import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from products.models import Brand, Category, Product

print("--- Brands ---")
for b in Brand.objects.all():
    print(f"Name: {b.name}, Slug: {b.slug}")

print("\n--- Categories ---")
for c in Category.objects.all():
    print(f"Name: {c.name}, Slug: {c.slug}")

print("\n--- Products (safa sample) ---")
for p in Product.objects.filter(name__icontains='صفا'):
    print(f"Name: {p.name}, Slug: {p.slug}")
