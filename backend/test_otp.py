import os
import django
import sys

# Setup Django environment
sys.path.append('e:/Code/wasel-water/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from accounts.models import OTPToken
from accounts.otp_utils import generate_otp, send_otp, normalize_phone

def test_otp_flow():
    test_phone = "0512345678"
    norm_phone = normalize_phone(test_phone)
    code = generate_otp(4)
    
    print(f"Testing for phone: {test_phone}")
    print(f"Normalized: {norm_phone}")
    print(f"Generated Code: {code}")
    
    # Save to DB
    otp = OTPToken.objects.create(phone_number=norm_phone, code=code)
    print(f"OTP Saved: {otp}")
    
    # Send (should print to console)
    send_otp(norm_phone, code)
    
    # Verify
    saved_otp = OTPToken.objects.get(id=otp.id)
    if saved_otp.code == code and saved_otp.is_valid():
        print("SUCCESS: OTP is valid and saved correctly.")
    else:
        print("FAIL: OTP verification failed.")

if __name__ == "__main__":
    test_otp_flow()
