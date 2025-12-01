from django.contrib import admin
from .models import (
    Couple,
    CoupleMember,
    EventType,
    Event,
    MediaFile,
    MoodBoard,
    MoodBoardItem,
    MoodBoardReaction,
)

admin.site.register(Couple)
admin.site.register(CoupleMember)
admin.site.register(EventType)
admin.site.register(Event)
admin.site.register(MediaFile)
admin.site.register(MoodBoard)
admin.site.register(MoodBoardItem)
admin.site.register(MoodBoardReaction)

# Register your models here.
