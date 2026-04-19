import re

path = r"E:\Code\wasel-water\backend\templates\admin\group_form.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

debug_html = '''            <div class="permission-grid">
              <!-- DEBUG COUNT: {{ form.permission_sections|length }} -->
              {% for section in form.permission_sections %}'''
content = content.replace('            <div class="permission-grid">\n              {% for section in form.permission_sections %}', debug_html)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added debug count")
