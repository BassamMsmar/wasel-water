import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from products.models import Brand

with open('brands_list.txt', 'w', encoding='utf-8') as f:
    for b in Brand.objects.all():
        f.write(f"Name: {b.name}, Slug: {b.slug}\n")
