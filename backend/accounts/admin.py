from django.contrib import admin
from .models import Customer, Address

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'birth_date', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number')

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'address_type', 'city', 'neighborhood', 'is_default')
    list_filter = ('address_type', 'is_default', 'city')
    search_fields = ('user__username', 'full_name', 'city', 'neighborhood', 'street')
