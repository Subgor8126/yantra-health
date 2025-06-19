from django.db import models

class User(models.Model):
    """
    Represents a user in the system.
    Attributes:
        user_id (UUIDField): The unique identifier for the user. Acts as the primary key.
        email (EmailField): The user's email address. Must be unique.
        full_name (CharField): The user's full name. Optional field with a maximum length of 255 characters.
        created_at (DateTimeField): The timestamp when the user was created. Automatically set on creation.
    Methods:
        __str__(): Returns the string representation of the user.
    """

    user_id = models.UUIDField(primary_key=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class Patient(models.Model):
    """
    Represents a patient entity associated with a user, containing personal details
    and metadata for medical imaging purposes.
    """
    patient_id = models.CharField(primary_key=True, max_length=64)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients')
    patient_name = models.CharField(max_length=255, blank=True, null=True)
    patient_sex = models.CharField(max_length=16, blank=True, null=True)
    patient_birth_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.patient_id


class Study(models.Model):
    """
    Represents a medical imaging study associated with a patient.
    Attributes:
        study_instance_uid (str): Unique identifier for the study instance (primary key).
        patient (Patient): Foreign key linking the study to a patient.
        study_date (date): The date the study was conducted. Optional.
        study_description (str): A textual description of the study. Optional.
        modality (str): The imaging modality used in the study (e.g., CT, MRI). Optional.
        institution_name (str): Name of the institution where the study was conducted. Optional.
        created_at (datetime): Timestamp indicating when the study record was created.
    """
    study_instance_uid = models.CharField(primary_key=True, max_length=128)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='studies')
    study_date = models.DateField(blank=True, null=True)
    study_description = models.CharField(max_length=255, blank=True, null=True)
    modality = models.CharField(max_length=64, blank=True, null=True)
    institution_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.study_instance_uid


class Series(models.Model):
    """
    Represents a medical imaging series within a study.
    Attributes:
        series_instance_uid (str): The unique identifier for the series (primary key).
        study (Study): A foreign key linking the series to its parent study.
        series_number (int, optional): The number of the series within the study.
        series_description (str, optional): A textual description of the series.
        modality (str, optional): The imaging modality used for the series (e.g., CT, MRI).
        created_at (datetime): The timestamp when the series was created.
    """
    
    series_instance_uid = models.CharField(primary_key=True, max_length=128)
    study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name='series')
    series_number = models.IntegerField(blank=True, null=True)
    series_description = models.CharField(max_length=255, blank=True, null=True)
    modality = models.CharField(max_length=64, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.series_instance_uid


class Instance(models.Model):
    
    sop_instance_uid = models.CharField(primary_key=True, max_length=128)
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='instances')
    instance_number = models.IntegerField(blank=True, null=True)
    dicom_path = models.CharField(max_length=1024)  # S3 key or URL
    raw_metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sop_instance_uid