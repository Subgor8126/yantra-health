from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import os
from api.services import get_s3_client
from api.models import User, Patient, Study, Series, Instance

S3_BUCKET = os.getenv("AWS_STORAGE_BUCKET_NAME", "yantra-healthcare-imaging")
S3_REGION = os.getenv("AWS_S3_REGION", "us-east-1")

@csrf_exempt
def delete_data_by_file_key(request):
    file_key = request.GET.get("fileKey")
    user_id = request.GET.get("userId")

    print(f"[DEBUG] FileKey received: {file_key}")

    if not file_key or not user_id:
        return JsonResponse({"error": "fileKey and userId parameters are required."}, status=400)

    try:
        # Check if user exists
        try:
            user_obj = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

        # Find the instance by file_key
        try:
            instance_obj = Instance.objects.get(file_key=file_key, user=user_obj)
        except Instance.DoesNotExist:
            return JsonResponse({"error": "No matching record found for the given file key."}, status=404)

        # Get related objects for response info
        patient_name = instance_obj.patient.name or "Unknown"
        series_obj = instance_obj.series
        study_obj = instance_obj.study
        patient_obj = instance_obj.patient

        # Delete all instances that belong to the same study (cascade delete)
        instances_to_delete = Instance.objects.filter(
            user=user_obj,
            study=study_obj
        )

        # Get all file keys to delete from S3
        s3_keys_to_delete = list(instances_to_delete.values_list('file_key', flat=True))
        deleted_instance_count = instances_to_delete.count()

        # Delete instances from database
        instances_to_delete.delete()

        # Check if series has any remaining instances
        remaining_instances_in_series = Instance.objects.filter(series=series_obj).count()
        if remaining_instances_in_series == 0:
            series_obj.delete()

        # Check if study has any remaining series
        remaining_series_in_study = Series.objects.filter(study=study_obj).count()
        if remaining_series_in_study == 0:
            study_obj.delete()

        # Check if patient has any remaining studies
        remaining_studies_for_patient = Study.objects.filter(patient=patient_obj).count()
        if remaining_studies_for_patient == 0:
            patient_obj.delete()

        # Delete files from S3
        deleted_s3_keys = []
        for s3_key in s3_keys_to_delete:
            if s3_key:  # Make sure file_key is not None/empty
                try:
                    delete_file_from_s3(s3_key)
                    deleted_s3_keys.append(s3_key)
                except Exception as s3_error:
                    print(f"[WARNING] Failed to delete S3 file {s3_key}: {str(s3_error)}")

        return JsonResponse({
            "Patient": patient_name,
            "DeletedInstanceCount": deleted_instance_count,
            "DeletedS3Files": deleted_s3_keys,
            "S3FilesDeleted": len(deleted_s3_keys) > 0
        }, status=200)

    except Exception as e:
        print(f"[ERROR] Failed to delete DICOM data: {str(e)}")
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

@csrf_exempt
def delete_data_by_patient_id(request):
    """
    Delete all data for a specific patient (all studies, series, instances)
    """
    patient_id = request.GET.get("patientId")
    user_id = request.GET.get("userId")

    if not patient_id or not user_id:
        return JsonResponse({"error": "patientId and userId parameters are required."}, status=400)

    try:
        # Check if user exists
        try:
            user_obj = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

        # Find the patient
        try:
            patient_obj = Patient.objects.get(patient_id=patient_id, user=user_obj)
        except Patient.DoesNotExist:
            return JsonResponse({"error": "Patient not found."}, status=404)

        patient_name = patient_obj.name or "Unknown"

        # Get all instances for this patient
        instances_to_delete = Instance.objects.filter(patient=patient_obj, user=user_obj)
        s3_keys_to_delete = list(instances_to_delete.values_list('file_key', flat=True))
        deleted_instance_count = instances_to_delete.count()

        # Delete all data for this patient (cascading)
        patient_obj.delete()  # This will cascade delete studies, series, and instances

        # Delete files from S3
        deleted_s3_keys = []
        for s3_key in s3_keys_to_delete:
            if s3_key:
                try:
                    delete_file_from_s3(s3_key)
                    deleted_s3_keys.append(s3_key)
                except Exception as s3_error:
                    print(f"[WARNING] Failed to delete S3 file {s3_key}: {str(s3_error)}")

        return JsonResponse({
            "Patient": patient_name,
            "DeletedInstanceCount": deleted_instance_count,
            "DeletedS3Files": deleted_s3_keys,
            "S3FilesDeleted": len(deleted_s3_keys) > 0
        }, status=200)

    except Exception as e:
        print(f"[ERROR] Failed to delete patient data: {str(e)}")
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

@csrf_exempt
def delete_data_by_study_uid(request):
    """
    Delete all data for a specific study
    """
    study_instance_uid = request.GET.get("studyInstanceUID")
    user_id = request.GET.get("userId")

    if not study_instance_uid or not user_id:
        return JsonResponse({"error": "studyInstanceUID and userId parameters are required."}, status=400)

    try:
        # Check if user exists
        try:
            user_obj = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

        # Find the study
        try:
            study_obj = Study.objects.get(study_instance_uid=study_instance_uid, user=user_obj)
        except Study.DoesNotExist:
            return JsonResponse({"error": "Study not found."}, status=404)

        patient_name = study_obj.patient.name or "Unknown"

        # Get all instances for this study
        instances_to_delete = Instance.objects.filter(study=study_obj, user=user_obj)
        s3_keys_to_delete = list(instances_to_delete.values_list('file_key', flat=True))
        deleted_instance_count = instances_to_delete.count()

        # Delete the study (this will cascade delete series and instances)
        study_obj.delete()

        # Check if patient has any remaining studies
        remaining_studies_for_patient = Study.objects.filter(patient=study_obj.patient).count()
        if remaining_studies_for_patient == 0:
            study_obj.patient.delete()

        # Delete files from S3
        deleted_s3_keys = []
        for s3_key in s3_keys_to_delete:
            if s3_key:
                try:
                    delete_file_from_s3(s3_key)
                    deleted_s3_keys.append(s3_key)
                except Exception as s3_error:
                    print(f"[WARNING] Failed to delete S3 file {s3_key}: {str(s3_error)}")

        return JsonResponse({
            "Patient": patient_name,
            "DeletedInstanceCount": deleted_instance_count,
            "DeletedS3Files": deleted_s3_keys,
            "S3FilesDeleted": len(deleted_s3_keys) > 0
        }, status=200)

    except Exception as e:
        print(f"[ERROR] Failed to delete study data: {str(e)}")
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

def delete_file_from_s3(file_key):
    """
    Delete a single file from S3
    """
    s3_client = get_s3_client()
    response = s3_client.delete_object(Bucket=S3_BUCKET, Key=file_key)
    return response.get('ResponseMetadata', {})

def delete_s3_prefix(prefix):
    """
    Delete all files with a specific prefix from S3
    """
    s3_client = get_s3_client()
    paginator = s3_client.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=S3_BUCKET, Prefix=prefix)

    deleted_keys = []
    for page in pages:
        for obj in page.get('Contents', []):
            s3_client.delete_object(Bucket=S3_BUCKET, Key=obj['Key'])
            deleted_keys.append(obj['Key'])

    return deleted_keys