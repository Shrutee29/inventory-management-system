from django.urls import path

from .views import AdminDashboardView, CustomerDashboardView, DashboardIndexView

urlpatterns = [
    path("dashboard/admin/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("dashboard/customer/", CustomerDashboardView.as_view(), name="customer-dashboard"),
    path("dashboard/", DashboardIndexView.as_view(), name="dashboard-root"),
]
