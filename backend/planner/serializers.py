from rest_framework import serializers
from .models import (
    MediaFile,
    MoodBoardItem,
    MoodBoardReaction,
    MoodBoard,
    Event,
    EventType,
    EventBudget,
    EventBudgetCategory,
    BudgetCategory,
    BudgetLineItem,
    HoneymoonPlan,
    HoneymoonItem,
)


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
        read_only_fields = ("id", "created_by", "created_at", "updated_at", "event_budget_category")


class EventBudgetCategorySerializer(serializers.ModelSerializer):
    line_items = BudgetLineItemSerializer(many=True, read_only=True)
    category = BudgetCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=BudgetCategory.objects.all(), source="category", write_only=True)

    class Meta:
        model = EventBudgetCategory
        fields = ("id", "event_budget", "category", "category_id", "planned_amount", "spent_amount", "line_items")
        read_only_fields = ("id", "event_budget", "category", "line_items")


class EventBudgetSerializer(serializers.ModelSerializer):
    categories = EventBudgetCategorySerializer(many=True, read_only=True)

    class Meta:
        model = EventBudget
        fields = ("id", "event", "currency_code", "total_planned", "total_spent", "categories")
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
