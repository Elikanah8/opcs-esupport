from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Department, Ticket, TicketLog, Notification, AssistanceRequest, Attachment, AISession

# Register all models so they appear in the admin panel

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'floor', 'building']

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter   = ['role', 'is_active']
    fieldsets     = UserAdmin.fieldsets + (
        ('OPCS Info', {'fields': ('role', 'department')}),
    )

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display  = ['reference', 'title', 'priority', 'status', 'submitted_by', 'claimed_by', 'created_at']
    list_filter   = ['priority', 'status']
    search_fields = ['title', 'reference']

@admin.register(TicketLog)
class TicketLogAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'action', 'performed_by', 'timestamp']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'message', 'type', 'is_read', 'created_at']

@admin.register(AssistanceRequest)
class AssistanceRequestAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'requested_by', 'is_resolved', 'created_at']

@admin.register(AISession)
class AISessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'query', 'created_at']