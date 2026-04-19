from django import forms
from .models import Product, Brand, Category, Offer


SEO_FIELDS = ['seo_title', 'seo_description', 'seo_keywords', 'seo_canonical_url', 'seo_image']


def seo_widgets():
    return {
        'seo_title': forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'عنوان واضح لمحركات البحث، يفضل أقل من 60 حرف',
            'maxlength': 160,
        }),
        'seo_description': forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'وصف مختصر وجذاب يظهر في نتائج البحث',
            'maxlength': 320,
        }),
        'seo_keywords': forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'مياه، توصيل مياه، عبوات مياه',
            'maxlength': 255,
        }),
        'seo_canonical_url': forms.URLInput(attrs={
            'class': 'form-control',
            'placeholder': 'https://example.com/page',
            'dir': 'ltr',
        }),
        'seo_image': forms.FileInput(attrs={'class': 'form-control'}),
    }


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
            'brand', 'category', 'active', 'product_type',
            *SEO_FIELDS,
        ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المنتج'}),
            'flag': forms.Select(attrs={'class': 'form-select'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'old_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '0.00', 'lang': 'en', 'style': 'direction: ltr;'}),
            'new_price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01', 'placeholder': '0.00', 'lang': 'en', 'style': 'direction: ltr;'}),
            'sku': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'SKU', 'lang': 'en', 'style': 'direction: ltr;'}),
            'subtitle': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'وصف مختصر يظهر تحت اسم المنتج'}),
            'descriptions': forms.Textarea(attrs={'class': 'form-control', 'rows': 5, 'placeholder': 'وصف تفصيلي للمنتج...'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0', 'lang': 'en', 'style': 'direction: ltr;'}),
            'brand': forms.Select(attrs={'class': 'form-select'}),
            'category': forms.SelectMultiple(attrs={'class': 'form-select', 'size': 6}),
            'active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'product_type': forms.Select(attrs={'class': 'form-select'}),
            **seo_widgets(),
        }


class BrandForm(forms.ModelForm):
    class Meta:
        model = Brand
        fields = [
            'name', 'image', 'cover_image', 'description',
            *SEO_FIELDS,
        ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم العلامة التجارية'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'cover_image': forms.FileInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'نبذة قصيرة عن العلامة التجارية'}),
            **seo_widgets(),
        }


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'image', *SEO_FIELDS]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم التصنيف'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            **seo_widgets(),
        }


class OfferForm(forms.ModelForm):
    class Meta:
        model = Offer
        fields = [
            'title', 'description', 'image', 'products',
            *SEO_FIELDS,
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'عنوان العرض'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'تفاصيل العرض...'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'products': forms.Select(attrs={'class': 'form-select'}),
            **seo_widgets(),
        }
