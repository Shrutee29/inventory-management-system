from django.db import transaction
from django.db.models import F
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product
from inventory.services import create_stock_transaction

from .models import Order
from .permissions import IsOwnerOrAdmin
from .serializers import OrderCreateSerializer, OrderSerializer, OrderStatusUpdateSerializer


class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("user").prefetch_related("items__product")
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    pagination_class = OrderPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "created_at"]
    ordering_fields = ["created_at", "updated_at", "total_amount"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role != "admin":
            queryset = queryset.filter(user=self.request.user)
        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        if self.action in {"update", "partial_update"}:
            return OrderStatusUpdateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        read_serializer = OrderSerializer(order, context=self.get_serializer_context())
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response({"detail": "Only admin users can update order status."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.role != "admin":
            return Response({"detail": "Only admin users can update order status."}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsOwnerOrAdmin])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if request.user.role != "admin" and order.user_id != request.user.id:
            return Response({"detail": "You can only cancel your own orders."}, status=status.HTTP_403_FORBIDDEN)

        if order.status == Order.Status.CANCELLED:
            return Response({"detail": "Order is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        if order.status == Order.Status.COMPLETED:
            return Response({"detail": "Completed orders cannot be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = Order.objects.select_for_update().prefetch_related("items__product").get(pk=order.pk)

            for item in order.items.all():
                
                try:
                    create_stock_transaction(
                        product=item.product,
                        change=int(item.quantity),
                        transaction_type="return",
                        order=order,
                        user=request.user,
                        note="Restored stock due to order cancellation",
                    )
                except Exception:
                    raise Exception(f"Failed to record stock transaction for restored item {item.product.name}")

            order.status = Order.Status.CANCELLED
            order.save(update_fields=["status", "updated_at"])

        return Response(OrderSerializer(order, context={"request": request}).data, status=status.HTTP_200_OK)
