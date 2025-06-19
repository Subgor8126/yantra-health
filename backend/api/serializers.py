from rest_framework import serializers
from .models import User, Patient, Study, Series, Instance

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    Converts User model instances into JSON format and validates data for creating or updating User objects.
    """
    class Meta:
        model = User
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer for the Patient model.
    Handles serialization and deserialization of Patient model instances.
    """
    class Meta:
        model = Patient
        fields = '__all__'

class StudySerializer(serializers.ModelSerializer):
    """
    Serializer for the Study model.
    Facilitates conversion of Study model instances to and from JSON format.
    """
    class Meta:
        model = Study
        fields = '__all__'

class SeriesSerializer(serializers.ModelSerializer):
    """
    Serializer for the Series model.
    Manages serialization and validation for Series model instances.
    """
    class Meta:
        model = Series
        fields = '__all__'

class InstanceSerializer(serializers.ModelSerializer):  
    """
    Serializer for the Instance model.
    Provides functionality for serializing and deserializing Instance model data.
    """
    class Meta:
        model = Instance
        fields = '__all__'