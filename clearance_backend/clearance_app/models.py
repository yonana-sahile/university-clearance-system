from django.db import models
from django.conf import settings
from accounts.models import Building


class FormStatus(models.TextChoices):
    IN_PROGRESS = 'in_progress', 'In Progress'
    CLEARED_BY_REGISTRAR = 'Cleared by Registrar', 'Cleared by Registrar'
    REJECTED = 'rejected', 'Rejected'
    REQUIRES_PAYMENT = 'requires_payment', 'Requires Payment'


class WorkflowStep(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Main Library", "Supermarket"
    role_required = models.CharField(max_length=50)  # e.g., "librarian", "supermarket"
    order = models.PositiveIntegerField()  # 1, 2, 3, 4...
    is_active = models.BooleanField(default=True)  # Admin can turn a step on/off

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.order}. {self.name} ({self.role_required})"


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

    # ✅ Save the student's pre-clearance checklist
    pre_clearance_checks = models.JSONField(default=dict, blank=True)

    # ✅ NEW DYNAMIC FIELDS (Replaced the 20+ hardcoded fields)
    overall_status = models.CharField(
        max_length=40, choices=FormStatus.choices,
        default=FormStatus.IN_PROGRESS
    )
    current_step = models.ForeignKey(WorkflowStep, on_delete=models.SET_NULL, null=True, blank=True)

    can_resubmit = models.BooleanField(default=False)
    building = models.ForeignKey(Building, null=True, blank=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Form #{self.id} - {self.full_name} ({self.overall_status})"


class ClearanceApproval(models.Model):
    """
    Tracks the history of approvals.
    Instead of columns, every time a staff member clicks 'Approve',
    a new row is created here.
    """
    form = models.ForeignKey(ClearanceForm, on_delete=models.CASCADE, related_name='approvals')
    step = models.ForeignKey(WorkflowStep, on_delete=models.SET_NULL, null=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    note = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='approved')  # approved, rejected, student_signed
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        step_name = self.step.name if self.step else "Deleted Step"
        return f"{self.form.full_name} - {step_name} ({self.status})"


class Dispute(models.Model):
    STATUS_CHOICES = [
        ('under_review', 'Under Review'),
        ('granted', 'Resolution Granted'),
        ('rejected', 'Rejected'),
        ('hearing', 'Hearing Scheduled'),
    ]
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='disputes', null=True, blank=True
    )
    ref = models.CharField(max_length=32, unique=True)
    department = models.CharField(max_length=200)
    category = models.CharField(max_length=200)
    reason = models.TextField()
    evidence = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='under_review')
    resolution_note = models.TextField(blank=True)
    reviewed_by = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ref} - {self.department}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('checked_in', 'Checked In'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='appointments', null=True, blank=True
    )
    ref = models.CharField(max_length=32, unique=True)
    office_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    date = models.DateField()
    time_slot = models.CharField(max_length=50)
    purpose = models.CharField(max_length=300)
    token_number = models.CharField(max_length=32)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ref} - {self.office_name}"

class ChecklistItem(models.Model):
    role = models.CharField(max_length=50)  # e.g., 'departmenthead', 'campuspolice'
    label = models.CharField(max_length=200)  # e.g., 'Return Lab Equipment'
    description = models.TextField(blank=True)  # Detailed description for the student
    order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"[{self.role}] {self.label}"
