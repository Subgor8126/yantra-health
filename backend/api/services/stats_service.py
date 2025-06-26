from django.views.decorators.csrf import csrf_exempt
import boto3
import os
from datetime import datetime
from collections import defaultdict
from decimal import Decimal
from django.http import JsonResponse
from boto3.dynamodb.conditions import Key
from api.services import get_user_id_from_request_token

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION'))
table = dynamodb.Table(os.getenv('DICOM_DYNAMO_TABLE'))

@csrf_exempt
def get_stats(request):
    user_id, error_response = get_user_id_from_request_token(request)
    print(f"UserId HERERERERER: {user_id}")
    response = table.query(
        KeyConditionExpression=Key('UserId').eq(user_id)
    )
    items = response.get('Items', [])

    print(items)

    total_instances = 0
    total_studies = 0
    total_study_size_bytes = Decimal(0)
    largest_study_size_bytes = Decimal(0)
    latest_upload_timestamp = None
    monthly_study_counts = defaultdict(int)

    for item in items:
        data_type = item.get('DataType')
        if data_type == 'instance':
            total_instances += 1
        elif data_type == 'study':
            total_studies += 1

            # Study Size
            size = Decimal(item.get('TotalStudySizeBytes', 0))
            total_study_size_bytes += size
            largest_study_size_bytes = max(largest_study_size_bytes, size)

            # Upload Timestamp
            upload_ts = item.get('UploadTimestamp')
            if upload_ts:
                try:
                    ts = datetime.fromisoformat(upload_ts.replace('Z', '+00:00'))
                    if latest_upload_timestamp is None or ts > latest_upload_timestamp:
                        latest_upload_timestamp = ts

                    month_key = ts.strftime("%Y-%m")
                    monthly_study_counts[month_key] += 1
                except Exception as e:
                    print(f"Bad timestamp: {upload_ts}, error: {e}")

    avg_study_size_mb = (
        float(total_study_size_bytes) / total_studies / (1024**2)
        if total_studies > 0 else 0
    )
    largest_study_size_mb = float(largest_study_size_bytes) / (1024**2)

    return JsonResponse({
        "totalInstances": total_instances,
        "totalStudies": total_studies,
        "averageStudySizeMB": round(avg_study_size_mb, 2),
        "largestStudySizeMB": round(largest_study_size_mb, 2),
        "mostRecentUpload": latest_upload_timestamp.isoformat() if latest_upload_timestamp else None,
        "monthlyStudyCounts": dict(monthly_study_counts)
    })
