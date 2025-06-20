from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.services import create_user_service
from api.models import User
from uuid import UUID
import json

@csrf_exempt  # optional if you're not using proper CSRF tokens yet
def create_user(request):
    print("Creating User...")
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        body = json.loads(request.body)
        user_id = UUID(body.get("user_id"))
        email = body.get("email")
        full_name = body.get("full_name")
        role = body.get("role")

        print(f"[DEBUG] Received user_id: {user_id}, email: {email}, full_name: {full_name}, role: {role}")

        if not email:
            return JsonResponse({"error": "Email is required"}, status=400)

        # Don't allow duplicate creation
        if User.objects.filter(user_id=user_id).exists():
            return JsonResponse({"error": "User already exists"}, status=400)

        create_user_service(user_id, email, full_name, role)
        return JsonResponse({"success": True})

    except (ValueError, TypeError, json.JSONDecodeError) as e:
        return JsonResponse({"error": f"Invalid input: {str(e)}"}, status=400)