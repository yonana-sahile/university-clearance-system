from django.db import models
from django.conf import settings


class PaymentMethod(models.Model):
    name = models.CharField(max_length=200)
    account_name = models.CharField(max_length=200, blank=True)
    account_number = models.CharField(max_length=100, blank=True)
    bank_name = models.CharField(max_length=200, blank=True)
    phone_number = models.CharField(max_length=32, blank=True)
    instructions = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class PaymentRecord(models.Model):
    STATUS = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    transaction_id = models.CharField(max_length=100, unique=True)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='payments'
    )
    student_id = models.CharField(max_length=32, db_index=True)
    student_name = models.CharField(max_length=200)
    department_type = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)
    payment_date = models.DateField()
    phone_number = models.CharField(max_length=32, blank=True)
    account_last_digits = models.CharField(max_length=10, blank=True)
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    note = models.TextField(blank=True)
    clearance_form = models.ForeignKey(
        'clearance_app.ClearanceForm', on_delete=models.SET_NULL, null=True, blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    rejection_reason = models.TextField(blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='verified_payments'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class DueRecord(models.Model):
    STATUS = [
        ('overdue', 'Overdue'),
        ('due_soon', 'Due Soon'),
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
        ('cleared', 'Cleared'),
    ]
    student_id = models.CharField(max_length=32, db_index=True)
    student_name = models.CharField(max_length=200)
    room_number = models.CharField(max_length=20, blank=True)
    description = models.TextField()
    book_title = models.CharField(max_length=200, blank=True)
    book_id = models.CharField(max_length=50, blank=True)
    incident_type = models.CharField(max_length=100, blank=True)
    cooperation_type = models.CharField(max_length=100, blank=True)
    program_type = models.CharField(max_length=100, blank=True)
    items = models.JSONField(default=list, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    due_date = models.DateField(null=True, blank=True)
    borrow_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    registered_date = models.DateField(auto_now_add=True)
    registered_by = models.CharField(max_length=200, blank=True)
    payment_status = models.CharField(max_length=20, default='unpaid')
    requirements = models.JSONField(default=list, blank=True)
    resolution_date = models.DateField(null=True, blank=True)
