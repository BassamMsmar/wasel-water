import re

path = r"E:\Code\wasel-water\backend\templates\admin\staff_form.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make username required visually
content = content.replace('<label class="form-label fw-bold">اسم المستخدم</label>', '<label class="form-label fw-bold">اسم المستخدم <span class="text-danger">*</span></label>')

# Make role required visually
content = content.replace('<label class="form-label fw-bold">الدور التشغيلي</label>', '<label class="form-label fw-bold">الدور التشغيلي <span class="text-danger">*</span></label>')

# Password field change
pw_label_old = '{% if object %}تغيير كلمة المرور (اختياري){% else %}كلمة المرور{% endif %}'
pw_label_new = '{% if object %}تغيير كلمة المرور (اختياري){% else %}كلمة المرور <span class="text-danger">*</span>{% endif %}'
content = content.replace(pw_label_old, pw_label_new)

# Add password_confirm block
pw_block_end = '''              {% if object %}
              <div class="form-text">اترك الحقل فارغاً إذا كنت لا تريد تغيير كلمة المرور.</div>
              {% endif %}
            </div>'''
            
pw_confirm_block = '''              {% if object %}
              <div class="form-text">اترك الحقل فارغاً إذا كنت لا تريد تغيير كلمة المرور.</div>
              {% endif %}
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">{% if object %}تأكيد السري{% else %}تأكيد السري <span class="text-danger">*</span>{% endif %}</label>
              {{ form.password_confirm }}
              {% if object %}
              <div class="form-text">يرجى التأكيد إن أردت تغيير السري.</div>
              {% endif %}
            </div>'''
            
content = content.replace(pw_block_end, pw_confirm_block)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated HTML")
