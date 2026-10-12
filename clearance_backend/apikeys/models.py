import secrets
from django.db import models
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password


class APIKey(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='api_keys',
    )
    name = models.CharField(max_length=100)
    prefix = models.CharField(max_length=24, unique=True, db_index=True)
    key_hash = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.prefix})"

    @staticmethod
    def generate(user, name):
        """Returns (APIKey instance, raw_key_string)."""
        prefix = f"ucs_{secrets.token_hex(6)}"
        secret = secrets.token_urlsafe(32)
        raw_key = f"{prefix}.{secret}"
        obj = APIKey.objects.create(
            user=user,
            name=name,
            prefix=prefix,
            key_hash=make_password(raw_key),
        )
        return obj, raw_key

    @staticmethod
    def verify(raw_key):
        """Return APIKey or None."""
        if not raw_key or '.' not in raw_key:
            return None
        prefix = raw_key.split('.', 1)[0]
        try:
            obj = APIKey.objects.select_related('user').get(prefix=prefix, is_active=True)
        except APIKey.DoesNotExist:
            return None
        if check_password(raw_key, obj.key_hash):
            return obj
        return None
