from rest_framework import serializers
from .models import ClearanceForm, Dispute, Appointment


class ClearanceFormSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    building = serializers.SerializerMethodField()

    class Meta:
        model = ClearanceForm
        fields = '__all__'

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
