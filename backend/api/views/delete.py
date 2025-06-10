from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
import os
from api.services import get_dynamodb_resource, get_s3_client

S3_BUCKET = os.getenv("AWS_STORAGE_BUCKET_NAME", "yantra-healthcare-imaging")
S3_REGION = os.getenv("AWS_S3_REGION", "us-east-1")

@csrf_exempt
def delete_data_by_file_key(request):
    file_key = request.GET.get("fileKey")
    user_id = request.GET.get("userId")

    print(f"[DEBUG] FileKey received: {file_key}")

    try:
        dynamodb_resource = get_dynamodb_resource()
        dicom_data_table = dynamodb_resource.Table("dicomFileMetadataTable")

        # Delete the main study record
        response = dicom_data_table.delete_item(
            Key={'UserId': user_id, 'FileKey': file_key},
            ReturnValues="ALL_OLD"
        )
        deleted_item = response.get("Attributes", {})
        if not deleted_item:
            return JsonResponse({"error": "No matching record found in DynamoDB."}, status=404)

        deleted_patient_name = deleted_item.get("PatientName", "Unknown")

        # Delete all child files under that prefix
        items = dicom_data_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("UserId").eq(user_id)
        )["Items"]

        deleted_count = 0
        for item in items:
            if item["FileKey"].startswith(file_key):
                dicom_data_table.delete_item(
                    Key={"UserId": item["UserId"], "FileKey": item["FileKey"]}
                )
                deleted_count += 1

        deleted_s3_keys = delete_s3_prefix(file_key)

        return JsonResponse({
            "Patient": deleted_patient_name,
            "DeletedInstanceCount": deleted_count,
            "DeletedS3Files": deleted_s3_keys,
            "S3FilesDeleted": bool(deleted_s3_keys)  # helpful boolean if frontend still wants it
        }, status=200)

    except Exception as e:
        print(f"[ERROR] Failed to delete DICOM data: {str(e)}")
        return JsonResponse({"error": f"Internal server error: {str(e)}"}, status=500)

def delete_file_from_s3(file_key):
    s3_client = get_s3_client()
    response = s3_client.delete_object(Bucket=S3_BUCKET, Key=file_key)
    return response.get('ResponseMetadata', {})

def delete_s3_prefix(prefix):
    s3_client = get_s3_client()
    paginator = s3_client.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=S3_BUCKET, Prefix=prefix)

    deleted_keys = []
    for page in pages:
        for obj in page.get('Contents', []):
            s3_client.delete_object(Bucket=S3_BUCKET, Key=obj['Key'])
            deleted_keys.append(obj['Key'])

    return deleted_keys
