from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("company_name", "contact_person", "email", "phone", "is_active")
    search_fields = ("company_name", "contact_person", "email", "phone")
