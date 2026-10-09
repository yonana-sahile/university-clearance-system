from django.db import models
from django.conf import settings
from accounts.models import Building


class FormStatus(models.TextChoices):
    PENDING_DEPARTMENT = 'pending_department'
    APPROVED_DEPARTMENT = 'approved_department'
    APPROVED_LIBRARY = 'approved_library'
    APPROVED_CAFETERIA = 'approved_cafeteria'
    APPROVED_PSYCHOLOGY = 'approved_psychology'
    APPROVED_SPORTMASTER = 'approved_sportmaster'
    APPROVED_CAMPUSPOLICE = 'approved_campuspolice'
    APPROVED_COOPERATION = 'approved_cooperationsharing'
    APPROVED_DOP = 'approved_dopcordinator'
    APPROVED_STUDENTAFFAIRS = 'approved_studentaffairs'
    APPROVED_DORMITORY = 'approved_dormitory'
    CLEARED_BY_REGISTRAR = 'Cleared by Registrar'
    REJECTED = 'rejected'
    REQUIRES_LIBRARY_PAYMENT = 'requires_library_payment'
    REQUIRES_CAFETERIA_PAYMENT = 'requires_cafeteria_payment'
    REQUIRES_DORMITORY_PAYMENT = 'requires_dormitory_payment'
    PENDING_RESUBMISSION = 'pending_resubmission'


class ClearanceForm(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='clearance_forms', null=True, blank=True
    )
    full_name = models.CharField(max_length=200)
    id_number = models.CharField(max_length=32, db_index=True)
    student_email = models.EmailField(blank=True)
    college = models.CharField(max_length=200, blank=True)
    department_name = models.CharField(max_length=200, blank=True)
    program_level = models.CharField(max_length=100, blank=True)
    enrollment_type = models.CharField(max_length=100, blank=True)
    year = models.CharField(max_length=50, blank=True)
    semester = models.CharField(max_length=50, blank=True)
    reason = models.TextField(blank=True)

    status = models.CharField(
        max_length=40, choices=FormStatus.choices,
        default=FormStatus.PENDING_DEPARTMENT
    )
    can_resubmit = models.BooleanField(default=False)

    note = models.TextField(blank=True)
    department_note = models.TextField(blank=True)
    department_approved_by = models.CharField(max_length=200, blank=True)
    library_note = models.TextField(blank=True)
    library_approved_by = models.CharField(max_length=200, blank=True)
    cafeteria_note = models.TextField(blank=True)
    cafeteria_approved_by = models.CharField(max_length=200, blank=True)
    psychology_note = models.TextField(blank=True)
    psychology_approved_by = models.CharField(max_length=200, blank=True)
    sportmaster_note = models.TextField(blank=True)
    sportmaster_approved_by = models.CharField(max_length=200, blank=True)
    campuspolice_note = models.TextField(blank=True)
    campuspolice_approved_by = models.CharField(max_length=200, blank=True)
    cooperationsharing_note = models.TextField(blank=True)
    cooperationsharing_approved_by = models.CharField(max_length=200, blank=True)
    dopcordinator_note = models.TextField(blank=True)
    dopcoordinator_approved_by = models.CharField(max_length=200, blank=True)
    studentaffairs_note = models.TextField(blank=True)
    studentaffairs_approved_by = models.CharField(max_length=200, blank=True)
    dormitory_note = models.TextField(blank=True)
    dormitory_approved_by = models.CharField(max_length=200, blank=True)
    registrar_note = models.TextField(blank=True)
    registrar_approved_by = models.CharField(max_length=200, blank=True)

    building = models.ForeignKey(Building, null=True, blank=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Form #{self.id} - {self.full_name} ({self.status})"
