from django.utils.translation import gettext_lazy as _
from django.db import models
from django.conf import settings
from products.models import Product, Bundle


class Branch(models.Model):
    name = models.CharField(_("Name"), max_length=100, unique=True)
    active = models.BooleanField(_("Active"), default=True)

    class Meta:
        verbose_name = _("الفرع")
        verbose_name_plural = _("الفروع")
        ordering = ('name',)

    def __str__(self):
        return self.name


class OrderStatus(models.Model):
    name = models.CharField(_("الاسم"), max_length=50)
    slug = models.SlugField(_("المعرّف البرمجي"), max_length=50, unique=True, help_text=_("مثال: pending, processing — لا تغيّره بعد الإنشاء"))
    color = models.CharField(_("اللون"), max_length=20, default='#6B7280', help_text=_("كود اللون HEX للبادج"))
    display_order = models.PositiveSmallIntegerField(_("الترتيب"), default=0)
    is_default = models.BooleanField(_("افتراضي للطلبات الجديدة"), default=False)

    class Meta:
        verbose_name = _("حالة الطلب")
        verbose_name_plural = _("حالات الطلبات")
        ordering = ('display_order', 'id')

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one default
        if self.is_default:
            OrderStatus.objects.exclude(pk=self.pk).filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.ForeignKey(OrderStatus, verbose_name=_("Status"), on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_paid = models.BooleanField(default=False)
    branch = models.CharField(max_length=100, blank=True, null=True)
    representative = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='represented_orders',
        blank=True,
        null=True,
    )
    
    # Simple address snapshot for now
    shipping_full_name = models.CharField(max_length=100)
    shipping_address = models.TextField()
    shipping_phone = models.CharField(max_length=20)
    shipping_city = models.CharField(max_length=50)
    shipping_country = models.CharField(max_length=100, blank=True, null=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True, null=True)
    shipping_latitude = models.DecimalField(max_digits=22, decimal_places=16, blank=True, null=True)
    shipping_longitude = models.DecimalField(max_digits=22, decimal_places=16, blank=True, null=True)
    shipping_location_link = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        verbose_name = _("الطلب")
        verbose_name_plural = _("الطلبات")
        ordering = ('-created_at',)

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"

    def get_status_display(self):
        return self.status.name if self.status else "-"

    @property
    def status_slug(self):
        """Returns the status slug for template comparisons, e.g. order.status_slug == 'pending'"""
        return self.status.slug if self.status else ''

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.SET_NULL, null=True, blank=True)
    bundle = models.ForeignKey(Bundle, related_name='order_items', on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = _("عنصر الطلب")
        verbose_name_plural = _("عناصر الطلب")

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
