from django.shortcuts import render, redirect
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import TemplateView, ListView, UpdateView, CreateView
from django.db.models import Count, Sum
from products.models import Product, Offer, Brand, Category, Bundle
from orders.models import Order
from django.contrib.auth import get_user_model

User = get_user_model()


from .models import Banner, Company, Section

# Create your views here.
def home(request):
    """
    Display the home page with featured products, categories, and ads.
    """

    #products 
    offers = Offer.objects.all()
    latest_products = Product.objects.filter(active=True)[:10]
    bundle_products = Product.objects.filter(product_type='bundle')[:6]
    banners = Banner.objects.all()
    brands = Brand.objects.all()
    categories = Category.objects.all()
    company = Company.objects.first()

    # Sections Logic
    sections = Section.objects.filter(active=True)
    for section in sections:
        if section.section_type == 'most_sold':
            # Order by sales_count descending
            section.items = Product.objects.filter(active=True).order_by('-sales_count')[:10]
        elif section.section_type == 'newest':
            section.items = Product.objects.filter(active=True).order_by('-id')[:10]
        else:
            section.items = section.products.all()

    #banners
    banner_offer = Banner.objects.filter(type='offer')
    banner_bundle = Banner.objects.filter(type='bundle')

    context = {
        'latest_products': latest_products,
        'offers': offers,
        'bundle_products': bundle_products,
        'banners': banners,
        'brands': brands,
        'categories': categories,
        'company': company,
        'sections': sections,
    }
    
    return render(request, 'home.html', context)


def about(request):
    company = Company.objects.first()
    return render(request, 'about.html', {'company': company})


def contact(request):
    company = Company.objects.first()
    return render(request, 'contact.html', {'company': company})


def privacy(request):
    company = Company.objects.first()
    return render(request, 'privacy.html', {'company': company})


def tos(request):
    company = Company.objects.first()
    return render(request, 'tos.html', {'company': company})


def return_policy(request):
    company = Company.objects.first()
    return render(request, 'return-policy.html', {'company': company})


# Custom Admin Dashboard Views
class StaffRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_staff

class AdminDashboardView(StaffRequiredMixin, TemplateView):
    template_name = 'admin/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_orders'] = Order.objects.count()
        context['total_products'] = Product.objects.count()
        context['total_customers'] = User.objects.count()
        context['recent_orders'] = Order.objects.order_by('-created_at')[:5]
        return context

class AdminProductListView(StaffRequiredMixin, ListView):
    model = Product
    template_name = 'admin/product_list.html'
    context_object_name = 'products'
    paginate_by = 20

class AdminOrderListView(StaffRequiredMixin, ListView):
    model = Order
    template_name = 'admin/order_list.html'
    context_object_name = 'orders'
    paginate_by = 20

class AdminCustomerListView(StaffRequiredMixin, ListView):
    model = User
    template_name = 'admin/customer_list.html'
    context_object_name = 'customers'
    paginate_by = 20

class AdminOfferListView(StaffRequiredMixin, ListView):
    model = Offer
    template_name = 'admin/offer_list.html'
    context_object_name = 'offers'