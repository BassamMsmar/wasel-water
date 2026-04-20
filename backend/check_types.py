
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from products.models import Product

print(f"Existing product types in DB: {list(Product.objects.values_list('product_type', flat=True).distinct())}")
