from django.http import JsonResponse
from uuid import UUID
from api.models import User
from api.services import get_user_id_from_request_token
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt

@require_GET
@csrf_exempt
def get_user(request):
    """
    Handles the retrieval of user information based on the user ID extracted from the request token.

    Args:
        request (HttpRequest): The HTTP request object containing the token.

    Returns:
        JsonResponse: A JSON response containing user details or an error message.
    """


    # Get user ID from token in request
    user_id, error_response = get_user_id_from_request_token(request)
    if error_response:
        return error_response
    
    if not user_id:
        return JsonResponse({"error": "Missing user_id"}, status=400)

    try:
        uuid_obj = UUID(user_id)
    except ValueError:
        return JsonResponse({"error": "Invalid UUID"}, status=400)

    try:
        user = User.objects.get(user_id=uuid_obj)
        return JsonResponse({
            "user_id": str(user.user_id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": user.created_at.isoformat(),
            "number_of_patients": user.patients.count()
        })
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)