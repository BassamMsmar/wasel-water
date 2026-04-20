from django.contrib.auth import get_user_model
from accounts.models import Address
from accounts.forms import AddressForm
from django.test import RequestFactory
from django.contrib.messages.storage.fallback import FallbackStorage

User = get_user_model()
username = 'testverificationuser'
if not User.objects.filter(username=username).exists():
    user = User.objects.create_user(username=username, password='password123')
else:
    user = User.objects.get(username=username)

# Test Create
print("Testing Create...")
form_data = {
    'full_name': 'Test Create',
    'phone_number': '0500000000',
    'city': 'Test City',
    'neighborhood': 'Test Neighborhood',
    'street': 'Test Street',
    'building_number': '1',
    'address_type': 'home',
    'is_default': True
}
form = AddressForm(data=form_data)
if form.is_valid():
    address = form.save(commit=False)
    address.user = user
    address.save()
    print(f"Address created: {address} (Default: {address.is_default})")
else:
    print(f"Create Failed: {form.errors}")

# Test Update
print("\nTesting Update...")
address = Address.objects.filter(full_name='Test Create').first()
if address:
    update_data = form_data.copy()
    update_data['full_name'] = 'Test Update'
    form = AddressForm(data=update_data, instance=address)
    if form.is_valid():
        address = form.save()
        print(f"Address updated: {address}")
    else:
        print(f"Update Failed: {form.errors}")
else:
    print("Address to update not found.")

# Test Delete
print("\nTesting Delete...")
if address:
    pk = address.pk
    address.delete()
    exists = Address.objects.filter(pk=pk).exists()
    print(f"Address deleted: {not exists}")
else:
    print("Address to delete not found.")
