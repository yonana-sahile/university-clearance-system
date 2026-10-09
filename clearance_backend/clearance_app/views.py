from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import ClearanceForm, FormStatus
from .serializers import ClearanceFormSerializer


STAFF_ROLES = {
    'department-head': ('department_note', 'department_approved_by', FormStatus.APPROVED_DEPARTMENT),
    'librarian': ('library_note', 'library_approved_by', FormStatus.APPROVED_LIBRARY),
    'cafeteria': ('cafeteria_note', 'cafeteria_approved_by', FormStatus.APPROVED_CAFETERIA),
    'psychology': ('psychology_note', 'psychology_approved_by', FormStatus.APPROVED_PSYCHOLOGY),
    'sportmaster': ('sportmaster_note', 'sportmaster_approved_by', FormStatus.APPROVED_SPORTMASTER),
    'campuspolice': ('campuspolice_note', 'campuspolice_approved_by', FormStatus.APPROVED_CAMPUSPOLICE),
    'cooperationsharing': ('cooperationsharing_note', 'cooperationsharing_approved_by', FormStatus.APPROVED_COOPERATION),
    'dopcordinator': ('dopcordinator_note', 'dopcoordinator_approved_by', FormStatus.APPROVED_DOP),
    'studentaffairs': ('studentaffairs_note', 'studentaffairs_approved_by', FormStatus.APPROVED_STUDENTAFFAIRS),
    'dormitory': ('dormitory_note', 'dormitory_approved_by', FormStatus.APPROVED_DORMITORY),
    'registrar': ('registrar_note', 'registrar_approved_by', FormStatus.CLEARED_BY_REGISTRAR),
}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    forms = ClearanceForm.objects.filter(id_number=request.user.id_number)
    return Response({
        'forms': ClearanceFormSerializer(forms, many=True).data,
        'notifications': [{
            'id': 1,
            'message': 'Welcome to Online Clearance System! Track your stage approvals in real-time.',
            'created_at': timezone.now().isoformat(),
        }],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_forms(request):
    forms = ClearanceForm.objects.filter(id_number=request.user.id_number)
    return Response(ClearanceFormSerializer(forms, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_form(request):
    data = request.data
    form = ClearanceForm.objects.create(
        student=request.user,
        full_name=data.get('full_name') or request.user.full_name(),
        id_number=data.get('id_number') or request.user.id_number or '',
        student_email=data.get('email') or request.user.email or '',
        college=data.get('college', ''),
        department_name=data.get('department_name', ''),
        program_level=data.get('program_level', ''),
        enrollment_type=data.get('enrollment_type', ''),
        year=data.get('year', ''),
        semester=data.get('semester', ''),
        reason=data.get('reason', ''),
        status=FormStatus.PENDING_DEPARTMENT,
    )
    return Response({
        'message': 'Clearance form submitted successfully!',
        'form': ClearanceFormSerializer(form).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_forms(request):
    role = request.user.role
    if role == 'student':
        forms = ClearanceForm.objects.filter(id_number=request.user.id_number)
    else:
        forms = ClearanceForm.objects.all()
    return Response(ClearanceFormSerializer(forms, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def staff_action(request, role, form_id):
    role_key = role.replace('-', '').replace('_', '')
    matched = None
    for key, cfg in STAFF_ROLES.items():
        if key.replace('-', '') == role_key:
            matched = cfg
            break

    if not matched:
        return Response({'detail': f'Unknown role: {role}'}, status=400)

    try:
        form = ClearanceForm.objects.get(id=form_id)
    except ClearanceForm.DoesNotExist:
        return Response({'detail': 'Form not found.'}, status=404)

    action = (request.data.get('action') or 'approve').lower()
    note = request.data.get('note', '')

    note_field, approver_field, approved_status = matched

    if action == 'approve':
        setattr(form, note_field, note)
        setattr(form, approver_field, request.user.full_name())
        form.status = approved_status
    else:
        form.status = FormStatus.REJECTED
        form.note = note
        form.can_resubmit = True

    form.updated_at = timezone.now()
    form.save()

    return Response({
        'message': f'Clearance form {action}d successfully!',
        'status': form.status,
        'note': note,
    })
