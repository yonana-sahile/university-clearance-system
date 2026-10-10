from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from .models import ChatRoom, ChatMessage
from .serializers import ChatRoomSerializer, ChatMessageSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rooms(request):
    if request.user.role == 'student':
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
