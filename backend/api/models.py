from django.db import models
import uuid


class User(models.Model):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=True, blank=True)
    full_name = models.TextField(null=True, blank=True)
    user_type = models.TextField(null=True, blank=True)
    specialty = models.TextField(null=True, blank=True)
    license_id = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    onboarding_complete = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return self.email or str(self.id)
    
class Institution(models.Model):
    institution_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(null=True, blank=True)
    institution_type = models.TextField(null=True, blank=True)
    country = models.TextField(null=True, blank=True)
    city = models.TextField(null=True, blank=True)
    contact_email = models.EmailField(unique=True, null=True, blank=True)
    contact_phone = models.TextField(null=True, blank=True)
    accreditation_id = models.TextField(null=True, blank=True)
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='institution', editable=False)
    healthimaging_datastore_id = models.TextField(null=True, blank=True)
    provisioned_at = models.DateTimeField(auto_now_add=True)

class InstitutionUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='institution_user')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='related_institution')
    role = models.TextField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.TextField(unique=True)  # DICOM PatientID
    name = models.TextField(null=True, blank=True)
    birth_date = models.TextField(null=True, blank=True)
    sex = models.TextField(null=True, blank=True)
    ethnicity = models.TextField(null=True, blank=True)
    weight = models.TextField(null=True, blank=True)
    age = models.TextField(null=True, blank=True)
    extra_json = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.patient_id


class Study(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    study_instance_uid = models.TextField(unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='studies')

    study_id = models.TextField(null=True, blank=True)
    study_date = models.TextField(null=True, blank=True)
    study_time = models.TextField(null=True, blank=True)
    study_description = models.TextField(null=True, blank=True)
    accession_number = models.TextField(null=True, blank=True)
    referring_physician_name = models.TextField(null=True, blank=True)
    modality = models.TextField(null=True, blank=True)
    body_part_examined = models.TextField(null=True, blank=True)
    total_study_size_bytes = models.BigIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.study_instance_uid


class Series(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    series_instance_uid = models.TextField(unique=True)
    study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name='series')

    modality = models.TextField(null=True, blank=True)
    series_number = models.TextField(null=True, blank=True)
    series_description = models.TextField(null=True, blank=True)
    body_part_examined = models.TextField(null=True, blank=True)
    canonical_instance_count = models.IntegerField()  # Required number of instances
    healthimaging_imageset_id = models.TextField()   # AWS HealthImaging reference

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.series_instance_uid


class Instance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='instances')
    sop_instance_uid = models.TextField(unique=True)
    content_hash = models.TextField()  # SHA256 hash of DICOM content

    instance_number = models.TextField(null=True, blank=True)
    file_key = models.TextField(null=True, blank=True)
    pixel_spacing = models.TextField(null=True, blank=True)
    slice_thickness = models.TextField(null=True, blank=True)
    image_position_patient = models.TextField(null=True, blank=True)
    image_orientation_patient = models.TextField(null=True, blank=True)
    frame_of_reference_uid = models.TextField(null=True, blank=True)
    window_center = models.TextField(null=True, blank=True)
    window_width = models.TextField(null=True, blank=True)
    bits_allocated = models.TextField(null=True, blank=True)
    bits_stored = models.TextField(null=True, blank=True)
    columns = models.TextField(null=True, blank=True)
    rows = models.TextField(null=True, blank=True)
    photometric_interpretation = models.TextField(null=True, blank=True)
    sop_class_uid = models.TextField(null=True, blank=True)
    number_of_frames = models.IntegerField(null=True, blank=True)
    has_pixel_data = models.BooleanField(null=True, blank=True)
    total_size_bytes = models.BigIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sop_instance_uid


class UserSeriesAccess(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='series_access')
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='user_access')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'series')

    def __str__(self):
        return f"{self.user_id} -> {self.series_id}"


# from django.db import models
# import uuid


# class User(models.Model):
#     user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     email = models.TextField(blank=True, null=True)
#     full_name = models.TextField(blank=True, null=True)
#     role = models.TextField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.email or str(self.user_id)


# class Patient(models.Model):
#     patient_id = models.TextField()
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients')
#     name = models.TextField(blank=True, null=True)
#     sex = models.TextField(blank=True, null=True)
#     age = models.TextField(blank=True, null=True)
#     weight = models.TextField(blank=True, null=True)
#     ethnicity = models.TextField(blank=True, null=True)
#     birth_date = models.TextField(blank=True, null=True)
#     extra_json = models.JSONField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         constraints = [
#             models.UniqueConstraint(fields=['user', 'patient_id'], name='user_patient_unique')
#         ]
#         indexes = [models.Index(fields=['user', 'patient_id'])]

#     def __str__(self):
#         return f"{self.user_id}-{self.patient_id}"


# class Study(models.Model):
#     study_instance_uid = models.TextField()
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='studies')
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='studies')
#     study_id = models.TextField(blank=True, null=True)
#     study_date = models.TextField(blank=True, null=True)
#     study_time = models.TextField(blank=True, null=True)
#     study_description = models.TextField(blank=True, null=True)
#     accession_number = models.TextField(blank=True, null=True)
#     referring_physician_name = models.TextField(blank=True, null=True)
#     modality = models.TextField(blank=True, null=True)
#     body_part_examined = models.TextField(blank=True, null=True)
#     total_study_size_bytes = models.BigIntegerField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         constraints = [
#             models.UniqueConstraint(fields=['user', 'study_instance_uid'], name='user_study_unique')
#         ]
#         indexes = [models.Index(fields=['user', 'study_instance_uid'])]

#     def __str__(self):
#         return f"{self.user_id}-{self.study_instance_uid}"


# class Series(models.Model):
#     series_instance_uid = models.TextField()
#     study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name='series')
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='series')
#     series_number = models.TextField(blank=True, null=True)
#     series_description = models.TextField(blank=True, null=True)
#     modality = models.TextField(blank=True, null=True)
#     body_part_examined = models.TextField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         constraints = [
#             models.UniqueConstraint(fields=['user', 'series_instance_uid'], name='user_series_unique')
#         ]
#         indexes = [models.Index(fields=['user', 'series_instance_uid'])]

#     def __str__(self):
#         return f"{self.user_id}-{self.series_instance_uid}"


# class Instance(models.Model):
#     sop_instance_uid = models.TextField()
#     series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='instances')
#     study = models.ForeignKey(Study, on_delete=models.CASCADE, related_name='instances')
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='instances')
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='instances')
#     instance_number = models.TextField(blank=True, null=True)
#     file_key = models.TextField(blank=True, null=True)
#     pixel_spacing = models.TextField(blank=True, null=True)
#     slice_thickness = models.TextField(blank=True, null=True)
#     image_position_patient = models.TextField(blank=True, null=True)
#     image_orientation_patient = models.TextField(blank=True, null=True)
#     frame_of_reference_uid = models.TextField(blank=True, null=True)
#     window_center = models.TextField(blank=True, null=True)
#     window_width = models.TextField(blank=True, null=True)
#     bits_allocated = models.TextField(blank=True, null=True)
#     bits_stored = models.TextField(blank=True, null=True)
#     columns = models.TextField(blank=True, null=True)
#     rows = models.TextField(blank=True, null=True)
#     photometric_interpretation = models.TextField(blank=True, null=True)
#     sop_class_uid = models.TextField(blank=True, null=True)
#     number_of_frames = models.IntegerField(blank=True, null=True)
#     has_pixel_data = models.BooleanField(blank=True, null=True)
#     total_size_bytes = models.BigIntegerField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         constraints = [
#             models.UniqueConstraint(fields=['user', 'sop_instance_uid'], name='user_instance_unique')
#         ]
#         indexes = [models.Index(fields=['user', 'sop_instance_uid'])]

#     def __str__(self):
#         return f"{self.user_id}-{self.sop_instance_uid}"