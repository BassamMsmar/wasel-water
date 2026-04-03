from django.db import models
from django.conf import settings
from products.models import Product, Bundle

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'), # بانتظار الدفع
        ('processing', 'Processing'), # جاري التجهيز
        ('paid', 'Paid'),     # تم الدفع
        ('shipped', 'Shipped'), # تم الشحن
        ('delivered', 'Delivered'), # تم التوصيل
        ('cancelled', 'Cancelled'), # ملغي
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid = models.BooleanField(default=False)
    
    # Simple address snapshot for now
    shipping_full_name = models.CharField(max_length=100)
    shipping_address = models.TextField()
    shipping_phone = models.CharField(max_length=20)
    shipping_city = models.CharField(max_length=50)
    shipping_location_link = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.SET_NULL, null=True, blank=True)
    bundle = models.ForeignKey(Bundle, related_name='order_items', on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return str(self.id)

    def get_cost(self):
        return self.price * self.quantity

    @property
    def get_name(self):
        if self.product:
            return self.product.name
        elif self.bundle:
            return self.bundle.name
        return "Unknown Item"

    @property
    def get_image_url(self):
        if self.product and self.product.image:
             return self.product.image.url
        # Assuming bundles might not have a main image or handled differently, 
        # but if Bundle has image, returned here.
        # Fallback
        return 'media\products\default.jpg'
