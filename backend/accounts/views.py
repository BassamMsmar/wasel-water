from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages, auth
from django.urls import reverse_lazy
from django.contrib.auth import get_user_model, authenticate, login as auth_login
from .models import Address, Customer, OTPToken
from .forms import AddressForm, UserSignUpForm
from .otp_utils import generate_otp, send_otp, normalize_phone, validate_phone_sa

from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

User = get_user_model()

@require_POST
def save_temp_location(request):
    """Legacy endpoint - kept for backward compatibility."""
    try:
        data = json.loads(request.body)
        location_link = data.get('location_link')
        if location_link:
            request.session['temp_location'] = location_link
            return JsonResponse({'success': True})
        return JsonResponse({'success': False, 'error': 'No link provided'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@require_POST
def save_user_location(request):
    """
    Save full location data from Google Maps selection.
    Stores: latitude, longitude, readable_address, maps_url
    - Always saves to session (for guests and cached use)
    - If logged in, also saves/updates the default Address record
    """
    try:
        data = json.loads(request.body)
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        readable_address = data.get('readable_address', '')
        maps_url = data.get('maps_url', '')
        city = data.get('city', '')
        country = data.get('country', '')
        neighborhood = data.get('neighborhood', '')
        street = data.get('street', '')
        postal_code = data.get('postal_code', '')

        if not latitude or not longitude:
            return JsonResponse({'success': False, 'error': 'Latitude and longitude are required'})

        # Save to session for all users (guests + logged in)
        request.session['user_location'] = {
            'latitude': latitude,
            'longitude': longitude,
            'readable_address': readable_address,
            'maps_url': maps_url,
            'city': city,
            'country': country,
        }
        # Also keep legacy key
        request.session['temp_location'] = maps_url

        # If authenticated, save/update default address in database
        if request.user.is_authenticated:
            from decimal import Decimal
            # Check for existing address with same coords
            existing = Address.objects.filter(
                user=request.user,
                latitude=Decimal(str(latitude)),
                longitude=Decimal(str(longitude))
            ).first()

            if not existing:
                # If user has a default address, unset it
                Address.objects.filter(user=request.user, is_default=True).update(is_default=False)
                # Create new address from map selection
                Address.objects.create(
                    user=request.user,
                    full_name=request.user.get_full_name() or request.user.username,
                    phone_number=getattr(request.user, 'customer', None) and request.user.customer.phone_number or '',
                    city=city,
                    country=country,
                    neighborhood=neighborhood,
                    street=street,
                    postal_code=postal_code,
                    latitude=latitude,
                    longitude=longitude,
                    is_default=True,
                )
            else:
                # Mark existing as default
                Address.objects.filter(user=request.user, is_default=True).exclude(pk=existing.pk).update(is_default=False)
                existing.is_default = True
                existing.save()

        return JsonResponse({
            'success': True,
            'readable_address': readable_address,
            'city': city,
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

class SignUpView(CreateView):
    form_class = UserSignUpForm
    success_url = reverse_lazy('login')
    template_name = 'registration/signup.html'

    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.object
        temp_location = self.request.session.get('temp_location')
        if temp_location:
            Address.objects.create(
                user=user,
                full_name=user.get_full_name() or user.username,
                phone_number="",
                city="jeddah - جدة",
                location_link=temp_location,
                is_default=True
            )
            del self.request.session['temp_location']
        messages.success(self.request, 'تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول')
        return response

class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        context['recent_orders'] = user.orders.all()[:5]
        context['default_address'] = user.addresses.filter(is_default=True).first()
        return context

class SettingsView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/settings.html'



class AddressListView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/address_list.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['addresses'] = self.request.user.addresses.all()
        return context

class AddressCreateView(LoginRequiredMixin, CreateView):
    model = Address
    form_class = AddressForm
    template_name = 'accounts/address_form.html'
    success_url = reverse_lazy('accounts:address_list')

    def form_valid(self, form):
        form.instance.user = self.request.user
        messages.success(self.request, 'تم إضافة العنوان بنجاح')
        return super().form_valid(form)



class AddressUpdateView(LoginRequiredMixin, UpdateView):
    model = Address
    form_class = AddressForm
    template_name = 'accounts/address_form.html'
    success_url = reverse_lazy('accounts:address_list')

    def get_queryset(self):
        return self.request.user.addresses.all()

    def form_valid(self, form):
        messages.success(self.request, 'تم تحديث العنوان بنجاح')
        return super().form_valid(form)



class AddressDeleteView(LoginRequiredMixin, DeleteView):
    model = Address
    template_name = 'accounts/address_confirm_delete.html'
    success_url = reverse_lazy('accounts:address_list')

    def get_queryset(self):
        return self.request.user.addresses.all()

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'تم حذف العنوان بنجاح')
        return super().delete(request, *args, **kwargs)

class ProfileView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/profile_detail.html'
    
    def post(self, request, *args, **kwargs):
        user = request.user
        # Update User model fields
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.save()

        # Update Customer model fields
        customer = user.customer
        customer.phone_number = request.POST.get('phone_number', customer.phone_number)
        
        birth_date = request.POST.get('birth_date')
        if birth_date:
            customer.birth_date = birth_date
            
        if 'image' in request.FILES:
            customer.image = request.FILES['image']
            
        customer.save()
        
        messages.success(request, 'تم تحديث البيانات بنجاح')
        return redirect('accounts:profile_detail')

class PaymentMethodsView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/payment_methods.html'

def otp_login_page_view(request):
    """Render the unified OTP login/register page."""
    if request.user.is_authenticated:
        return redirect('home')
    return render(request, 'accounts/otp_login.html')

@require_POST
def otp_request_view(request):
    """Handle OTP request via AJAX."""
    try:
        data = json.loads(request.body)
        phone = data.get('phone')
        
        if not phone:
            return JsonResponse({'success': False, 'error': 'يرجى إدخال رقم الهاتف'})
            
        if not validate_phone_sa(phone):
            return JsonResponse({'success': False, 'error': 'رقم الهاتف غير صحيح (مثال: 05xxxxxxxx)'})
            
        normalized_phone = normalize_phone(phone)
        code = generate_otp(4)
        
        from django.utils import timezone
        from datetime import timedelta
        
        # Invalidate old unused tokens for this phone
        OTPToken.objects.filter(
            phone_number=normalized_phone,
            is_used=False
        ).update(is_used=True)
        
        # Create OTP token with explicit expires_at
        expires_at = timezone.now() + timedelta(minutes=5)
        token = OTPToken.objects.create(
            phone_number=normalized_phone,
            code=code,
            expires_at=expires_at,
        )
        
        print(f"[OTP DEBUG] Created token id={token.pk} phone={normalized_phone} code={code} expires={expires_at}")
        
        # Send OTP
        send_otp(normalized_phone, code)
        
        from django.conf import settings
        response_data = {'success': True, 'message': 'تم إرسال كود التحقق بنجاح'}
        if settings.DEBUG:
            response_data['debug_code'] = code
            
        return JsonResponse(response_data)
    except Exception as e:
        import traceback
        print(f"[OTP ERROR] otp_request: {e}\n{traceback.format_exc()}")
        return JsonResponse({'success': False, 'error': str(e)})

@require_POST
def otp_verify_view(request):
    """Verify OTP and log user in (auto-register if new)."""
    try:
        data = json.loads(request.body)
        phone = data.get('phone')
        code = data.get('code')
        
        if not phone or not code:
            return JsonResponse({'success': False, 'error': 'بيانات التحقق غير مكتملة'})
            
        normalized_phone = normalize_phone(phone)
        
        from django.utils import timezone as tz
        print(f"[OTP DEBUG] Verify request: phone={normalized_phone} code={code} server_time={tz.now()}")
        
        # Find valid OTP token
        otp_token = OTPToken.objects.filter(
            phone_number=normalized_phone,
            code=code,
            is_used=False
        ).order_by('-created_at').first()
        
        if otp_token:
            print(f"[OTP DEBUG] Token found: id={otp_token.pk} expires={otp_token.expires_at} is_used={otp_token.is_used} attempts={otp_token.attempts} is_valid={otp_token.is_valid()}")
        else:
            # Try without code filter to see what's in DB
            any_token = OTPToken.objects.filter(phone_number=normalized_phone, is_used=False).order_by('-created_at').first()
            if any_token:
                print(f"[OTP DEBUG] No match for code. Latest token: code={any_token.code} (submitted: {code})")
            else:
                print(f"[OTP DEBUG] No token found for phone={normalized_phone}")
        
        if not otp_token or not otp_token.is_valid():
            if otp_token:
                otp_token.attempts += 1
                otp_token.save()
            return JsonResponse({'success': False, 'error': 'كود التحقق غير صحيح أو منتهي الصلاحية'})
            
        # Mark as used
        otp_token.is_used = True
        otp_token.save()
        
        # Find or create user
        customer = Customer.objects.filter(phone_number=normalized_phone).first()
        if customer:
            user = customer.user
        else:
            # Check if user exists by username (phone)
            user = User.objects.filter(username=normalized_phone).first()
            if not user:
                # Create new user — make_random_password removed in Django 5.x
                from django.utils.crypto import get_random_string
                user = User.objects.create_user(
                    username=normalized_phone,
                    password=get_random_string(16)
                )
                print(f"[OTP DEBUG] Created new user: {normalized_phone}")

            # Always use get_or_create to avoid UNIQUE constraint on user_id
            customer, created = Customer.objects.get_or_create(
                user=user,
                defaults={'phone_number': normalized_phone}
            )
            if not created and not customer.phone_number:
                customer.phone_number = normalized_phone
                customer.save()
            print(f"[OTP DEBUG] Customer {'created' if created else 'found'}: id={customer.pk}")
        
        print(f"[OTP DEBUG] Logging in user: {user.username} (id={user.pk})")
        # Log in
        auth.login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        # Check for next redirect
        next_url = request.GET.get('next', 'home')
        if next_url == 'home' or not next_url:
            from django.urls import reverse
            next_url = reverse('home')
            
        return JsonResponse({'success': True, 'redirect_url': next_url})
    except Exception as e:
        import traceback
        print(f"[OTP ERROR] otp_verify: {e}\n{traceback.format_exc()}")
        return JsonResponse({'success': False, 'error': str(e)})

@require_POST
def traditional_login_view(request):
    """Handle traditional username/password login via AJAX."""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'success': False, 'error': 'يرجى إدخال اسم المستخدم وكلمة المرور'})
            
        # Our PhoneOrEmailBackend handles username, email or phone
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            auth_login(request, user, backend='accounts.backends.PhoneOrEmailBackend')
            
            # Follow next parameter
            from django.urls import reverse
            next_url = request.GET.get('next') or reverse('home')
                
            return JsonResponse({'success': True, 'redirect_url': next_url})
        else:
            return JsonResponse({'success': False, 'error': 'خطأ في اسم المستخدم أو كلمة المرور'})
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': 'حدث خطأ أثناء تسجيل الدخول'})
