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
    path('forgot-password', views.forgot_password),
    path('verify-otp', views.verify_otp),
    path('reset-password', views.reset_password),
    path('admin/create-staff', views.admin_create_staff),
    path('admin/colleges', views.admin_colleges),
    path('admin/colleges/<int:pk>', views.admin_college_detail),
    path('admin/departments', views.admin_departments),
    path('admin/departments/<int:pk>', views.admin_department_detail),
]
