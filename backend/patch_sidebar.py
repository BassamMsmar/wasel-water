import re

path = r"E:\Code\wasel-water\backend\templates\admin\base_admin.html"
with open(path, 'r', encoding='utf-8') as f: c = f.read()

# Pattern to find the Products link
prod_pattern = r'(<a href="{% url \'settings:admin_products\' %}" id="nav-products".*?</a>)'
new_featured_link = r'''\1

      <a href="/admin/products/featuredproduct/" id="nav-featured"
         class="adm-nav-lnk {% if "featuredproduct" in request.path %}here{% endif %}">
        <i class="bi bi-star"></i> المنتجات المميزة 🌟
      </a>'''

if "nav-featured" not in c:
    c = re.sub(prod_pattern, new_featured_link, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f: f.write(c)
print("Updated base_admin.html")
