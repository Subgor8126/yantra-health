# Django imports
from django.urls import path, include
from django.http import JsonResponse

from rest_framework.routers import DefaultRouter

# Views imports
from api.views import (
    upload_dicom,
    delete_data_by_file_key,
    print_something,
    check_user_exists,
    create_user,
    get_user,
    get_patients,
    get_studies,
    delete_studies,
    delete_patients,
)

from api.views.user_viewset import UserViewSet

# Services imports
from api.services import (
    get_dicom_metadata,
    get_stats
)
from api.views import user_viewset

router = DefaultRouter()
router.register(r'users', UserViewSet, basename="user")

def api_only_root(request):
    return JsonResponse({"message": "Backend API is running."})

urlpatterns = [
    path('', include(router.urls)),
    path("upload-dicom", upload_dicom, name="upload-dicom"),
    path("get-dicom-metadata", get_dicom_metadata, name="get-dicom-metadata"),
    path("delete-data-by-file-key", delete_data_by_file_key, name="delete-data-by-file-key"),
    path("delete-patients", delete_patients, name="delete-patients"),
    path("delete-studies", delete_studies, name="delete-studies"),
    path("check-user-exists", check_user_exists, name="check-user-exists"),
    path("create-user", create_user, name="create-user"),
    path("get-user", get_user, name="get-user"),
    path("get-patients", get_patients, name="get-patients"),
    path("get-studies", get_studies, name="get-studies"),
    path("print-something", print_something, name="print-something"),
    path("stats", get_stats, name="stats"),
    path("", api_only_root)
]

# in the path() function call, the first argument is the actual path name, the second argument is the function to call
# when this path is accessed, and the third argument is the name of the path. The name of the path is used to reference
# this path in other parts of the code, such as in the template files. The name of the path is optional, but it is
# recommended to provide a name for each path to make the code more readable and maintainable.