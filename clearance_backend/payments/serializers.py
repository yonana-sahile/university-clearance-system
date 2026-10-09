from rest_framework import serializers
from .models import PaymentMethod, PaymentRecord, DueRecord


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'


class PaymentRecordSerializer(serializers.ModelSerializer):
    payment_method_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PaymentRecord
        fields = '__all__'

    def get_payment_method_name(self, obj):
        return obj.payment_method.name if obj.payment_method else None

    def get_verified_by_name(self, obj):
        return obj.verified_by.full_name() if obj.verified_by else None


class DueRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DueRecord
        fields = '__all__'
