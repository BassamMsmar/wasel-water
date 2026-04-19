import re

path = r"E:\Code\wasel-water\backend\templates\admin\base_admin.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

css_global = '''
  <style>
    /* Global Select rtl fix -> Arrow on the right */
    .form-select {
        background-position: right 0.75rem center !important;
        padding-right: 2.25rem !important;
        padding-left: 0.75rem !important;
    }
  </style>
</head>
'''

if ".form-select" not in content and "</head>" in content:
    content = content.replace("</head>", css_global)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated base_admin.html")
else:
    print("Already updated or </head> not found.")
