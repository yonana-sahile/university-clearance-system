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

    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
