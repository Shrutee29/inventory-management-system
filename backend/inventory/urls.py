from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import StockTransactionViewSet

router = DefaultRouter()
router.register(r"transactions", StockTransactionViewSet, basename="stocktransaction")

urlpatterns = [path("inventory/", include((router.urls, "inventory"), namespace="inventory"))]
