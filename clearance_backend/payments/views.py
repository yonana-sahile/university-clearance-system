from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone

from .models import PaymentMethod, PaymentRecord, DueRecord
from .serializers import (
    PaymentMethodSerializer, PaymentRecordSerializer, DueRecordSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def payment_methods(request):
    return Response(PaymentMethodSerializer(
        PaymentMethod.objects.filter(is_active=True), many=True
    ).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_payment(request):
    data = request.data
    method = PaymentMethod.objects.filter(id=data.get('payment_method_id')).first()
    record = PaymentRecord.objects.create(
        transaction_id=data.get('transaction_id') or f"PAY-{int(timezone.now().timestamp())}",
        student=request.user,
        student_id=data.get('student_id') or request.user.id_number or '',
        student_name=data.get('student_name') or request.user.full_name(),
        department_type=data.get('department_type', 'library'),
        amount=data.get('amount', 0),
        payment_method=method,
        payment_date=data.get('payment_date') or timezone.now().date(),
        phone_number=data.get('phone_number', ''),
        account_last_digits=data.get('account_last_digits', ''),
        note=data.get('note', ''),
        clearance_form_id=data.get('clearance_form_id'),
        status='pending',
    )
    return Response({
        'message': 'Payment submitted successfully for department verification!',
        'data': PaymentRecordSerializer(record).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_payments(request):
    qs = PaymentRecord.objects.filter(status='pending')
    return Response(PaymentRecordSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verified_payments(request):
    qs = PaymentRecord.objects.exclude(status='pending')
    return Response(PaymentRecordSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dues_list(request):
    qs = DueRecord.objects.all()
    if request.user.role == 'student':
        qs = qs.filter(student_id=request.user.id_number)
    return Response(DueRecordSerializer(qs, many=True).data)
