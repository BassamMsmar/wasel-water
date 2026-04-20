import re

path = r"E:\Code\wasel-water\backend\templates\admin\staff_form.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_sub = "استخدمها للحالات الخاصة فقط. المعروض هنا: إضافة، تعديل، حذف فقط."
new_sub = "استخدمها للحالات الخاصة فقط. المعروض هنا: إضافة، عرض، تعديل، حذف."
content = content.replace(old_sub, new_sub)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated sub text staff form")
