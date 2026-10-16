from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import ChatRoom, ChatMessage
from .serializers import ChatRoomSerializer, ChatMessageSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rooms(request):
    from accounts.models import User

    if request.user.role == 'student':
        qs = ChatRoom.objects.filter(student=request.user)

        # Auto-create one room per staff role if none exist yet
        if not qs.exists():
            staff_roles = [
                ('departmenthead', 'Department Head'),
                ('librarian', 'Library'),
                ('cafeteria', 'Cafeteria'),
                ('dormitory', 'Dormitory'),
                ('registrar', 'Registrar Office'),
            ]
            for role, label in staff_roles:
                staff_user = User.objects.filter(role=role).first()
                ChatRoom.objects.create(
                    name=f"{label} Support",
                    student=request.user,
                    student_number=request.user.id_number or '',
                    student_name=request.user.full_name(),
                    staff_role=role,
                    staff_name=staff_user.full_name() if staff_user else label,
                    staff_user=staff_user,
                )
            qs = ChatRoom.objects.filter(student=request.user)
    else:
        qs = ChatRoom.objects.filter(staff_role=request.user.role)

    return Response(ChatRoomSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def messages(request, room_id):
    qs = ChatMessage.objects.filter(room_id=room_id)
    return Response({
        'messages': ChatMessageSerializer(
            qs, many=True, context={'request': request}
        ).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    room_id = request.data.get('room_id')
    content = request.data.get('content', '')
    if not room_id:
        return Response({'detail': 'room_id required'}, status=400)

    room, _ = ChatRoom.objects.get_or_create(id=room_id)

    msg = ChatMessage.objects.create(room=room, sender=request.user, content=content)
    room.last_message = content
    room.last_message_time = timezone.now()
    room.save()

    return Response(ChatMessageSerializer(msg, context={'request': request}).data)
