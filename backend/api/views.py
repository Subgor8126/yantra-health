import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .s3_utils import generate_and_return_presigned_url
from .auth_utils import cognito_token_verification
from decimal import Decimal
from datetime import datetime
import pydicom
import io
import boto3
import os
import zipfile
import hashlib
from decimal import Decimal

def get_dicom_value(dicom_data, attribute, default="Unknown"):
    """Safely fetches a DICOM attribute as a string."""
    value = getattr(dicom_data, attribute, default)
    if value is None or value == '':
        return default
    return str(value)

def numToDecimal(metadata):
    # Convert numeric values to Decimal to store in DynamoDB
    for key, value in metadata.items():
        if isinstance(value, str) and value.replace(".", "", 1).isdigit():
            metadata[key] = Decimal(value)

    return metadata

def validate_dicom_file(file_obj):
    try:
        current_pos = file_obj.tell()
        file_obj.seek(0)

        # Read with force=True to allow non-standard but valid DICOMs
        dataset = pydicom.dcmread(file_obj, force=True)

        # Check essential attributes
        required_attrs = ['PatientID', 'StudyInstanceUID', 'SeriesInstanceUID', 'SOPInstanceUID']
        missing_attrs = [attr for attr in required_attrs if not hasattr(dataset, attr)]

        if missing_attrs:
            file_obj.seek(current_pos)
            return False, f"Missing required DICOM attributes: {', '.join(missing_attrs)}"

        file_obj.seek(current_pos)
        return True, dataset

    except Exception as e:
        file_obj.seek(current_pos)
        return False, f"DICOM validation error: {str(e)}"

    
def validate_dicom_consistency(files):
    if not files:
        return False, "No files provided"
    
    # Read first file to get reference values
    first_file = files[0]
    first_file.seek(0)
    first_ds = pydicom.dcmread(first_file, force=True)
    study_uid = getattr(first_ds, "StudyInstanceUID", None)
    patient_id = getattr(first_ds, "PatientID", None)
    
    if not study_uid or not patient_id:
        return False, "First file missing StudyInstanceUID or PatientID"
    
    # Check all other files
    inconsistencies = []
    
    for i, file in enumerate(files[1:], 1):
        # is_valid_file, result = validate_dicom_file(file)
        # if not is_valid_file:
        #     return False, f"File {i+1}: {result}"
        file.seek(0)
        ds = pydicom.dcmread(file, force=True)
        
        if getattr(ds, "StudyInstanceUID", None) != study_uid:
            inconsistencies.append(f"File {i+1}: Different StudyInstanceUID")
        
        if getattr(ds, "PatientID", None) != patient_id:
            inconsistencies.append(f"File {i+1}: Different PatientID")
    
    # Reset file positions
    for file in files:
        file.seek(0)
    
    if inconsistencies:
        return False, f"Files show inconsistencies: {'; '.join(inconsistencies)}"
    
    return True, {"StudyInstanceUID": study_uid, "PatientID": patient_id}

# Create your views here.

@csrf_exempt
def upload_dicom(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        # Token verification
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JsonResponse({"error": "Missing Authorization header"}, status=401)
        token = auth_header.split(" ")[1]
        user_id = cognito_token_verification(token)

        files = request.FILES.getlist("files")
        print(f"Here is the FormData object:\n {files}")
        if not files:
            return JsonResponse({"error": "No DICOM files uploaded"}, status=400)
        
        # is_valid, message = validate_dicom_consistency(files)
        # if not is_valid:
        #     return JsonResponse({"error": message}, status=400)
        
        s3 = boto3.client("s3")
        bucket = os.environ.get("AWS_STORAGE_BUCKET_NAME")
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(os.environ.get("DICOM_DYNAMO_TABLE"))     

        sop_uid_list = []
        series_uid_set = set()   
        total_size_bytes = 0
        timestamp = datetime.utcnow().isoformat()

        first_instance_from_study = files[0]
        first_instance_dicom_data = pydicom.dcmread(first_instance_from_study, force=True)

        files[0].seek(0)

        base_metadata = {
            "UserID": user_id,

            # Patient Information
            "PatientID": get_dicom_value(first_instance_dicom_data, "PatientID"),
            "PatientName": get_dicom_value(first_instance_dicom_data, "PatientName"),
            "PatientSex": get_dicom_value(first_instance_dicom_data, "PatientSex"),
            "PatientAge": get_dicom_value(first_instance_dicom_data, "PatientAge"),
            "PatientWeight": get_dicom_value(first_instance_dicom_data, "PatientWeight"),

            # Study Information
            "StudyID": get_dicom_value(first_instance_dicom_data, "StudyID"),
            "StudyDate": get_dicom_value(first_instance_dicom_data, "StudyDate"),
            "StudyDescription": get_dicom_value(first_instance_dicom_data, "StudyDescription"),
            "StudyInstanceUID": get_dicom_value(first_instance_dicom_data, "StudyInstanceUID"),
            "AccessionNumber": get_dicom_value(first_instance_dicom_data, "AccessionNumber"),
            "StudyTime": get_dicom_value(first_instance_dicom_data, "StudyTime", "120000"),

            # Equipment & Acquisition Information
            "Manufacturer": get_dicom_value(first_instance_dicom_data, "Manufacturer"),
            "ManufacturerModelName": get_dicom_value(first_instance_dicom_data, "ManufacturerModelName"),
            "SoftwareVersions": get_dicom_value(first_instance_dicom_data, "SoftwareVersions"),
            "ContrastBolusAgent": get_dicom_value(first_instance_dicom_data, "ContrastBolusAgent"),
            "ScanOptions": get_dicom_value(first_instance_dicom_data, "ScanOptions"),
            "KVP": get_dicom_value(first_instance_dicom_data, "KVP"),
            "ExposureTime": get_dicom_value(first_instance_dicom_data, "ExposureTime"),
            "XRayTubeCurrent": get_dicom_value(first_instance_dicom_data, "XRayTubeCurrent"),
            "ConvolutionKernel": get_dicom_value(first_instance_dicom_data, "ConvolutionKernel"),

            # Extra
            "UploadTimestamp": timestamp
        }

        print("here's the base metadata")
        print(base_metadata)

        for f in files:
            dicom_ds = pydicom.dcmread(f, force=True)

            # Extract all the required tags
            patient_id = get_dicom_value(dicom_ds, "PatientID")
            study_instance_uid = get_dicom_value(dicom_ds, "StudyInstanceUID")
            series_instance_uid = get_dicom_value(dicom_ds, "SeriesInstanceUID")
            sop_instance_uid = get_dicom_value(dicom_ds, "SOPInstanceUID")

            # S3 Key
            s3_key = f"{user_id}/{patient_id}/{study_instance_uid}/{series_instance_uid}/{sop_instance_uid}.dcm"
            
            # Reset file position before upload
            f.seek(0)

            # Upload file to S3
            s3.upload_fileobj(f, bucket, s3_key)

            total_size_bytes += f.size
            sop_uid_list.append(sop_instance_uid)
            series_uid_set.add(series_instance_uid)
            
            has_pixel_data = False
            if "PixelData" in dicom_ds:
                    has_pixel_data = True

            instance_metadata = {
                 **base_metadata,
                "FileKey": s3_key,

                # Patient Information
                "PatientID": patient_id,
                "PatientName": get_dicom_value(dicom_ds, "PatientName"),
                "PatientSex": get_dicom_value(dicom_ds, "PatientSex"),
                "PatientAge": get_dicom_value(dicom_ds, "PatientAge"),
                "PatientWeight": get_dicom_value(dicom_ds, "PatientWeight"),

                # Study Information
                "StudyID": get_dicom_value(dicom_ds, "StudyID"),
                "StudyDate": get_dicom_value(dicom_ds, "StudyDate"),
                "StudyDescription": get_dicom_value(dicom_ds, "StudyDescription"),
                "StudyInstanceUID": study_instance_uid,
                "AccessionNumber": get_dicom_value(dicom_ds, "AccessionNumber"),

                # Series Information
                "SeriesInstanceUID": series_instance_uid,
                "SeriesNumber": get_dicom_value(dicom_ds, "SeriesNumber", 1),
                "SeriesDescription": get_dicom_value(dicom_ds, "SeriesDescription"),
                "Modality": get_dicom_value(dicom_ds, "Modality", "OT"),
                "BodyPartExamined": get_dicom_value(dicom_ds, "BodyPartExamined"),

                # Instance Information
                "SOPInstanceUID": sop_instance_uid,
                "InstanceNumber": get_dicom_value(dicom_ds, "InstanceNumber", "1"),
                "PixelSpacing": get_dicom_value(dicom_ds, "PixelSpacing", "0.5\\0.5"),
                "SliceThickness": get_dicom_value(dicom_ds, "SliceThickness", "1.0"),
                "ImagePositionPatient": get_dicom_value(dicom_ds, "ImagePositionPatient", "0\\0\\0"),
                "ImageOrientationPatient": get_dicom_value(dicom_ds, "ImageOrientationPatient", "1\\0\\0\\0\\1\\0"),
                "FrameOfReferenceUID": get_dicom_value(dicom_ds, "FrameOfReferenceUID"),
                "WindowCenter": get_dicom_value(dicom_ds, "WindowCenter", "40"),
                "WindowWidth": get_dicom_value(dicom_ds, "WindowWidth", "400"),
                "BitsAllocated": get_dicom_value(dicom_ds, "BitsAllocated", "16"),
                "BitsStored": get_dicom_value(dicom_ds, "BitsStored", "12"),
                "Columns": get_dicom_value(dicom_ds, "Columns", "512"),
                "Rows": get_dicom_value(dicom_ds, "Rows", "512"),
                "PhotometricInterpretation": get_dicom_value(dicom_ds, "PhotometricInterpretation", "MONOCHROME2"),
                "SOPClassUID": get_dicom_value(dicom_ds, "SOPClassUID", "1.2.840.10008.5.1.4.1.1.2"),
                "NumberOfFrames": int(getattr(dicom_ds, "NumberOfFrames", 1)),

                # Extra metadata
                "TotalSizeBytes": total_size_bytes,
                "SliceIndex": int(get_dicom_value(dicom_ds, "InstanceNumber", "1")),
                "DataType": "instance",
                "HasPixelData": has_pixel_data
            }

            final_instance_metadata = numToDecimal(instance_metadata)
            table.put_item(Item=final_instance_metadata)

        study_s3_key = f"{user_id}/{patient_id}/{study_instance_uid}/"

        # Step 1: Try fetching existing study record
        existing_study = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("UserID").eq(user_id),
            FilterExpression=boto3.dynamodb.conditions.Attr("DataType").eq("study") & boto3.dynamodb.conditions.Attr("StudyInstanceUID").eq(study_instance_uid)
        )

        # Step 2: Merge previous data if available
        if existing_study.get("Items"):
            prev = existing_study["Items"][0]

            existing_sops = prev.get("SOPInstanceUIDList", [])
            existing_series = prev.get("SeriesInstanceUIDList", [])
            existing_size = Decimal(str(prev.get("TotalStudySizeBytes", 0)))

            merged_sops = list(set(existing_sops + sop_uid_list))
            merged_series = list(set(existing_series + list(series_uid_set)))
            merged_total_size = existing_size + total_size_bytes
        else:
            merged_sops = sop_uid_list
            merged_series = list(series_uid_set)
            merged_total_size = total_size_bytes

        # Step 3: Prepare final merged study metadata
        study_metadata = {
            **base_metadata,
            "FileKey": study_s3_key,

            "StudyName": get_dicom_value(first_instance_dicom_data, "StudyDescription"),
            "StudyUIDHash": hashlib.sha1(study_instance_uid.encode()).hexdigest(),

            # Series Information from first file (snapshot)
            "SeriesInstanceUID": get_dicom_value(first_instance_dicom_data, "SeriesInstanceUID"),
            "SeriesNumber": get_dicom_value(first_instance_dicom_data, "SeriesNumber", 1),
            "SeriesDescription": get_dicom_value(first_instance_dicom_data, "SeriesDescription"),
            "Modality": get_dicom_value(first_instance_dicom_data, "Modality", "OT"),
            "BodyPartExamined": get_dicom_value(first_instance_dicom_data, "BodyPartExamined"),

            # Cumulative metadata
            "NumberOfInstances": len(merged_sops),
            "SOPInstanceUIDList": merged_sops,
            "SeriesInstanceUIDList": merged_series,
            "TotalStudySizeBytes": merged_total_size,
            "DataType": "study"
        }


        final_study_metadata = numToDecimal(study_metadata)
        table.put_item(Item=final_study_metadata)

        return JsonResponse({"message": "Study uploaded successfully"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# @csrf_exempt
# def upload_dicom(request):
#     """
#     This view handles the upload of DICOM files. It generates a pre-signed URL for the DICOM file upload to S3.
#     """
#     # print("Here is the request.method: "+request.method)
#     if request.method != "POST":
#         return JsonResponse({"error": "Method not allowed"}, status=405)

#     try:
#         # Getting the Authorization header from the request, the one where we assigned the bearer token on the frontend
#         auth_header = request.headers.get("Authorization")
#         # print(f"Here's the auth_header: {auth_header} {__name__}")
#         if not auth_header:
#             print("🚨🚨🚨")
#             return JsonResponse({"error": "Missing Authorization header"}, status=401)

#         # Extracting the token from the Authorization header, and sending it to the cognito_token_verification function
#         # to verify the token and extract the Cognito user ID.
#         token = auth_header.split(" ")[1]
#         # print("Token, are you there?"+ token)
#         user_id = cognito_token_verification(token)
#         if not user_id:
#             return JsonResponse({"error": "User Not Authenticated, either token is invalid or expired"}, status=401)

#         # Parsing the request body to get the filename and patient_id
#         data = json.loads(request.body)
#         filename = data.get("filename")
#         # user_id = request.user.id  # Assuming authentication is handled
#         patient_id = data.get("patient_id")

#         print(data)
#         print(f"patient_id: {patient_id}")
#         print(f"user_id: {user_id}")
#         print(request.body)

#         if not filename or not patient_id:
#             print(patient_id)
#             return JsonResponse({"error": "Missing filename or patient_id"}, status=400)

#         print("ready to upload")

#         # Generating the pre-signed URL for the DICOM file upload
#         presigned_url = generate_and_return_presigned_url(filename, user_id, patient_id)
#         if not presigned_url:
#             return JsonResponse({"error": "Failed to generate pre-signed URL"}, status=500)
        
#         print("upload url generated")

#         return JsonResponse({"upload_url": presigned_url})
#     except Exception as e:
#         print(e.message)
#         return JsonResponse({"error": str(e)}, status=500)

# @csrf_exempt
# def upload_study(request):
#     """
#     This view handles the upload of a study. It generates a pre-signed URL for the study upload to S3.
#     """
#     print("in upload_study")
#     if request.method != "POST":
#         return JsonResponse({"error": "Method not allowed"}, status=405)

#     try:
#         # Getting the Authorization header from the request, the one where we assigned the bearer token on the frontend
#         auth_header = request.headers.get("Authorization")
#         # print(f"Here's the auth_header: {auth_header} {__name__}")
#         if not auth_header:
#             print("🚨🚨🚨")
#             return JsonResponse({"error": "Missing Authorization header"}, status=401)

#         # Extracting the token from the Authorization header, and sending it to the cognito_token_verification function
#         # to verify the token and extract the Cognito user ID.
#         token = auth_header.split(" ")[1]
#         # print("Token, are you there?"+ token)
#         user_id = cognito_token_verification(token)
#         if not user_id:
#             return JsonResponse({"error": "User Not Authenticated, either token is invalid or expired"}, status=401)
#         print("auth and token")
#            # ✅ 1. Get all uploaded files
#         files = request.FILES.getlist("files")
#         if not files:
#             return JsonResponse({"error": "No files uploaded"}, status=400)
#         print("got the folder")
#         # ✅ 2. Pick the first file for metadata
#         first_file = files[0]
#         dicom_ds = pydicom.dcmread(first_file)
#         print("dcm file read")
#         patient_id = get_dicom_value(dicom_ds, "PatientID")
#         study_instance_uid = get_dicom_value(dicom_ds, "StudyInstanceUID")

#         s3_key = f"{user_id}/{patient_id}/{study_instance_uid}/study.zip"

#         sop_uid_list = []
#         series_uid_set = set()
#         has_pixel_data = False
#         total_size_bytes = 0

#         # ✅ Scan all files for instance/series UIDs + size
#         for f in files:
#             total_size_bytes += f.size
#             try:
#                 ds = pydicom.dcmread(f)
#                 sop_uid = get_dicom_value(ds, "SOPInstanceUID")
#                 series_uid = get_dicom_value(ds, "SeriesInstanceUID")
#                 sop_uid_list.append(sop_uid)
#                 series_uid_set.add(series_uid)
#                 if "PixelData" in ds:
#                     has_pixel_data = True
#             except Exception as scan_err:
#                 print(f"⚠️ Could not parse one file: {f.name}, skipping UID scan")
#         print("did the folder scan thing")
#         # Extract metadata with defaults
#         metadata = {
#                 "UserID": user_id,
#                 "FileKey": s3_key,

#                 # Patient Information
#                 "PatientID": patient_id,
#                 "PatientName": get_dicom_value(dicom_ds, "PatientName"),
#                 "PatientSex": get_dicom_value(dicom_ds, "PatientSex"),
#                 "PatientAge": get_dicom_value(dicom_ds, "PatientAge"),
#                 "PatientWeight": get_dicom_value(dicom_ds, "PatientWeight"),

#                 # Study Information
#                 "StudyID": get_dicom_value(dicom_ds, "StudyID"),
#                 "StudyDate": get_dicom_value(dicom_ds, "StudyDate"),
#                 "StudyDescription": get_dicom_value(dicom_ds, "StudyDescription"),
#                 "StudyInstanceUID": study_instance_uid,
#                 "AccessionNumber": get_dicom_value(dicom_ds, "AccessionNumber"),

#                 # Series Information
#                 "SeriesInstanceUID": get_dicom_value(dicom_ds, "SeriesInstanceUID"),
#                 "SeriesNumber": get_dicom_value(dicom_ds, "SeriesNumber"),
#                 "SeriesDescription": get_dicom_value(dicom_ds, "SeriesDescription"),
#                 "Modality": get_dicom_value(dicom_ds, "Modality", "OT"),
#                 "BodyPartExamined": get_dicom_value(dicom_ds, "BodyPartExamined"),

#                 # Instance Information
#                 "SOPInstanceUID": get_dicom_value(dicom_ds, "SOPInstanceUID"),
#                 "InstanceNumber": get_dicom_value(dicom_ds, "InstanceNumber", "1"),
#                 "PixelSpacing": get_dicom_value(dicom_ds, "PixelSpacing", "0.5\\0.5"),
#                 "SliceThickness": get_dicom_value(dicom_ds, "SliceThickness", "1.0"),
#                 "ImagePositionPatient": get_dicom_value(dicom_ds, "ImagePositionPatient", "0\\0\\0"),
#                 "ImageOrientationPatient": get_dicom_value(dicom_ds, "ImageOrientationPatient", "1\\0\\0\\0\\1\\0"),
#                 "FrameOfReferenceUID": get_dicom_value(dicom_ds, "FrameOfReferenceUID"),
#                 "WindowCenter": get_dicom_value(dicom_ds, "WindowCenter", "40"),
#                 "WindowWidth": get_dicom_value(dicom_ds, "WindowWidth", "400"),
#                 "BitsAllocated": get_dicom_value(dicom_ds, "BitsAllocated", "16"),
#                 "BitsStored": get_dicom_value(dicom_ds, "BitsStored", "12"),
#                 "Columns": get_dicom_value(dicom_ds, "Columns", "512"),
#                 "Rows": get_dicom_value(dicom_ds, "Rows", "512"),
#                 "PhotometricInterpretation": get_dicom_value(dicom_ds, "PhotometricInterpretation", "MONOCHROME2"),
#                 "SOPClassUID": get_dicom_value(dicom_ds, "SOPClassUID", "1.2.840.10008.5.1.4.1.1.2"),
#                 "NumberOfFrames": int(getattr(dicom_ds, "NumberOfFrames", 1)),

#                 # Equipment & Acquisition Information
#                 "Manufacturer": get_dicom_value(dicom_ds, "Manufacturer"),
#                 "ManufacturerModelName": get_dicom_value(dicom_ds, "ManufacturerModelName"),
#                 "SoftwareVersions": get_dicom_value(dicom_ds, "SoftwareVersions"),
#                 "ContrastBolusAgent": get_dicom_value(dicom_ds, "ContrastBolusAgent"),
#                 "ScanOptions": get_dicom_value(dicom_ds, "ScanOptions"),
#                 "KVP": get_dicom_value(dicom_ds, "KVP"),
#                 "ExposureTime": get_dicom_value(dicom_ds, "ExposureTime"),
#                 "XRayTubeCurrent": get_dicom_value(dicom_ds, "XRayTubeCurrent"),
#                 "ConvolutionKernel": get_dicom_value(dicom_ds, "ConvolutionKernel"),

#                 # Extra metadata
#                 "NumberOfFiles": len(files),
#                 "SOPInstanceUIDList": sop_uid_list,
#                 "SeriesInstanceUIDList": list(series_uid_set),
#                 "HasPixelData": has_pixel_data,
#                 "TotalSizeBytes": total_size_bytes,
#                 "UploadTimestamp": datetime.utcnow().isoformat(),
#                 "StorageType": "zip",
#         }
#         print("metadata filled")
#         # Convert numeric values to Decimal to store in DynamoDB
#         for key, value in metadata.items():
#             if isinstance(value, str) and value.replace(".", "", 1).isdigit():
#                 metadata[key] = Decimal(value)

#         # ✅ 3. Zip all files into memory
#         zip_buffer = io.BytesIO()
#         with zipfile.ZipFile(zip_buffer, "w") as zipf:
#             for f in files:
#                 # Use relative path if available; fallback to name
#                 zipf.writestr(f.name, f.read())
#         print("zipped")

#         zip_buffer.seek(0)

#          # ✅ 4. Upload zip to S3
#         s3 = boto3.client("s3")
#         bucket = os.environ.get("AWS_STORAGE_BUCKET_NAME")

#         s3.upload_fileobj(
#             zip_buffer,
#             bucket,
#             s3_key,
#             ExtraArgs={"ContentType": "application/zip", "ContentDisposition": "attachment; filename=study.zip"}
#         )

#         print("uploaded to s3")

#         # ✅ 5. Write metadata to DynamoDB
#         dynamodb = boto3.resource("dynamodb")
#         table = dynamodb.Table(os.environ.get("DICOM_DYNAMO_TABLE"))
#         table.put_item(Item=metadata)
#         print("table updated")
#         return JsonResponse({"message": "Study uploaded successfully"})

#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)