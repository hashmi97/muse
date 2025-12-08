from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest import mock
from .models import User
from planner.models import CoupleMember, CoupleInvite, Couple


class AuthTests(APITestCase):
    def test_signup_returns_tokens(self):
        payload = {
            "email": "test@example.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "User",
            "role": "groom",
            "partner_email": "partner@example.com",
            "partner_first_name": "Partner",
            "partner_last_name": "User",
        }
        url = reverse("signup")
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()["data"]
        self.assertIn("access", data)
        self.assertIn("refresh", data)
        self.assertEqual(data["user"]["email"], payload["email"])
        self.assertTrue(User.objects.filter(email=payload["email"]).exists())

    def test_login(self):
        user = User.objects.create_user(email="login@example.com", password="password123")
        url = reverse("login")
        res = self.client.post(url, {"email": user.email, "password": "password123"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()["data"]
        self.assertIn("access", data)
        self.assertEqual(data["user"]["email"], user.email)


class InviteFlowTests(APITestCase):
    @mock.patch("accounts.views.secrets.token_urlsafe", return_value="temp-pass")
    def test_partner_invite_and_first_login_activates(self, _mock_tok):
        payload = {
            "email": "owner@example.com",
            "password": "password123",
            "first_name": "Owner",
            "last_name": "User",
            "role": "groom",
            "partner_email": "partner@example.com",
            "partner_first_name": "Partner",
            "partner_last_name": "User",
        }
        res = self.client.post(reverse("signup"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Partner user created with invited status
        partner = User.objects.get(email="partner@example.com")
        membership = CoupleMember.objects.get(user=partner)
        self.assertEqual(membership.status, "invited")
        invite = CoupleInvite.objects.get(email=partner.email)
        self.assertEqual(invite.status, "pending")

        # Partner logs in with temp password -> activates membership and invite
        res = self.client.post(
            reverse("login"),
            {"email": partner.email, "password": "temp-pass"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        membership.refresh_from_db()
        invite.refresh_from_db()
        self.assertEqual(membership.status, "active")
        self.assertEqual(invite.status, "accepted")

    def test_change_password(self):
        user = User.objects.create_user(email="change@example.com", password="old-pass")
        # login to get token
        res = self.client.post(reverse("login"), {"email": user.email, "password": "old-pass"}, format="json")
        token = res.json()["data"]["access"]
        auth = {"HTTP_AUTHORIZATION": f"Bearer {token}"}

        # change password
        res = self.client.post(
            reverse("password-change"),
            {"old_password": "old-pass", "new_password": "new-pass"},
            format="json",
            **auth,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # old password should fail, new should work
        res_fail = self.client.post(reverse("login"), {"email": user.email, "password": "old-pass"}, format="json")
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)
        res_ok = self.client.post(reverse("login"), {"email": user.email, "password": "new-pass"}, format="json")
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
