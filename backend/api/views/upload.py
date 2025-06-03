from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.services import generate_and_return_presigned_url
from api.services import cognito_token_verification
from decimal import Decimal
from datetime import datetime
import pydicom
import boto3
import os
import hashlib
from decimal import Decimal
from api.services import get_dynamodb_resource
from api.services import get_s3_client
import traceback
import pprint

# DICOM Tag mapping dictionary
DICOM_TAGS = {
    # Patient Information
    "PatientID": "00100020",
    "PatientName": "00100010",
    "PatientSex": "00100040",
    "PatientAge": "00101010",
    "PatientWeight": "00101030",
    "PatientBirthDate": "00100030",                # Date of birth (YYYYMMDD)
    "PatientSize": "00101020",                     # Height in meters
    "EthnicGroup": "00102160",                     # Ethnic background (e.g. ASIAN, HISPANIC)
    "OtherPatientIDs": "00101000",                 # Legacy or secondary IDs
    "OtherPatientNames": "00101001",               # Aliases or alternative names
    "PatientComments": "00104000",                 # Free-text comments (technician/radiologist)
    "AdditionalPatientHistory": "001021B0",        # Medical history entered by operator
    "PregnancyStatus": "001021C0",                 # DICOM-coded pregnancy state
    "PatientAddress": "00101040",                  # Street address (rarely used)
    "CountryOfResidence": "00102150",              # Often for epidemiological tracking
    "RegionOfResidence": "00102152",               # Optional regional info
    "PatientTelephoneNumbers": "00102154",         # Phone contact
    "ResponsiblePerson": "00102201",               # Guardian/responsible adult
    "ResponsiblePersonRole": "00102202",           # Relationship to patient
    "ResponsibleOrganization": "00102203",         # Employer, clinic, guardian org

    # Study Information
    "StudyID": "00200010",
    "StudyDate": "00080020",
    "StudyDescription": "00081030",
    "StudyInstanceUID": "0020000D",
    "AccessionNumber": "00080050",
    "StudyTime": "00080030",

    # Series Information
    "SeriesInstanceUID": "0020000E",
    "SeriesNumber": "00200011",
    "SeriesDescription": "0008103E",
    "Modality": "00080060",
    "BodyPartExamined": "00180015",

    # Instance Information
    "SOPInstanceUID": "00080018",
    "InstanceNumber": "00200013",
    "PixelSpacing": "00280030",
    "SliceThickness": "00180050",
    "ImagePositionPatient": "00200032",
    "ImageOrientationPatient": "00200037",
    "FrameOfReferenceUID": "00200052",
    "WindowCenter": "00281050",
    "WindowWidth": "00281051",
    "BitsAllocated": "00280100",
    "BitsStored": "00280101",
    "Columns": "00280011",
    "Rows": "00280010",
    "PhotometricInterpretation": "00280004",
    "SOPClassUID": "00080016",
    "NumberOfFrames": "00280008",

    # Equipment & Acquisition Information
    "Manufacturer": "00080070",
    "ManufacturerModelName": "00081090",
    "SoftwareVersions": "00181020",
    "ContrastBolusAgent": "00180010",
    "ScanOptions": "00180022",
    "KVP": "00180060",
    "ExposureTime": "00181150",
    "XRayTubeCurrent": "00181151",
    "ConvolutionKernel": "00181210"
}

def get_dicom_value(dicom_data, attribute, default="Unknown"):
    """Safely fetches a DICOM attribute as a string."""
    value = getattr(dicom_data, attribute, default)
    if value is None or value == '':
        return default
    return str(value)

def convert_to_dicom_tags(metadata_dict):
    """Convert attribute names to DICOM tags in metadata dictionary."""
    tagged_metadata = {}
    
    for key, value in metadata_dict.items():
        # If the key has a corresponding DICOM tag, use the tag as the key
        if key in DICOM_TAGS:
            tagged_metadata[DICOM_TAGS[key]] = value
        else:
            # Keep non-DICOM fields as-is (like UserId, FileKey, etc.)
            tagged_metadata[key] = value
    
    return tagged_metadata

def numToDecimal(metadata):
    """Convert numeric values to Decimal to store in DynamoDB"""
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
        
        s3 = get_s3_client()
        bucket = os.environ.get("AWS_STORAGE_BUCKET_NAME")
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table(os.environ.get("DICOM_DYNAMO_TABLE"))     

        sop_uid_list = []
        series_uid_set = set()   
        total_size_bytes = 0
        timestamp = datetime.utcnow().isoformat()

        first_instance_from_study = files[0]
        first_instance_dicom_data = pydicom.dcmread(first_instance_from_study, force=True)
        files[0].seek(0)

        # Base metadata with attribute names (will be converted to tags later)
        base_metadata = {
            "UserId": user_id,
            "UploadTimestamp": timestamp,

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
            "ConvolutionKernel": get_dicom_value(first_instance_dicom_data, "ConvolutionKernel")
        }

        print("here's the base metadata")
        print(base_metadata)

        for f in files:
            dicom_ds = pydicom.dcmread(f, force=True)

            # Extract all the required tags (still using attribute names for reading)
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
            composite_sort_key = f"{study_instance_uid}#{series_instance_uid}#{sop_instance_uid}"
            
            has_pixel_data = False
            if "PixelData" in dicom_ds:
                has_pixel_data = True

            # Instance metadata with attribute names (will be converted to tags)
            instance_metadata = {
                **base_metadata,
                "FileKey": s3_key,
                "CompositeSortKey": composite_sort_key,

                # Patient Information (overwrite with instance-specific values)
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
                "SeriesNumber": get_dicom_value(dicom_ds, "SeriesNumber", "1"),
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

            # Convert attribute names to DICOM tags
            tagged_instance_metadata = convert_to_dicom_tags(instance_metadata)
            final_instance_metadata = numToDecimal(tagged_instance_metadata)
            
            print("Final instance metadata with DICOM tags:")
            pprint.pprint(final_instance_metadata)
            table.put_item(Item=final_instance_metadata)

        study_s3_key = f"{user_id}/{patient_id}/{study_instance_uid}/"

        # Try fetching existing study record
        existing_study = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("UserId").eq(user_id),
            FilterExpression=boto3.dynamodb.conditions.Attr("DataType").eq("study") & boto3.dynamodb.conditions.Attr(DICOM_TAGS["StudyInstanceUID"]).eq(study_instance_uid)
        )

        # Merge previous data if available
        if existing_study.get("Items"):
            prev = existing_study["Items"][0]

            existing_sops = prev.get("SOPInstanceUIDList", [])
            existing_series = prev.get("SeriesInstanceUIDList", [])
            size_raw = prev.get("TotalStudySizeBytes", 0)
            try:
                existing_size = Decimal(str(size_raw))
            except Exception:
                print("Warning: Failed to convert TotalStudySizeBytes to Decimal:", size_raw)
                existing_size = Decimal("0")

            merged_sops = list(set(existing_sops + sop_uid_list))
            merged_series = list(set(existing_series + list(series_uid_set)))
            merged_total_size = existing_size + total_size_bytes
        else:
            merged_sops = sop_uid_list
            merged_series = list(series_uid_set)
            merged_total_size = total_size_bytes

        # Prepare final merged study metadata (with attribute names)
        study_metadata = {
            **base_metadata,
            "FileKey": study_s3_key,

            "StudyName": get_dicom_value(first_instance_dicom_data, "StudyDescription"),
            "StudyUIDHash": hashlib.sha1(study_instance_uid.encode()).hexdigest(),

            # Series Information from first file (snapshot)
            "SeriesInstanceUID": get_dicom_value(first_instance_dicom_data, "SeriesInstanceUID"),
            "SeriesNumber": get_dicom_value(first_instance_dicom_data, "SeriesNumber", "1"),
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

        # Convert attribute names to DICOM tags
        tagged_study_metadata = convert_to_dicom_tags(study_metadata)
        final_study_metadata = numToDecimal(tagged_study_metadata)
        
        print("Final study metadata with DICOM tags:")
        pprint.pprint(final_study_metadata)
        table.put_item(Item=final_study_metadata)



        return JsonResponse({"message": "Study uploaded successfully"})

    except Exception as e:
        # Log full traceback to container logs
        print("Upload failed due to unexpected error:")
        traceback.print_exc()

        # Prevent long or unserializable error messages from crashing JsonResponse
        safe_error = str(e)
        if not isinstance(safe_error, str) or len(safe_error) > 500:
            safe_error = "Unexpected server error occurred."

        return JsonResponse({"error": safe_error}, status=500)