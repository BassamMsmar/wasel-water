from django.contrib.auth import get_user_model
from accounts.models import Address
import sys

User = get_user_model()
username = 'testverificationuser'
if not User.objects.filter(username=username).exists():
    user = User.objects.create_user(username=username, password='password123')
else:
    user = User.objects.get(username=username)

try:
    # Create address with new fields
    address = Address.objects.create(
        user=user,
        full_name='Test New Address',
        phone_number='0555555555',
        city='New City',
        neighborhood='Al Olaya',
        street='King Fahd Rd',
        building_number='101',
        apartment_number='5'
    )
    print(f"VERIFICATION SUCCESS: New address created: {address}")
    print(f"Neighborhood: {address.neighborhood}")
except Exception as e:
    print(f"VERIFICATION FAILED: {e}")
