from django import forms
from django.contrib.auth.models import Group, Permission, User
from orders.models import Branch
from .models import Address, Customer


PERMISSION_ACTIONS = {
    'add': 'إضافة',
    'view': 'عرض',
    'change': 'تعديل',
    'delete': 'حذف',
}


PERMISSION_SECTIONS = [
    {
        'title': 'لوحة التحكم (نظرة عامة)',
        'app_label': 'core',
        'model': 'company',
        'actions': ['view', 'change'],
    },
    {
        'title': 'المنتجات',
        'app_label': 'products',
        'model': 'product',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'المنتجات المميزة',
        'app_label': 'products',
        'model': 'featuredproduct',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'التصنيفات',
        'app_label': 'products',
        'model': 'category',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'العلامات التجارية',
        'app_label': 'products',
        'model': 'brand',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'العروض والخصومات',
        'app_label': 'products',
        'model': 'offer',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'الطلبات والعمليات',
        'app_label': 'orders',
        'model': 'order',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'الفروع',
        'app_label': 'orders',
        'model': 'branch',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'العملاء',
        'app_label': 'accounts',
        'model': 'customer',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'الموظفون',
        'app_label': 'auth',
        'model': 'user',
        'actions': ['add', 'view', 'change', 'delete'],
    },
    {
        'title': 'الأدوار والصلاحيات',
        'app_label': 'auth',
        'model': 'group',
        'actions': ['add', 'view', 'change', 'delete'],
    },
]


def allowed_permission_queryset():
    filters = []
    for section in PERMISSION_SECTIONS:
        for action in section['actions']:
            filters.append((
                section['app_label'],
                section['model'],
                f"{action}_{section['model']}",
            ))

    query = None
    from django.db.models import Q
    for app_label, model, codename in filters:
        part = Q(content_type__app_label=app_label, content_type__model=model, codename=codename)
        query = part if query is None else query | part
    return Permission.objects.select_related('content_type').filter(query).order_by(
        'content_type__app_label', 'content_type__model', 'codename'
    )


def permission_sections_for_bound_field(bound_field):
    try:
        by_key = {
            (
                permission.content_type.app_label,
                permission.content_type.model,
                permission.codename,
            ): permission
            for permission in bound_field.field.queryset
        }
        val = bound_field.value() or []
        # Attempt to handle different types of iterables safely
        selected_values = set()
        for v in val:
            try:
                selected_values.add(str(v))
            except Exception:
                pass
                
        sections = []
        for section in PERMISSION_SECTIONS:
            items = []
            for action in section['actions']:
                codename = f"{action}_{section['model']}"
                permission = by_key.get((section['app_label'], section['model'], codename))
                if not permission:
                    continue
                items.append({
                    'id': permission.id,
                    'label': PERMISSION_ACTIONS[action],
                    'checked': str(permission.id) in selected_values,
                })
            if items:
                sections.append({'title': section['title'], 'items': items})
                
        if not sections:
            return [{'title': 'Debug: Sections Empty', 'items': [{'id':0, 'label': f'Queryset count: {bound_field.field.queryset.count()}'}]}]
        return sections
    except Exception as e:
        return [{'title': 'Debug: Exception', 'items': [{'id':0, 'label': str(e)}]}]

class UserSignUpForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'كلمة المرور', 'autocomplete': 'new-password'}))
    password_confirm = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'تأكيد كلمة المرور', 'autocomplete': 'new-password'}))
    phone_number = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'رقم الجوال', 'autocomplete': 'off'}))

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المستخدم', 'autocomplete': 'off'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'البريد الإلكتروني', 'autocomplete': 'off'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الاسم الأول', 'autocomplete': 'off'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم العائلة', 'autocomplete': 'off'}),
        }

    def clean_password_confirm(self):
        p1 = self.cleaned_data.get('password')
        p2 = self.cleaned_data.get('password_confirm')
        if p1 != p2:
            raise forms.ValidationError("كلمتا المرور غير متطابقتين")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
            customer, created = Customer.objects.get_or_create(user=user)
            customer.phone_number = self.cleaned_data['phone_number']
            customer.save()
        return user


class AddressForm(forms.ModelForm):
    class Meta:
        model = Address
        fields = [
            'full_name', 'phone_number', 'country', 'city', 'neighborhood',
            'street', 'building_number', 'apartment_number', 'postal_code',
            'latitude', 'longitude', 'image_of_building', 'address_type', 'is_default'
        ]
        widgets = {
            'full_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الاسم الكامل'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'رقم الهاتف'}),
            'country': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الدولة'}),
            'city': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'المدينة'}),
            'neighborhood': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الحي'}),
            'street': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الشارع'}),
            'building_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'رقم المبنى'}),
            'apartment_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'رقم الشقة (اختياري)'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الرمز البريدي'}),
            'latitude': forms.HiddenInput(),
            'longitude': forms.HiddenInput(),
            'address_type': forms.Select(attrs={'class': 'form-select'}),
            'is_default': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class StaffForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'كلمة المرور', 'autocomplete': 'new-password'}),
        required=False,
    )
    password_confirm = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'تأكيد كلمة المرور', 'autocomplete': 'new-password'}),
        required=False,
    )
    role = forms.ChoiceField(
        label='الدور التشغيلي',
        choices=Customer.ROLE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'}),
    )
    branch = forms.ModelChoiceField(
        label='الفرع',
        queryset=Branch.objects.filter(active=True).order_by('name'),
        required=False,
        empty_label='بدون فرع',
        widget=forms.Select(attrs={'class': 'form-select'}),
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_superuser', 'groups', 'user_permissions',
        ]
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المستخدم', 'autocomplete': 'off'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'البريد الإلكتروني', 'autocomplete': 'off'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الاسم الأول', 'autocomplete': 'off'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم العائلة', 'autocomplete': 'off'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'is_superuser': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'groups': forms.SelectMultiple(attrs={'class': 'form-select', 'size': 8}),
            'user_permissions': forms.SelectMultiple(attrs={'class': 'form-select', 'size': 10}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        profile = getattr(self.instance, 'customer', None)
        if profile:
            self.fields['role'].initial = profile.role
            self.fields['branch'].initial = profile.branch
        self.fields['groups'].queryset = Group.objects.order_by('name')
        self.fields['groups'].required = False
        self.fields['user_permissions'].queryset = allowed_permission_queryset()
        self.fields['user_permissions'].required = False

    def permission_sections(self):
        return permission_sections_for_bound_field(self['user_permissions'])

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')
        
        if not self.instance.pk and not password:
            self.add_error('password', 'كلمة المرور مطلوبة عند إضافة موظف جديد.')
            
        if password and password != password_confirm:
            self.add_error('password_confirm', 'كلمتا المرور غير متطابقتين.')
            
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        if password:
            user.set_password(password)
        user.is_staff = True
        if commit:
            user.save()
            self.save_m2m()
            profile, created = Customer.objects.get_or_create(user=user)
            profile.role = self.cleaned_data.get('role') or 'customer'
            profile.branch = self.cleaned_data.get('branch')
            profile.save(update_fields=['role', 'branch', 'updated_at'])
        return user


class GroupPermissionForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['name', 'permissions']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'مثال: مدير الطلبات'}),
            'permissions': forms.SelectMultiple(attrs={'class': 'form-select', 'size': 16}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['permissions'].queryset = allowed_permission_queryset()
        self.fields['permissions'].required = False

    def permission_sections(self):
        return permission_sections_for_bound_field(self['permissions'])
