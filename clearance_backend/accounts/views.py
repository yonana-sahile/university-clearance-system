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
