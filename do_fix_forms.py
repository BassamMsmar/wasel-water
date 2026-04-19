import re

path = r"E:\Code\wasel-water\backend\accounts\forms.py"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace widgets in StaffForm
widgets_section = '''        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم المستخدم', 'autocomplete': 'off'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'البريد الإلكتروني', 'autocomplete': 'off'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'الاسم الأول', 'autocomplete': 'off'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'اسم العائلة', 'autocomplete': 'off'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'is_superuser': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'groups': forms.SelectMultiple(attrs={'class': 'form-select', 'size': 8}),
            'user_permissions': forms.SelectMultiple(attrs={'class': 'form-select', 'size': 10}),
        }'''

# Replace the widgets definition in StaffForm Meta
content = re.sub(
    r"widgets\s*=\s*\{\s*'username':.*?'user_permissions':.*?\n\s*\}",
    widgets_section,
    content,
    flags=re.DOTALL
)

# Also fix the password field in StaffForm
pw_section = '''    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'كلمة المرور', 'autocomplete': 'new-password'}),
        required=False,
    )'''

content = re.sub(
    r"    password = forms\.CharField\(\s*widget=forms\.PasswordInput\(attrs=\{'class': 'form-control', 'placeholder': 'كلمة المرور'\}\),\s*required=False,\s*\)",
    pw_section,
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated forms.py")
