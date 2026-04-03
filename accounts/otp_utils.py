import random
import string
import re
from django.conf import settings

def generate_otp(length=4):
    """Generate a random numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))

def send_otp(phone_number, code):
    """
    Simulate sending OTP to phone number.
    In production, replace with actual SMS gateway integration.
    """
    print(f"\n[OTP SERVICE] Sending code {code} to {phone_number}\n")
    # Example: 
    # response = sms_gateway.send(to=phone_number, message=f"كود التحقق الخاص بك هو: {code}")
    return True

def normalize_phone(phone):
    """
    Normalize Saudi phone numbers to +966xxxxxxxx format.
    Handles inputs like '05xxxxxxxx', '5xxxxxxxx', '+9665xxxxxxxx'.
    """
    if not phone:
        return None
    
    # Remove any non-digits
    digits = re.sub(r'\D', '', phone)
    
    if digits.startswith('9665') and len(digits) == 12:
        return '+' + digits
    elif digits.startswith('05') and len(digits) == 10:
        return '+966' + digits[1:]
    elif digits.startswith('5') and len(digits) == 9:
        return '+966' + digits
    
    # Fallback to digits if it doesn't match standard Saudi mobile patterns
    return '+' + digits if not digits.startswith('+') else digits

def validate_phone_sa(phone):
    """
    Simple validation for Saudi mobile numbers.
    """
    normalized = normalize_phone(phone)
    if not normalized:
        return False
    # +966 followed by 5 and 8 digits
    return bool(re.match(r'^\+9665\d{8}$', normalized))
