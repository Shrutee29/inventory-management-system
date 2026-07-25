from decimal import Decimal

from rest_framework import serializers

from products.models import Product
from suppliers.models import Supplier

from .models import PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemWriteSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.select_related("supplier").all())
    quantity = serializers.IntegerField(min_value=1)
    unit_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=Decimal("0.01"))


class PurchaseOrderItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    supplier_name = serializers.SerializerMethodField()
    remaining_quantity = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_sku",
            "supplier_name",
            "quantity",
            "received_quantity",
            "remaining_quantity",
            "unit_cost",
            "line_total",
        )

    def get_supplier_name(self, obj):
        supplier = getattr(obj.product, "supplier", None)
        return supplier.company_name if supplier else None

    def get_remaining_quantity(self, obj):
        return obj.quantity - obj.received_quantity


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.company_name", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    items = PurchaseOrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = (
            "id",
            "supplier",
            "supplier_name",
            "created_by",
            "created_by_username",
            "status",
            "notes",
            "total_amount",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "status", "total_amount", "created_at", "updated_at")


class PurchaseOrderCreateUpdateSerializer(serializers.Serializer):
    supplier = serializers.PrimaryKeyRelatedField(queryset=Supplier.objects.filter(is_active=True))
    notes = serializers.CharField(required=False, allow_blank=True)
    items = PurchaseOrderItemWriteSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one purchase order item is required.")

        seen_products = set()
        for item in value:
            product = item["product"]
            if product.pk in seen_products:
                raise serializers.ValidationError("Duplicate products are not allowed in a single purchase order.")
            seen_products.add(product.pk)

            if not product.is_active:
                raise serializers.ValidationError(f"Product '{product.name}' is not available.")

        return value

    def validate(self, attrs):
        supplier = attrs.get("supplier")
        items = attrs.get("items", [])
        for item in items:
            product_supplier = getattr(item["product"], "supplier", None)
            if product_supplier and product_supplier.pk != supplier.pk:
                raise serializers.ValidationError(
                    f"Product '{item['product'].name}' belongs to a different supplier."
                )
        return attrs


class PurchaseOrderReceiveSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True)

