from datetime import timedelta
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import SignupSerializer, LoginSerializer, UserSerializer
from .models import User


def _set_refresh_cookie(response: Response, refresh_token: str):
    max_age = int(settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME", timedelta(days=14)).total_seconds())
    response.set_cookie(
        "refresh_token",
        refresh_token,
        max_age=max_age,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
    )


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        response = Response({"data": data, "error": None}, status=status.HTTP_201_CREATED)
        _set_refresh_cookie(response, str(refresh))
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        response = Response({"data": data, "error": None}, status=status.HTTP_200_OK)
        _set_refresh_cookie(response, str(refresh))
        return response


class RefreshCookieView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # Allow refresh token from cookie if not provided in body
        if not request.data.get("refresh") and (rt := request.COOKIES.get("refresh_token")):
            mutable = request.data._mutable if hasattr(request.data, "_mutable") else None
            try:
                if hasattr(request.data, "_mutable"):
                    request.data._mutable = True
                request.data["refresh"] = rt
            finally:
                if mutable is not None:
                    request.data._mutable = mutable
        response = super().post(request, *args, **kwargs)
        # If success, rotate refresh cookie
        if response.status_code == 200 and "refresh" in response.data:
            _set_refresh_cookie(response, response.data["refresh"])
        return response


class LogoutView(APIView):
    def post(self, request):
        response = Response({"data": {"logged_out": True}, "error": None})
        response.delete_cookie("refresh_token")
        return response

# Create your views here.
