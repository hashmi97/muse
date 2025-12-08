from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "role", "avatar_url")


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    partner_email = serializers.EmailField(write_only=True)
    partner_first_name = serializers.CharField(write_only=True, max_length=100, required=False, allow_blank=True)
    partner_last_name = serializers.CharField(write_only=True, max_length=100, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name", "role", "avatar_url", "partner_email", "partner_first_name", "partner_last_name")

    def validate_role(self, value):
        if value not in ("bride", "groom"):
            raise serializers.ValidationError("Role must be 'bride' or 'groom'")
        return value

    def create(self, validated_data):
        partner_email = validated_data.pop("partner_email", None)
        partner_first_name = validated_data.pop("partner_first_name", "")
        partner_last_name = validated_data.pop("partner_last_name", "")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        # Couple creation handled in view to avoid circular import of planner models here.
        user._partner_email = partner_email  # stash for view
        user._partner_first_name = partner_first_name  # stash for view
        user._partner_last_name = partner_last_name  # stash for view
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        attrs["user"] = user
        return attrs
