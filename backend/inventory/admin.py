from django.contrib import admin

from .models import StockTransaction


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "transaction_type", "change", "created_by", "created_at")
    list_filter = ("transaction_type",)
    search_fields = ("product__name", "product__sku", "created_by__username")
