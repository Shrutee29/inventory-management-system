from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from inventory.permissions import IsAdmin

from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import (
    PurchaseOrderCreateUpdateSerializer,
    PurchaseOrderReceiveSerializer,
    PurchaseOrderSerializer,
)
from .services import (
    approve_purchase_order,
    cancel_purchase_order,
    create_purchase_order,
    receive_purchase_order,
    update_purchase_order,
)


class PurchaseOrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related("supplier", "created_by").prefetch_related(
        Prefetch("items", queryset=PurchaseOrderItem.objects.select_related("product", "product__supplier"))
    )
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = PurchaseOrderPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "supplier", "created_at"]
    ordering_fields = ["created_at", "updated_at", "total_amount"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return PurchaseOrderCreateUpdateSerializer
        if self.action in {"receive"}:
            return PurchaseOrderReceiveSerializer
        return PurchaseOrderSerializer

    def get_queryset(self):
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purchase_order = create_purchase_order(
            supplier=serializer.validated_data["supplier"],
            items_data=serializer.validated_data["items"],
            created_by=request.user,
            notes=serializer.validated_data.get("notes", ""),
        )
        read_serializer = PurchaseOrderSerializer(purchase_order, context=self.get_serializer_context())
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purchase_order = update_purchase_order(
            purchase_order=instance,
            supplier=serializer.validated_data.get("supplier"),
            items_data=serializer.validated_data.get("items"),
            notes=serializer.validated_data.get("notes"),
        )
        return Response(PurchaseOrderSerializer(purchase_order, context=self.get_serializer_context()).data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status == PurchaseOrder.Status.RECEIVED:
            return Response(
                {"detail": "Received purchase orders cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        purchase_order = approve_purchase_order(purchase_order=self.get_object())
        return Response(PurchaseOrderSerializer(purchase_order, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"])
    def receive(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purchase_order = receive_purchase_order(
            purchase_order=self.get_object(),
            user=request.user,
            note=serializer.validated_data.get("note", ""),
        )
        return Response(PurchaseOrderSerializer(purchase_order, context=self.get_serializer_context()).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        purchase_order = cancel_purchase_order(purchase_order=self.get_object())
        return Response(PurchaseOrderSerializer(purchase_order, context=self.get_serializer_context()).data)
