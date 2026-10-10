from django.urls import path
from . import views

urlpatterns = [
    path('chat/rooms', views.rooms),
    path('chat/recent', views.rooms),
    path('chat/messages/<int:room_id>', views.messages),
    path('chat/send', views.send_message),
]
