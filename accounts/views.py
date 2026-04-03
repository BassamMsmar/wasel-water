from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.urls import reverse_lazy
from .models import Address, Customer
from .forms import AddressForm, UserSignUpForm

from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

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
# ... (rest of file) ...
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
