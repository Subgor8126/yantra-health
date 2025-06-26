from django.db import models
import uuid


class User(models.Model):
    """
    Represents a user in the system.
    """
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.TextField(blank=True, null=True)
    full_name = models.TextField(blank=True, null=True)
    role = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email or str(self.user_id)


class Patient(models.Model):
    """
    Represents a patient entity associated with a user, containing personal details
    and metadata for medical imaging purposes.
    """
    patient_id = models.TextField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients', 
                           db_column='user_id', to_field='user_id')
    name = models.TextField(blank=True, null=True)
    sex = models.TextField(blank=True, null=True)
    age = models.TextField(blank=True, null=True)
    weight = models.TextField(blank=True, null=True)
    ethnicity = models.TextField(blank=True, null=True)
    birth_date = models.TextField(blank=True, null=True)
    extra_json = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.patient_id


class Study(models.Model):
    """
    Represents a medical imaging study associated with a patient.
    """
    study_instance_uid = models.TextField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='studies',
                              db_column='patient_id', to_field='patient_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='studies',
                           db_column='user_id', to_field='user_id')
    study_id = models.TextField(blank=True, null=True)
    study_date = models.TextField(blank=True, null=True)
    study_time = models.TextField(blank=True, null=True)
    study_description = models.TextField(blank=True, null=True)
    accession_number = models.TextField(blank=True, null=True)
    referring_physician_name = models.TextField(blank=True, null=True)
    modality = models.TextField(blank=True, null=True)
    body_part_examined = models.TextField(blank=True, null=True)
    total_study_size_bytes = models.BigIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.study_instance_uid


class Series(models.Model):
    """
    Represents a medical imaging series within a study.
    """
    series_instance_uid = models.TextField(primary_key=True)
    study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name='series',
                            db_column='study_instance_uid', to_field='study_instance_uid')
    series_number = models.TextField(blank=True, null=True)
    series_description = models.TextField(blank=True, null=True)
    modality = models.TextField(blank=True, null=True)
    body_part_examined = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.series_instance_uid


class Instance(models.Model):
    """
    Represents a DICOM instance within a medical imaging series.
    """
    sop_instance_uid = models.TextField(primary_key=True)
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='instances',
                             db_column='series_instance_uid', to_field='series_instance_uid')
    study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name='instances',
                            db_column='study_instance_uid', to_field='study_instance_uid')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='instances',
                              db_column='patient_id', to_field='patient_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='instances',
                           db_column='user_id', to_field='user_id')
    instance_number = models.TextField(blank=True, null=True)
    file_key = models.TextField(blank=True, null=True)
    pixel_spacing = models.TextField(blank=True, null=True)
    slice_thickness = models.TextField(blank=True, null=True)
    image_position_patient = models.TextField(blank=True, null=True)
    image_orientation_patient = models.TextField(blank=True, null=True)
    frame_of_reference_uid = models.TextField(blank=True, null=True)
    window_center = models.TextField(blank=True, null=True)
    window_width = models.TextField(blank=True, null=True)
    bits_allocated = models.TextField(blank=True, null=True)
    bits_stored = models.TextField(blank=True, null=True)
    columns = models.TextField(blank=True, null=True)
    rows = models.TextField(blank=True, null=True)
    photometric_interpretation = models.TextField(blank=True, null=True)
    sop_class_uid = models.TextField(blank=True, null=True)
    number_of_frames = models.IntegerField(blank=True, null=True)
    has_pixel_data = models.BooleanField(blank=True, null=True)
    total_size_bytes = models.BigIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sop_instance_uid