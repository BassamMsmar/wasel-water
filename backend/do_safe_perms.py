import re

path = r"E:\Code\wasel-water\backend\accounts\forms.py"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add exception handling to permission_sections_for_bound_field
safe_func = '''def permission_sections_for_bound_field(bound_field):
    try:
        by_key = {
            (
                permission.content_type.app_label,
                permission.content_type.model,
                permission.codename,
            ): permission
            for permission in bound_field.field.queryset
        }
        val = bound_field.value() or []
        # Attempt to handle different types of iterables safely
        selected_values = set()
        for v in val:
            try:
                selected_values.add(str(v))
            except Exception:
                pass
                
        sections = []
        for section in PERMISSION_SECTIONS:
            items = []
            for action in section['actions']:
                codename = f"{action}_{section['model']}"
                permission = by_key.get((section['app_label'], section['model'], codename))
                if not permission:
                    continue
                items.append({
                    'id': permission.id,
                    'label': PERMISSION_ACTIONS[action],
                    'checked': str(permission.id) in selected_values,
                })
            if items:
                sections.append({'title': section['title'], 'items': items})
                
        if not sections:
            return [{'title': 'Debug: Sections Empty', 'items': [{'id':0, 'label': f'Queryset count: {bound_field.field.queryset.count()}'}]}]
        return sections
    except Exception as e:
        return [{'title': 'Debug: Exception', 'items': [{'id':0, 'label': str(e)}]}]'''

content = re.sub(r'def permission_sections_for_bound_field\(bound_field\):.*?(?=\n\nclass UserSignUpForm)', safe_func, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated forms.py with safe permission sections generator")
