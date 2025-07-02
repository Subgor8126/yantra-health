from rest_framework import serializers
from .models import (
    User,
    Institution,
    InstitutionUser,
    Patient,
    Study,
    Series,
    Instance
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'user_id',
            'email',
            'full_name',
            'user_type',
            'specialty',
            'license_id',
            'created_at',
            'onboarding_complete'
        ]
        read_only_fields = ['user_id', 'created_at']

class InstitutionSerializer(serializers.ModelSerializer):
    admin_user = UserSerializer(read_only=True)

    class Meta:
        model = Institution
        fields = [
            'institution_id',
            'name',
            'institution_type',
            'country',
            'city',
            'contact_email',
            'contact_phone',
            'accreditation_id',
            'admin_user',
            'healthimaging_datastore_id',
            'provisioned_at'
        ]
        read_only_fields = ['institution_id', 'provisioned_at', 'healthimaging_datastore_id']
        

class InstitutionUserSerializer(serializers.ModelSerializer):
    institution = InstitutionSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = InstitutionUser
        fields = [
            'id',
            'institution',
            'user',
            'role',
            'joined_at'
        ]
        read_only_fields = ['id', 'joined_at']

class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer for the Patient model.
    """
    class Meta:
        model = Patient
        fields = '__all__'


class StudySerializer(serializers.ModelSerializer):
    """
    Serializer for the Study model.
    Includes nested Patient reference.
    """
    patient = PatientSerializer(read_only=True)

    class Meta:
        model = Study
        fields = '__all__'


class InstanceSerializer(serializers.ModelSerializer):
    """
    Serializer for Instance model.
    Represents individual SOP Instances belonging to a Series.
    """
    class Meta:
        model = Instance
        fields = '__all__'


class SeriesSerializer(serializers.ModelSerializer):
    """
    Serializer for the Series model.
    Includes nested Study reference and instances.
    """
    study = StudySerializer(read_only=True)
    instances = InstanceSerializer(many=True, read_only=True)

    class Meta:
        model = Series
        fields = '__all__'


# class UserSeriesAccessSerializer(serializers.ModelSerializer):
#     """
#     Serializer for the UserSeriesAccess model.
#     Includes user and series details.
#     """
#     user = UserSerializer(read_only=True)
#     series = SeriesSerializer(read_only=True)

#     class Meta:
#         model = UserSeriesAccess
#         fields = '__all__'