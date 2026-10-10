from django.db import models
from django.conf import settings


class ChatRoom(models.Model):
    name = models.CharField(max_length=200, blank=True)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='chat_rooms', null=True, blank=True
    )
    student_number = models.CharField(max_length=32, blank=True)   # ← renamed from student_id
    student_name = models.CharField(max_length=200, blank=True)
    staff_role = models.CharField(max_length=50, blank=True)
    staff_name = models.CharField(max_length=200, blank=True)
    staff_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='staff_rooms'
    )
    last_message = models.TextField(blank=True)
    last_message_time = models.DateTimeField(null=True, blank=True)
    unread_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    content = models.TextField(blank=True)
    message_type = models.CharField(max_length=20, default='text')
    image_file = models.ImageField(upload_to='chat/images/', null=True, blank=True)
    audio_file = models.FileField(upload_to='chat/audio/', null=True, blank=True)
    video_file = models.FileField(upload_to='chat/video/', null=True, blank=True)
    file = models.FileField(upload_to='chat/files/', null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
