from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only admins can access."""

    message = "Admin access required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "admin")
