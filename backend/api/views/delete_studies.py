from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.services import get_user_id_from_request_token
from api.models import Study
from django.views.decorators.http import require_http_methods

@require_http_methods(['DELETE'])
@csrf_exempt
def delete_studies(request):
    user_id, _ = get_user_id_from_request_token(request)
    study_instance_uid = request.GET.get("studyInstanceUid")

    try:
        deleted_studies, _ = Study.objects.filter(user__user_id=user_id, study_instance_uid=study_instance_uid).delete()
        return JsonResponse({ "DeleteText": f"{deleted_studies} record(s) deleted successfully." }, status=200)
    except Exception as e:
        return JsonResponse({ "error": str(e) }, status=500)