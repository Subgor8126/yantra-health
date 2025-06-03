from django.urls import path
from django.http import JsonResponse
from api.views import upload_dicom
from api.services import get_study_data_by_uid
from api.views import delete_data_by_file_key
from api.views import print_something
from api.services import get_stats

def api_only_root(request):
    return JsonResponse({"message": "Backend API is running."})

urlpatterns = [
    path("upload-dicom", upload_dicom, name="upload-dicom"),
    path("get-study-data-by-uid", get_study_data_by_uid, name="get-study-data-by-uid"),
    path("delete-data-by-file-key", delete_data_by_file_key, name="delete-data-by-file-key"),
    path("print-something", print_something, name="print-something"),
    path("stats", get_stats, name="stats"),
    path("", api_only_root)
]

# in the path() function call, the first argument is the actual path name, the second argument is the function to call
# when this path is accessed, and the third argument is the name of the path. The name of the path is used to reference
# this path in other parts of the code, such as in the template files. The name of the path is optional, but it is
# recommended to provide a name for each path to make the code more readable and maintainable.