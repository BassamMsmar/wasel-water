import re

path = r"E:\Code\wasel-water\backend\accounts\forms.py"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure 'view' is present in actions
perm_actions_old = '''PERMISSION_ACTIONS = {
    'add': 'إضافة',
    'change': 'تعديل',
    'delete': 'حذف',
}'''
perm_actions_new = '''PERMISSION_ACTIONS = {
    'add': 'إضافة',
    'view': 'عرض',
    'change': 'تعديل',
    'delete': 'حذف',
}'''
content = content.replace(perm_actions_old, perm_actions_new)

# Replace the actions arrays in PERMISSION_SECTIONS
content = content.replace("'actions': ['add', 'change', 'delete']", "'actions': ['add', 'view', 'change', 'delete']")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added 'view' actions")
