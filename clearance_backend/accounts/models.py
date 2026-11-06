from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    STUDENT = 'student', 'Student'
    DEPARTMENT_HEAD = 'departmenthead', 'Department Head'
    LIBRARIAN = 'librarian', 'Librarian'
    CAFETERIA = 'cafeteria', 'Cafeteria'
    PSYCHOLOGY = 'psychology', 'Psychology'
    SPORTMASTER = 'sportmaster', 'Sport Master'
    CAMPUS_POLICE = 'campuspolice', 'Campus Police'
    COOPERATION_SHARING = 'cooperationsharing', 'Cooperation & Sharing'
    DOP_COORDINATOR = 'dopcordinator', 'DOP Coordinator'
    STUDENT_AFFAIRS = 'studentaffairs', 'Student Affairs'
    DORMITORY = 'dormitory', 'Dormitory'
    REGISTRAR = 'registrar', 'Registrar'
    ADMIN = 'admin', 'Admin'


class College(models.Model):
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=200)

    class Meta:
        unique_together = ('college', 'name')

    def __str__(self):
        return self.name


class Building(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.name} [{self.code}]"


class User(AbstractUser):
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.STUDENT)
    id_number = models.CharField(max_length=32, blank=True, null=True, unique=True)
    phone = models.CharField(max_length=32, blank=True)
    college = models.ForeignKey(College, null=True, blank=True, on_delete=models.SET_NULL)
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL)
    building = models.ForeignKey(Building, null=True, blank=True, on_delete=models.SET_NULL)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    # ✅ NEW FIELDS FOR LOCKING ACADEMIC INFO
    program_level = models.CharField(max_length=100, blank=True)
    enrollment_type = models.CharField(max_length=100, blank=True)
    current_year = models.CharField(max_length=50, blank=True)

    # ✅ FIELDS FOR PASSWORD RESET
    reset_otp = models.CharField(max_length=6, blank=True, null=True)
    reset_otp_expiry = models.DateTimeField(blank=True, null=True)

    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


# ============================================================
# ✅ GLOBAL SYSTEM SETTINGS (LOCK/UNLOCK PORTAL)
# ============================================================
class SystemSetting(models.Model):
    """
    Singleton model to store global system settings.
    There should only be ONE row (id=1).
    """
    is_clearance_open = models.BooleanField(
        default=False,
        help_text='If true, students can submit clearance forms. If false, portal is locked.'
    )
    locked_message = models.CharField(
        max_length=255,
        default='The clearance portal is currently locked by the administration. Please check back later.',
        blank=True
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='settings_updated'
    )

    class Meta:
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f"Clearance Open: {self.is_clearance_open}"

    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings row."""
        obj, _ = cls.objects.get_or_create(id=1)
        return obj
