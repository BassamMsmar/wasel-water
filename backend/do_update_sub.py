import re

path = r"E:\Code\wasel-water\backend\templates\admin\group_form.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_sub = "الصلاحيات المعروضة هنا فقط هي الصلاحيات المستخدمة في لوحة التحكم: إضافة، تعديل، حذف."
new_sub = "الصلاحيات المعروضة هنا فقط هي الصلاحيات المستخدمة في لوحة التحكم: إضافة، عرض، تعديل، وحذف."
content = content.replace(old_sub, new_sub)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated sub text")
