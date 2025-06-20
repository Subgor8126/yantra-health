from django.db.models.functions import Cast
from uuid import UUID
from django.db.models import CharField
from api.models import User
from django.http import JsonResponse

def check_user_exists(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "Missing user_id"}, status=400)

    try:
        uuid_obj = UUID(user_id)  # Do NOT specify version
    except ValueError:
        return JsonResponse({"error": "Invalid UUID"}, status=400)

    # Try filtering using string comparison as fallback
    exists = User.objects.annotate(
        user_id_str=Cast("user_id", CharField())
    ).filter(user_id_str=str(uuid_obj)).exists()
    print(f"[DEBUG] User exists: {exists} for user_id: {user_id}")
    return JsonResponse({"exists": exists})