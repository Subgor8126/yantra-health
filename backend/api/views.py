import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .s3_utils import generate_and_return_presigned_url
from .auth_utils import cognito_token_verification

# Create your views here.

@csrf_exempt
def upload_dicom(request):
    """
    Handles pre-signed URL generation for DICOM file uploads.
    """
    # print("Here is the request.method: "+request.method)
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        # Getting the Authorization header from the request, the one where we assigned the bearer token on the frontend
        auth_header = request.headers.get("Authorization")
        # print(f"Here's the auth_header: {auth_header} {__name__}")
        if not auth_header:
            print("🚨🚨🚨")
            return JsonResponse({"error": "Missing Authorization header"}, status=401)

        # Extracting the token from the Authorization header, and sending it to the cognito_token_verification function
        # to verify the token and extract the Cognito user ID.
        token = auth_header.split(" ")[1]
        # print("Token, are you there?"+ token)
        user_id = cognito_token_verification(token)
        if not user_id:
            return JsonResponse({"error": "User Not Authenticated, either token is invalid or expired"}, status=401)

        # Parsing the request body to get the filename and patient_id
        data = json.loads(request.body)
        filename = data.get("filename")
        # user_id = request.user.id  # Assuming authentication is handled
        patient_id = data.get("patient_id")

        print("chatgptpt")
        print(data)
        print(f"patient_id: {patient_id}")
        print(f"user_id: {user_id}")
        print(request.body)

        if not filename or not patient_id:
            print(patient_id)
            return JsonResponse({"error": "Missing filename or patient_id"}, status=400)

        print("ready to upload")

        # Generating the pre-signed URL for the DICOM file upload
        presigned_url = generate_and_return_presigned_url(filename, user_id, patient_id)
        if not presigned_url:
            return JsonResponse({"error": "Failed to generate pre-signed URL"}, status=500)
        
        print("upload url generated")

        return JsonResponse({"upload_url": presigned_url})
    except Exception as e:
        print(e.message)
        return JsonResponse({"error": str(e)}, status=500)
