from django.utils.text import slugify
from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.company_name", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "category",
            "category_name",
            "supplier",
            "supplier_name",
            "name",
            "slug",
            "sku",
            "description",
            "price",
            "stock_quantity",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_category(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Products can only be assigned to active categories.")
        return value

    def validate_supplier(self, value):
        if value and not value.is_active:
            raise serializers.ValidationError("Products can only be assigned to active suppliers.")
        return value

    def validate_name(self, value):
        queryset = Product.objects.filter(name__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A product with this name already exists.")
        return value

    def validate_slug(self, value):
        queryset = Product.objects.filter(slug__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A product with this slug already exists.")
        return value

    def validate_sku(self, value):
        queryset = Product.objects.filter(sku__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A product with this SKU already exists.")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def _resolve_slug(self, name, provided_slug=None):
        candidate = (provided_slug or slugify(name)).strip()
        queryset = Product.objects.filter(slug__iexact=candidate)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError({"slug": "A product with this slug already exists."})
        return candidate

    def create(self, validated_data):
        validated_data["slug"] = self._resolve_slug(
            validated_data["name"],
            validated_data.get("slug"),
        )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "name" in validated_data or "slug" in validated_data:
            name = validated_data.get("name", instance.name)
            validated_data["slug"] = self._resolve_slug(name, validated_data.get("slug"))
        return super().update(instance, validated_data)