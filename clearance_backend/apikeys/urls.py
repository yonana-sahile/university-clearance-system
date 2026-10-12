from django.urls import path
from . import views

urlpatterns = [
    path('api-keys', views.list_keys),
    path('api-keys/create', views.create_key),
    path('api-keys/<int:key_id>/revoke', views.revoke_key),
    path('api-keys/<int:key_id>', views.delete_key),
]
