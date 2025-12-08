from datetime import timedelta
import secrets
from django.conf import settings
from django.contrib.auth import update_session_auth_hash
from rest_framework import permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.core.mail import send_mail
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import SignupSerializer, LoginSerializer, UserSerializer
from .models import User
from planner.models import Couple, CoupleMember, CoupleInvite


def _set_refresh_cookie(response: Response, refresh_token: str):
    max_age = int(
        settings.SIMPLE_JWT.get(
            "REFRESH_TOKEN_LIFETIME", timedelta(days=14)
        ).total_seconds()
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        max_age=max_age,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
    )


def _activate_invites_for_user(user: User):
    CoupleMember.objects.filter(user=user, status="invited").update(status="active")
    CoupleInvite.objects.filter(email=user.email, status="pending").update(status="accepted")


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        partner_email = getattr(user, "_partner_email", None)

        # Create couple + membership
        couple_name = "{} & Partner's Wedding".format(user.full_name)
        couple = Couple.objects.create(name=couple_name)
        CoupleMember.objects.create(
            couple=couple,
            user=user,
            role=user.role,
            is_owner=True,
            status="active",
        )
        if partner_email:
            invite, created = CoupleInvite.objects.get_or_create(
                couple=couple, email=partner_email, defaults={"status": "pending"}
            )
            # Create partner user with a random password if they don't exist
            partner_user = User.objects.filter(email=partner_email).first()
            generated_pw = None
            partner_role = (
                "bride"
                if user.role == "groom"
                else "groom" if user.role == "bride" else "other"
            )
            if not partner_user:
                generated_pw = secrets.token_urlsafe(10)
                partner_user = User.objects.create_user(
                    email=partner_email,
                    password=generated_pw,
                    full_name="",
                    role=partner_role,
                )
            CoupleMember.objects.get_or_create(
                couple=couple,
                user=partner_user,
                defaults={"role": partner_role, "is_owner": False, "status": "invited"},
            )

            if created:
                login_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173/login")
                body_lines = [
                    f"{user.full_name} added you to your wedding workspace on Muse.",
                ]
                if generated_pw:
                    body_lines.append("An account was created for you.")
                    body_lines.append(f"Email: {partner_email}")
                    body_lines.append(f"Temporary password: {generated_pw}")
                    body_lines.append(f"Log in at: {login_url}")
                else:
                    body_lines.append(
                        "Log in with your existing account to start planning together."
                    )
                send_mail(
                    subject="You've been invited to plan on Muse",
                    message="\n".join(body_lines),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[partner_email],
                    fail_silently=True,
                )

        refresh = RefreshToken.for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        response = Response(
            {"data": data, "error": None}, status=status.HTTP_201_CREATED
        )
        _set_refresh_cookie(response, str(refresh))
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        _activate_invites_for_user(user)
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
        if not request.data.get("refresh") and (
            rt := request.COOKIES.get("refresh_token")
        ):
            mutable = (
                request.data._mutable if hasattr(request.data, "_mutable") else None
            )
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


class ChangePasswordView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        if not old_password or not new_password:
            return Response(
                {"data": None, "error": "old_password and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = request.user
        if not user.check_password(old_password):
            return Response(
                {"data": None, "error": "Invalid current password"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)
        return Response({"data": {"password_changed": True}, "error": None}, status=status.HTTP_200_OK)


# Create your views here.
