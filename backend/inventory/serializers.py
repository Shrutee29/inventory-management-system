from rest_framework import serializers

from .models import StockTransaction


class StockTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = StockTransaction
        fields = (
            "id",
            "product",
            "product_name",
            "change",
            "transaction_type",
            "order",
            "created_by",
            "note",
            "created_at",
        )
        read_only_fields = ("id", "created_at", "created_by")
