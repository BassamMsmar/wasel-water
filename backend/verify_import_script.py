import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

try:
    from accounts import urls
    from accounts import views
    print("SUCCESS: accounts.urls and accounts.views imported successfully.")
except ImportError as e:
    print(f"FAILED: ImportError: {e}")
except Exception as e:
    print(f"FAILED: Exception: {e}")
