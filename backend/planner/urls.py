from django.urls import path
from .views import PlannerPingView, MediaUploadView, MoodBoardView, MoodBoardItemDeleteView

urlpatterns = [
    path('ping/', PlannerPingView.as_view(), name='planner-ping'),
    path('media/upload/', MediaUploadView.as_view(), name='media-upload'),
    path('moodboard/<int:event_id>/', MoodBoardView.as_view(), name='moodboard'),
    path('moodboard/<int:event_id>/items/', MoodBoardView.as_view(), name='moodboard-item-create'),
    path('moodboard/items/<int:item_id>/', MoodBoardItemDeleteView.as_view(), name='moodboard-item-delete'),
]
