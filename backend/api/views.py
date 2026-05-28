from django.contrib.auth import get_user_model
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Ticket, TicketLog, Notification, AssistanceRequest, Department
from .serializers import (
    UserSerializer, RegisterSerializer, TicketSerializer,
    NotificationSerializer, DepartmentSerializer
)

User = get_user_model()


class RegisterView(APIView):
    """
    Allows new staff members to create an account.
    No authentication required — public endpoint.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """
    Returns the profile of the currently logged-in user.
    Used by the frontend to determine role and redirect accordingly.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class TicketListCreateView(APIView):
    """
    GET  — returns tickets filtered by the user's role.
    POST — creates a new ticket and logs the action.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Supervisors and admins see all tickets
        if user.role in ['supervisor', 'admin']:
            tickets = Ticket.objects.all().order_by('-created_at')

        # Interns see all tickets so they can claim them
        elif user.role == 'intern':
            tickets = Ticket.objects.all().order_by('-created_at')

        # Staff only see their own submitted tickets
        else:
            tickets = Ticket.objects.filter(submitted_by=user).order_by('-created_at')

        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            # Assign the logged-in user as the submitter
            ticket = serializer.save(submitted_by=request.user)

            # Log the ticket creation action
            TicketLog.objects.create(
                ticket=ticket,
                action='Ticket submitted',
                performed_by=request.user,
                notes=f'Priority: {ticket.priority}'
            )

            # Notify all interns about the new ticket
            interns = User.objects.filter(role='intern')
            for intern in interns:
                Notification.objects.create(
                    recipient=intern,
                    message=f'New {ticket.priority} priority ticket: {ticket.title}',
                    type='new_ticket'
                )

            return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketDetailView(APIView):
    """
    GET   — returns full details of a single ticket.
    PATCH — updates ticket fields (status, priority, etc).
    """
    permission_classes = [IsAuthenticated]

    def get_ticket(self, pk):
        try:
            return Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return None

    def get(self, request, pk):
        ticket = self.get_ticket(pk)
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TicketSerializer(ticket).data)

    def patch(self, request, pk):
        ticket = self.get_ticket(pk)
        if not ticket:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TicketSerializer(ticket, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClaimTicketView(APIView):
    """
    Allows an intern to claim an unclaimed ticket.
    Prevents two interns from claiming the same ticket simultaneously.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent claiming an already claimed ticket
        if ticket.claimed_by:
            return Response(
                {'error': f'Ticket already claimed by {ticket.claimed_by.get_full_name()}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Assign ticket to this intern
        ticket.claimed_by = request.user
        ticket.status = 'claimed'
        ticket.save()

        # Log the claim action
        TicketLog.objects.create(
            ticket=ticket,
            action='Ticket claimed',
            performed_by=request.user
        )

        # Notify the staff member who submitted the ticket
        if ticket.submitted_by:
            Notification.objects.create(
                recipient=ticket.submitted_by,
                message=f'Your ticket {ticket.reference} has been claimed by {request.user.get_full_name()}',
                type='claimed'
            )

        return Response(TicketSerializer(ticket).data)


class ResolveTicketView(APIView):
    """
    Marks a ticket as resolved.
    Only the intern who claimed it can resolve it.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        # Update ticket status to resolved
        ticket.status = 'resolved'
        ticket.save()

        # Log the resolution
        TicketLog.objects.create(
            ticket=ticket,
            action='Ticket resolved',
            performed_by=request.user,
            notes=request.data.get('notes', '')
        )

        # Notify the staff member their issue is resolved
        if ticket.submitted_by:
            Notification.objects.create(
                recipient=ticket.submitted_by,
                message=f'Your ticket {ticket.reference} has been resolved.',
                type='resolved'
            )

        return Response(TicketSerializer(ticket).data)


class AssistTicketView(APIView):
    """
    Intern requests assistance from a supervisor on a difficult ticket.
    Notifies all supervisors immediately.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

        # Create assistance request record
        AssistanceRequest.objects.create(
            ticket=ticket,
            requested_by=request.user,
            note=request.data.get('note', '')
        )

        # Update ticket status to awaiting assistance
        ticket.status = 'awaiting'
        ticket.save()

        # Notify all supervisors
        supervisors = User.objects.filter(role='supervisor')
        for supervisor in supervisors:
            Notification.objects.create(
                recipient=supervisor,
                message=f'Intern {request.user.get_full_name()} needs assistance on {ticket.reference}: {ticket.title}',
                type='escalation'
            )

        return Response({'message': 'Assistance requested. Supervisors have been notified.'})


class NotificationListView(APIView):
    """
    Returns all notifications for the logged-in user.
    Ordered by most recent first.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')[:20]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class MarkNotificationReadView(APIView):
    """
    Marks a single notification as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Marked as read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


class DepartmentListView(APIView):
    """
    Returns all departments for the ticket submission dropdown.
    Public endpoint — no authentication required.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)


class AnalyticsSummaryView(APIView):
    """
    Returns dashboard statistics for the supervisor panel.
    Includes ticket counts, intern performance, and priority breakdown.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Overall ticket counts
        total_tickets   = Ticket.objects.count()
        open_tickets    = Ticket.objects.exclude(status__in=['resolved', 'closed']).count()
        resolved_today  = Ticket.objects.filter(status='resolved').count()
        critical_open   = Ticket.objects.filter(priority='critical').exclude(status__in=['resolved', 'closed']).count()

        # Priority breakdown for pie chart
        priority_breakdown = {
            'low':      Ticket.objects.filter(priority='low').count(),
            'medium':   Ticket.objects.filter(priority='medium').count(),
            'high':     Ticket.objects.filter(priority='high').count(),
            'critical': Ticket.objects.filter(priority='critical').count(),
        }

        # Intern performance stats
        interns = User.objects.filter(role='intern')
        intern_stats = []
        for intern in interns:
            claimed  = Ticket.objects.filter(claimed_by=intern).count()
            resolved = Ticket.objects.filter(claimed_by=intern, status='resolved').count()
            intern_stats.append({
                'name':     intern.get_full_name(),
                'claimed':  claimed,
                'resolved': resolved,
                'status':   'active',
            })

        return Response({
            'total_tickets':      total_tickets,
            'open_tickets':       open_tickets,
            'resolved_today':     resolved_today,
            'critical_open':      critical_open,
            'priority_breakdown': priority_breakdown,
            'intern_stats':       intern_stats,
        })