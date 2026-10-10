from rest_framework import serializers
from .models import ChatRoom, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    is_own = serializers.SerializerMethodField()
    sender = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = '__all__'

    def get_is_own(self, obj):
        req = self.context.get('request')
        return bool(req and obj.sender_id == req.user.id)

    def get_sender(self, obj):
        if not obj.sender:
            return None
        return {
            'id': obj.sender.id,
            'username': obj.sender.username,
            'full_name': obj.sender.full_name(),
            'role': obj.sender.role,
        }


class ChatRoomSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(source='student_number', read_only=True)  # ← expose as student_id
    student = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = '__all__'

    def get_student(self, obj):
        if not obj.student:
            return None
        return {
            'id': obj.student.id,
            'full_name': obj.student.full_name(),
            'id_number': obj.student.id_number,
            'email': obj.student.email,
        }

    def get_other_participant(self, obj):
        other = obj.staff_user or obj.student
        if not other:
            return None
        return {
            'id': other.id,
            'username': other.username,
            'full_name': other.full_name(),
            'role': other.role,
        }
