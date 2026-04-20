import re

path = r"E:\Code\wasel-water\backend\accounts\forms.py"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# I want to completely replace PERMISSION_SECTIONS again.
new_sections = '''
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
'''

content = re.sub(r'PERMISSION_SECTIONS = \[.*?\]\n', new_sections, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated PERMISSION_SECTIONS with categories and customers")
