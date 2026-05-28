from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Ticket, TicketLog, Notification, Department, Attachment

User = get_user_model()


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializes department data for dropdowns and ticket forms"""
    class Meta:
        model  = Department
        fields = ['id', 'name', 'floor', 'building']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializes user profile data returned after login.
    Excludes sensitive fields like password.
    """
    department_name = serializers.CharField(
        source='department.name', read_only=True
    )

    class Meta:
        model  = User
        fields = [
            'id', 'username', 'email', 'first_name',
            'last_name', 'role', 'department', 'department_name', 'is_active'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user registration.
    Accepts password as write-only and hashes it automatically.
    """
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'role', 'department']

    def create(self, validated_data):
        # Use create_user so Django hashes the password correctly
        user = User.objects.create_user(
            username   = validated_data['username'],
            email      = validated_data.get('email', ''),
            password   = validated_data['password'],
            first_name = validated_data.get('first_name', ''),
            last_name  = validated_data.get('last_name', ''),
            role       = validated_data.get('role', 'staff'),
            department = validated_data.get('department', None),
        )
        return user


class TicketLogSerializer(serializers.ModelSerializer):
    """Serializes audit log entries for a ticket"""
    performed_by_name = serializers.CharField(
        source='performed_by.get_full_name', read_only=True
    )

    class Meta:
        model  = TicketLog
        fields = ['id', 'action', 'performed_by_name', 'notes', 'timestamp']


class TicketSerializer(serializers.ModelSerializer):
    """
    Full ticket serializer including nested logs and user names.
    Used for both creating and retrieving tickets.
    """
    submitted_by_name = serializers.CharField(
        source='submitted_by.get_full_name', read_only=True
    )
    claimed_by_name = serializers.CharField(
        source='claimed_by.get_full_name', read_only=True
    )
    logs = TicketLogSerializer(many=True, read_only=True)

    class Meta:
        model  = Ticket
        fields = [
            'id', 'reference', 'title', 'description',
            'priority', 'status', 'location', 'department',
            'submitted_by', 'submitted_by_name',
            'claimed_by', 'claimed_by_name',
            'created_at', 'updated_at', 'logs'
        ]
        # These fields are set automatically — not required in POST requests
        read_only_fields = ['reference', 'submitted_by', 'claimed_by', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializes notification data for the frontend notification panel"""
    class Meta:
        model  = Notification
        fields = ['id', 'message', 'type', 'is_read', 'created_at']