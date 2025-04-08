import boto3
import os
from botocore.exceptions import NoCredentialsError

S3_BUCKET = os.getenv("AWS_STORAGE_BUCKET_NAME", "yantra-healthcare-imaging")
S3_REGION = os.getenv("AWS_S3_REGION", "us-east-1")

s3_client = boto3.client("s3", region_name=S3_REGION)

def generate_and_return_presigned_url(filename, user_id, patient_id, expiration=1800):
    """
    Generates a pre-signed S3 URL for uploading a DICOM file.
    (The expiration parameter is set in seconds, not milliseconds)
    """

    patient_id_str = str(patient_id).replace("/", "//").strip()
    # the code above exists because some of the patient ids were like D97258/11053, and the / in the middle was being
    # treated as a directory separator, hence in S3 it was being created as /D97258 then inside it /11053, and then
    # the file

    object_key = f"{user_id}/{patient_id_str}/{filename}"
    print(object_key)

    try:
        upload_url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": S3_BUCKET, "Key": object_key, "ContentType": "application/dicom"},
            ExpiresIn=expiration,
        )
        return upload_url
    except NoCredentialsError:
        return None

def generate_pre_signed_url_with_file_key(file_key):
    expiration=1800
    try:
        pre_signed_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": file_key},
            ExpiresIn=expiration,
        )
        return pre_signed_url
    except NoCredentialsError:
        return None