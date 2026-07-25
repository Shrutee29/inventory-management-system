from django.db.models import Count, F, Q, Sum, DecimalField
from django.db.models.functions import TruncMonth, Coalesce
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from categories.models import Category
from orders.models import Order, OrderItem
from products.models import Product

from .permissions import IsAdmin
from .serializers import AdminDashboardSerializer, CustomerDashboardSerializer


class AdminDashboardView(APIView):
    """Admin dashboard with complete system analytics and recent activity."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """
        Returns aggregated admin dashboard data:
        - System statistics (products, categories, orders, revenue)
        - Orders breakdown by status
        - Monthly revenue trend
        - Low stock alerts
        - Recent orders
        """

        # Aggregated counts using optimized queries
        total_products = Product.objects.filter(is_active=True).count()
        total_categories = Category.objects.filter(is_active=True).count()
        total_orders = Order.objects.count()
        low_stock_count = Product.objects.filter(is_active=True, stock_quantity__lte=5).count()

        # Revenue aggregation
        revenue_data = Order.objects.aggregate(total=Coalesce(Sum("total_amount"), 0, output_field=DecimalField()))
        total_revenue = revenue_data["total"]

        # Orders by status breakdown
        orders_by_status = dict(
            Order.objects.values("status").annotate(count=Count("id")).values_list("status", "count")
        )

        # Pending orders count
        pending_orders_count = Order.objects.filter(status="pending").count()

        # Monthly revenue trend (last 12 months)
        monthly_revenue = (
            Order.objects.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(revenue=Coalesce(Sum("total_amount"), 0, output_field=DecimalField()))
            .order_by("month")
        )

        revenue_by_month = [
            {
                "month": item["month"].strftime("%b %Y") if item["month"] else "N/A",
                "revenue": float(item["revenue"]),
            }
            for item in monthly_revenue
        ]

        # Low stock products (top 5 by urgency)
        low_stock_products_qs = (
            Product.objects.filter(is_active=True, stock_quantity__lte=5)
            .select_related("category")
            .order_by("stock_quantity")[:5]
        )
        low_stock_data = [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "stock_quantity": p.stock_quantity,
                "price": p.price,
                "category_name": p.category.name,
            }
            for p in low_stock_products_qs
        ]

        # Recent orders with item counts (last 10)
        recent_orders_qs = (
            Order.objects.select_related("user")
            .prefetch_related("items")
            .order_by("-created_at")[:10]
        )
        recent_orders_data = [
            {
                "id": o.id,
                "user_username": o.user.username,
                "status": o.status,
                "total_amount": o.total_amount,
                "created_at": o.created_at,
                "items_count": o.items.count(),
            }
            for o in recent_orders_qs
        ]

        data = {
            "total_products": total_products,
            "total_categories": total_categories,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "low_stock_count": low_stock_count,
            "pending_orders_count": pending_orders_count,
            "orders_by_status": orders_by_status,
            "revenue_by_month": revenue_by_month,
            "low_stock_products": low_stock_data,
            "recent_orders": recent_orders_data,
        }

        serializer = AdminDashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CustomerDashboardView(APIView):
    """Customer dashboard with personal order analytics."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Returns customer-specific dashboard data:
        - Order counts (total, pending, completed)
        - Total amount spent
        - Recent orders
        """

        user = request.user

        # Aggregate customer orders by status
        order_stats = Order.objects.filter(user=user).aggregate(
            total_orders=Count("id"),
            pending_orders=Count("id", filter=Q(status="pending")),
            completed_orders=Count("id", filter=Q(status="completed")),
            total_spent=Coalesce(Sum("total_amount"), 0, output_field=DecimalField()),
        )

        # Recent orders (last 5)
        recent_orders_qs = (
            Order.objects.filter(user=user)
            .select_related("user")
            .prefetch_related("items")
            .order_by("-created_at")[:5]
        )
        recent_orders_data = [
            {
                "id": o.id,
                "user_username": o.user.username,
                "status": o.status,
                "total_amount": o.total_amount,
                "created_at": o.created_at,
                "items_count": o.items.count(),
            }
            for o in recent_orders_qs
        ]

        data = {
            "total_orders": order_stats["total_orders"],
            "pending_orders": order_stats["pending_orders"],
            "completed_orders": order_stats["completed_orders"],
            "total_spent": order_stats["total_spent"],
            "recent_orders": recent_orders_data,
        }

        serializer = CustomerDashboardSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DashboardIndexView(APIView):
    """Simple index for the dashboard root that lists available sub-endpoints."""

    # Allow public read of available endpoints
    permission_classes = []

    def get(self, request):
        base = request.build_absolute_uri('/')
        api_base = request.build_absolute_uri('/api/').rstrip('/')
        data = {
            'admin_dashboard': f"{api_base}/dashboard/admin/",
            'customer_dashboard': f"{api_base}/dashboard/customer/",
            'notes': 'Use the admin endpoint as an admin (JWT). Use the customer endpoint with an authenticated user.',
        }
        return Response(data, status=status.HTTP_200_OK)
