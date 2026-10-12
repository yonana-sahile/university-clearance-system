from rest_framework import serializers
from .models import APIKey


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = [
            'id', 'name', 'prefix', 'is_active',
            'created_at', 'last_used_at', 'expires_at',
        ]
        read_only_fields = ['prefix', 'created_at', 'last_used_at']
