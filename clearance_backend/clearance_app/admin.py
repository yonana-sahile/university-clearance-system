from django.contrib import admin
from .models import ClearanceForm


@admin.register(ClearanceForm)
class ClearanceFormAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'id_number', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('id_number', 'full_name')
