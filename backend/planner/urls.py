from django.urls import path
from .views import (
    PlannerPingView,
    MediaUploadView,
    MoodBoardView,
    MoodBoardItemDeleteView,
    EventTypesView,
    EventSelectionView,
    EventsListView,
    CalendarView,
    EventBudgetView,
    EventBudgetCategoryItemsView,
    HoneymoonPlanView,
    HoneymoonItemView,
)

urlpatterns = [
    path('ping/', PlannerPingView.as_view(), name='planner-ping'),
    path('events/types/', EventTypesView.as_view(), name='event-types'),
    path('events/', EventsListView.as_view(), name='events-list'),
    path('events/selection/', EventSelectionView.as_view(), name='events-selection'),
    path('calendar/', CalendarView.as_view(), name='calendar'),
    path('events/<int:event_id>/budget/', EventBudgetView.as_view(), name='event-budget'),
    path('budget/categories/<int:category_id>/items/', EventBudgetCategoryItemsView.as_view(), name='budget-line-item'),
    path('events/<int:event_id>/honeymoon/', HoneymoonPlanView.as_view(), name='honeymoon-plan'),
    path('honeymoon/<int:plan_id>/items/', HoneymoonItemView.as_view(), name='honeymoon-item'),
    path('media/upload/', MediaUploadView.as_view(), name='media-upload'),
    path('moodboard/<int:event_id>/', MoodBoardView.as_view(), name='moodboard'),
    path('moodboard/<int:event_id>/items/', MoodBoardView.as_view(), name='moodboard-item-create'),
    path('moodboard/items/<int:item_id>/', MoodBoardItemDeleteView.as_view(), name='moodboard-item-delete'),
]
