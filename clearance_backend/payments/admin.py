from django.contrib import admin
from .models import PaymentMethod, PaymentRecord, DueRecord

admin.site.register(PaymentMethod)
admin.site.register(PaymentRecord)
admin.site.register(DueRecord)
