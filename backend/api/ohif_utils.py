import json
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .s3_utils import generate_pre_signed_url_with_file_key
import requests
import boto3
from .ddb_utils import get_dynamodb_resource

DYNAMO_TABLE_NAME = "dicomFileMetadataTable"

@csrf_exempt
def send_json_response_to_ohif(request):
    print("In send_json_response_to_ohif")

    try:
        # Extract fileKey from request
        file_key = request.GET.get("fileKey")
        user_id = request.GET.get("userId")
        if not file_key:
            return JsonResponse({"error": "Missing fileKey parameter"}, status=400)

        print(f"Fetching metadata for fileKey: {file_key}")

        # Query DynamoDB using FileKey
        dynamodb_resource = get_dynamodb_resource()
        table = dynamodb_resource.Table(DYNAMO_TABLE_NAME)
        response = table.get_item(Key={"UserID": user_id, "FileKey": file_key})

        if "Item" not in response:
            return JsonResponse({"error": "File metadata not found in database"}, status=404)

        metadata = response["Item"]

        # Generate Pre-Signed URL
        pre_signed_url = generate_pre_signed_url_for_ohif(file_key)
        if not pre_signed_url:
            return JsonResponse({"error": "Failed to generate pre-signed URL"}, status=500)

        # Safely convert values with error handling
        try:
            pixel_spacing = json.loads(metadata["PixelSpacing"]) if "PixelSpacing" in metadata else [1.0, 1.0]
        except (ValueError, TypeError):
            pixel_spacing = [1.0, 1.0]
            
        try:
            slice_thickness = float(metadata.get("SliceThickness", 1.0))
        except (ValueError, TypeError):
            slice_thickness = 1.0
            
        try:
            image_position = json.loads(metadata["ImagePositionPatient"]) if "ImagePositionPatient" in metadata else [0.0, 0.0, 0.0]
        except (ValueError, TypeError):
            image_position = [0.0, 0.0, 0.0]
            
        try:
            image_orientation = json.loads(metadata["ImageOrientationPatient"]) if "ImageOrientationPatient" in metadata else [1.0, 0.0, 0.0, 0.0, 1.0, 0.0]
        except (ValueError, TypeError):
            image_orientation = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0]
            
        try:
            window_center = float(metadata.get("WindowCenter", 40))
        except (ValueError, TypeError):
            window_center = 40.0
            
        try:
            window_width = float(metadata.get("WindowWidth", 400))
        except (ValueError, TypeError):
            window_width = 400.0
            
        try:
            bits_allocated = int(metadata.get("BitsAllocated", 16))
        except (ValueError, TypeError):
            bits_allocated = 16
            
        try:
            bits_stored = int(metadata.get("BitsStored", 16))
        except (ValueError, TypeError):
            bits_stored = 16

        # Construct OHIF-compatible JSON response
        ohif_response = {
            "studies": [
                {
                    "StudyInstanceUID": metadata["StudyInstanceUID"],
                    "series": [
                        {
                            "SeriesInstanceUID": metadata["SeriesInstanceUID"],
                            "Modality": metadata["Modality"],  # Hardcoded for now enter metadata["Modality"] later
                            "instances": [
                                {
                                    "metadata": {
                                        "SOPInstanceUID": metadata["SOPInstanceUID"],
                                        "SeriesInstanceUID": metadata["SeriesInstanceUID"],
                                        "StudyInstanceUID": metadata["StudyInstanceUID"],
                                        
                                        # Properly formatted arrays with safe conversion
                                        "PixelSpacing": pixel_spacing,
                                        "SliceThickness": slice_thickness,
                                        "ImagePositionPatient": image_position,
                                        "ImageOrientationPatient": image_orientation,

                                        # Safe string and numeric values
                                        "FrameOfReferenceUID": metadata.get("FrameOfReferenceUID", ""),
                                        "WindowCenter": window_center,
                                        "WindowWidth": window_width,
                                        "BitsAllocated": bits_allocated,
                                        "BitsStored": bits_stored,
                                    },
                                    "url": pre_signed_url
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        return JsonResponse(ohif_response)

    except Exception as e:
        print(f"Error: {e}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def print_something(request):
    return JsonResponse({"ITurnTheMusicUp": "IGotMyRecordsOn"}, status=200)

def generate_pre_signed_url_for_ohif(file_key):
    try:
        pre_signed_url = generate_pre_signed_url_with_file_key(file_key)
        if not pre_signed_url:
            return JsonResponse({"error": "Failed to generate pre-signed URL"}, status=500)
        
        print("hier hier, schau")
        print(pre_signed_url)

        return pre_signed_url

    except Exception as e:
        return e


# @csrf_exempt
# def send_json_response_to_ohif(request):
#     print("in send_json_response_to_ohif")
#     try:
#         file_key = request.GET.get("fileKey")
#         series_instance_uid = request.GET.get("seriesInstanceUid")
#         study_instance_uid = request.GET.get("studyInstanceUid")
#         sop_instance_uid = request.GET.get("sopInstanceUid")
#         modality = request.GET.get("modality")

#         print("---------------------------------------")
#         print(series_instance_uid)
#         print(study_instance_uid)
#         print(sop_instance_uid)
#         print("---------------------------------------")
#         if not file_key:
#             # return HttpResponse("<h1>Missing fileKey parameter</h1>", status=400)
#             return JsonResponse({"error": "Missing fileKey parameter"}, status=400)
        
#         print(f"filekey: {file_key}")
#         pre_signed_url = generate_pre_signed_url_for_ohif(file_key)
#         if not pre_signed_url:
#             # return HttpResponse("<h1>Failed to generate pre-signed URL</h1>", status=500)
#             return JsonResponse({"error": "Failed to generate pre-signed URL"}, status=500)
        
#         print(f"psurl: {pre_signed_url}")
#         response_object_dicom_file = requests.get(pre_signed_url, stream=True, timeout=10)
#         # Timeout is 10 seconds, not any other temporal unit
#         # Re
#         print(f"response object status: {response_object_dicom_file.status_code}")
#         if response_object_dicom_file.status_code != 200:
#             return JsonResponse({"error": "Failed to fetch DICOM file from S3"}, status=response_object_dicom_file.status_code)

#         # Return an HTML page similar to what Orthanc serves
#         # html_content = f"""
#         # <!doctype html>
#         # <html lang="en">
#         # <head>
#         #     <meta charset="UTF-8">
#         #     <meta name="viewport" content="width=device-width, initial-scale=1">
#         #     <title>OHIF Viewer</title>
#         #     <script>
#         #         window.onload = function() {{
#         #             window.location.href = "{pre_signed_url}";
#         #         }};
#         #     </script>
#         # </head>
#         # <body>
#         #     <h1>Loading OHIF Viewer...</h1>
#         # </body>
#         # </html>
#         # """
#         # return HttpResponse(html_content, content_type="text/html")

#         # Return JSON response with pre-signed URL and file content (base64 encoded if needed)
#         # return JsonResponse({
#         #     "PreSignedUrl": pre_signed_url,
#         #     "DicomFile": response_object_dicom_file.content.decode("latin1")  # DICOM is binary, may need Base64 encoding
#         # })

#         return JsonResponse(
#         {
#             "studies": [
#                 {
#                     "StudyInstanceUID": study_instance_uid,
#                     "series": [
#                         {
#                             "SeriesInstanceUID": series_instance_uid,
#                             "Modality": modality,
#                             "instances": [
#                                 {
#                                     "metadata": {
#                                         "SOPInstanceUID": sop_instance_uid,
#                                         "SeriesInstanceUID": series_instance_uid,
#                                         "StudyInstanceUID": study_instance_uid
#                                     },
#                                     "url": pre_signed_url
#                                 }
#                             ]
#                         }
#                     ]
#                 }
#             ]
#         }
#     )

#     except Exception as e:
#         return JsonResponse({"error": f"{e}"})