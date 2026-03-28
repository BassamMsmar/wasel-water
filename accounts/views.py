from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import TemplateView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.urls import reverse_lazy
from .models import Address, Customer
from .forms import AddressForm, UserSignUpForm

class SignUpView(CreateView):
    form_class = UserSignUpForm
    success_url = reverse_lazy('login')
    template_name = 'registration/signup.html'

    def form_valid(self, form):
        messages.success(self.request, 'تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول')
        return super().form_valid(form)

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
