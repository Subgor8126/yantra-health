from rest_framework import viewsets
from api.models import InstitutionUser
from api.serializers import InstitutionUserSerializer

class InstitutionUserViewSet(viewsets.ModelViewSet):
    queryset = InstitutionUser.objects.all()
    serializer_class = InstitutionUserSerializer

    def perform_create(self, serializer):
        serializer.save()