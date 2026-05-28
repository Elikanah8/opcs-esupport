from django.urls import path
from . import views

urlpatterns = [
    # User registration
    path('auth/register/', views.RegisterView.as_view(), name='register'),

    # Current user profile
    path('users/me/', views.CurrentUserView.as_view(), name='current_user'),

    # Ticket endpoints
    path('tickets/', views.TicketListCreateView.as_view(), name='tickets'),
    path('tickets/<int:pk>/', views.TicketDetailView.as_view(), name='ticket_detail'),
    path('tickets/<int:pk>/claim/', views.ClaimTicketView.as_view(), name='claim_ticket'),
    path('tickets/<int:pk>/resolve/', views.ResolveTicketView.as_view(), name='resolve_ticket'),
    path('tickets/<int:pk>/assist/', views.AssistTicketView.as_view(), name='assist_ticket'),

    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='mark_read'),

    # Departments dropdown
    path('departments/', views.DepartmentListView.as_view(), name='departments'),

    # Supervisor analytics
    path('analytics/summary/', views.AnalyticsSummaryView.as_view(), name='analytics'),
]