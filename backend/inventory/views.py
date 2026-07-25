from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import StockTransaction
from .serializers import StockTransactionSerializer
from .permissions import IsAdmin
from .services import create_stock_transaction


class StockTransactionViewSet(viewsets.ModelViewSet):
    queryset = StockTransaction.objects.select_related("product", "order", "created_by").all()
    serializer_class = StockTransactionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def create(self, request, *args, **kwargs):
        # Handle create through service to ensure product stock is updated
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        product = data.get("product")
        change = int(data.get("change"))
        transaction_type = data.get("transaction_type")
        order = data.get("order", None)
        note = data.get("note", "")

        try:
            tx = create_stock_transaction(product=product, change=change, transaction_type=transaction_type, order=order, user=request.user, note=note)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        out_serializer = self.get_serializer(tx)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)
