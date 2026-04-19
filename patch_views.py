import re

path = r"E:\Code\wasel-water\backend\core\views.py"
with open(path, 'r', encoding='utf-8') as f: c = f.read()

# 1. Update Imports
if "FeaturedProduct" not in c:
    c = c.replace("from products.models import Product, Offer, Brand, Category, Bundle", 
                  "from products.models import Product, Offer, Brand, Category, Bundle, FeaturedProduct")

# 2. Update Home View Logic
home_pattern = re.compile(r'(def home\(request\):.*?#products\s*\n)', re.DOTALL)
featured_logic = """    # Featured Products for Hero
    featured_qs = FeaturedProduct.objects.filter(active=True, product__active=True).order_by('order')
    if featured_qs.exists():
        featured_products = [fp.product for fp in featured_qs[:3]]
    else:
        # Fallback to latest products if no featured products are set
        featured_products = Product.objects.filter(active=True).order_by('-id')[:3]

"""
if "featured_products =" not in c:
    c = home_pattern.sub(r'\1' + featured_logic, c)

# 3. Update Context
if "'featured_products': featured_products," not in c:
    c = c.replace("'latest_products': latest_products,", "'featured_products': featured_products,\n        'latest_products': latest_products,")

with open(path, 'w', encoding='utf-8') as f: f.write(c)
print("Updated core/views.py")
