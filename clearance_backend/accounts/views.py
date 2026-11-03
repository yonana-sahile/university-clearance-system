import random
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, College, Department, Building, SystemSetting
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


# ============================================================
# ADMIN STAFF CREATION ENDPOINT
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_staff(request):
    if request.user.role != 'admin':
        return Response({'detail': 'Only admin can create staff.'}, status=403)

    data = request.data
    if User.objects.filter(username=data.get('username')).exists():
        return Response({'detail': 'Username already exists.'}, status=400)

    # ✅ FIXED: Find the department by ID instead of name to prevent collisions
    dept_id = data.get('department_id')
    dept = Department.objects.filter(id=dept_id).first() if dept_id else None
    college = dept.college if dept else None

    user = User.objects.create_user(
        username=data.get('username'),
        password=data.get('password'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        role=data.get('role'),
        email=data.get('email', f"{data.get('username')}@mau.edu.et"),
        department=dept,
        college=college
    )
    return Response({'message': 'Staff created successfully.', 'id': user.id}, status=201)


# ============================================================
# ADMIN ACADEMICS (COLLEGES & DEPARTMENTS) ENDPOINTS
# ============================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_colleges(request):
    if request.method == 'GET':
        return Response(CollegeSerializer(College.objects.all(), many=True).data)

    if request.user.role != 'admin':
        return Response({'detail': 'Only admin can add colleges.'}, status=403)

    name = (request.data.get('name') or '').strip()
    if not name:
        return Response({'detail': 'College name required.'}, status=400)

    if College.objects.filter(name__iexact=name).exists():
        return Response({'detail': 'College already exists.'}, status=400)

    college = College.objects.create(name=name)
    return Response(CollegeSerializer(college).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_college_detail(request, pk):
    if request.user.role != 'admin':
        return Response({'detail': 'Only admin can delete colleges.'}, status=403)

    deleted, _ = College.objects.filter(id=pk).delete()
    if not deleted:
        return Response({'detail': 'College not found.'}, status=404)
    return Response(status=204)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_departments(request):
    if request.method == 'GET':
        return Response(DepartmentSerializer(Department.objects.all(), many=True).data)

    if request.user.role != 'admin':
        return Response({'detail': 'Only admin can add departments.'}, status=403)

    name = (request.data.get('name') or '').strip()
    college_id = request.data.get('college_id')

    if not name or not college_id:
        return Response({'detail': 'Department name and College ID required.'}, status=400)

    if not College.objects.filter(id=college_id).exists():
        return Response({'detail': 'Selected college does not exist.'}, status=400)

    if Department.objects.filter(name__iexact=name, college_id=college_id).exists():
        return Response({'detail': 'Department already exists in this college.'}, status=400)

    dept = Department.objects.create(name=name, college_id=college_id)
    return Response(DepartmentSerializer(dept).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_department_detail(request, pk):
    if request.user.role != 'admin':
        return Response({'detail': 'Only admin can delete departments.'}, status=403)

    deleted, _ = Department.objects.filter(id=pk).delete()
    if not deleted:
        return Response({'detail': 'Department not found.'}, status=404)
    return Response(status=204)


# ============================================================
# ✅ NEW: GLOBAL SYSTEM SETTINGS (LOCK/UNLOCK)
# ============================================================

@api_view(['GET'])
@permission_classes([AllowAny])  # Anyone can check if portal is open
def get_system_settings(request):
    settings = SystemSetting.get_settings()
    return Response({
        'is_clearance_open': settings.is_clearance_open,
        'locked_message': settings.locked_message,
        'updated_at': settings.updated_at.isoformat() if settings.updated_at else None,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_clearance_portal(request):
    """Admin-only — toggle the global lock/unlock state."""
    if request.user.role != 'admin':
        return Response({'detail': 'Only admin can toggle the clearance portal.'}, status=403)

    is_open = bool(request.data.get('is_clearance_open', False))
    custom_message = request.data.get('locked_message')

    settings = SystemSetting.get_settings()
    settings.is_clearance_open = is_open
    if custom_message is not None:
        settings.locked_message = custom_message
    settings.updated_by = request.user
    settings.save()

    return Response({
        'message': f"Clearance portal is now {'OPEN' if is_open else 'LOCKED'} for ALL users.",
        'is_clearance_open': settings.is_clearance_open,
        'locked_message': settings.locked_message,
    })
