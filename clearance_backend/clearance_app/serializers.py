from rest_framework import serializers
from django.utils.timesince import timesince
from .models import (
    ClearanceForm, Dispute, Appointment, WorkflowStep,
    ClearanceApproval, ChecklistItem, PropertyExitPass,
    Notification  # ✅ NEW: Imported Notification model
)


class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = '__all__'


class ClearanceApprovalSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    step_name = serializers.CharField(source='step.name', read_only=True)
    step_order = serializers.IntegerField(source='step.order', read_only=True)

    class Meta:
        model = ClearanceApproval
        fields = '__all__'


class ClearanceFormSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    building = serializers.SerializerMethodField()

    # ✅ Nest the dynamic step and approvals history
    current_step = WorkflowStepSerializer(read_only=True)
    approvals = ClearanceApprovalSerializer(many=True, read_only=True)

    class Meta:
        model = ClearanceForm
        fields = '__all__'  # ✅ This automatically includes pre_clearance_checks

    def get_building(self, obj):
        if not obj.building:
            return None
        return {
            'id': obj.building.id,
            'name': obj.building.name,
            'code': obj.building.code,
        }


class DisputeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dispute
        fields = '__all__'
        read_only_fields = [
            'student', 'ref', 'status', 'resolution_note',
            'reviewed_by', 'created_at', 'updated_at',
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['student', 'ref', 'token_number', 'created_at']


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = '__all__'


class PropertyExitPassSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_id_num = serializers.CharField(source='student.id_number', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)

    class Meta:
        model = PropertyExitPass
        fields = '__all__'


# ✅ NEW: Notification Serializer
class NotificationSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    read = serializers.BooleanField(source='is_read') # Maps 'is_read' to 'read' for the frontend

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'time', 'read']

    def get_time(self, obj):
        return f"{timesince(obj.created_at)} ago"
