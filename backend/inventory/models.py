from django.conf import settings
from django.db import models

from products.models import Product


class StockTransaction(models.Model):
    class Type(models.TextChoices):
        PURCHASE = "purchase", "Purchase"
        SALE = "sale", "Sale"
        ADJUSTMENT = "adjustment", "Adjustment"
        RETURN = "return", "Return"

    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="stock_transactions")
    change = models.IntegerField(help_text="Positive for increase, negative for decrease")
    transaction_type = models.CharField(max_length=20, choices=Type.choices)
    order = models.ForeignKey(
        "orders.Order", null=True, blank=True, on_delete=models.SET_NULL, related_name="stock_transactions"
    )
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_transaction_type_display()} {self.change} @ {self.product.sku}"
