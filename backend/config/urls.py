from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/users/", include("users.urls")),
    path("api/", include("categories.urls")),
    path("api/", include("products.urls")),
    path("api/", include("orders.urls")),
    path("api/", include("dashboard.urls")),
    path("api/", include("inventory.urls")),
    path("api/", include("suppliers.urls")),
    path("api/", include("purchase_orders.urls")),
]