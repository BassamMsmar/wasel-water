from django.contrib import admin
from .models import Branch, Order, OrderItem, OrderStatus


@admin.register(OrderStatus)
class OrderStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'color', 'display_order', 'is_default')
    list_editable = ('color', 'display_order', 'is_default')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('display_order',)


admin.site.register(Branch)
