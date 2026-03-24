from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer, BundleSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    bundle_details = BundleSerializer(source='bundle', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user', 'total_price', 'status', 'is_paid']
