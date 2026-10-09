from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ValidStudent
from .serializers import ValidStudentSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def valid_students_view(request):
    if request.method == 'POST':
        items = request.data.get('students', [])
        for item in items:
            ValidStudent.objects.update_or_create(
                id_number=item['id_number'],
                defaults={
                    'first_name': item.get('first_name', ''),
                    'last_name': item.get('last_name', ''),
                    'email': item.get('email', ''),
                    'year_of_admission': item.get('year_of_admission', ''),
                    'status': item.get('status', 'active'),
                }
            )
        return Response({'message': 'CSV imported.', 'count': len(items)})

    students = ValidStudent.objects.all()
    return Response({
        'students': ValidStudentSerializer(students, many=True).data,
        'total_count': students.count(),
        'total_records': students.count(),
        'active_records': students.filter(status='active').count(),
        'registered_records': students.filter(is_registered=True).count(),
        'registration_rate': round(
            students.filter(is_registered=True).count() / max(students.count(), 1) * 100
        ),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def csv_statistics(request):
    students = ValidStudent.objects.all()
    return Response({
        'total_records': students.count(),
        'active_records': students.filter(status='active').count(),
        'registered_records': students.filter(is_registered=True).count(),
        'registration_rate': round(
            students.filter(is_registered=True).count() / max(students.count(), 1) * 100
        ),
    })
