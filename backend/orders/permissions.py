from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == "admin")


class IsOwnerOrAdmin(BasePermission):
    message = "You do not have permission to access this order."

    def has_object_permission(self, request, view, obj):
        user = request.user
        return bool(user and user.is_authenticated and (user.role == "admin" or obj.user_id == user.id))