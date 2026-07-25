from rest_framework import serializers


class LowStockProductSerializer(serializers.Serializer):
    """Minimal product info for low-stock alerts."""

    id = serializers.IntegerField()
    name = serializers.CharField()
    sku = serializers.CharField()
    stock_quantity = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    category_name = serializers.CharField()


class RecentOrderSerializer(serializers.Serializer):
    """Lightweight order summary for dashboard."""

    id = serializers.IntegerField()
    user_username = serializers.CharField()
    status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    created_at = serializers.DateTimeField()
    items_count = serializers.IntegerField()


class AdminDashboardSerializer(serializers.Serializer):
    """Admin dashboard summary with aggregated stats."""

    # Summary stats
    total_products = serializers.IntegerField()
    total_categories = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    low_stock_count = serializers.IntegerField()
    pending_orders_count = serializers.IntegerField()

    # Time-series data
    orders_by_status = serializers.DictField()  # {"pending": 5, "confirmed": 3, ...}
    revenue_by_month = serializers.ListField()  # [{"month": "Jan", "revenue": 1000}, ...]

    # Recent data
    low_stock_products = LowStockProductSerializer(many=True)
    recent_orders = RecentOrderSerializer(many=True)


class CustomerDashboardSerializer(serializers.Serializer):
    """Customer dashboard with personal order stats."""

    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)

    # Recent data
    recent_orders = RecentOrderSerializer(many=True)
