from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import APIKey


class APIKeyAuthentication(BaseAuthentication):
    """
    Accepts `X-API-Key: ucs_xxxx.yyyy` header for external integrations.
    """
    keyword = 'X-API-Key'

    def authenticate(self, request):
        raw_key = request.META.get('HTTP_X_API_KEY')
        if not raw_key:
            return None

        key_obj = APIKey.verify(raw_key)
        if not key_obj:
            raise AuthenticationFailed('Invalid API key.')

        if key_obj.expires_at and key_obj.expires_at < timezone.now():
            raise AuthenticationFailed('API key has expired.')

        # Track usage
        key_obj.last_used_at = timezone.now()
        key_obj.save(update_fields=['last_used_at'])

        return (key_obj.user, key_obj)

    def authenticate_header(self, request):
        return 'X-API-Key'
