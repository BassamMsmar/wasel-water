from django import forms
from .models import Product, Brand, Category, Offer

class ProductForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance.pk:
            for field in self.fields:
                if isinstance(self.fields[field], (forms.DecimalField, forms.FloatField, forms.IntegerField)):
                    self.fields[field].initial = None

    class Meta:
        model = Product
        fields = [
            'name', 'flag', 'image', 'old_price', 'new_price', 
            'sku', 'subtitle', 'descriptions', 'quantity', 
            'brand', 'category', 'active', 'product_type'
        ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المنتج (مثال: مياه نوفا 330 مل)'}),
            'flag': forms.Select(attrs={'class': 'form-select'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'old_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '0.00', 'lang': 'en', 'style': 'direction: ltr;'}),
            'new_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '0.00', 'lang': 'en', 'style': 'direction: ltr;'}),
            'sku': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'كود المنتج (SKU)', 'lang': 'en', 'style': 'direction: ltr;'}),
            'subtitle': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'وصف مختصر (مثال: كرتون 40 حبة)'}),
            'descriptions': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'وصف تفصيلي للمنتج...'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0', 'lang': 'en', 'style': 'direction: ltr;'}),
            'brand': forms.Select(attrs={'class': 'form-select'}),
            'category': forms.SelectMultiple(attrs={'class': 'form-select', 'size': 5}),
            'active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'product_type': forms.Select(attrs={'class': 'form-select'}),
        }

class BrandForm(forms.ModelForm):
    class Meta:
        model = Brand
        fields = ['name', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم العلامة التجارية (مثال: نسلة)'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
        }

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم التصنيف (مثال: مياه معدنية)'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
        }

class OfferForm(forms.ModelForm):
    class Meta:
        model = Offer
        fields = ['title', 'description', 'image', 'products']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'عنوان العرض (مثال: خصم الصيف)'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'تفاصيل العرض...'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'products': forms.Select(attrs={'class': 'form-select'}),
        }
