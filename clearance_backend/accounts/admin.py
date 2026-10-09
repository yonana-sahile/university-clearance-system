from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, College, Department, Building

admin.site.register(College)
admin.site.register(Department)
admin.site.register(Building)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'id_number')
    list_filter = ('role',)
    fieldsets = UserAdmin.fieldsets + (
        ('Clearance Info', {
            'fields': ('role', 'id_number', 'phone', 'college', 'department', 'building')
        }),
    )
