import re

path = r"E:\Code\wasel-water\backend\templates\admin\base_admin.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

css_addition = '''
    /* Global Select rtl fix -> Arrow on the right */
    .form-select {
        background-position: left 0.75rem center !important;
        padding-right: 0.75rem !important;
        padding-left: 2.25rem !important;
    }
  </style>'''

if ".form-select {" in css_addition and "</style>" in content:
    # Actually wait, standard Bootstrap 5 RTL has them on the left.
    # We want them on the LEFT or RIGHT? The user says "الاسهم في اليسار وليس في اليمين", meaning "Arrows are on the left and not on the right".
    # This means he wants them on the RIGHT!
    # So background-position: left (for arrow on left)? No, right!
    css_addition_correct = '''
    /* Global Select rtl fix -> Arrow on the left (RTL default) or right (forced) */
    /* If he wants them on the right, we do this: */
    select.form-select, select.adm-input {
        background-position: left 0.75rem center !important;
        padding-right: 0.75rem !important;
        padding-left: 2.25rem !important;
    }
  </style>'''
    # Wait! In RTL, bootstrap 5 puts ackground-position: left 0.75rem center; BY DEFAULT. So it is ALREADY on the left!
    # The user says: "الاسهم في اليسار وليس في اليمين" = "The arrows are in the left and not in the right". Meaning they WANT them on the right like LTR!
    css_addition_forced_right = '''
    select.form-select, select.adm-input {
        background-position: right 0.75rem center !important;
        padding-right: 2.25rem !important;
        padding-left: 0.75rem !important;
    }
  </style>'''
    
    content = content.replace("  </style>", css_addition_forced_right)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated base_admin.html")
