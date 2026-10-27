import random
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, College, Department, Building
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    CollegeSerializer, DepartmentSerializer, BuildingSerializer,
)
from admincsv.models import ValidStudent


@api_view(['GET'])
@permission_classes([AllowAny])
def public_colleges(request):
    return Response(CollegeSerializer(College.objects.all(), many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_departments(request):
    return Response(DepartmentSerializer(Department.objects.all(), many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def buildings_list(request):
    return Response({'buildings': BuildingSerializer(Building.objects.all(), many=True).data})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_student_by_id(request):
    id_number = (request.data.get('id_number') or '').strip()
    if not id_number:
        return Response({'detail': 'id_number required.'}, status=400)
    try:
        s = ValidStudent.objects.get(id_number__iexact=id_number)
    except ValidStudent.DoesNotExist:
        return Response(
            {'detail': 'Student ID not found in university records.'},
            status=404,
        )

    return Response({
        'student': {
            'id': s.id,
            'first_name': s.first_name,
            'last_name': s.last_name,
            'id_number': s.id_number,
            'email': s.email or f"{s.first_name.lower()}.{s.last_name.lower()}@mau.edu.et",
            'college': s.college.name if s.college else '',
            'college_id': s.college_id,
            'department': s.department.name if s.department else '',
            'department_id': s.department_id,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    ser = RegisterSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response({'message': 'Registration successful! You can now log in.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    ser = LoginSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    user = ser.validated_data['user']
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    data = UserSerializer(user).data
    data['token'] = access
    return Response({'user': data, 'token': access, 'refresh': str(refresh)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


# ============================================================
# PASSWORD RESET ENDPOINTS
# ============================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({'message': 'If an account exists, an OTP was sent.'})

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    user.reset_otp = otp
    user.reset_otp_expiry = timezone.now() + timedelta(minutes=10)
    user.save()

    # 🚨 FOR TESTING: We return the OTP so you can see it on the screen.
    print(f"🔑 OTP for {email}: {otp}")

    return Response({
        'message': 'OTP generated successfully.',
        'dev_otp': otp  # Remove this line in real production!
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({'detail': 'Invalid email.'}, status=400)

    if not user.reset_otp or not user.reset_otp_expiry:
        return Response({'detail': 'No OTP requested.'}, status=400)

    if user.reset_otp != otp:
        return Response({'detail': 'Invalid OTP code.'}, status=400)

    if timezone.now() > user.reset_otp_expiry:
        return Response({'detail': 'OTP has expired.'}, status=400)

    return Response({'message': 'OTP verified successfully.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()
    new_password = request.data.get('password', '')

    if len(new_password) < 6:
        return Response({'detail': 'Password must be at least 6 characters.'}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({'detail': 'Invalid email.'}, status=400)

    if user.reset_otp != otp:
        return Response({'detail': 'Invalid OTP code.'}, status=400)

    if timezone.now() > user.reset_otp_expiry:
        return Response({'detail': 'OTP has expired.'}, status=400)

    # ✅ Update Password
    user.set_password(new_password)
    user.reset_otp = None
    user.reset_otp_expiry = None
    user.save()

    return Response({'message': 'Password reset successfully! You can now log in.'})
