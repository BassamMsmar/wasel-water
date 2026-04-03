from django import forms
from django.contrib.auth.models import User
from .models import Address, Customer

class UserSignUpForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'كلمة المرور'}))
    password_confirm = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'تأكيد كلمة المرور'}))
    phone_number = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'رقم الجوال'}))

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المستخدم'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'البريد الإلكتروني'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الاسم الأول'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم العائلة'}),
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
            Customer.objects.create(user=user, phone_number=self.cleaned_data['phone_number'])
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
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'كلمة المرور'}), required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'is_active']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المستخدم'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'البريد الإلكتروني'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الاسم الأول'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم العائلة'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        if password:
            user.set_password(password)
        user.is_staff = True # Ensure they are staff
        if commit:
            user.save()
        return user
