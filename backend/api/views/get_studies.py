from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.services import get_user_id_from_request_token
from api.models import Study
from django.views.decorators.http import require_GET

@require_GET
@csrf_exempt
def get_studies(request):

    user_id, error_response = get_user_id_from_request_token(request)
    patient_id = request.GET.get("patientId")

    print(f"Getting studies for User {user_id} and patient {patient_id}")

    if not user_id:
        return JsonResponse({"error": "Unable to extract User ID from received bearer token, or no token was passed"}, status=400)

    if not patient_id:
        return JsonResponse({"error": "Patient ID not provided"}, status=400)
    
    try:
        studies = Study.objects.filter(user__user_id=user_id, patient__patient_id=patient_id)
        print(f"Got the studies, {studies}")

        if not studies.exists():
            return JsonResponse({
                "studies": [],
                "message": "No Studies Found for this patient"
            }, status=200)

        studies_response=[
            {
                "study_instance_uid": study.study_instance_uid,
                "study_id": study.study_id,
                "accession_number": study.accession_number,
                "study_date": study.study_date,
                "study_time": study.study_time,
                "study_description": study.study_description,
                "referring_physician_name": study.referring_physician_name,
                "modality": study.modality,
                "body_part_examined": study.body_part_examined,
                "total_study_size_bytes": study.total_study_size_bytes,
                "created_at": study.created_at.isoformat(),
                "number_of_series": study.series.count(),
                "number_of_instances": study.instances.count()
            }
            for study in studies
        ]

        return JsonResponse({
            "studies": studies_response
        }, status=200)

    except ValueError:
        return JsonResponse({"error": "Bad value"}, status=400)

    except Exception as e:
        # final catch-all
        return JsonResponse({"error": str(e)}, status=500)