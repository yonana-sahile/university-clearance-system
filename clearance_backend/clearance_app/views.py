import random

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import ClearanceForm, FormStatus, Dispute, Appointment
from .serializers import (
    ClearanceFormSerializer,
    DisputeSerializer,
    AppointmentSerializer,
)


# role -> (note_field, approver_field, approved_status, previous_status_required)
STAFF_ROLES = {
    'departmenthead':     ('department_note', 'department_approved_by', FormStatus.APPROVED_DEPARTMENT, FormStatus.PENDING_DEPARTMENT),
    'librarian':          ('library_note', 'library_approved_by', FormStatus.APPROVED_LIBRARY, FormStatus.APPROVED_DEPARTMENT),
    'cafeteria':          ('cafeteria_note', 'cafeteria_approved_by', FormStatus.APPROVED_CAFETERIA, FormStatus.APPROVED_LIBRARY),
    'psychology':         ('psychology_note', 'psychology_approved_by', FormStatus.APPROVED_PSYCHOLOGY, FormStatus.APPROVED_CAFETERIA),
    'sportmaster':        ('sportmaster_note', 'sportmaster_approved_by', FormStatus.APPROVED_SPORTMASTER, FormStatus.APPROVED_PSYCHOLOGY),
    'campuspolice':       ('campuspolice_note', 'campuspolice_approved_by', FormStatus.APPROVED_CAMPUSPOLICE, FormStatus.APPROVED_SPORTMASTER),
    'cooperationsharing': ('cooperationsharing_note', 'cooperationsharing_approved_by', FormStatus.APPROVED_COOPERATION, FormStatus.APPROVED_CAMPUSPOLICE),
    'dopcordinator':      ('dopcordinator_note', 'dopcoordinator_approved_by', FormStatus.APPROVED_DOP, FormStatus.APPROVED_COOPERATION),
    'studentaffairs':     ('studentaffairs_note', 'studentaffairs_approved_by', FormStatus.APPROVED_STUDENTAFFAIRS, FormStatus.APPROVED_DOP),
    'dormitory':          ('dormitory_note', 'dormitory_approved_by', FormStatus.APPROVED_DORMITORY, FormStatus.APPROVED_STUDENTAFFAIRS),
    'registrar':          ('registrar_note', 'registrar_approved_by', FormStatus.CLEARED_BY_REGISTRAR, FormStatus.APPROVED_DORMITORY),
}

STATUS_ORDER = [
    FormStatus.PENDING_DEPARTMENT,
    FormStatus.APPROVED_DEPARTMENT,
    FormStatus.APPROVED_LIBRARY,
    FormStatus.APPROVED_CAFETERIA,
    FormStatus.APPROVED_PSYCHOLOGY,
    FormStatus.APPROVED_SPORTMASTER,
    FormStatus.APPROVED_CAMPUSPOLICE,
    FormStatus.APPROVED_COOPERATION,
    FormStatus.APPROVED_DOP,
    FormStatus.APPROVED_STUDENTAFFAIRS,
    FormStatus.APPROVED_DORMITORY,
    FormStatus.CLEARED_BY_REGISTRAR,
]


def _role_key(value):
    return (value or '').replace('-', '').replace('_', '').lower()


# ============================================================
# STUDENT ENDPOINTS
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    forms = ClearanceForm.objects.filter(
        id_number=request.user.id_number
    ).order_by('-id')
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
    forms = ClearanceForm.objects.filter(
        id_number=request.user.id_number
    ).order_by('-id')
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sign_cost_sharing(request, form_id):
    """Student signs the cost-sharing contract (Form CS-04)."""
    try:
        form = ClearanceForm.objects.get(
            id=form_id,
            id_number=request.user.id_number
        )
    except ClearanceForm.DoesNotExist:
        return Response({'detail': 'Form not found.'}, status=404)

    guarantor_name = request.data.get('guarantor_name', '')
    guarantor_phone = request.data.get('guarantor_phone', '')
    guarantor_woreda = request.data.get('guarantor_woreda', '')

    form.cooperationsharing_note = (
        f"Cost sharing obligation contract Form CS-04 signed by student. "
        f"Guarantor: {guarantor_name} ({guarantor_phone}), "
        f"Residence: {guarantor_woreda}."
    )
    form.save()

    return Response({
        'message': 'Cost Sharing Promissory Note signed successfully!',
        'form': ClearanceFormSerializer(form).data,
    })


# ============================================================
# DISPUTES
# ============================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def disputes(request):
    if request.method == 'GET':
        qs = Dispute.objects.filter(student=request.user)
        return Response(DisputeSerializer(qs, many=True).data)

    # POST — create a new dispute
    ref = f"APP-2026-{random.randint(100, 999)}"
    dispute = Dispute.objects.create(
        student=request.user,
        ref=ref,
        department=request.data.get('department', ''),
        category=request.data.get('category', ''),
        reason=request.data.get('reason', ''),
        evidence=request.data.get('evidence', ''),
        status='under_review',
        resolution_note='Assigned to Dean of Students & Department Audit Committee',
    )
    return Response({
        'message': 'Dispute appeal submitted successfully!',
        'dispute': DisputeSerializer(dispute).data,
    }, status=201)


# ============================================================
# APPOINTMENTS
# ============================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appointments(request):
    if request.method == 'GET':
        qs = Appointment.objects.filter(student=request.user)
        return Response(AppointmentSerializer(qs, many=True).data)

    # POST — create a new appointment
    ref = f"APT-{random.randint(100, 999)}"
    office_name = request.data.get('office_name', '')
    token = f"{office_name[:3].upper()}-T{random.randint(10, 99)}"
    apt = Appointment.objects.create(
        student=request.user,
        ref=ref,
        office_name=office_name,
        location=request.data.get('location', ''),
        date=request.data.get('date'),
        time_slot=request.data.get('time_slot', ''),
        purpose=request.data.get('purpose', ''),
        token_number=token,
        status='confirmed',
    )
    return Response({
        'message': 'Appointment booked successfully!',
        'appointment': AppointmentSerializer(apt).data,
    }, status=201)


# ============================================================
# STAFF ENDPOINTS
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_forms(request):
    role = _role_key(request.user.role)

    if role == 'student':
        forms = ClearanceForm.objects.filter(
            id_number=request.user.id_number
        ).order_by('-id')
    elif role == 'admin':
        forms = ClearanceForm.objects.all().order_by('-id')
    elif role in STAFF_ROLES:
        first_needed = STAFF_ROLES[role][3]
        forms = ClearanceForm.objects.filter(
            status__in=STATUS_ORDER[STATUS_ORDER.index(first_needed):]
        ).order_by('-id')
        if role == 'departmenthead':
            if not request.user.department:
                return Response([])
            forms = forms.filter(department_name=request.user.department.name)
    else:
        forms = ClearanceForm.objects.none()

    return Response(ClearanceFormSerializer(forms, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def staff_action(request, role, form_id):
    role_key = _role_key(role)
    matched = STAFF_ROLES.get(role_key)
    if not matched:
        return Response({'detail': f'Unknown role: {role}'}, status=400)

    if _role_key(request.user.role) not in (role_key, 'admin'):
        return Response({'detail': 'You are not allowed to do this action.'}, status=403)

    try:
        form = ClearanceForm.objects.get(id=form_id)
    except ClearanceForm.DoesNotExist:
        return Response({'detail': 'Form not found.'}, status=404)

    note_field, approver_field, approved_status, required_status = matched

    if form.status != required_status:
        return Response({'detail': 'This form is not at your stage yet.'}, status=400)

    if role_key == 'departmenthead' and request.user.department and \
            form.department_name != request.user.department.name:
        return Response({'detail': 'This form belongs to another department.'}, status=403)

    action = (request.data.get('action') or 'approve').lower()
    note = request.data.get('note', '')

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
