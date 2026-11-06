from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ValidStudent
from .serializers import ValidStudentSerializer
from accounts.models import College, Department


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def valid_students_view(request):
    if request.method == 'POST':
        items = request.data.get('students', [])
        for item in items:
            # ✅ Look up the College and Department by name
            college_name = item.get('college', '').strip()
            department_name = item.get('department', '').strip()

            college = College.objects.filter(name__iexact=college_name).first() if college_name else None
            department = Department.objects.filter(name__iexact=department_name).first() if department_name else None

            ValidStudent.objects.update_or_create(
                id_number=item['id_number'],
                defaults={
                    'first_name': item.get('first_name', ''),
                    'last_name': item.get('last_name', ''),
                    'email': item.get('email', ''),
                    'college': college,
                    'department': department,
                    'year_of_admission': item.get('year_of_admission', ''),
                    # ✅ NEW: Save the academic info
                    'program_level': item.get('program_level', ''),
                    'enrollment_type': item.get('enrollment_type', ''),
                    'current_year': item.get('current_year', ''),
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


# ============================================================
# ✅ ADMIN STUDENT DETAIL (Toggle Status & Delete)
# ============================================================
@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def valid_student_detail(request, pk):
    if request.user.role != 'admin':
        return Response({'detail': 'Only admin can modify student records.'}, status=403)

    student = get_object_or_404(ValidStudent, id=pk)

    if request.method == 'PATCH':
        new_status = request.data.get('status')
        if new_status in ['active', 'inactive', 'graduated', 'suspended']:
            student.status = new_status
            student.save()
            return Response({'message': 'Status updated successfully.', 'status': student.status})
        return Response({'detail': 'Invalid status provided.'}, status=400)

    if request.method == 'DELETE':
        student.delete()
        return Response({'message': 'Student deleted successfully.'}, status=204)
