from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from .models import (
    ActivityLog,
    BudgetCategory,
    BudgetLineItem,
    Comment,
    Event,
    EventBudget,
    EventBudgetCategory,
    EventType,
    HoneymoonItem,
    HoneymoonPlan,
    MediaFile,
    MoodBoard,
    MoodBoardItem,
    MoodBoardReaction,
    Notification,
    Task,
)


TARGET_MODEL_MAP = {
    "event": Event,
    "moodboard_item": MoodBoardItem,
    "budget_line_item": BudgetLineItem,
    "honeymoon_item": HoneymoonItem,
    "task": Task,
}


def _get_content_type(target_type: str):
    model = TARGET_MODEL_MAP.get(target_type)
    if not model:
        raise serializers.ValidationError(f"Unsupported target_type: {target_type}")
    return ContentType.objects.get_for_model(model)


class MediaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaFile
        fields = (
            "id",
            "couple",
            "storage_key",
            "url",
            "mime_type",
            "size_bytes",
            "uploaded_by",
            "created_at",
        )
        read_only_fields = ("id", "couple", "uploaded_by", "created_at")


class MoodBoardItemSerializer(serializers.ModelSerializer):
    media = MediaFileSerializer(read_only=True)
    media_id = serializers.PrimaryKeyRelatedField(
        queryset=MediaFile.objects.all(), source="media", write_only=True
    )

    class Meta:
        model = MoodBoardItem
        fields = (
            "id",
            "mood_board",
            "media",
            "media_id",
            "caption",
            "position",
            "created_by",
            "created_at",
        )
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
        fields = (
            "id",
            "key",
            "name_en",
            "name_ar",
            "default_color_hex",
            "default_moodboard_enabled",
        )


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


class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = ("id", "key", "label", "sort_order", "is_default_for_omani")


class BudgetLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetLineItem
        fields = (
            "id",
            "event_budget_category",
            "label",
            "planned_amount",
            "actual_amount",
            "notes",
            "paid_on",
            "receipt_media",
            "created_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_by",
            "created_at",
            "updated_at",
            "event_budget_category",
        )


class EventBudgetCategorySerializer(serializers.ModelSerializer):
    line_items = BudgetLineItemSerializer(many=True, read_only=True)
    category = BudgetCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BudgetCategory.objects.all(), source="category", write_only=True
    )

    class Meta:
        model = EventBudgetCategory
        fields = (
            "id",
            "event_budget",
            "category",
            "category_id",
            "planned_amount",
            "spent_amount",
            "line_items",
        )
        read_only_fields = ("id", "event_budget", "category", "line_items")


class EventBudgetSerializer(serializers.ModelSerializer):
    categories = EventBudgetCategorySerializer(many=True, read_only=True)

    class Meta:
        model = EventBudget
        fields = (
            "id",
            "event",
            "currency_code",
            "total_planned",
            "total_spent",
            "categories",
        )
        read_only_fields = ("id", "event", "total_planned", "total_spent", "categories")


class HoneymoonItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoneymoonItem
        fields = (
            "id",
            "honeymoon_plan",
            "type",
            "label",
            "start_date",
            "end_date",
            "planned_amount",
            "actual_amount",
            "provider_name",
            "booking_ref",
            "notes",
            "created_at",
        )
        read_only_fields = ("id", "honeymoon_plan", "created_at")


class HoneymoonPlanSerializer(serializers.ModelSerializer):
    items = HoneymoonItemSerializer(many=True, read_only=True)

    class Meta:
        model = HoneymoonPlan
        fields = (
            "id",
            "event",
            "destination_country",
            "destination_city",
            "start_date",
            "end_date",
            "notes",
            "total_planned",
            "total_spent",
            "items",
        )
        read_only_fields = ("id", "event", "items")


class CommentSerializer(serializers.ModelSerializer):
    target_type = serializers.CharField(write_only=True)
    target_id = serializers.IntegerField(write_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "couple",
            "target_type",
            "target_id",
            "body",
            "created_by",
            "created_at",
            "updated_at",
            "is_deleted",
        )
        read_only_fields = ("id", "couple", "created_by", "created_at", "updated_at")

    def create(self, validated_data):
        target_type = validated_data.pop("target_type")
        target_id = validated_data.pop("target_id")
        ct = _get_content_type(target_type)
        return Comment.objects.create(
            content_type=ct, object_id=target_id, **validated_data
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["target_type"] = instance.content_type.model
        data["target_id"] = instance.object_id
        return data


class ActivityLogSerializer(serializers.ModelSerializer):
    target_type = serializers.CharField(
        write_only=True, required=False, allow_null=True
    )
    target_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    actor = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ActivityLog
        fields = (
            "id",
            "couple",
            "actor",
            "verb",
            "metadata",
            "target_type",
            "target_id",
            "created_at",
        )
        read_only_fields = ("id", "couple", "actor", "created_at")

    def create(self, validated_data):
        target_type = validated_data.pop("target_type", None)
        target_id = validated_data.pop("target_id", None)
        ct = _get_content_type(target_type) if target_type else None
        return ActivityLog.objects.create(
            content_type=ct, object_id=target_id, **validated_data
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["target_type"] = (
            instance.content_type.model if instance.content_type else None
        )
        data["target_id"] = instance.object_id
        return data


class TaskSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        source="event",
        write_only=True,
        required=False,
        allow_null=True,
    )
    assigned_to = serializers.PrimaryKeyRelatedField(read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "couple",
            "event",
            "event_id",
            "title",
            "description",
            "status",
            "due_date",
            "assigned_to",
            "created_by",
            "created_at",
            "updated_at",
            "completed_at",
        )
        read_only_fields = (
            "id",
            "couple",
            "event",
            "created_by",
            "created_at",
            "updated_at",
            "completed_at",
        )


class NotificationSerializer(serializers.ModelSerializer):
    target_type = serializers.CharField(
        write_only=True, required=False, allow_null=True
    )
    target_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Notification
        fields = (
            "id",
            "couple",
            "user",
            "message",
            "is_read",
            "target_type",
            "target_id",
            "created_at",
        )
        read_only_fields = ("id", "couple", "user", "created_at")

    def create(self, validated_data):
        target_type = validated_data.pop("target_type", None)
        target_id = validated_data.pop("target_id", None)
        ct = _get_content_type(target_type) if target_type else None
        return Notification.objects.create(
            content_type=ct, object_id=target_id, **validated_data
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["target_type"] = (
            instance.content_type.model if instance.content_type else None
        )
        data["target_id"] = instance.object_id
        return data
