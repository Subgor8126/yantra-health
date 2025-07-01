from rest_framework import serializers
from .models import (
    User,
    Patient,
    Study,
    Series,
    Instance,
    UserSeriesAccess
)


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """
    class Meta:
        model = User
        fields = '__all__'


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


class UserSeriesAccessSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserSeriesAccess model.
    Includes user and series details.
    """
    user = UserSerializer(read_only=True)
    series = SeriesSerializer(read_only=True)

    class Meta:
        model = UserSeriesAccess
        fields = '__all__'