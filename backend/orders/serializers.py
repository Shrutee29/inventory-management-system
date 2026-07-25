from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from products.models import Product

# Service to record stock transactions
from inventory.services import create_stock_transaction

from .models import Order, OrderItem


class OrderItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_sku",
            "quantity",
            "unit_price",
            "line_total",
        )


class OrderItemWriteSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    customer = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "customer",
            "status",
            "total_amount",
            "items",
            "created_at",
            "updated_at",
        )


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True)

    class Meta:
        model = Order
        fields = ("id", "items", "total_amount", "status", "created_at", "updated_at")
        read_only_fields = ("id", "total_amount", "status", "created_at", "updated_at")

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one order item is required.")

        seen_products = set()
        for item in value:
            product = item["product"]
            quantity = item["quantity"]

            if product.pk in seen_products:
                raise serializers.ValidationError("Duplicate products are not allowed in a single order.")
            seen_products.add(product.pk)

            if not product.is_active:
                raise serializers.ValidationError(f"Product '{product.name}' is not available.")

            if product.stock_quantity < quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}."
                )

        return value

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user

        with transaction.atomic():
            locked_product_ids = [item["product"].pk for item in items_data]
            products = {
                product.pk: product
                for product in Product.objects.select_for_update().filter(pk__in=locked_product_ids)
            }

            if len(products) != len(locked_product_ids):
                raise serializers.ValidationError("One or more products are no longer available.")

            total_amount = Decimal("0.00")
            resolved_items = []

            for item in items_data:
                product = products[item["product"].pk]
                quantity = item["quantity"]

                if product.stock_quantity < quantity:
                    raise serializers.ValidationError(
                        f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}."
                    )

                unit_price = product.price
                line_total = unit_price * quantity
                total_amount += line_total

                resolved_items.append(
                    {
                        "product": product,
                        "quantity": quantity,
                        "unit_price": unit_price,
                        "line_total": line_total,
                    }
                )

            order = Order.objects.create(user=user, total_amount=total_amount)

            for item in resolved_items:
                OrderItem.objects.create(order=order, **item)
                
                # Record stock transaction for the sale
                try:
                    create_stock_transaction(
                        product=item["product"],
                        change=-int(item["quantity"]),
                        transaction_type="sale",
                        order=order,
                        user=user,
                        note="Sale created from order",
                    )
                except Exception:
                    # Surface as validation error inside transaction
                    raise serializers.ValidationError(
                        f"Failed to record stock transaction for {item['product'].name}."
                    )

            return order


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("status",)

    def validate_status(self, value):
        if value == Order.Status.CANCELLED:
            raise serializers.ValidationError("Use the cancel action to cancel an order.")
        return value