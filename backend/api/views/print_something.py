from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

@csrf_exempt
def print_something(request):
    return JsonResponse({"ITurnTheMusicUp": "IGotMyRecordsOn"}, status=200)