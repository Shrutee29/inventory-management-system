from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from inventory.services import create_stock_transaction
from products.models import Product

from .models import PurchaseOrder, PurchaseOrderItem


def _resolve_unit_cost(product, unit_cost):
    return Decimal(str(unit_cost)) if unit_cost is not None else product.price


def create_purchase_order(*, supplier, items_data, created_by, notes=""):
    with transaction.atomic():
        purchase_order = PurchaseOrder.objects.create(
            supplier=supplier,
            created_by=created_by,
            notes=notes,
            status=PurchaseOrder.Status.PENDING,
        )

        total_amount = Decimal("0.00")
        for item in items_data:
            product = item["product"]
            quantity = item["quantity"]
            unit_cost = _resolve_unit_cost(product, item.get("unit_cost"))
            line_total = unit_cost * quantity
            total_amount += line_total

            PurchaseOrderItem.objects.create(
                purchase_order=purchase_order,
                product=product,
                quantity=quantity,
                received_quantity=0,
                unit_cost=unit_cost,
                line_total=line_total,
            )

        purchase_order.total_amount = total_amount
        purchase_order.save(update_fields=["total_amount", "updated_at"])
        return purchase_order


def update_purchase_order(*, purchase_order, supplier=None, items_data=None, notes=None):
    with transaction.atomic():
        purchase_order = PurchaseOrder.objects.select_for_update().get(pk=purchase_order.pk)

        if purchase_order.status in {PurchaseOrder.Status.RECEIVED, PurchaseOrder.Status.CANCELLED}:
            raise serializers.ValidationError("Received or cancelled purchase orders cannot be updated.")

        if supplier is not None:
            purchase_order.supplier = supplier
        if notes is not None:
            purchase_order.notes = notes

        if items_data is not None:
            if purchase_order.items.filter(received_quantity__gt=0).exists():
                raise serializers.ValidationError("Purchase order items cannot be changed after receiving starts.")

            purchase_order.items.all().delete()
            total_amount = Decimal("0.00")
            for item in items_data:
                product = item["product"]
                quantity = item["quantity"]
                unit_cost = _resolve_unit_cost(product, item.get("unit_cost"))
                line_total = unit_cost * quantity
                total_amount += line_total

                PurchaseOrderItem.objects.create(
                    purchase_order=purchase_order,
                    product=product,
                    quantity=quantity,
                    received_quantity=0,
                    unit_cost=unit_cost,
                    line_total=line_total,
                )

            purchase_order.total_amount = total_amount

        purchase_order.save()
        return purchase_order


def approve_purchase_order(*, purchase_order):
    with transaction.atomic():
        purchase_order = PurchaseOrder.objects.select_for_update().get(pk=purchase_order.pk)

        if purchase_order.status != PurchaseOrder.Status.PENDING:
            raise serializers.ValidationError("Only pending purchase orders can be approved.")

        purchase_order.status = PurchaseOrder.Status.APPROVED
        purchase_order.save(update_fields=["status", "updated_at"])
        return purchase_order


def receive_purchase_order(*, purchase_order, user=None, note=""):
    with transaction.atomic():
        purchase_order = (
            PurchaseOrder.objects.select_for_update().prefetch_related("items__product").get(pk=purchase_order.pk)
        )

        if purchase_order.status != PurchaseOrder.Status.APPROVED:
            raise serializers.ValidationError("Only approved purchase orders can be received.")

        for item in purchase_order.items.all():
            remaining = item.quantity - item.received_quantity
            if remaining <= 0:
                continue

            create_stock_transaction(
                product=item.product,
                change=remaining,
                transaction_type="purchase",
                user=user,
                note=note or f"Received purchase order #{purchase_order.pk}",
            )

            PurchaseOrderItem.objects.filter(pk=item.pk).update(received_quantity=F("received_quantity") + remaining)

        purchase_order.status = PurchaseOrder.Status.RECEIVED
        purchase_order.save(update_fields=["status", "updated_at"])
        return purchase_order


def cancel_purchase_order(*, purchase_order):
    with transaction.atomic():
        purchase_order = PurchaseOrder.objects.select_for_update().get(pk=purchase_order.pk)

        if purchase_order.status == PurchaseOrder.Status.RECEIVED:
            raise serializers.ValidationError("Received purchase orders cannot be cancelled.")

        purchase_order.status = PurchaseOrder.Status.CANCELLED
        purchase_order.save(update_fields=["status", "updated_at"])
        return purchase_order
