import requests
import json
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
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
        student_number=data.get('student_id') or request.user.id_number or '',
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
    if request.user.role == 'student':
        qs = qs.filter(student=request.user)
    return Response(PaymentRecordSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verified_payments(request):
    qs = PaymentRecord.objects.exclude(status='pending')
    if request.user.role == 'student':
        qs = qs.filter(student=request.user)
    return Response(PaymentRecordSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dues_list(request):
    qs = DueRecord.objects.all()
    if request.user.role == 'student':
        qs = qs.filter(student_id=request.user.id_number)
    return Response(DueRecordSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request, payment_id):
    """Staff approves or rejects a submitted payment manually."""
    try:
        record = PaymentRecord.objects.get(id=payment_id)
    except PaymentRecord.DoesNotExist:
        return Response({'detail': 'Payment not found.'}, status=404)

    action = (request.data.get('action') or 'approve').lower()
    reason = request.data.get('reason', '')

    if action == 'approve':
        record.status = 'verified'
        record.verified_by = request.user
        record.verified_at = timezone.now()
    else:
        record.status = 'rejected'
        record.rejection_reason = reason

    record.save()

    return Response({
        'message': f'Payment {action}d successfully!',
        'status': record.status,
        'data': PaymentRecordSerializer(record).data,
    })


# ============================================================
# ✅ NEW: CHAPA AUTOMATED PAYMENT ENDPOINTS
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_chapa_payment(request):
    """Creates a checkout URL and redirects the user to Chapa."""
    amount = request.data.get('amount', 350)
    department = request.data.get('department_type', 'library')

    # Generate a unique transaction reference
    tx_ref = f"MAU-CLR-{request.user.id_number}-{int(timezone.now().timestamp())}"

    # URL the user goes to after paying (Your frontend URL)
    return_url = "http://localhost:5173/payment"

    headers = {
        "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "amount": str(amount),
        "currency": "ETB",
        "email": request.user.email or "student@mau.edu.et",
        "first_name": request.user.first_name or "Student",
        "last_name": request.user.last_name or "User",
        "phone_number": request.user.phone or "0900000000",
        "tx_ref": tx_ref,
        "return_url": return_url,
        "customization": {
            "title": "University Clearance Payment",
            "description": f"Payment for {department} dues"
        }
    }

    # Call Chapa API
    response = requests.post(
        "https://api.chapa.co/v1/transaction/initialize",
        json=payload,
        headers=headers
    )

    if response.status_code == 200:
        data = response.json()

        # Save a pending record in your database
        PaymentRecord.objects.create(
            transaction_id=tx_ref,
            student=request.user,
            student_number=request.user.id_number or '',
            student_name=request.user.full_name(),
            department_type=department,
            amount=amount,
            payment_date=timezone.now().date(),
            status="pending",
            note="Automated Chapa Payment"
        )

        # Return the checkout URL to the frontend
        return Response({"checkout_url": data['data']['checkout_url']})
    else:
        return Response({"error": "Failed to initialize payment", "details": response.text}, status=400)


@csrf_exempt
def chapa_webhook(request):
    """Chapa calls this URL silently in the background when a payment succeeds."""
    if request.method == 'POST':
        try:
            webhook_data = json.loads(request.body)
            tx_ref = webhook_data.get('tx_ref')
            status = webhook_data.get('status')  # 'success' or 'failed'

            try:
                payment = PaymentRecord.objects.get(transaction_id=tx_ref)
                if status == 'success':
                    payment.status = 'verified'  # ✅ AUTOMATIC CLEARANCE
                    payment.verified_at = timezone.now()
                else:
                    payment.status = 'rejected'
                payment.save()
            except PaymentRecord.DoesNotExist:
                pass  # Ignore if not found

            return HttpResponse(status=200)
        except Exception as e:
            return HttpResponse(status=400)

    return HttpResponse(status=405)
