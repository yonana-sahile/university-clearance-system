from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, College, Department, Building


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = ['id', 'name']


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'college', 'name']


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ['id', 'name', 'code']


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    college_name = serializers.SerializerMethodField()
    building_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'id_number', 'phone', 'department_name', 'college_name',
            'building_id', 'building_name', 'date_joined', 'last_login',
        ]

    def get_full_name(self, obj):
        return obj.full_name()

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_college_name(self, obj):
        return obj.college.name if obj.college else None

    def get_building_name(self, obj):
        return obj.building.name if obj.building else None


class RegisterSerializer(serializers.Serializer):
    id_number = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_id_number(self, value):
        from admincsv.models import ValidStudent
        if not ValidStudent.objects.filter(id_number__iexact=value).exists():
            raise serializers.ValidationError('Student ID not found in university records.')
        if User.objects.filter(id_number__iexact=value).exists():
            raise serializers.ValidationError('This ID is already registered.')
        return value

    def create(self, validated_data):
        from admincsv.models import ValidStudent
        valid = ValidStudent.objects.get(id_number__iexact=validated_data['id_number'])
        user = User.objects.create_user(
            username=validated_data['id_number'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role='student',
            id_number=valid.id_number,
        )
        valid.is_registered = True
        valid.save(update_fields=['is_registered'])
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        identifier = attrs.get('username') or attrs.get('email')
        password = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError('Username/email and password required.')

        user = None
        user = authenticate(username=identifier, password=password)

        if not user:
            try:
                u = User.objects.get(email__iexact=identifier)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            try:
                u = User.objects.get(id_number__iexact=identifier)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            raise AuthenticationFailed('Incorrect username or password.')

        attrs['user'] = user
        return attrs


# ============================================================
# ✅ NEW: PASSWORD RESET SERIALIZERS
# ============================================================

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('No account found with this email address.')
        return value


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email.')

        if not user.reset_otp or not user.reset_otp_expiry:
            raise serializers.ValidationError('No OTP requested.')

        if user.reset_otp != otp:
            raise serializers.ValidationError('Invalid OTP code.')

        if timezone.now() > user.reset_otp_expiry:
            raise serializers.ValidationError('OTP has expired.')

        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    password = serializers.CharField(min_length=6, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email.')

        if user.reset_otp != otp:
            raise serializers.ValidationError('Invalid OTP code.')

        if not user.reset_otp_expiry or timezone.now() > user.reset_otp_expiry:
            raise serializers.ValidationError('OTP has expired.')

        return attrs
