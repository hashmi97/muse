from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, views
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import CoupleMember, Event, MediaFile, MoodBoard, MoodBoardItem, EventType
from .serializers import MediaFileSerializer, MoodBoardSerializer, MoodBoardItemSerializer, EventTypeSerializer, EventSerializer


def _active_couple_id(user_id):
    membership = CoupleMember.objects.filter(user_id=user_id, status="active").order_by("created_at").first()
    return membership.couple_id if membership else None


class PlannerPingView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"data": {"status": "ok"}, "error": None})


class EventTypesView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        onboarding_only = request.query_params.get("onboardingOnly") in ("true", "1", "yes")
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
        events = Event.objects.filter(couple_id=couple_id, is_active=True).select_related("event_type")
        return Response({"data": EventSerializer(events, many=True).data, "error": None})


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
            return Response({"data": None, "error": "No active couple membership"}, status=404)

        selections = request.data.get("selections", [])
        if not isinstance(selections, list):
            return Response({"data": None, "error": "selections must be a list"}, status=400)

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
                defaults={"title": title, "is_active": True},
            )
            keep_ids.append(evt.id)
            MoodBoard.objects.update_or_create(
                event=evt,
                defaults={"is_enabled": bool(enable_mb)},
            )

        # Deactivate unselected events (except engagement)
        Event.objects.filter(couple_id=couple_id).exclude(event_type__key="engagement").exclude(id__in=keep_ids).update(
            is_active=False
        )

        events = Event.objects.filter(couple_id=couple_id, is_active=True).select_related("event_type")
        return Response({"data": EventSerializer(events, many=True).data, "error": None})


class CalendarView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        couple_id = _active_couple_id(request.user.id)
        if not couple_id:
            return Response({"data": [], "error": None})
        events = Event.objects.filter(couple_id=couple_id, is_active=True).select_related("event_type")
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


class MediaUploadView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response({"data": None, "error": "No active couple membership"}, status=404)

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
        return Response({"data": MediaFileSerializer(media).data, "error": None}, status=201)


class MoodBoardView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response({"data": None, "error": "No active couple membership"}, status=404)

        event = get_object_or_404(Event, id=event_id, couple_id=couple_id)
        board, _ = MoodBoard.objects.get_or_create(event=event, defaults={"is_enabled": True})
        board = MoodBoard.objects.prefetch_related("items__media").get(id=board.id)
        return Response({"data": MoodBoardSerializer(board).data, "error": None})

    def post(self, request, event_id):
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response({"data": None, "error": "No active couple membership"}, status=404)

        event = get_object_or_404(Event, id=event_id, couple_id=couple_id)
        board, _ = MoodBoard.objects.get_or_create(event=event, defaults={"is_enabled": True})

        serializer = MoodBoardItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(mood_board=board, created_by=user)
        return Response({"data": MoodBoardItemSerializer(item).data, "error": None}, status=201)


class MoodBoardItemDeleteView(views.APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        user = request.user
        couple_id = _active_couple_id(user.id)
        if not couple_id:
            return Response({"data": None, "error": "No active couple membership"}, status=404)

        item = get_object_or_404(
            MoodBoardItem.objects.select_related("mood_board__event"),
            id=item_id,
        )
        if item.mood_board.event.couple_id != couple_id:
            return Response({"data": None, "error": "Not found"}, status=404)

        item.delete()
        return Response({"data": {"deleted": True}, "error": None})
