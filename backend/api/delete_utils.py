import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
import os

S3_BUCKET = os.getenv("AWS_STORAGE_BUCKET_NAME", "yantra-healthcare-imaging")
S3_REGION = os.getenv("AWS_S3_REGION", "us-east-1")
s3_client = boto3.client("s3", region_name=S3_REGION)

dynamodb = boto3.resource("dynamodb")

@csrf_exempt
def delete_data_by_file_key(request):
    file_key = request.GET.get("fileKey")
    user_id = request.GET.get("userId")  # Accept UserID from request

    try:
        dicom_data_table = dynamodb.Table("dicomFileMetadataTable")
        response = dicom_data_table.delete_item(
            Key={
                'UserID': user_id,  # Primary key
                'FileKey': file_key  # Sort key
            },
            ReturnValues="ALL_OLD"
        )
        
        deleted_item = response.get("Attributes", {})
        deleted_file_name = deleted_item.get("FileKey", "").split('/')[-1]
        deleted_patient_name = deleted_item.get("PatientName", "Unknown")

        s3_response = delete_file_from_s3(file_key)
        status_code = s3_response.get('HTTPStatusCode', 500)
        print("Le code du status")
        print(status_code)

        if 200 <= status_code <= 299:
            return JsonResponse({
                "DeleteText": f"Dicom File Deleted Successfully.\nDeleted File Details\nFile Name: {deleted_file_name}\nPatient Name: {deleted_patient_name}"
            }, status=200)

        return JsonResponse({"DeleteText": "File probably deleted"}, status=200)
    
    except Exception as e:
        print(f"Failed to delete DICOM data: {str(e)}")
        return JsonResponse({"error": f"Failed to delete DICOM data: {str(e)}"}, status=500)

def delete_file_from_s3(file_key):
    response = s3_client.delete_object(Bucket=S3_BUCKET, Key=file_key)
    return response.get('ResponseMetadata', {})
