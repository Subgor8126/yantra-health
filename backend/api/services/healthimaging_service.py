import boto3
import uuid
import os

client = boto3.client('medical-imaging')

def start_ahi_import(bucket_name, series_file_key):
    """
    Starts AWS HealthImaging import for the given S3 prefix.
    Returns a dict with the job ID.
    """
    input_uri = f's3://{bucket_name}/{series_file_key}/'
    output_uri = 's3://yantra-healthimaging-logger'
    job_token = str(uuid.uuid4())

    response = client.start_dicom_import_job(
        dataStoreId=os.getenv("HEALTHIMAGING_DATA_STORE_ID"),
        inputS3Uri=input_uri,
        outputS3Uri=output_uri,
        clientToken=job_token,
        dataAccessRoleArn=os.getenv("AWS_HEALTHIMAGING_ROLE_ARN")
    )

    return { "jobId": response["jobId"] }