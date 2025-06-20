from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.services import cognito_token_verification
from datetime import datetime
import pydicom
import os
import traceback
import pprint
from api.services import get_s3_client
from api.models import User, Patient, Study, Series, Instance

def get_dicom_value(dicom_data, attribute, default=None):
    value = getattr(dicom_data, attribute, default)
    return str(value) if value not in [None, ""] else default

def validate_dicom_consistency(files):
    if not files:
        return False, "No files provided"
    
    first_ds = pydicom.dcmread(files[0], force=True)
    reference = {
        "PatientID": getattr(first_ds, "PatientID", None),
        "StudyInstanceUID": getattr(first_ds, "StudyInstanceUID", None),
        "SeriesInstanceUID": getattr(first_ds, "SeriesInstanceUID", None)
    }

    if not all(reference.values()):
        return False, "Missing required DICOM identifiers in first file"

    for i, f in enumerate(files[1:], 2):
        ds = pydicom.dcmread(f, force=True)
        for key in reference:
            if getattr(ds, key, None) != reference[key]:
                return False, f"File {i} has inconsistent {key}"
    
    return True, reference

@csrf_exempt
def upload_dicom(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        # Auth
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JsonResponse({"error": "Missing Authorization header"}, status=401)
        token = auth_header.split(" ")[1]
        user_id = cognito_token_verification(token)

        files = request.FILES.getlist("files")
        if not files:
            return JsonResponse({"error": "No files uploaded"}, status=400)

        validation, result = validate_dicom_consistency(files)
        if not validation:
            return JsonResponse({"error": result}, status=400)

        s3 = get_s3_client()
        bucket = os.environ.get("AWS_STORAGE_BUCKET_NAME")
        timestamp = datetime.utcnow().isoformat()

        first_ds = pydicom.dcmread(files[0], force=True)
        patient_id = get_dicom_value(first_ds, "PatientID")
        study_instance_uid = get_dicom_value(first_ds, "StudyInstanceUID")
        series_instance_uid = get_dicom_value(first_ds, "SeriesInstanceUID")

        # Calculate total study size
        total_study_size_bytes = sum(f.size for f in files)

        # ORM: User
        user_obj, _ = User.objects.get_or_create(
            user_id=user_id,
            defaults={
                "email": None,  # Set from token if available
                "full_name": None,
                "role": None
            }
        )

        # ORM: Patient
        patient_obj, _ = Patient.objects.get_or_create(
            patient_id=patient_id,
            defaults={
                "user": user_obj,
                "name": get_dicom_value(first_ds, "PatientName"),
                "sex": get_dicom_value(first_ds, "PatientSex"),
                "age": get_dicom_value(first_ds, "PatientAge"),
                "weight": get_dicom_value(first_ds, "PatientWeight"),
                "birth_date": get_dicom_value(first_ds, "PatientBirthDate"),
                "extra_json": {}
            }
        )

        # ORM: Study
        study_obj, _ = Study.objects.get_or_create(
            study_instance_uid=study_instance_uid,
            defaults={
                "patient": patient_obj,
                "user": user_obj,
                "study_id": get_dicom_value(first_ds, "StudyID"),
                "study_date": get_dicom_value(first_ds, "StudyDate"),
                "study_time": get_dicom_value(first_ds, "StudyTime"),
                "study_description": get_dicom_value(first_ds, "StudyDescription"),
                "accession_number": get_dicom_value(first_ds, "AccessionNumber"),
                "referring_physician_name": get_dicom_value(first_ds, "ReferringPhysicianName"),
                "modality": get_dicom_value(first_ds, "Modality"),
                "body_part_examined": get_dicom_value(first_ds, "BodyPartExamined"),
                "total_study_size_bytes": total_study_size_bytes
            }
        )

        # Collect SOP Instance UIDs for the series
        sop_instance_uid_list = []
        for f in files:
            ds = pydicom.dcmread(f, force=True)
            sop_uid = get_dicom_value(ds, "SOPInstanceUID")
            if sop_uid:
                sop_instance_uid_list.append(sop_uid)

        # ORM: Series
        series_obj, _ = Series.objects.get_or_create(
            series_instance_uid=series_instance_uid,
            defaults={
                "study": study_obj,
                "series_number": get_dicom_value(first_ds, "SeriesNumber"),
                "series_description": get_dicom_value(first_ds, "SeriesDescription"),
                "modality": get_dicom_value(first_ds, "Modality"),
                "body_part_examined": get_dicom_value(first_ds, "BodyPartExamined"),
                "number_of_instances": len(files),
                "sop_instance_uid_list": sop_instance_uid_list
            }
        )

        # Process all instances
        for f in files:
            ds = pydicom.dcmread(f, force=True)

            sop_uid = get_dicom_value(ds, "SOPInstanceUID")
            s3_key = f"{user_id}/{patient_id}/{study_instance_uid}/{series_instance_uid}/{sop_uid}.dcm"
            f.seek(0)
            s3.upload_fileobj(f, bucket, s3_key)

            # Calculate file size
            f.seek(0, 2)  # Seek to end
            file_size = f.tell()
            f.seek(0)  # Reset

            # Save instance record
            Instance.objects.update_or_create(
                sop_instance_uid=sop_uid,
                defaults={
                    "series": series_obj,
                    "study": study_obj,
                    "patient": patient_obj,
                    "user": user_obj,
                    "instance_number": get_dicom_value(ds, "InstanceNumber"),
                    "file_key": s3_key,
                    "pixel_spacing": get_dicom_value(ds, "PixelSpacing"),
                    "slice_thickness": get_dicom_value(ds, "SliceThickness"),
                    "image_position_patient": get_dicom_value(ds, "ImagePositionPatient"),
                    "image_orientation_patient": get_dicom_value(ds, "ImageOrientationPatient"),
                    "frame_of_reference_uid": get_dicom_value(ds, "FrameOfReferenceUID"),
                    "window_center": get_dicom_value(ds, "WindowCenter"),
                    "window_width": get_dicom_value(ds, "WindowWidth"),
                    "bits_allocated": get_dicom_value(ds, "BitsAllocated"),
                    "bits_stored": get_dicom_value(ds, "BitsStored"),
                    "columns": get_dicom_value(ds, "Columns"),
                    "rows": get_dicom_value(ds, "Rows"),
                    "photometric_interpretation": get_dicom_value(ds, "PhotometricInterpretation"),
                    "sop_class_uid": get_dicom_value(ds, "SOPClassUID"),
                    "number_of_frames": int(get_dicom_value(ds, "NumberOfFrames", "1")),
                    "has_pixel_data": "PixelData" in ds,
                    "total_size_bytes": file_size
                }
            )

        return JsonResponse({"message": "Study uploaded successfully"})

    except Exception as e:
        print("Upload failed due to unexpected error:")
        traceback.print_exc()

        return JsonResponse({
            "error": str(e)[:500] if isinstance(e, str) else "Unexpected server error."
        }, status=500)