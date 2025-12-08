from django.urls import path
from .views import (
    ActivityLogView,
    CalendarView,
    CommentDetailView,
    CommentView,
    EventBudgetCategoryItemsView,
    EventBudgetView,
    EventSelectionView,
    EventTypesView,
    EventsListView,
    HoneymoonItemView,
    HoneymoonPlanView,
    MediaUploadView,
    MoodBoardItemDeleteView,
    MoodBoardView,
    NotificationListView,
    PlannerPingView,
    TaskDetailView,
    TaskListView,
    DashboardSummaryView,
)

urlpatterns = [
    path("ping/", PlannerPingView.as_view(), name="planner-ping"),
    path("events/types/", EventTypesView.as_view(), name="event-types"),
    path("events/", EventsListView.as_view(), name="events-list"),
    path("events/selection/", EventSelectionView.as_view(), name="events-selection"),
    path("calendar/", CalendarView.as_view(), name="calendar"),
    path(
        "events/<int:event_id>/budget/", EventBudgetView.as_view(), name="event-budget"
    ),
    path(
        "budget/categories/<int:category_id>/items/",
        EventBudgetCategoryItemsView.as_view(),
        name="budget-line-item",
    ),
    path(
        "events/<int:event_id>/honeymoon/",
        HoneymoonPlanView.as_view(),
        name="honeymoon-plan",
    ),
    path(
        "honeymoon/<int:plan_id>/items/",
        HoneymoonItemView.as_view(),
        name="honeymoon-item",
    ),
    path("media/upload/", MediaUploadView.as_view(), name="media-upload"),
    path("moodboard/<int:event_id>/", MoodBoardView.as_view(), name="moodboard"),
    path(
        "moodboard/<int:event_id>/items/",
        MoodBoardView.as_view(),
        name="moodboard-item-create",
    ),
    path(
        "moodboard/items/<int:item_id>/",
        MoodBoardItemDeleteView.as_view(),
        name="moodboard-item-delete",
    ),
    path("comments/", CommentView.as_view(), name="comments"),
    path(
        "comments/<int:comment_id>/", CommentDetailView.as_view(), name="comment-detail"
    ),
    path("activity/", ActivityLogView.as_view(), name="activity-log"),
    path("tasks/", TaskListView.as_view(), name="tasks"),
    path("tasks/<int:task_id>/", TaskDetailView.as_view(), name="task-detail"),
    path("notifications/", NotificationListView.as_view(), name="notifications"),
    path(
        "dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"
    ),
]
