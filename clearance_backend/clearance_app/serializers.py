from rest_framework import serializers
from .models import ClearanceForm


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
