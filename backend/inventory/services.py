from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from products.models import Product

from .models import StockTransaction


def create_stock_transaction(product, change, transaction_type, order=None, user=None, note=""):
    """Apply a stock change and create a StockTransaction.

    - `change` is an integer: positive to increase, negative to decrease.
    - Ensures stock never goes negative.
    - Uses select_for_update to guard concurrent updates when not already locked.
    """

    if change == 0:
        raise serializers.ValidationError("Stock change must be non-zero.")

    with transaction.atomic():
        # Lock the product row to avoid race conditions
        p = Product.objects.select_for_update().get(pk=product.pk)

        new_qty = p.stock_quantity + int(change)
        if new_qty < 0:
            raise serializers.ValidationError(f"Insufficient stock for '{p.name}' to apply change {change}.")

        # Update the product stock using an F expression for safety
        Product.objects.filter(pk=p.pk).update(stock_quantity=F("stock_quantity") + int(change))

        tx = StockTransaction.objects.create(
            product=p,
            change=int(change),
            transaction_type=transaction_type,
            order=order,
            created_by=user,
            note=note,
        )

    return tx
