from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "admin")


class IsAdminOrReadOnly(BasePermission):
    """Allow read access to anyone, write access only to admins."""

    def has_permission(self, request, view):
        # Allow read access (GET, HEAD, OPTIONS) to everyone
        if request.method in SAFE_METHODS:
            return True
        # Require authentication and admin role for write operations
        user = request.user
        return bool(user and user.is_authenticated and user.role == "admin")