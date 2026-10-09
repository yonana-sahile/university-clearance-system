from django.urls import path
from . import views

urlpatterns = [
    path('public/colleges', views.public_colleges),
    path('public/departments', views.public_departments),
    path('buildings', views.buildings_list),
    path('verify-student-by-id', views.verify_student_by_id),
    path('register', views.register_view),
    path('login', views.login_view),
    path('me', views.me_view),
]
