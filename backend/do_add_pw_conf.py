import re

path = r"E:\Code\wasel-water\backend\accounts\forms.py"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pw_addition = '''    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'كلمة المرور', 'autocomplete': 'new-password'}),
        required=False,
    )
    password_confirm = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'تأكيد كلمة المرور', 'autocomplete': 'new-password'}),
        required=False,
    )'''

content = re.sub(
    r"    password = forms\.CharField\(\s*widget=forms\.PasswordInput\(attrs=\{'class': 'form-control', 'placeholder': 'كلمة المرور', 'autocomplete': 'new-password'\}\),\s*required=False,\s*\)",
    pw_addition,
    content
)

clean_pw_addition = '''    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')
        
        if not self.instance.pk and not password:
            self.add_error('password', 'كلمة المرور مطلوبة عند إضافة موظف جديد.')
            
        if password and password != password_confirm:
            self.add_error('password_confirm', 'كلمتا المرور غير متطابقتين.')
            
        return cleaned_data'''

content = re.sub(
    r"    def clean_password\(self\):\n.*?return password",
    clean_pw_addition,
    content,
    flags=re.DOTALL
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated forms.py")
