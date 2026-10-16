from django.urls import path
from . import views

urlpatterns = [
    path('student/dashboard', views.student_dashboard),
    path('student/forms', views.student_forms),
    path('forms/submit', views.submit_form),
    path('forms/create', views.submit_form),
    path('forms/<int:form_id>/sign-cost-sharing', views.sign_cost_sharing),
    path('forms', views.list_forms),
    path('disputes', views.disputes),
    path('appointments', views.appointments),
    path('<str:role>/action/<int:form_id>', views.staff_action),
    path('<str:role>/<int:form_id>/action', views.staff_action),
]
