from rest_framework import serializers
from .models import ValidStudent


class ValidStudentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    college = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = ValidStudent
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'id_number',
            'email', 'college', 'department', 'year_of_admission',
            'status', 'is_registered', 'registered_at',
        ]

    def get_full_name(self, obj):
        return obj.full_name

    def get_college(self, obj):
        return obj.college.name if obj.college else ''

    def get_department(self, obj):
        return obj.department.name if obj.department else ''
