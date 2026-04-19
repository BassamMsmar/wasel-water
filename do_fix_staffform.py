import re

path = r"E:\Code\wasel-water\backend\templates\admin\staff_form.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace h-100 to allow scrolling
content = content.replace('<div class="seo-panel h-100">', '<div class="seo-panel" style="height: 100%; max-height: 600px; display: flex; flex-direction: column;">')

content = content.replace('<div class="permission-grid staff-permission-grid">', '<div class="permission-grid staff-permission-grid" style="overflow-y: auto; flex-grow: 1; padding-left: 5px;">')

# Fix form-select arrows to right
css_addition = '''
.form-select { background-position: right 0.75rem center !important; padding-right: 2.25rem !important; padding-left: 0.75rem !important; }
</style>'''

content = content.replace('</style>', css_addition)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated staff_form.html")
