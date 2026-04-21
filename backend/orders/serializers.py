from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Order, OrderItem, OrderStatus, Branch
from products.models import Product
from products.serializers import ProductSerializer, BundleSerializer

class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatus
        fields = ['id', 'name', 'slug', 'color']


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    bundle_details = BundleSerializer(source='bundle', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status = OrderStatusSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user', 'total_price', 'is_paid']


class CheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, max_value=999)


class CheckoutSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=50)
    address = serializers.CharField()
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    location_link = serializers.URLField(max_length=500, required=False, allow_blank=True)
    note = serializers.CharField(required=False, allow_blank=True)
    items = CheckoutItemSerializer(many=True)

    def validate_items(self, items):
        product_ids = [item['product_id'] for item in items]
        products = Product.objects.filter(id__in=product_ids, active=True)
        found_ids = set(products.values_list('id', flat=True))
        missing = sorted(set(product_ids) - found_ids)
        if missing:
            raise serializers.ValidationError(f"Products not available: {missing}")

        products_by_id = {product.id: product for product in products}
        for item in items:
            product = products_by_id[item['product_id']]
            if product.quantity is not None and item['quantity'] > product.quantity:
                raise serializers.ValidationError(f"Quantity not available for product {product.id}")
        return items

    def _checkout_user(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user

        User = get_user_model()
        digits = ''.join(char for char in validated_data['phone'] if char.isdigit())
        username = f"guest_{digits or validated_data['phone'][:20]}"
        user, created = User.objects.get_or_create(
            username=username[:150],
            defaults={
                'first_name': validated_data['full_name'][:150],
            },
        )
        if created:
            user.set_unusable_password()
            user.save(update_fields=['password'])
        return user

    def create(self, validated_data):
        items = validated_data.pop('items')
        note = validated_data.pop('note', '').strip()
        products = Product.objects.in_bulk([item['product_id'] for item in items])

        total = Decimal('0.00')
        order_items = []
        for item in items:
            product = products[item['product_id']]
            price = Decimal(str(product.new_price or product.old_price or 0))
            quantity = item['quantity']
            total += price * quantity
            order_items.append((product, price, quantity))

        status = (
            OrderStatus.objects.filter(is_default=True).first()
            or OrderStatus.objects.filter(slug='pending').first()
            or OrderStatus.objects.first()
        )
        address = validated_data['address']
        if note:
            address = f"{address} - ملاحظات: {note}"

        order = Order.objects.create(
            user=self._checkout_user(validated_data),
            status=status,
            shipping_full_name=validated_data['full_name'],
            shipping_phone=validated_data['phone'],
            shipping_city=validated_data['city'],
            shipping_country=validated_data.get('country', ''),
            shipping_postal_code=validated_data.get('postal_code', ''),
            shipping_address=address,
            shipping_location_link=validated_data.get('location_link', ''),
            total_price=total,
        )

        OrderItem.objects.bulk_create(
            [
                OrderItem(order=order, product=product, price=price, quantity=quantity)
                for product, price, quantity in order_items
            ]
        )
        return order


class CheckoutResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.CharField()
    total_price = serializers.CharField()
    message = serializers.CharField()
