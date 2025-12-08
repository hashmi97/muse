from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from django.db.models import Sum
from django.utils import timezone
from rest_framework import permissions, status, views
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import (
    ActivityLog,
    BudgetCategory,
    BudgetLineItem,
    Comment,
    CoupleMember,
    Event,
    EventBudget,
    EventBudgetCategory,
    EventType,
    HoneymoonItem,
    HoneymoonPlan,
    MediaFile,
    MoodBoard,
    MoodBoardItem,
    Notification,
    Task,
)
from .serializers import (
    ActivityLogSerializer,
    MediaFileSerializer,
    MoodBoardSerializer,
    MoodBoardItemSerializer,
    EventTypeSerializer,
    EventSerializer,
    EventBudgetSerializer,
    EventBudgetCategorySerializer,
    BudgetLineItemSerializer,
    HoneymoonPlanSerializer,
    HoneymoonItemSerializer,
    CommentSerializer,
    TaskSerializer,
    NotificationSerializer,
)


def _active_couple_id(user_id):
    membership = (
        CoupleMember.objects.filter(user_id=user_id, status="active")
        .order_by("created_at")
        .first()
    )
    return membership.couple_id if membership else None


def _get_target_for_couple(couple_id, target_type, target_id):
    if target_type == "event":
        return get_object_or_404(
            Event, id=target_id, couple_id=couple_id, is_deleted=False
        )
    if target_type == "moodboard_item":
        item = get_object_or_404(
            MoodBoardItem.objects.select_related("mood_board__event"),
            id=target_id,
            is_deleted=False,
        )
        if item.mood_board.event.couple_id != couple_id:
            raise Http404
        return item
    if target_type == "budget_line_item":
        item = get_object_or_404(
            BudgetLineItem.objects.select_related(
                "event_budget_category__event_budget__event"
            ),
            id=target_id,
            is_deleted=False,
        )
        if item.event_budget_category.event_budget.event.couple_id != couple_id:
            raise Http404
        return item
    if target_type == "honeymoon_item":
        item = get_object_or_404(
            HoneymoonItem.objects.select_related("honeymoon_plan__event"),
            id=target_id,
            is_deleted=False,
        )
        if item.honeymoon_plan.event.couple_id != couple_id:
            raise Http404
        return item
    if target_type == "task":
        item = get_object_or_404(Task, id=target_id, couple_id=couple_id)
        return item
    raise Http404


class PlannerPingView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"data": {"status": "ok"}, "error": None})


class EventTypesView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        onboarding_only = request.query_params.get("onboardingOnly") in (
            "true",
            "1",
            "yes",
        )
        qs = EventType.objects.all()
        if onboarding_only:
            qs = qs.exclude(key="engagement")
        data = EventTypeSerializer(qs, many=True).data
        return Response({"data": data, "error": None})


class EventsListView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response({"data": [], "error": None})
        events = Event.objects.filter(
            couple_id=couple_id, is_active=True, is_deleted=False
        ).select_related("event_type")
        return Response(
            {"data": EventSerializer(events, many=True).data, "error": None}
        )


class EventSelectionView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Body: { selections: [{ eventTypeKey: string, title?: string, enableMoodboard?: bool }] }
        Engagement is ignored for onboarding (calendar-only).
        """
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )

        selections = request.data.get("selections", [])
        if not isinstance(selections, list):
            return Response(
                {"data": None, "error": "selections must be a list"}, status=400
            )

        types_by_key = {et.key: et for et in EventType.objects.all()}
        keep_ids = []

        for sel in selections:
            key = sel.get("eventTypeKey")
            if not key:
                continue
            if key == "engagement":
                continue  # milestone-only
            et = types_by_key.get(key)
            if not et:
                continue
            title = sel.get("title") or et.name_en
            enable_mb = sel.get("enableMoodboard", et.default_moodboard_enabled)
            evt, _ = Event.objects.update_or_create(
                couple_id=couple_id,
                event_type=et,
                defaults={"title": title, "is_active": True, "is_deleted": False},
            )
            keep_ids.append(evt.id)
            MoodBoard.objects.update_or_create(
                event=evt,
                defaults={"is_enabled": bool(enable_mb)},
            )

        # Deactivate unselected events (except engagement)
        Event.objects.filter(couple_id=couple_id).exclude(
            event_type__key="engagement"
        ).exclude(id__in=keep_ids).update(is_active=False)

        events = Event.objects.filter(
            couple_id=couple_id, is_active=True, is_deleted=False
        ).select_related("event_type")
        return Response(
            {"data": EventSerializer(events, many=True).data, "error": None}
        )


class CalendarView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response({"data": [], "error": None})
        events = Event.objects.filter(
            couple_id=couple_id, is_active=True, is_deleted=False
        ).select_related("event_type")
        data = [
            {
                "id": e.id,
                "title": e.title or e.event_type.name_en,
                "event_type": e.event_type.key,
                "start_date": e.start_date,
                "end_date": e.end_date,
            }
            for e in events
        ]
        return Response({"data": data, "error": None})


class EventBudgetView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        event = get_object_or_404(
            Event.objects.filter(id=event_id, couple_id=couple_id, is_deleted=False)
        )
        budget, _ = EventBudget.objects.get_or_create(event=event)
        from django.db.models import Prefetch
        budget = EventBudget.objects.prefetch_related(
            "categories",
            Prefetch("categories__line_items", queryset=BudgetLineItem.objects.filter(is_deleted=False))
        ).get(id=budget.id)
        return Response({"data": EventBudgetSerializer(budget).data, "error": None})

    def post(self, request, event_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        event = get_object_or_404(
            Event.objects.filter(id=event_id, couple_id=couple_id, is_deleted=False)
        )
        budget, _ = EventBudget.objects.get_or_create(event=event)

        # Attach category (optional)
        category_id = request.data.get("category_id")
        if category_id:
            category = get_object_or_404(BudgetCategory, id=category_id)
            EventBudgetCategory.objects.get_or_create(
                event_budget=budget, category=category
            )

        budget.refresh_from_db()
        from django.db.models import Prefetch
        budget = EventBudget.objects.prefetch_related(
            "categories",
            Prefetch("categories__line_items", queryset=BudgetLineItem.objects.filter(is_deleted=False))
        ).get(id=budget.id)
        return Response(
            {"data": EventBudgetSerializer(budget).data, "error": None}, status=201
        )


class EventBudgetCategoryItemsView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, category_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        cat = get_object_or_404(
            EventBudgetCategory.objects.select_related("event_budget__event"),
            id=category_id,
        )
        if cat.event_budget.event.couple_id != couple_id or cat.event_budget.event.is_deleted:
            return Response({"data": None, "error": "Not found"}, status=404)

        serializer = BudgetLineItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(event_budget_category=cat, created_by=request.user)
        return Response(
            {"data": BudgetLineItemSerializer(item).data, "error": None}, status=201
        )


class HoneymoonPlanView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        event = get_object_or_404(
            Event.objects.filter(id=event_id, couple_id=couple_id, is_deleted=False)
        )
        plan, _ = HoneymoonPlan.objects.get_or_create(event=event)
        from django.db.models import Prefetch
        plan = HoneymoonPlan.objects.prefetch_related(
            Prefetch("items", queryset=HoneymoonItem.objects.filter(is_deleted=False))
        ).get(id=plan.id)
        return Response({"data": HoneymoonPlanSerializer(plan).data, "error": None})

    def post(self, request, event_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        event = get_object_or_404(
            Event.objects.filter(id=event_id, couple_id=couple_id, is_deleted=False)
        )
        plan, _ = HoneymoonPlan.objects.get_or_create(event=event)
        serializer = HoneymoonPlanSerializer(plan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        from django.db.models import Prefetch
        plan = HoneymoonPlan.objects.prefetch_related(
            Prefetch("items", queryset=HoneymoonItem.objects.filter(is_deleted=False))
        ).get(id=plan.id)
        return Response({"data": HoneymoonPlanSerializer(plan).data, "error": None})


class HoneymoonItemView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, plan_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        plan = get_object_or_404(
            HoneymoonPlan.objects.select_related("event"), id=plan_id
        )
        if plan.event.couple_id != couple_id or plan.event.is_deleted:
            return Response({"data": None, "error": "Not found"}, status=404)
        serializer = HoneymoonItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(honeymoon_plan=plan)
        return Response(
            {"data": HoneymoonItemSerializer(item).data, "error": None}, status=201
        )


class MediaUploadView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )

        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"data": None, "error": "file is required"}, status=400)

        storage = FileSystemStorage(location=settings.MEDIA_ROOT)
        filename = storage.save(file_obj.name, file_obj)
        url = request.build_absolute_uri(settings.MEDIA_URL + filename)

        media = MediaFile.objects.create(
            couple_id=couple_id,
            storage_key=filename,
            url=url,
            mime_type=file_obj.content_type or "",
            size_bytes=file_obj.size,
            uploaded_by=user,
        )
        return Response(
            {"data": MediaFileSerializer(media).data, "error": None}, status=201
        )


class MoodBoardView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )

        event = get_object_or_404(
            Event, id=event_id, couple_id=couple_id, is_deleted=False
        )
        board, _ = MoodBoard.objects.get_or_create(
            event=event, defaults={"is_enabled": True}
        )
        from django.db.models import Prefetch
        board = MoodBoard.objects.prefetch_related(
            Prefetch("items", queryset=MoodBoardItem.objects.filter(is_deleted=False).select_related("media"))
        ).get(id=board.id)
        return Response({"data": MoodBoardSerializer(board).data, "error": None})

    def post(self, request, event_id):
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )

        event = get_object_or_404(Event, id=event_id, couple_id=couple_id)
        board, _ = MoodBoard.objects.get_or_create(
            event=event, defaults={"is_enabled": True}
        )

        serializer = MoodBoardItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(mood_board=board, created_by=user)
        return Response(
            {"data": MoodBoardItemSerializer(item).data, "error": None}, status=201
        )


class MoodBoardItemDeleteView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )

        item = get_object_or_404(
            MoodBoardItem.objects.select_related("mood_board__event"),
            id=item_id,
            is_deleted=False,
        )
        if item.mood_board.event.couple_id != couple_id:
            return Response({"data": None, "error": "Not found"}, status=404)

        item.is_deleted = True
        item.save(update_fields=["is_deleted", "updated_at"])
        return Response({"data": {"deleted": True}, "error": None})


class CommentView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response({"data": [], "error": None})
        target_type = request.query_params.get("target_type")
        target_id = request.query_params.get("target_id")
        if not target_type or not target_id:
            return Response(
                {"data": None, "error": "target_type and target_id are required"},
                status=400,
            )
        target = _get_target_for_couple(couple_id, target_type, target_id)
        ct = ContentType.objects.get_for_model(type(target))
        comments = Comment.objects.filter(
            couple_id=couple_id, content_type=ct, object_id=target.id, is_deleted=False
        ).order_by("created_at")
        return Response(
            {"data": CommentSerializer(comments, many=True).data, "error": None}
        )

    def post(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        target_type = request.data.get("target_type")
        target_id = request.data.get("target_id")
        if not target_type or not target_id:
            return Response(
                {"data": None, "error": "target_type and target_id are required"},
                status=400,
            )
        _get_target_for_couple(couple_id, target_type, target_id)
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(couple_id=couple_id, created_by=request.user)
        return Response(
            {"data": CommentSerializer(comment).data, "error": None}, status=201
        )


class CommentDetailView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        comment = get_object_or_404(
            Comment, id=comment_id, couple_id=couple_id, is_deleted=False
        )
        comment.is_deleted = True
        comment.save(update_fields=["is_deleted", "updated_at"])
        return Response({"data": {"deleted": True}, "error": None})


class ActivityLogView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response({"data": [], "error": None})
        limit = int(request.query_params.get("limit", 50))
        logs = ActivityLog.objects.filter(couple_id=couple_id).order_by("-created_at")[
            :limit
        ]
        return Response(
            {"data": ActivityLogSerializer(logs, many=True).data, "error": None}
        )

    def post(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        target_type = request.data.get("target_type")
        target_id = request.data.get("target_id")
        if target_type and target_id:
            _get_target_for_couple(couple_id, target_type, target_id)
        serializer = ActivityLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log = serializer.save(couple_id=couple_id, actor=request.user)
        return Response(
            {"data": ActivityLogSerializer(log).data, "error": None}, status=201
        )


class TaskListView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response({"data": [], "error": None})
        event_id = request.query_params.get("event_id")
        tasks = Task.objects.filter(couple_id=couple_id)
        if event_id:
            tasks = tasks.filter(event_id=event_id)
        tasks = tasks.order_by("-created_at")
        return Response({"data": TaskSerializer(tasks, many=True).data, "error": None})

    def post(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        event_id = request.data.get("event_id")
        if event_id:
            _get_target_for_couple(couple_id, "event", event_id)
        serializer = TaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save(couple_id=couple_id, created_by=request.user)
        return Response({"data": TaskSerializer(task).data, "error": None}, status=201)


class TaskDetailView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, task_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        task = get_object_or_404(Task, id=task_id, couple_id=couple_id)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        return Response({"data": TaskSerializer(task).data, "error": None})

    def delete(self, request, task_id):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {"data": None, "error": "No active couple membership"}, status=404
            )
        task = get_object_or_404(Task, id=task_id, couple_id=couple_id)
        task.delete()
        return Response({"data": {"deleted": True}, "error": None})


class NotificationListView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by(
            "-created_at"
        )[:100]
        return Response(
            {
                "data": NotificationSerializer(notifications, many=True).data,
                "error": None,
            }
        )

    def post(self, request):
        # Mark as read
        ids = request.data.get("ids", [])
        if not isinstance(ids, list):
            return Response({"data": None, "error": "ids must be a list"}, status=400)
        Notification.objects.filter(user=request.user, id__in=ids).update(is_read=True)
        return Response({"data": {"updated": len(ids)}, "error": None})


class DashboardSummaryView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response(
                {
                    "data": {
                        "upcoming_events": [],
                        "budget": {"planned": "0.00", "spent": "0.00"},
                        "honeymoon": None,
                        "moodboard_highlights": [],
                        "recent_activity": [],
                    },
                    "error": None,
                }
            )

        today = timezone.now().date()
        events = (
            Event.objects.filter(couple_id=couple_id, is_active=True, is_deleted=False)
            .select_related("event_type")
            .order_by("start_date")
        )
        upcoming = [
            {
                "id": e.id,
                "title": e.title or e.event_type.name_en,
                "event_type": e.event_type.key,
                "start_date": e.start_date,
                "end_date": e.end_date,
            }
            for e in events.filter(start_date__gte=today)[:5]
        ]

        budget_totals = EventBudgetCategory.objects.filter(
            event_budget__event__couple_id=couple_id
        ).aggregate(planned=Sum("planned_amount"), spent=Sum("spent_amount"))
        budget_summary = {
            "planned": str(budget_totals.get("planned") or 0),
            "spent": str(budget_totals.get("spent") or 0),
        }

        honeymoon = (
            HoneymoonPlan.objects.filter(
                event__couple_id=couple_id, event__is_deleted=False
            )
            .select_related("event")
            .order_by("-updated_at")
            .first()
        )
        honeymoon_summary = (
            {
                "id": honeymoon.id,
                "event_id": honeymoon.event_id,
                "destination_country": honeymoon.destination_country,
                "destination_city": honeymoon.destination_city,
                "start_date": honeymoon.start_date,
                "end_date": honeymoon.end_date,
                "total_planned": honeymoon.total_planned,
                "total_spent": honeymoon.total_spent,
            }
            if honeymoon
            else None
        )

        mood_items = (
            MoodBoardItem.objects.filter(
                mood_board__event__couple_id=couple_id,
                mood_board__event__is_deleted=False,
                is_deleted=False,
            )
            .select_related("media", "mood_board__event")
            .order_by("-created_at")[:5]
        )
        moodboard_highlights = [
            {
                "id": item.id,
                "event_id": item.mood_board.event_id,
                "caption": item.caption,
                "media_url": item.media.url,
                "created_at": item.created_at,
            }
            for item in mood_items
        ]

        activity = ActivityLog.objects.filter(couple_id=couple_id).order_by(
            "-created_at"
        )[:10]
        activity_items = [
            {
                "id": a.id,
                "verb": a.verb,
                "actor_id": a.actor_id,
                "target_type": a.content_type.model if a.content_type else None,
                "target_id": a.object_id,
                "metadata": a.metadata,
                "created_at": a.created_at,
            }
            for a in activity
        ]

        return Response(
            {
                "data": {
                    "upcoming_events": upcoming,
                    "budget": budget_summary,
                    "honeymoon": honeymoon_summary,
                    "moodboard_highlights": moodboard_highlights,
                    "recent_activity": activity_items,
                },
                "error": None,
            }
        )
