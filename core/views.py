from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import TemplateView, ListView, UpdateView, CreateView, View, DetailView
from django.db.models import Count, Sum
from products.models import Product, Offer, Brand, Category, Bundle
from products.forms import ProductForm, BrandForm, CategoryForm, OfferForm
from orders.models import Order, OrderItem
from orders.forms import OrderForm, OrderItemFormSet
from django.contrib.auth import get_user_model
from django.urls import reverse_lazy
from django.contrib import messages
from accounts.forms import StaffForm

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
        'all_products': Product.objects.filter(active=True).order_by('-create_at')[:20],
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

# --- Product Management ---
class AdminProductListView(StaffRequiredMixin, ListView):
    model = Product
    template_name = 'admin/product_list.html'
    context_object_name = 'products'
    paginate_by = 20

class AdminProductCreateView(StaffRequiredMixin, CreateView):
    model = Product
    form_class = ProductForm
    template_name = 'admin/product_form.html'
    success_url = reverse_lazy('settings:admin_products')

class AdminProductUpdateView(StaffRequiredMixin, UpdateView):
    model = Product
    form_class = ProductForm
    template_name = 'admin/product_form.html'
    success_url = reverse_lazy('settings:admin_products')

# --- Brand Management ---
class AdminBrandListView(StaffRequiredMixin, ListView):
    model = Brand
    template_name = 'admin/brand_list.html'
    context_object_name = 'brands'

class AdminBrandCreateView(StaffRequiredMixin, CreateView):
    model = Brand
    form_class = BrandForm
    template_name = 'admin/brand_form.html'
    success_url = reverse_lazy('settings:admin_brands')

class AdminBrandUpdateView(StaffRequiredMixin, UpdateView):
    model = Brand
    form_class = BrandForm
    template_name = 'admin/brand_form.html'
    success_url = reverse_lazy('settings:admin_brands')

# --- Category Management ---
class AdminCategoryListView(StaffRequiredMixin, ListView):
    model = Category
    template_name = 'admin/category_list.html'
    context_object_name = 'categories'

class AdminCategoryCreateView(StaffRequiredMixin, CreateView):
    model = Category
    form_class = CategoryForm
    template_name = 'admin/category_form.html'
    success_url = reverse_lazy('settings:admin_categories')

class AdminCategoryUpdateView(StaffRequiredMixin, UpdateView):
    model = Category
    form_class = CategoryForm
    template_name = 'admin/category_form.html'
    success_url = reverse_lazy('settings:admin_categories')

# --- Offer Management ---
class AdminOfferListView(StaffRequiredMixin, ListView):
    model = Offer
    template_name = 'admin/offer_list.html'
    context_object_name = 'offers'

class AdminOfferCreateView(StaffRequiredMixin, CreateView):
    model = Offer
    form_class = OfferForm
    template_name = 'admin/offer_form.html'
    success_url = reverse_lazy('settings:admin_offers')

class AdminOfferUpdateView(StaffRequiredMixin, UpdateView):
    model = Offer
    form_class = OfferForm
    template_name = 'admin/offer_form.html'
    success_url = reverse_lazy('settings:admin_offers')

# --- Order Management ---
class AdminOrderListView(StaffRequiredMixin, ListView):
    model = Order
    template_name = 'admin/order_list.html'
    context_object_name = 'orders'
    paginate_by = 20

class AdminOrderCreateView(StaffRequiredMixin, CreateView):
    model = Order
    form_class = OrderForm
    template_name = 'admin/order_form.html'
    success_url = reverse_lazy('settings:admin_orders')

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        if self.request.POST:
            data['items'] = OrderItemFormSet(self.request.POST)
        else:
            data['items'] = OrderItemFormSet()
        return data

    def form_valid(self, form):
        context = self.get_context_data()
        items = context['items']
        if items.is_valid():
            # Initial save to get the order ID
            self.object = form.save()
            items.instance = self.object
            items.save()
            
            # Recalculate total_price from items to ensure accuracy
            total = sum(item.get_cost() for item in self.object.items.all())
            self.object.total_price = total
            self.object.save()
            
            messages.success(self.request, f'تم إنشاء الطلب #{self.object.id} بنجاح.')
            return redirect(self.success_url)
        else:
            return self.render_to_response(self.get_context_data(form=form))

class AdminOrderDetailView(StaffRequiredMixin, DetailView):
    model = Order
    template_name = 'admin/order_detail.html'
    context_object_name = 'order'

class AdminOrderUpdateView(StaffRequiredMixin, UpdateView):
    model = Order
    form_class = OrderForm
    template_name = 'admin/order_form.html'
    success_url = reverse_lazy('settings:admin_orders')

    def get_context_data(self, **kwargs):
        data = super().get_context_data(**kwargs)
        if self.request.POST:
            data['items'] = OrderItemFormSet(self.request.POST, instance=self.object)
        else:
            data['items'] = OrderItemFormSet(instance=self.object)
        return data

    def form_valid(self, form):
        context = self.get_context_data()
        items = context['items']
        if items.is_valid():
            self.object = form.save()
            items.instance = self.object
            items.save()
            
            # Recalculate total_price from items
            total = sum(item.get_cost() for item in self.object.items.all())
            self.object.total_price = total
            self.object.save()
            
            messages.success(self.request, f'تم تحديث الطلب #{self.object.id} بنجاح.')
            return redirect(self.success_url)
        else:
            return self.render_to_response(self.get_context_data(form=form))

class AdminOrderUpdateStatusView(StaffRequiredMixin, View):
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        status = request.POST.get('status')
        if status in dict(Order.STATUS_CHOICES):
            order.status = status
            order.save()
            messages.success(request, f'تم تغيير حالة الطلب #{order.id} إلى {order.get_status_display()}')
        return redirect('settings:admin_orders')

# --- Other Management ---
class AdminCustomerListView(StaffRequiredMixin, ListView):
    model = User
    template_name = 'admin/customer_list.html'
    context_object_name = 'customers'
    paginate_by = 20

class AdminStaffListView(StaffRequiredMixin, ListView):
    model = User
    template_name = 'admin/staff_list.html'
    context_object_name = 'staff_members'

    def get_queryset(self):
        return User.objects.filter(is_staff=True)

class AdminStaffCreateView(StaffRequiredMixin, CreateView):
    model = User
    form_class = StaffForm
    template_name = 'admin/staff_form.html'
    success_url = reverse_lazy('settings:admin_staff')

    def form_valid(self, form):
        messages.success(self.request, 'تم إضافة الموظف بنجاح.')
        return super().form_valid(form)

class AdminStaffUpdateView(StaffRequiredMixin, UpdateView):
    model = User
    form_class = StaffForm
    template_name = 'admin/staff_form.html'
    success_url = reverse_lazy('settings:admin_staff')

    def form_valid(self, form):
        messages.success(self.request, 'تم تحديث بيانات الموظف بنجاح.')
        return super().form_valid(form)