from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
from boto3.dynamodb.conditions import Key, Attr
import os

# This module provides utility functions to interact with AWS DynamoDB for DICOM data retrieval.

# Create DynamoDB resource
def get_dynamodb_resource():
    return boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION")    
    )

@csrf_exempt
def get_dicom_metadata(request):
    try:
        user_id = request.GET.get("userId") # Get UserId from the URL query parameters
        record_type = request.GET.get("recordType")  # e.g., "patient, "series", "study" or "instance"
        file_key = request.GET.get("fileKey", "")  # Optional, used to filter results

        if not user_id or not record_type:
            return JsonResponse({"error": "Missing required parameters: userId and/or recordType"}, status=400)
        
        dynamodb_resource = get_dynamodb_resource()
        dicom_data_table = dynamodb_resource.Table("dicomFileMetadataTable")

        if file_key == "":
            response = dicom_data_table.query(
                KeyConditionExpression=Key('UserId').eq(user_id),
                FilterExpression=Attr('DataType').eq(record_type)
            )
        else:
            response = dicom_data_table.query(
                KeyConditionExpression=Key('UserId').eq(user_id) & Key("FileKey").begins_with(file_key),
                FilterExpression=Attr('DataType').eq(record_type)
            )

        items = response['Items']
        return JsonResponse(items, safe=False)

    except Exception as e:
        print(f"Failed to get DICOM data: {str(e)}")
        return JsonResponse({"error": f"Failed to get DICOM data: {str(e)}"}, status=500)