from django.urls import path
from . import views

urlpatterns = [
    path('payment/methods', views.payment_methods),
    path('payment/submit', views.submit_payment),
    path('payment/pending', views.pending_payments),
    path('payment/verified', views.verified_payments),
    path('dues', views.dues_list),
]
