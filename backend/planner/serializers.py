from rest_framework import serializers
from .models import MediaFile, MoodBoardItem, MoodBoardReaction, MoodBoard, Event, EventType


class MediaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaFile
        fields = ("id", "couple", "storage_key", "url", "mime_type", "size_bytes", "uploaded_by", "created_at")
        read_only_fields = ("id", "couple", "uploaded_by", "created_at")


class MoodBoardItemSerializer(serializers.ModelSerializer):
    media = MediaFileSerializer(read_only=True)
    media_id = serializers.PrimaryKeyRelatedField(queryset=MediaFile.objects.all(), source="media", write_only=True)

    class Meta:
        model = MoodBoardItem
        fields = ("id", "mood_board", "media", "media_id", "caption", "position", "created_by", "created_at")
        read_only_fields = ("id", "mood_board", "created_by", "created_at", "media")


class MoodBoardSerializer(serializers.ModelSerializer):
    items = MoodBoardItemSerializer(many=True, read_only=True)

    class Meta:
        model = MoodBoard
        fields = ("id", "event", "is_enabled", "items")
        read_only_fields = ("id", "event", "items")


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ("id", "key", "name_en", "name_ar", "default_color_hex", "default_moodboard_enabled")


class EventSerializer(serializers.ModelSerializer):
    event_type = EventTypeSerializer(read_only=True)

    class Meta:
        model = Event
        fields = (
            "id",
            "event_type",
            "title",
            "description",
            "start_date",
            "end_date",
            "is_active",
        )
