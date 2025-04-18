import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource("dynamodb")

@csrf_exempt
def get_study_data_by_uid(request):
    try:
        user_id = request.GET.get("userId")
        record_type = request.GET.get("recordType")  # e.g., "study" or "instance"

        if not user_id or not record_type:
            return JsonResponse({"error": "Missing required parameters: userId and/or recordType"}, status=400)

        dicom_data_table = dynamodb.Table("dicomFileMetadataTable")
        response = dicom_data_table.query(
            KeyConditionExpression=Key('UserID').eq(user_id),
            FilterExpression=Attr('DataType').eq(record_type)
        )

        items = response['Items']
        return JsonResponse(items, safe=False)

    except Exception as e:
        print(f"Failed to get DICOM data: {str(e)}")
        return JsonResponse({"error": f"Failed to get DICOM data: {str(e)}"}, status=500)

# @csrf_exempt
# def get_study_data_by_uid(request):
#     try:
#         dicom_data_table = dynamodb.Table("dicomFileMetadataTable")
#         response = dicom_data_table.query(
#         KeyConditionExpression=boto3.dynamodb.conditions.Key('UserID').eq(request.GET.get("userId"))
#         )
#         items = response['Items']
#         return JsonResponse(items, safe=False)
#     except Exception as e:
#             print(f"Failed to get DICOM data: {str(e)}")
#             return JsonResponse({"error": f"Failed to get Dicom Data: {str(e)}"}, status=500)