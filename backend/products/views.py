from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.response import Response
from django.db.models.deletion import ProtectedError
from rest_framework.pagination import PageNumberPagination

from .models import Product
from .permissions import IsAdminOrReadOnly
from .serializers import ProductSerializer


class ProductPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "supplier", "is_active"]
    search_fields = ["name", "slug", "sku", "description"]
    ordering_fields = ["name", "price", "stock_quantity", "created_at", "updated_at"]
    ordering = ["name"]

    def get_queryset(self):
        queryset = Product.objects.select_related("category").all()

        # Frontend only shows active products
        if not self.request.path.startswith("/admin/"):
            queryset = queryset.filter(is_active=True)

        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)

        except ProtectedError:
            return Response(
                {
                    "detail": "Product has previous orders, so it was archived instead of deleted."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
