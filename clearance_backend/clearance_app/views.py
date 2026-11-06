import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone

from .models import (
    ClearanceForm, FormStatus, Dispute, Appointment,
    WorkflowStep, ClearanceApproval, ChecklistItem
)
from .serializers import (
    ClearanceFormSerializer, DisputeSerializer, AppointmentSerializer,
    WorkflowStepSerializer, ChecklistItemSerializer
)
from accounts.models import SystemSetting


# ============================================================
# HELPER FUNCTION: DYNAMIC NEXT STEP
# ============================================================
def get_next_workflow_step(form):
    last_approval = form.approvals.filter(
        status='approved',
        step__isnull=False
    ).order_by('-step__order').first()

    if last_approval and last_approval.step:
        return WorkflowStep.objects.filter(
            is_active=True,
            order__gt=last_approval.step.order
        ).order_by('order').first()
    else:
        return WorkflowStep.objects.filter(is_active=True).order_by('order').first()


# ============================================================
# STUDENT ENDPOINTS
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard(request):
    forms = ClearanceForm.objects.filter(
        id_number=request.user.id_number
    ).order_by('-id')

    workflow = WorkflowStep.objects.filter(is_active=True).order_by('order')

    return Response({
        'forms': ClearanceFormSerializer(forms, many=True).data,
        'workflow': WorkflowStepSerializer(workflow, many=True).data,
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
    user = request.user

    system_settings = SystemSetting.get_settings()
    if not system_settings.is_clearance_open:
        return Response(
            {
                'detail': system_settings.locked_message or
                          'The clearance portal is currently locked by the administration. Please check back later.'
            },
            status=403
        )

    first_step = WorkflowStep.objects.filter(is_active=True).order_by('order').first()

    form = ClearanceForm.objects.create(
        student=user,
        full_name=user.full_name() or user.username,
        id_number=user.id_number or '',
        student_email=user.email or '',
        college=user.college.name if getattr(user, 'college', None) else '',
        department_name=user.department.name if getattr(user, 'department', None) else '',

        # ✅ CRITICAL SECURITY FIX: Force from user profile
        program_level=user.program_level or 'Undergraduate (B.Sc.)',
        enrollment_type=user.enrollment_type or 'Regular',
        year=user.current_year or '4th Year',

        semester=data.get('semester', ''),
        reason=data.get('reason', ''),
        pre_clearance_checks=data.get('pre_clearance_checks', {}),
        overall_status=FormStatus.IN_PROGRESS,
        current_step=first_step
    )
    return Response({
        'message': 'Clearance form submitted successfully!',
        'form': ClearanceFormSerializer(form).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sign_cost_sharing(request, form_id):
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

    cost_sharing_step = WorkflowStep.objects.filter(role_required='cooperationsharing').first()

    ClearanceApproval.objects.create(
        form=form,
        step=cost_sharing_step,
        approved_by=request.user,
        note=f"Cost sharing obligation contract Form CS-04 signed by student. Guarantor: {guarantor_name} ({guarantor_phone}), Residence: {guarantor_woreda}.",
        status='student_signed'
    )

    return Response({
        'message': 'Cost Sharing Promissory Note signed successfully!',
        'form': ClearanceFormSerializer(form).data,
    })


# ============================================================
# DISPUTES & APPOINTMENTS
# ============================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def disputes(request):
    if request.method == 'GET':
        qs = Dispute.objects.filter(student=request.user)
        return Response(DisputeSerializer(qs, many=True).data)

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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appointments(request):
    if request.method == 'GET':
        qs = Appointment.objects.filter(student=request.user)
        return Response(AppointmentSerializer(qs, many=True).data)

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
    role = request.user.role

    if role == 'student':
        forms = ClearanceForm.objects.filter(
            id_number=request.user.id_number
        ).order_by('-id')
    elif role == 'admin':
        forms = ClearanceForm.objects.all().order_by('-id')
    else:
        forms = ClearanceForm.objects.filter(
            current_step__role_required=role,
            overall_status=FormStatus.IN_PROGRESS
        ).order_by('-id')

        if role == 'departmenthead':
            if not request.user.department:
                return Response([])
            forms = forms.filter(department_name__iexact=request.user.department.name)

        elif role == 'registrar':
            if getattr(request.user, 'college', None):
                forms = forms.filter(college__iexact=request.user.college.name)

    return Response(ClearanceFormSerializer(forms, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def staff_action(request, form_id):
    try:
        form = ClearanceForm.objects.get(id=form_id)
    except ClearanceForm.DoesNotExist:
        return Response({'detail': 'Form not found.'}, status=404)

    current_step = form.current_step

    if not current_step:
        current_step = get_next_workflow_step(form)
        form.current_step = current_step

    if not current_step or (request.user.role != current_step.role_required and request.user.role != 'admin'):
        return Response({'detail': 'You are not authorized to approve this stage.'}, status=403)

    if request.user.role == 'departmenthead':
        if not request.user.department or form.department_name.lower() != request.user.department.name.lower():
            return Response({'detail': 'This form belongs to another department.'}, status=403)

    if request.user.role == 'registrar':
        if getattr(request.user, 'college', None) and form.college.lower() != request.user.college.name.lower():
            return Response({'detail': 'This form belongs to another college.'}, status=403)

    action = (request.data.get('action') or 'approve').lower()
    note = request.data.get('note', '')

    if action == 'reject':
        form.overall_status = FormStatus.REJECTED
        form.can_resubmit = True
        ClearanceApproval.objects.create(form=form, step=current_step, approved_by=request.user, note=note,
                                         status='rejected')
        form.save()
        return Response({'message': 'Rejected successfully.'})

    ClearanceApproval.objects.create(form=form, step=current_step, approved_by=request.user, note=note,
                                     status='approved')

    next_step = get_next_workflow_step(form)

    if next_step:
        form.current_step = next_step
        form.save()
        return Response({
            'message': f'Approved! Moved to {next_step.name}.',
            'status': form.overall_status,
            'note': note,
        })
    else:
        form.current_step = None
        form.overall_status = FormStatus.CLEARED_BY_REGISTRAR
        form.save()
        return Response({
            'message': 'Final clearance granted!',
            'status': form.overall_status,
            'note': note,
        })


# ============================================================
# ADMIN WORKFLOW MANAGEMENT
# ============================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_workflow_steps(request):
    if request.user.role != 'admin':
        return Response({'detail': 'Only admin allowed.'}, status=403)

    if request.method == 'GET':
        steps = WorkflowStep.objects.all().order_by('order')
        return Response(WorkflowStepSerializer(steps, many=True).data)

    step = WorkflowStep.objects.create(
        name=request.data.get('name'),
        role_required=request.data.get('role_required'),
        order=request.data.get('order')
    )
    return Response(WorkflowStepSerializer(step).data, status=201)


@api_view(['DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_workflow_step_detail(request, pk):
    if request.user.role != 'admin':
        return Response({'detail': 'Only admin allowed.'}, status=403)

    step = WorkflowStep.objects.filter(id=pk).first()
    if not step:
        return Response({'detail': 'Not found'}, status=404)

    if request.method == 'DELETE':
        step.delete()
        return Response(status=204)

    if request.method == 'PATCH':
        step.is_active = request.data.get('is_active', step.is_active)
        step.order = request.data.get('order', step.order)
        step.name = request.data.get('name', step.name)
        step.save()
        return Response(WorkflowStepSerializer(step).data)


# ============================================================
# PUBLIC TRACKING ENDPOINT
# ============================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def public_track(request):
    id_number = request.query_params.get('id_number', '').strip()
    if not id_number:
        return Response({'found': False, 'message': 'ID required'}, status=400)

    form = ClearanceForm.objects.filter(id_number__iexact=id_number).order_by('-created_at').first()

    if not form:
        return Response({'found': False})

    return Response({
        'found': True,
        'full_name': form.full_name,
        'id_number': form.id_number,
        'department_name': form.department_name,
        'college': form.college,
        'program_level': form.program_level,
        'enrollment_type': form.enrollment_type,
        'status': form.overall_status,
    })


# ============================================================
# ✅ NEW: DYNAMIC PRE-CLEARANCE CHECKLIST ENDPOINTS
# ============================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def staff_checklist(request):
    if request.method == 'GET':
        items = ChecklistItem.objects.filter(role=request.user.role, is_active=True).order_by('order')
        return Response(ChecklistItemSerializer(items, many=True).data)

    if request.method == 'POST':
        if request.user.role == 'student':
            return Response({'detail': 'Students cannot manage checklists.'}, status=403)

        item = ChecklistItem.objects.create(
            role=request.user.role,
            label=request.data.get('label'),
            description=request.data.get('description', ''),
            order=request.data.get('order', 1)
        )
        return Response(ChecklistItemSerializer(item).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def staff_checklist_detail(request, pk):
    if request.user.role == 'student':
        return Response({'detail': 'Students cannot manage checklists.'}, status=403)

    item = ChecklistItem.objects.filter(id=pk, role=request.user.role).first()
    if not item:
        return Response({'detail': 'Not found'}, status=404)
    item.delete()
    return Response(status=204)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_checklist(request):
    items = ChecklistItem.objects.filter(is_active=True).order_by('role', 'order')
    return Response(ChecklistItemSerializer(items, many=True).data)
