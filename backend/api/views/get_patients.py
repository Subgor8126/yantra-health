from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.services import get_user_id_from_request_token
from api.models import Patient
from django.views.decorators.http import require_GET

@require_GET
@csrf_exempt
def get_patients(request):
    """
    Handles GET requests to retrieve patients associated with a specific user.

    Args:
        request: The HTTP request object containing user authentication details.

    Returns:
        JsonResponse: A JSON response containing the list of patients or an error message.
    """

    user_id, error_response = get_user_id_from_request_token(request)
    if error_response:
        return error_response

    if not user_id:
        return JsonResponse({"error": "Missing user_id"}, status=400)
    
    try:
        patients = Patient.objects.filter(user__user_id=user_id)
        # user__user_id means it checks the corresponding user_id in the patient table, goes to the row in the
        # user table which has that user id, and checks if that user id matches with the one we've passed.
        # Basically we say, “Give me all Patient records where the related User object has user_id = user_id”
        # We do it because it's more ORM-idiomatic and future-proof — it explicitly follows the model relationship
        # (user → user_id) rather than assuming the column name (user_id) won’t change. It's also more readable 
        # and consistent when filtering on related fields across multiple models.
        # And the filter function returns a **QuerySet** object which is like a list of objects, where each object 
        # corresponds to one row in the table, and we access it like p.name and p.age where "p" is one object in that
        # list.

        if not patients.exists():
            return JsonResponse({
                "patients": [],
                "message": "No patients found for this user."
            }, status=200)
        
        patients_response = [
            {
                "patient_id": p.patient_id,
                "name": p.name,
                "age": p.age,
                "sex": p.sex,
                "birth_date": p.birth_date,
                "number_of_studies": p.studies.count()
            }
            for p in patients
        ]

        return JsonResponse({ "patients":patients_response }, status=200)

    except ValueError:
        return JsonResponse({"error": "Bad value"}, status=400)

    except Exception as e:
        # final catch-all
        return JsonResponse({"error": str(e)}, status=500)