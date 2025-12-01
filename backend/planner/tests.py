import shutil
import tempfile
from unittest import mock
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken
from accounts.models import User
from .models import Couple, CoupleMember, EventType, Event, MoodBoardItem, MediaFile


class PlannerPingTests(APITestCase):
    def test_ping(self):
        res = self.client.get("/api/ping/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["data"]["status"], "ok")


class MoodboardFlowTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._media_dir = tempfile.mkdtemp()
        settings.MEDIA_ROOT = cls._media_dir

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls._media_dir, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.user = User.objects.create_user(email="user@example.com", password="password123")
        self.couple = Couple.objects.create(name="Test Couple")
        CoupleMember.objects.create(couple=self.couple, user=self.user, status="active", role="bride", is_owner=True)
        self.event_type = EventType.objects.create(key="wedding_night", name_en="Wedding Night")
        self.event = Event.objects.create(couple=self.couple, event_type=self.event_type, title="Wedding Night")
        token = AccessToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}

    def test_media_upload_and_moodboard_crud(self):
        # upload media
        file = SimpleUploadedFile("test.jpg", b"filecontent", content_type="image/jpeg")
        with self.settings(MEDIA_ROOT=self._media_dir), mock.patch("planner.views.FileSystemStorage.save", return_value="test.jpg"):
            res = self.client.post("/api/media/upload/", {"file": file}, **self.auth)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        media_id = res.json()["data"]["id"]
        self.assertTrue(MediaFile.objects.filter(id=media_id).exists())

        # create moodboard item
        res = self.client.post(
            f"/api/moodboard/{self.event.id}/items/",
            {"media_id": media_id, "caption": "nice"},
            **self.auth,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        item_id = res.json()["data"]["id"]
        self.assertTrue(MoodBoardItem.objects.filter(id=item_id).exists())

        # list moodboard
        res = self.client.get(f"/api/moodboard/{self.event.id}/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()["data"]["items"]), 1)

        # delete item
        res = self.client.delete(f"/api/moodboard/items/{item_id}/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(MoodBoardItem.objects.filter(id=item_id).exists())


class EventSelectionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="user2@example.com", password="password123")
        self.couple = Couple.objects.create(name="Couple Two")
        CoupleMember.objects.create(couple=self.couple, user=self.user, status="active", role="groom", is_owner=True)
        # seed types
        self.eng = EventType.objects.create(key="engagement", name_en="Engagement")
        self.wed = EventType.objects.create(key="wedding_night", name_en="Wedding Night")
        token = AccessToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}

    def test_event_types_exclude_engagement(self):
        res = self.client.get("/api/events/types/?onboardingOnly=true", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        keys = [et["key"] for et in res.json()["data"]]
        self.assertNotIn("engagement", keys)
        self.assertIn("wedding_night", keys)

    def test_selection_upsert(self):
        body = {"selections": [{"eventTypeKey": "wedding_night", "title": "Our Wedding", "enableMoodboard": True}]}
        res = self.client.post("/api/events/selection/", body, format="json", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["event_type"]["key"], "wedding_night")
        self.assertTrue(Event.objects.filter(couple=self.couple, event_type=self.wed, is_active=True).exists())
