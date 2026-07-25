import os
from decimal import Decimal
from django.db.models import F
import sys
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
import django
# ensure the backend project root is on sys.path so `config` can be imported
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))
django.setup()

from django.contrib.auth import get_user_model
from categories.models import Category
from products.models import Product
from orders.models import Order
from orders.serializers import OrderCreateSerializer
from rest_framework.test import APIRequestFactory
from inventory.models import StockTransaction
from inventory.services import create_stock_transaction

User = get_user_model()

admin, created = User.objects.get_or_create(username='testadmin', defaults={'email':'admin@example.com','role':'admin'})
if created:
    admin.set_password('password')
    admin.save()

cust, created = User.objects.get_or_create(username='testcust', defaults={'email':'cust@example.com','role':'staff'})
if created:
    cust.set_password('password')
    cust.save()

cat, _ = Category.objects.get_or_create(name='TestCat', defaults={'slug':'testcat'})
prod, created = Product.objects.get_or_create(sku='TST-001', defaults={
    'name':'Test Product','slug':'test-product','price':Decimal('9.99'),'stock_quantity':10,'category':cat,'is_active':True
})
if not created:
    prod.category = cat
    prod.slug = 'test-product'
    prod.price = Decimal('9.99')
    prod.stock_quantity = 10
    prod.is_active = True
    prod.save()

print('Initial stock:', Product.objects.get(pk=prod.pk).stock_quantity)

# Create order via serializer
factory = APIRequestFactory()
request = factory.post('/api/orders/')
request.user = cust
serializer = OrderCreateSerializer(data={'items':[{'product': prod.id, 'quantity': 3}]}, context={'request': request})
if serializer.is_valid():
    order = serializer.save()
    print('Order created id=', order.id)
    print('Stock after sale:', Product.objects.get(pk=prod.pk).stock_quantity)
else:
    print('Order create errors:', serializer.errors)
    raise SystemExit(1)

# Cancel order logic similar to view
order = Order.objects.get(pk=order.id)
from django.db import transaction
with transaction.atomic():
    order = Order.objects.select_for_update().prefetch_related('items__product').get(pk=order.pk)
    for item in order.items.all():
        Product.objects.filter(pk=item.product_id).update(stock_quantity=F('stock_quantity') + item.quantity)
        create_stock_transaction(product=item.product, change=int(item.quantity), transaction_type='return', order=order, user=admin, note='test cancel')
    order.status = Order.Status.CANCELLED
    order.save()

print('Order cancelled. Stock after restore:', Product.objects.get(pk=prod.pk).stock_quantity)

print('Stock transactions for product:')
for tx in StockTransaction.objects.filter(product=prod).order_by('created_at'):
    print(tx.created_at, tx.transaction_type, tx.change, 'order_id=', tx.order_id)
