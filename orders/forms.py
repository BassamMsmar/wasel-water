from django import forms
from django.forms import inlineformset_factory
from .models import Order, OrderItem
from products.models import Product, Bundle

class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = [
            'user', 'status', 'total_price', 'is_paid',
            'shipping_full_name', 'shipping_address', 'shipping_phone', 'shipping_city'
        ]
        widgets = {
            'user': forms.Select(attrs={'class': 'form-select'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'total_price': forms.NumberInput(attrs={'class': 'form-control', 'readonly': 'readonly', 'lang': 'en', 'style': 'direction: ltr;'}),
            'is_paid': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'shipping_full_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الاسم الكامل للمستلم'}),
            'shipping_address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'العنوان التفصيلي (الشارع، الحي، المعلم)'}),
            'shipping_phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '05xxxxxxxx', 'lang': 'en', 'style': 'direction: ltr;'}),
            'shipping_city': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'المدينة'}),
        }

OrderItemFormSet = inlineformset_factory(
    Order, OrderItem,
    fields=('product', 'bundle', 'price', 'quantity'),
    extra=1,
    can_delete=True,
    widgets={
        'product': forms.Select(attrs={'class': 'form-select'}),
        'bundle': forms.Select(attrs={'class': 'form-select', 'placeholder': 'اختر الحزمة'}),
        'price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'lang': 'en', 'style': 'direction: ltr;', 'placeholder': '0.00'}),
        'quantity': forms.NumberInput(attrs={'class': 'form-control', 'lang': 'en', 'style': 'direction: ltr;', 'placeholder': '1'}),
    }
)
