from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta

class Customer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer')
    phone_number = models.CharField(_("Phone Number"), max_length=20, blank=True)
    birth_date = models.DateField(_("Birth Date"), null=True, blank=True)
    image = models.ImageField(_("Profile Image"), upload_to='profile_images/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("العميل")
        verbose_name_plural = _("العملاء")

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Address(models.Model):
    ADDRESS_TYPE_CHOICES = (
        ('home', _('Home')),
        ('work', _('Work')),
        ('other', _('Other')),
    )

    CITY_CHOICES = (
        ('jeddah - جدة', _('Jeddah')),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(_("Full Name"), max_length=100)
    phone_number = models.CharField(_("Phone Number"), max_length=20)
    city = models.CharField(_("City"), max_length=100, choices=CITY_CHOICES, default='jeddah - جدة')
    neighborhood = models.CharField(_("Neighborhood"), max_length=255, blank=True, null=True)
    street = models.CharField(_("Street"), max_length=255, blank=True, null=True)
    building_number = models.CharField(_("Building Number"), max_length=20, blank=True, null=True)
    apartment_number = models.CharField(_("Apartment Number"), max_length=20, blank=True, null=True)
    
    # Google Maps Data
    country = models.CharField(_("Country"), max_length=100, blank=True, null=True)
    postal_code = models.CharField(_("Postal Code"), max_length=20, blank=True, null=True)
    latitude = models.DecimalField(_("Latitude"), max_digits=22, decimal_places=16, blank=True, null=True)
    longitude = models.DecimalField(_("Longitude"), max_digits=22, decimal_places=16, blank=True, null=True)
    
    image_of_building = models.ImageField(_("Image of Building"), upload_to='address_images/', null=True, blank=True)
    location_link = models.URLField(_("Map Link"), max_length=500, blank=True, null=True)
    
    address_type = models.CharField(_("Address Type"), max_length=10, choices=ADDRESS_TYPE_CHOICES, default='home')
    is_default = models.BooleanField(_("Default Address"), default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("العنوان")
        verbose_name_plural = _("العناوين")
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.city}"
    
    def save(self, *args, **kwargs):
        # If this is set as default, unset other default addresses for this user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

class OTPToken(models.Model):
    phone_number = models.CharField(_("Phone Number"), max_length=20)
    code = models.CharField(_("OTP Code"), max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)

    class Meta:
        verbose_name = _("رمز التحقق")
        verbose_name_plural = _("رموز التحقق")

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at and self.attempts < 5

    def __str__(self):
        return f"OTP for {self.phone_number}: {self.code}"
