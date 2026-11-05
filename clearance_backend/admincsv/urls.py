from django.urls import path
from . import views

urlpatterns = [
    path('admin/valid-students', views.valid_students_view),
    path('admin/valid-students/<int:pk>', views.valid_student_detail),
    path('admin/csv-statistics', views.csv_statistics),
]
