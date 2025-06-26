from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.services import get_user_id_from_request_token
from api.models import Patient
from django.views.decorators.http import require_http_methods

@require_http_methods(["DELETE"])
@csrf_exempt
def delete_patients(request):
    user_id, _ = get_user_id_from_request_token(request)
    patient_id = request.GET.get("patientId")

    try:
        deleted_patient, _ = Patient.objects.filter(user__user_id=user_id, patient_id=patient_id).delete()
        return JsonResponse({ "DeleteText": f"{deleted_patient} record(s) deleted successfully." }, status=200)
    except Exception as e:
        return JsonResponse({ "error": str(e) }, status=500)