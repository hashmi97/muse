import shutil
import tempfile
from unittest import mock
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken
from accounts.models import User
from .models import (
    ActivityLog,
    Comment,
    Couple,
    CoupleMember,
    EventType,
    Event,
    EventBudget,
    MoodBoardItem,
    MoodBoard,
    MediaFile,
    EventBudgetCategory,
    BudgetLineItem,
    HoneymoonPlan,
    HoneymoonItem,
    BudgetCategory,
    Notification,
    Task,
)
from django.conf import settings


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
        self.user = User.objects.create_user(
            email="user@example.com", password="password123"
        )
        self.couple = Couple.objects.create(name="Test Couple")
        CoupleMember.objects.create(
            couple=self.couple,
            user=self.user,
            status="active",
            role="bride",
            is_owner=True,
        )
        self.event_type = EventType.objects.create(
            key="wedding_night", name_en="Wedding Night"
        )
        self.event = Event.objects.create(
            couple=self.couple, event_type=self.event_type, title="Wedding Night"
        )
        token = AccessToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}

    def test_media_upload_and_moodboard_crud(self):
        # upload media
        file = SimpleUploadedFile("test.jpg", b"filecontent", content_type="image/jpeg")
        with self.settings(MEDIA_ROOT=self._media_dir), mock.patch(
            "planner.views.FileSystemStorage.save", return_value="test.jpg"
        ):
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

        # delete item (soft delete)
        res = self.client.delete(f"/api/moodboard/items/{item_id}/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        item = MoodBoardItem.objects.get(id=item_id)
        self.assertTrue(item.is_deleted)


class EventSelectionTests(APITestCase):
    def setUp(self):
        if "testserver" not in settings.ALLOWED_HOSTS:
            settings.ALLOWED_HOSTS.append("testserver")
        self.user = User.objects.create_user(
            email="user2@example.com", password="password123"
        )
        self.couple = Couple.objects.create(name="Couple Two")
        CoupleMember.objects.create(
            couple=self.couple,
            user=self.user,
            status="active",
            role="groom",
            is_owner=True,
        )
        # seed types
        self.eng, _ = EventType.objects.get_or_create(
            key="engagement", defaults={"name_en": "Engagement"}
        )
        self.wed, _ = EventType.objects.get_or_create(
            key="wedding_night", defaults={"name_en": "Wedding Night"}
        )
        token = AccessToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}

    def test_event_types_exclude_engagement(self):
        res = self.client.get("/api/events/types/?onboardingOnly=true", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        keys = [et["key"] for et in res.json()["data"]]
        self.assertNotIn("engagement", keys)
        self.assertIn("wedding_night", keys)

    def test_selection_upsert(self):
        body = {
            "selections": [
                {
                    "eventTypeKey": "wedding_night",
                    "title": "Our Wedding",
                    "enableMoodboard": True,
                }
            ]
        }
        res = self.client.post(
            "/api/events/selection/", body, format="json", **self.auth
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["event_type"]["key"], "wedding_night")
        self.assertTrue(
            Event.objects.filter(
                couple=self.couple, event_type=self.wed, is_active=True
            ).exists()
        )


class BudgetAndHoneymoonTests(APITestCase):
    def setUp(self):
        if "testserver" not in settings.ALLOWED_HOSTS:
            settings.ALLOWED_HOSTS.append("testserver")
        self.user = User.objects.create_user(
            email="user3@example.com", password="password123"
        )
        self.couple = Couple.objects.create(name="Couple Three")
        CoupleMember.objects.create(
            couple=self.couple,
            user=self.user,
            status="active",
            role="groom",
            is_owner=True,
        )
        self.wed, _ = EventType.objects.get_or_create(
            key="wedding_night", defaults={"name_en": "Wedding Night"}
        )
        self.event = Event.objects.create(
            couple=self.couple, event_type=self.wed, title="Wedding Night"
        )
        token = AccessToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}

    def test_budget_flow(self):
        # create budget and attach category
        cat = BudgetCategory.objects.create(key="venue", label="Venue")
        res = self.client.post(
            f"/api/events/{self.event.id}/budget/",
            {"category_id": cat.id},
            **self.auth,
        )
        if res.status_code != status.HTTP_201_CREATED:
            self.fail(f"Budget create failed: {res.status_code} {res.content}")
        data = res.json()["data"]
        self.assertEqual(data["event"], self.event.id)
        # find category id
        budget_cat_id = data["categories"][0]["id"]
        # add line item
        res = self.client.post(
            f"/api/budget/categories/{budget_cat_id}/items/",
            {"label": "Hall", "planned_amount": "1000.00"},
            **self.auth,
        )
        if res.status_code != status.HTTP_201_CREATED:
            self.fail(f"Line item create failed: {res.status_code} {res.content}")
        self.assertTrue(BudgetLineItem.objects.filter(label="Hall").exists())

    def test_honeymoon_flow(self):
        res = self.client.post(
            f"/api/events/{self.event.id}/honeymoon/",
            {"destination_country": "OM", "destination_city": "Muscat"},
            **self.auth,
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        plan_id = res.json()["data"]["id"]
        self.assertTrue(HoneymoonPlan.objects.filter(id=plan_id).exists())

        res = self.client.post(
            f"/api/honeymoon/{plan_id}/items/",
            {"type": "flight", "label": "Flight to MCT", "planned_amount": "500.00"},
            **self.auth,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(HoneymoonItem.objects.filter(label="Flight to MCT").exists())


class CollaborationTests(APITestCase):
    def setUp(self):
        if "testserver" not in settings.ALLOWED_HOSTS:
            settings.ALLOWED_HOSTS.append("testserver")
        self.user = User.objects.create_user(
            email="collab@example.com", password="password123"
        )
        self.other_user = User.objects.create_user(
            email="other@example.com", password="password123"
        )
        self.couple = Couple.objects.create(name="Collab Couple")
        CoupleMember.objects.create(
            couple=self.couple,
            user=self.user,
            status="active",
            role="groom",
            is_owner=True,
        )
        self.other_couple = Couple.objects.create(name="Other Couple")
        CoupleMember.objects.create(
            couple=self.other_couple,
            user=self.other_user,
            status="active",
            role="groom",
            is_owner=True,
        )
        self.event_type = EventType.objects.create(
            key="wedding_night", name_en="Wedding Night"
        )
        self.event = Event.objects.create(
            couple=self.couple, event_type=self.event_type, title="Wedding Night"
        )
        self.other_event = Event.objects.create(
            couple=self.other_couple, event_type=self.event_type, title="Other Wedding"
        )
        token = AccessToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}
        token_other = AccessToken.for_user(self.other_user)
        self.auth_other = {"HTTP_AUTHORIZATION": f"Bearer {str(token_other)}"}

    def test_comment_flow_and_soft_delete(self):
        body = {"target_type": "event", "target_id": self.event.id, "body": "Congrats"}
        res = self.client.post("/api/comments/", body, format="json", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        comment_id = res.json()["data"]["id"]
        self.assertTrue(
            Comment.objects.filter(id=comment_id, is_deleted=False).exists()
        )

        res = self.client.get(
            f"/api/comments/?target_type=event&target_id={self.event.id}", **self.auth
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()["data"]), 1)

        res = self.client.delete(f"/api/comments/{comment_id}/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(Comment.objects.filter(id=comment_id, is_deleted=True).exists())

        res = self.client.get(
            f"/api/comments/?target_type=event&target_id={self.event.id}", **self.auth
        )
        self.assertEqual(len(res.json()["data"]), 0)

    def test_comment_missing_target_validation(self):
        res = self.client.post(
            "/api/comments/", {"body": "No target"}, format="json", **self.auth
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        res = self.client.get("/api/comments/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_activity_log_flow(self):
        res = self.client.post(
            "/api/activity/",
            {
                "verb": "created_event",
                "target_type": "event",
                "target_id": self.event.id,
                "metadata": {"foo": "bar"},
            },
            format="json",
            **self.auth,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        log_id = res.json()["data"]["id"]
        self.assertTrue(ActivityLog.objects.filter(id=log_id).exists())

        res = self.client.get("/api/activity/?limit=1", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()["data"]), 1)

    def test_task_crud_and_completion(self):
        res = self.client.post(
            "/api/tasks/",
            {
                "title": "Book venue",
                "event_id": self.event.id,
                "due_date": "2025-12-31",
            },
            format="json",
            **self.auth,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        task_id = res.json()["data"]["id"]
        task = Task.objects.get(id=task_id)
        self.assertEqual(task.status, "todo")
        self.assertIsNone(task.completed_at)

        res = self.client.patch(
            f"/api/tasks/{task_id}/", {"status": "done"}, format="json", **self.auth
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, "done")
        self.assertIsNotNone(task.completed_at)

        res = self.client.delete(f"/api/tasks/{task_id}/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(Task.objects.filter(id=task_id).exists())

    def test_notifications_list_and_mark_read(self):
        notif = Notification.objects.create(
            couple=self.couple, user=self.user, message="Hello", is_read=False
        )
        res = self.client.get("/api/notifications/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()["data"]), 1)
        self.assertFalse(res.json()["data"][0]["is_read"])

        res = self.client.post(
            "/api/notifications/", {"ids": [notif.id]}, format="json", **self.auth
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_cross_couple_comment_forbidden(self):
        res = self.client.post(
            "/api/comments/",
            {"target_type": "event", "target_id": self.other_event.id, "body": "hi"},
            format="json",
            **self.auth,
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_cross_couple_activity_forbidden(self):
        res = self.client.post(
            "/api/activity/",
            {"verb": "test", "target_type": "event", "target_id": self.other_event.id},
            format="json",
            **self.auth,
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_cross_couple_task_forbidden(self):
        # other couple creates a task
        res = self.client.post(
            "/api/tasks/",
            {"title": "Other task", "event_id": self.other_event.id},
            format="json",
            **self.auth_other,
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        task_id = res.json()["data"]["id"]

        res = self.client.patch(
            f"/api/tasks/{task_id}/", {"status": "done"}, format="json", **self.auth
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        res = self.client.delete(f"/api/tasks/{task_id}/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_notifications_are_user_scoped(self):
        Notification.objects.create(
            couple=self.other_couple, user=self.other_user, message="Private"
        )
        res = self.client.get("/api/notifications/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()["data"]), 0)


class DashboardSummaryTests(APITestCase):
    def setUp(self):
        if "testserver" not in settings.ALLOWED_HOSTS:
            settings.ALLOWED_HOSTS.append("testserver")
        self.user = User.objects.create_user(
            email="dash@example.com", password="password123"
        )
        self.couple = Couple.objects.create(name="Dash Couple")
        CoupleMember.objects.create(
            couple=self.couple,
            user=self.user,
            status="active",
            role="groom",
            is_owner=True,
        )
        self.event_type = EventType.objects.create(
            key="wedding_night", name_en="Wedding Night"
        )
        self.event = Event.objects.create(
            couple=self.couple,
            event_type=self.event_type,
            title="Wedding Night",
            start_date=timezone.now().date(),
        )
        token = AccessToken.for_user(self.user)
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}

    def test_dashboard_summary(self):
        # Budget
        cat = BudgetCategory.objects.create(key="venue", label="Venue")
        budget, _ = EventBudget.objects.get_or_create(event=self.event)
        EventBudgetCategory.objects.create(
            event_budget=budget, category=cat, planned_amount=1000, spent_amount=200
        )
        # Honeymoon
        HoneymoonPlan.objects.create(
            event=self.event,
            destination_country="OM",
            destination_city="Muscat",
            total_planned=5000,
            total_spent=1200,
        )
        # Moodboard
        media = MediaFile.objects.create(
            couple=self.couple,
            storage_key="img.jpg",
            url="http://example.com/img.jpg",
            mime_type="image/jpeg",
            size_bytes=100,
            uploaded_by=self.user,
        )
        board, _ = MoodBoard.objects.get_or_create(event=self.event)
        MoodBoardItem.objects.create(mood_board=board, media=media, caption="Inspo")
        # Activity
        ActivityLog.objects.create(
            couple=self.couple, actor=self.user, verb="created_event", metadata={}
        )

        res = self.client.get("/api/dashboard/summary/", **self.auth)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()["data"]
        self.assertTrue(len(data["upcoming_events"]) >= 1)
        self.assertEqual(data["budget"]["planned"], "1000.00")
        self.assertEqual(data["budget"]["spent"], "200.00")
        self.assertIsNotNone(data["honeymoon"])
        self.assertTrue(len(data["moodboard_highlights"]) >= 1)
        self.assertTrue(len(data["recent_activity"]) >= 1)
