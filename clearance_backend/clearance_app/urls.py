from django.urls import path
from . import views

urlpatterns = [
    path('public/track', views.public_track),
    path('student/dashboard', views.student_dashboard),
    path('student/forms', views.student_forms),
    path('forms/submit', views.submit_form),
    path('forms/create', views.submit_form),  # Alias
    path('forms/<int:form_id>/sign-cost-sharing', views.sign_cost_sharing),
    path('forms', views.list_forms),
    path('disputes', views.disputes),
    path('appointments', views.appointments),
    path('staff/action/<int:form_id>', views.staff_action),
    path('staff/<int:form_id>/action', views.staff_action),
    path('admin/workflow', views.admin_workflow_steps),
    path('admin/workflow/<int:pk>', views.admin_workflow_step_detail),
]
