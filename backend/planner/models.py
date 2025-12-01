from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Couple(models.Model):
    name = models.CharField(max_length=255)
    wedding_date = models.DateField(null=True, blank=True)
    language_pref = models.CharField(max_length=20, default="en")
    theme = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class CoupleMember(models.Model):
    ROLE_CHOICES = (
        ("bride", "Bride"),
        ("groom", "Groom"),
        ("viewer", "Viewer"),
        ("editor", "Editor"),
    )
    STATUS_CHOICES = (
        ("invited", "Invited"),
        ("active", "Active"),
        ("left", "Left"),
    )

    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="couple_memberships")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="viewer")
    is_owner = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="invited")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("couple", "user")


class EventType(models.Model):
    key = models.CharField(max_length=50, unique=True)
    name_en = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100, blank=True)
    default_color_hex = models.CharField(max_length=7, default="#FFC0CB")
    default_moodboard_enabled = models.BooleanField(default=False)

    def __str__(self):
        return self.key


class Event(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name="events")
    event_type = models.ForeignKey(EventType, on_delete=models.PROTECT, related_name="events")
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("couple", "event_type")

    def __str__(self):
        return self.title or f"{self.couple} - {self.event_type.key}"


class MediaFile(models.Model):
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name="media_files")
    storage_key = models.CharField(max_length=255)
    url = models.URLField()
    mime_type = models.CharField(max_length=100)
    size_bytes = models.BigIntegerField()
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="uploads")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.storage_key


class MoodBoard(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name="mood_board")
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Mood board for {self.event}"


class MoodBoardItem(models.Model):
    mood_board = models.ForeignKey(MoodBoard, on_delete=models.CASCADE, related_name="items")
    media = models.ForeignKey(MediaFile, on_delete=models.PROTECT, related_name="mood_board_items")
    caption = models.CharField(max_length=255, blank=True)
    position = models.IntegerField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="mood_board_items")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Item {self.id} on {self.mood_board}"


class MoodBoardReaction(models.Model):
    mood_board_item = models.ForeignKey(MoodBoardItem, on_delete=models.CASCADE, related_name="reactions")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mood_board_reactions")
    reaction_type = models.CharField(max_length=20, default="heart")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("mood_board_item", "user", "reaction_type")


class EventBudget(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name="event_budget")
    currency_code = models.CharField(max_length=8, default="USD")
    total_planned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class BudgetCategory(models.Model):
    key = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    sort_order = models.IntegerField(default=0)
    is_default_for_omani = models.BooleanField(default=False)

    def __str__(self):
        return self.label


class EventBudgetCategory(models.Model):
    event_budget = models.ForeignKey(EventBudget, on_delete=models.CASCADE, related_name="categories")
    category = models.ForeignKey(BudgetCategory, on_delete=models.PROTECT)
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    spent_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)


class BudgetLineItem(models.Model):
    event_budget_category = models.ForeignKey(EventBudgetCategory, on_delete=models.CASCADE, related_name="line_items")
    label = models.CharField(max_length=255)
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    paid_on = models.DateField(null=True, blank=True)
    receipt_media = models.ForeignKey(MediaFile, on_delete=models.SET_NULL, null=True, blank=True, related_name="receipts")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="budget_line_items")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class HoneymoonPlan(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name="honeymoon_plan")
    destination_country = models.CharField(max_length=100, blank=True)
    destination_city = models.CharField(max_length=100, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    total_planned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class HoneymoonItem(models.Model):
    TYPE_CHOICES = (
        ("flight", "Flight"),
        ("hotel", "Hotel"),
        ("activity", "Activity"),
        ("other", "Other"),
    )
    honeymoon_plan = models.ForeignKey(HoneymoonPlan, on_delete=models.CASCADE, related_name="items")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="other")
    label = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    planned_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    provider_name = models.CharField(max_length=255, blank=True)
    booking_ref = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Create your models here.
