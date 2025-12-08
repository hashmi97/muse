from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User


class AuthTests(APITestCase):
    def test_signup_returns_tokens(self):
        payload = {
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
            "role": "groom",
            "partner_email": "partner@example.com",
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

# Create your tests here.
