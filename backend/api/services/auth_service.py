import jwt
import requests
import os
from django.http import JsonResponse

COGNITO_REGION = os.getenv("AWS_REGION", "us-east-1")
COGNITO_USERPOOL_ID = os.getenv("COGNITO_USERPOOL_ID", "us-east-1_QAGkAfsHK")

def get_cognito_public_keys():
    """Fetch Cognito public keys for token verification"""
    url = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}/.well-known/jwks.json"
    print("In the get_cognito_public_keys function")
    try:
        response = requests.get(url, timeout=5)  # Add timeout
        return response.json().get("keys", [])
    except requests.RequestException as e:
        print(f"Failed to fetch Cognito keys: {e}")
        return None  # Return None if the request fails

def cognito_token_verification(token):
    """Verify JWT token and extract user ID"""
    try:
        print("In the cognito_token_verification function try block")
        keys = get_cognito_public_keys()
        header = jwt.get_unverified_header(token)

        key = next((k for k in keys if k["kid"] == header["kid"]), None)
        
        if not key:
            return None

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        payload = jwt.decode(token, public_key, algorithms=["RS256"], issuer=f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USERPOOL_ID}")
        # before you had the audience parameter that has the Cognito App client ID
        # but you were verifying an access token which doesn't have the audience parameter, hence you changed the parameter
        # to issuer.
        # print(f"-------------------------payload: {payload}")
        cognito_user_id = payload.get("sub")
        print(f"Verified User ID: {cognito_user_id}")

        return cognito_user_id  # Cognito user ID
    except Exception as e:
        print(f"Exception: {e}")
        return None  # ← Fixed: Return None instead of Exception class

def get_user_id_from_request_token(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, JsonResponse({"error": "Missing or malformed Authorization header"}, status=401)

    try:
        token = auth_header.split(" ")[1]
    except IndexError:
        return None, JsonResponse({"error": "Malformed Authorization header"}, status=401)
    
    user_id = cognito_token_verification(token)
    if not user_id:  # This will catch None properly now
        return None, JsonResponse({"error": "Invalid or expired token"}, status=401)

    return user_id, None