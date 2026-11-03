from django.contrib import admin
from .models import ClearanceForm, WorkflowStep, ClearanceApproval, Dispute, Appointment


@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = ('order', 'name', 'role_required', 'is_active')
    list_filter = ('is_active', 'role_required')
    ordering = ('order',)


class ClearanceApprovalInline(admin.TabularInline):
    model = ClearanceApproval
    extra = 0
    readonly_fields = ('step', 'approved_by', 'status', 'note', 'timestamp')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ClearanceForm)
class ClearanceFormAdmin(admin.ModelAdmin):
    # ✅ Changed 'status' to 'overall_status' and added 'current_step'
    list_display = ('id', 'full_name', 'id_number', 'overall_status', 'current_step', 'created_at')
    list_filter = ('overall_status', 'current_step', 'college')
    search_fields = ('id_number', 'full_name')
    inlines = [ClearanceApprovalInline]


@admin.register(ClearanceApproval)
class ClearanceApprovalAdmin(admin.ModelAdmin):
    list_display = ('id', 'form', 'step', 'approved_by', 'status', 'timestamp')
    list_filter = ('status', 'step')
    search_fields = ('form__full_name', 'form__id_number')


admin.site.register(Dispute)
admin.site.register(Appointment)
