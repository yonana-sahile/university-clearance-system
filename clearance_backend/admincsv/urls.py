from django.urls import path
from . import views

urlpatterns = [
    path('admin/valid-students', views.valid_students_view),
    path('admin/csv-statistics', views.csv_statistics),
]
