from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Customer

User = get_user_model()

class PhoneOrEmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to login using their 
    email, phone number, or username.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        try:
            # Try to find the user by username, email, or phone number
            # Phone number is stored in the related Customer profile
            user = User.objects.filter(
                Q(username__iexact=username) | 
                Q(email__iexact=username) | 
                Q(customer__phone_number__iexact=username)
            ).distinct().first()
            
            if user and user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
        
        return None
