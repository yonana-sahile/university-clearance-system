from django.contrib import admin
from .models import ValidStudent


@admin.register(ValidStudent)
class ValidStudentAdmin(admin.ModelAdmin):
    list_display = ('id_number', 'first_name', 'last_name', 'college', 'is_registered')
    search_fields = ('id_number', 'first_name', 'last_name')
    list_filter = ('status', 'is_registered', 'college')
