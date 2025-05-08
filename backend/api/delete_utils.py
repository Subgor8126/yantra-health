import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
import os
from .ddb_utils import get_dynamodb_resource
from .s3_utils import get_s3_client

S3_BUCKET = os.getenv("AWS_STORAGE_BUCKET_NAME", "yantra-healthcare-imaging")
S3_REGION = os.getenv("AWS_S3_REGION", "us-east-1")

@csrf_exempt
def delete_data_by_file_key(request):
    file_key = request.GET.get("fileKey")
    user_id = request.GET.get("userId")  # Accept UserID from request

    try:
        dynamodb_resource = get_dynamodb_resource()
        dicom_data_table = dynamodb_resource.Table("dicomFileMetadataTable")
        # Step 1: Delete the study record
        response = dicom_data_table.delete_item(
            Key={'UserID': user_id, 'FileKey': file_key},
            ReturnValues="ALL_OLD"
        )
        deleted_item = response.get("Attributes", {})
        if not deleted_item:
            return JsonResponse({"error": "No matching study record found."}, status=404)
        
        # deleted_file_name = deleted_item.get("FileKey", "").split('/')[-1]
        deleted_patient_name = deleted_item.get("PatientName", "Unknown")

        # 1. Query all items for this user
        items = dicom_data_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("UserID").eq(user_id)
        )["Items"]

        # 2. Delete every item whose FileKey starts with the study key
        deleted_count = 0
        for item in items:
            if item["FileKey"].startswith(file_key):  # match any file under that study prefix
                dicom_data_table.delete_item(
                    Key={"UserID": item["UserID"], "FileKey": item["FileKey"]}
                )
                deleted_count += 1


        # s3_response = delete_file_from_s3(file_key)
        deleted_s3_keys = delete_s3_prefix(file_key)
        # status_code = s3_response.get('HTTPStatusCode', 500)
        # print("Le code du status")
        # print(status_code)

        # if 200 <= status_code <= 299:
        #     return JsonResponse({
        #         "DeleteText": f"Dicom File Deleted Successfully.\nDeleted File Details\nFile Name: {deleted_file_name}\nPatient Name: {deleted_patient_name}"
        #     }, status=200)

        # return JsonResponse({"DeleteText": "File probably deleted"}, status=200)

        if deleted_s3_keys:  # if list is non-empty
            return JsonResponse({
                "DeleteText": "Study and related files deleted successfully.",
                "DeletedS3Files": deleted_s3_keys,
                "DeletedInstanceCount": deleted_count,
                "Patient": deleted_patient_name
            }, status=200)
        else:
            return JsonResponse({
                "DeleteText": "No S3 files found for deletion.",
                "DeletedInstanceCount": deleted_count
            }, status=404)
    
    except Exception as e:
        print(f"Failed to delete DICOM data: {str(e)}")
        return JsonResponse({"error": f"Failed to delete DICOM data: {str(e)}"}, status=500)

def delete_file_from_s3(file_key):
    s3_client = get_s3_client()
    response = s3_client.delete_object(Bucket=S3_BUCKET, Key=file_key)
    return response.get('ResponseMetadata', {})

def delete_s3_prefix(prefix):
    """Deletes all S3 objects under a given key prefix."""
    s3_client = get_s3_client()
    paginator = s3_client.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=S3_BUCKET, Prefix=prefix)

    deleted_keys = []
    for page in pages:
        for obj in page.get('Contents', []):
            s3_client.delete_object(Bucket=S3_BUCKET, Key=obj['Key'])
            deleted_keys.append(obj['Key'])

    return deleted_keys
