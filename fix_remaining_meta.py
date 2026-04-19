import re

# accounts/models.py
path = r"E:\Code\wasel-water\backend\accounts\models.py"
with open(path, 'r', encoding='utf-8') as f: c = f.read()
c = re.sub(r'(class Customer\(models\.Model\):.*?    updated_at = models\.DateTimeField\(auto_now=True\)\n)', r'\1\n    class Meta:\n        verbose_name = _("العميل")\n        verbose_name_plural = _("العملاء")\n', c, flags=re.DOTALL)
c = c.replace('verbose_name = _("Address")', 'verbose_name = _("العنوان")').replace('verbose_name_plural = _("Addresses")', 'verbose_name_plural = _("العناوين")')
c = re.sub(r'(class OTPToken\(models\.Model\):.*?    attempts = models\.IntegerField\(default=0\)\n)', r'\1\n    class Meta:\n        verbose_name = _("رمز التحقق")\n        verbose_name_plural = _("رموز التحقق")\n', c, flags=re.DOTALL)
with open(path, 'w', encoding='utf-8') as f: f.write(c)

# core/models.py
path = r"E:\Code\wasel-water\backend\core\models.py"
with open(path, 'r', encoding='utf-8') as f: c = f.read()
if "from django.utils.translation import gettext_lazy as _" not in c:
    c = "from django.utils.translation import gettext_lazy as _\n" + c
c = c.replace('class Meta:\n        ordering = [\'ordering\']', 'class Meta:\n        verbose_name = _("القسم")\n        verbose_name_plural = _("الأقسام")\n        ordering = [\'ordering\']')
c = re.sub(r'(class Company\(models\.Model\):.*?    whatsapp = models\.CharField\(max_length=100 , blank=True , null=True\)\n)', r'\1\n    class Meta:\n        verbose_name = _("الشركة")\n        verbose_name_plural = _("الشركات")\n', c, flags=re.DOTALL)
c = re.sub(r'(class Banner\(models\.Model\):.*?    type = models\.CharField\(max_length=10, choices=TYPE_BANNER, default=\'offer\'\)\s*\n)', r'\1\n    class Meta:\n        verbose_name = _("البانر الإعلاني")\n        verbose_name_plural = _("البانرات الإعلانية")\n', c, flags=re.DOTALL)
with open(path, 'w', encoding='utf-8') as f: f.write(c)

# cart/models.py
path = r"E:\Code\wasel-water\backend\cart\models.py"
with open(path, 'r', encoding='utf-8') as f: c = f.read()
if "from django.utils.translation import gettext_lazy as _" not in c:
    c = "from django.utils.translation import gettext_lazy as _\n" + c
c = re.sub(r'(class Cart\(models\.Model\):.*?    updated_at = models\.DateTimeField\(auto_now=True\)\n)', r'\1\n    class Meta:\n        verbose_name = _("سلة التسوق")\n        verbose_name_plural = _("سلال التسوق")\n', c, flags=re.DOTALL)
with open(path, 'w', encoding='utf-8') as f: f.write(c)

# orders/models.py
path = r"E:\Code\wasel-water\backend\orders\models.py"
with open(path, 'r', encoding='utf-8') as f: c = f.read()
if "from django.utils.translation import gettext_lazy as _" not in c:
    c = "from django.utils.translation import gettext_lazy as _\n" + c
c = c.replace('class Meta:\n        ordering = (\'-created_at\',)', 'class Meta:\n        verbose_name = _("الطلب")\n        verbose_name_plural = _("الطلبات")\n        ordering = (\'-created_at\',)')
c = re.sub(r'(class OrderItem\(models\.Model\):.*?    quantity = models\.PositiveIntegerField\(default=1\)\n)', r'\1\n    class Meta:\n        verbose_name = _("عنصر الطلب")\n        verbose_name_plural = _("عناصر الطلب")\n', c, flags=re.DOTALL)
with open(path, 'w', encoding='utf-8') as f: f.write(c)

print("Done")
