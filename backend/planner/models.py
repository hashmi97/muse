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

# Create your models here.
