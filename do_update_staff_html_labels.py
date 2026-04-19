import re

path = r"E:\Code\wasel-water\backend\templates\admin\staff_form.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('تأكيد السري', 'تأكيد كلمة المرور')
content = content.replace('التأكيد إن أردت تغيير السري', 'التأكيد إن أردت تغيير كلمة المرور')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated HTML labels")
