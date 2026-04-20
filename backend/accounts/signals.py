from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from django.dispatch import receiver
from .models import Customer

User = get_user_model()

@receiver(post_save, sender=User)
def create_customer_profile(sender, instance, created, **kwargs):
    if created:
        Customer.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_customer_profile(sender, instance, **kwargs):
    if hasattr(instance, 'customer'):
        instance.customer.save()
    else:
        Customer.objects.create(user=instance)

from django.contrib.auth.signals import user_logged_in
from .models import Address

@receiver(user_logged_in)
def save_temp_location_to_user(sender, user, request, **kwargs):
    if request and hasattr(request, 'session'):
        temp_location = request.session.get('temp_location')
        if temp_location:
            # Check if this link already exists for the user
            if not Address.objects.filter(user=user, location_link=temp_location).exists():
                Address.objects.create(
                    user=user,
                    full_name=user.get_full_name() or user.username,
                    phone_number="",
                    city="jeddah - جدة",
                    location_link=temp_location,
                    is_default=not Address.objects.filter(user=user).exists()
                )
            del request.session['temp_location']
