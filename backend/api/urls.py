# Django imports
from django.urls import path
from django.http import JsonResponse

# Views imports
from api.views import (
    upload_dicom,
    delete_data_by_file_key,
    print_something,
    check_user_exists,
    create_user
)

# Services imports
from api.services import (
    get_dicom_metadata,
    get_stats
)

def api_only_root(request):
    return JsonResponse({"message": "Backend API is running."})

urlpatterns = [
    path("upload-dicom", upload_dicom, name="upload-dicom"),
    path("get-dicom-metadata", get_dicom_metadata, name="get-dicom-metadata"),
    path("delete-data-by-file-key", delete_data_by_file_key, name="delete-data-by-file-key"),
    path("check-user-exists", check_user_exists, name="check-user-exists"),
    path("create-user", create_user, name="create-user"),
    path("print-something", print_something, name="print-something"),
    path("stats", get_stats, name="stats"),
    path("", api_only_root)
]

# in the path() function call, the first argument is the actual path name, the second argument is the function to call
# when this path is accessed, and the third argument is the name of the path. The name of the path is used to reference
# this path in other parts of the code, such as in the template files. The name of the path is optional, but it is
# recommended to provide a name for each path to make the code more readable and maintainable.