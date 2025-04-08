import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import boto3

dynamodb = boto3.resource("dynamodb")

@csrf_exempt
def get_data_by_uid(request):
    try:
        dicom_data_table = dynamodb.Table("dicomFileMetadataTable")
        response = dicom_data_table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('UserID').eq(request.GET.get("user_id"))
        )
        items = response['Items']
        return JsonResponse(items, safe=False)
    except Exception as e:
            print(f"Failed to get DICOM data: {str(e)}")
            return JsonResponse({"error": f"Failed to get Dicom Data: {str(e)}"}, status=500)