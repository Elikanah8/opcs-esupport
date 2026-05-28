from django.db import models
from django.contrib.auth.models import AbstractUser


class Department(models.Model):
    """Represents an OPCS department or directorate"""
    name     = models.CharField(max_length=200)
    floor    = models.CharField(max_length=100, blank=True)
    building = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    """
    Custom user model extending Django's default user.
    Adds role, department, and profile fields.
    """
    ROLE_CHOICES = [
        ('staff',      'Staff Member'),
        ('intern',     'Intern / Attachee'),
        ('supervisor', 'Supervisor'),
        ('admin',      'System Administrator'),
    ]

    role       = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    is_active  = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"


class Ticket(models.Model):
    """
    Core ticket model — represents a single IT support request.
    Tracks the full lifecycle from submission to closure.
    """
    PRIORITY_CHOICES = [
        ('low',      'Low'),
        ('medium',   'Medium'),
        ('high',     'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('claimed',   'Claimed'),
        ('in_progress', 'In Progress'),
        ('awaiting',  'Awaiting Assistance'),
        ('resolved',  'Resolved'),
        ('closed',    'Closed'),
    ]

    # Auto-generated unique reference number e.g. TKT-0001
    reference    = models.CharField(max_length=20, unique=True, blank=True)
    title        = models.CharField(max_length=300)
    description  = models.TextField()
    priority     = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    location     = models.CharField(max_length=200)

    # Relationships
    department   = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_tickets')
    claimed_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='claimed_tickets')

    # Timestamps
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-generate reference number on first save
        if not self.reference:
            super().save(*args, **kwargs)
            self.reference = f"TKT-{self.pk:04d}"
            Ticket.objects.filter(pk=self.pk).update(reference=self.reference)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} — {self.title}"


class TicketLog(models.Model):
    """
    Audit trail for every action taken on a ticket.
    Records who did what and when.
    """
    ticket       = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='logs')
    action       = models.CharField(max_length=200)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes        = models.TextField(blank=True)
    timestamp    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.ticket.reference} — {self.action} at {self.timestamp}"


class AssistanceRequest(models.Model):
    """
    Created when an intern needs help from a supervisor.
    Triggers notifications to available senior staff.
    """
    ticket       = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='assistance_requests')
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    note         = models.TextField(blank=True)
    is_resolved  = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assist request on {self.ticket.reference} by {self.requested_by}"


class Notification(models.Model):
    """
    In-app notifications sent to users for key system events.
    """
    TYPE_CHOICES = [
        ('new_ticket',  'New Ticket'),
        ('claimed',     'Ticket Claimed'),
        ('escalation',  'Escalation Request'),
        ('resolved',    'Ticket Resolved'),
        ('general',     'General'),
    ]

    recipient  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message    = models.TextField()
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.recipient} — {self.type}"


class Attachment(models.Model):
    """
    File attachments uploaded alongside a ticket submission.
    """
    ticket      = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file        = models.FileField(upload_to='attachments/')
    file_name   = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} on {self.ticket.reference}"


class AISession(models.Model):
    """
    Logs every interaction with the AI assistant.
    Used for analytics and improving response quality.
    """
    user       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    query      = models.TextField()
    response   = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI session by {self.user} at {self.created_at}"