from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import TemplateView, ListView, UpdateView, CreateView, View, DetailView, DeleteView
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDay, TruncMonth
from django.utils import timezone
from datetime import timedelta
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
        filters = self._dashboard_filters()
        orders = Order.objects.select_related('user', 'representative').filter(**filters['query'])
        if filters['branch']:
            orders = orders.filter(Q(branch__iexact=filters['branch']) | Q(shipping_city__iexact=filters['branch']))

        context['period'] = filters['period']
        context['date_from'] = filters['date_from']
        context['date_to'] = filters['date_to']
        context['selected_branch'] = filters['branch']
        context['selected_representative'] = filters['representative']
        context['branches'] = self._branches()
        context['representatives'] = User.objects.filter(is_staff=True).order_by('first_name', 'username')
        context['total_orders'] = orders.count()
        context['total_products'] = Product.objects.count()
        context['total_customers'] = User.objects.count()
        context['total_revenue'] = orders.aggregate(total=Sum('total_price', default=0))['total']
        context['paid_orders'] = orders.filter(is_paid=True).count()
        context['average_order'] = (context['total_revenue'] / context['total_orders']) if context['total_orders'] else 0
        context['recent_orders'] = orders.order_by('-created_at')[:8]
        context['status_rows'] = orders.values('status').annotate(total=Count('id')).order_by('-total')
        context['branch_rows'] = orders.values('branch', 'shipping_city').annotate(total=Count('id'), revenue=Sum('total_price', default=0)).order_by('-revenue')[:8]
        context['representative_rows'] = orders.values(
            'representative__first_name', 'representative__last_name', 'representative__username'
        ).annotate(total=Count('id'), revenue=Sum('total_price', default=0)).order_by('-revenue')[:8]
        context['timeline_rows'] = self._timeline(orders, filters['period'])
        return context

    def _dashboard_filters(self):
        request = self.request
        now = timezone.localtime()
        today = now.date()
        period = request.GET.get('period') or 'daily'
        date_from = request.GET.get('date_from') or ''
        date_to = request.GET.get('date_to') or ''
        branch = request.GET.get('branch') or ''
        representative = request.GET.get('representative') or ''

        start = None
        end = None
        if period == 'custom':
            start = self._parse_date(date_from)
            end = self._parse_date(date_to)
        elif period == 'weekly':
            start = today - timedelta(days=today.weekday())
        elif period == 'monthly':
            start = today.replace(day=1)
        elif period == 'yearly':
            start = today.replace(month=1, day=1)
        else:
            period = 'daily'
            start = today

        query = {}
        if start:
            query['created_at__date__gte'] = start
            date_from = start.isoformat()
        if end:
            query['created_at__date__lte'] = end
            date_to = end.isoformat()
        if representative:
            query['representative_id'] = representative

        return {
            'query': query,
            'period': period,
            'date_from': date_from,
            'date_to': date_to,
            'branch': branch,
            'representative': representative,
        }

    def _parse_date(self, value):
        if not value:
            return None
        try:
            return timezone.datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            return None

    def _branches(self):
        branch_values = set(
            Order.objects.exclude(branch__isnull=True).exclude(branch='').values_list('branch', flat=True)
        )
        city_values = set(
            Order.objects.exclude(shipping_city__isnull=True).exclude(shipping_city='').values_list('shipping_city', flat=True)
        )
        return sorted(branch_values | city_values)

    def _timeline(self, orders, period):
        trunc = TruncMonth('created_at') if period == 'yearly' else TruncDay('created_at')
        return orders.annotate(point=trunc).values('point').annotate(
            total=Count('id'),
            revenue=Sum('total_price', default=0),
        ).order_by('point')

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

    def form_valid(self, form):
        messages.success(self.request, 'تم إضافة المنتج بنجاح.')
        return super().form_valid(form)

class AdminProductUpdateView(StaffRequiredMixin, UpdateView):
    model = Product
    form_class = ProductForm
    template_name = 'admin/product_form.html'
    success_url = reverse_lazy('settings:admin_products')

    def form_valid(self, form):
        messages.success(self.request, 'تم تحديث بيانات المنتج بنجاح.')
        return super().form_valid(form)

class AdminProductDeleteView(StaffRequiredMixin, DeleteView):
    model = Product
    template_name = 'admin/confirm_delete.html'
    success_url = reverse_lazy('settings:admin_products')

    def post(self, request, *args, **kwargs):
        messages.success(self.request, 'تم حذف المنتج بنجاح.')
        return super().post(request, *args, **kwargs)

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

    def form_valid(self, form):
        messages.success(self.request, 'تم إضافة الماركة بنجاح.')
        return super().form_valid(form)

class AdminBrandUpdateView(StaffRequiredMixin, UpdateView):
    model = Brand
    form_class = BrandForm
    template_name = 'admin/brand_form.html'
    success_url = reverse_lazy('settings:admin_brands')

    def form_valid(self, form):
        messages.success(self.request, 'تم تحديث بيانات الماركة بنجاح.')
        return super().form_valid(form)

class AdminBrandDeleteView(StaffRequiredMixin, DeleteView):
    model = Brand
    template_name = 'admin/confirm_delete.html'
    success_url = reverse_lazy('settings:admin_brands')

    def post(self, request, *args, **kwargs):
        messages.success(self.request, 'تم حذف الماركة بنجاح.')
        return super().post(request, *args, **kwargs)

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

    def form_valid(self, form):
        messages.success(self.request, 'تم إضافة القسم بنجاح.')
        return super().form_valid(form)

class AdminCategoryUpdateView(StaffRequiredMixin, UpdateView):
    model = Category
    form_class = CategoryForm
    template_name = 'admin/category_form.html'
    success_url = reverse_lazy('settings:admin_categories')

    def form_valid(self, form):
        messages.success(self.request, 'تم تحديث بيانات القسم بنجاح.')
        return super().form_valid(form)

class AdminCategoryDeleteView(StaffRequiredMixin, DeleteView):
    model = Category
    template_name = 'admin/confirm_delete.html'
    success_url = reverse_lazy('settings:admin_categories')

    def post(self, request, *args, **kwargs):
        messages.success(self.request, 'تم حذف القسم بنجاح.')
        return super().post(request, *args, **kwargs)

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

    def form_valid(self, form):
        messages.success(self.request, 'تم إضافة العرض بنجاح.')
        return super().form_valid(form)

class AdminOfferUpdateView(StaffRequiredMixin, UpdateView):
    model = Offer
    form_class = OfferForm
    template_name = 'admin/offer_form.html'
    success_url = reverse_lazy('settings:admin_offers')

    def form_valid(self, form):
        messages.success(self.request, 'تم تحديث بيانات العرض بنجاح.')
        return super().form_valid(form)

class AdminOfferDeleteView(StaffRequiredMixin, DeleteView):
    model = Offer
    template_name = 'admin/confirm_delete.html'
    success_url = reverse_lazy('settings:admin_offers')

    def post(self, request, *args, **kwargs):
        messages.success(self.request, 'تم حذف العرض بنجاح.')
        return super().post(request, *args, **kwargs)

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

class AdminOrderDeleteView(StaffRequiredMixin, DeleteView):
    model = Order
    template_name = 'admin/confirm_delete.html'
    success_url = reverse_lazy('settings:admin_orders')

    def post(self, request, *args, **kwargs):
        messages.success(self.request, f'تم حذف الطلب بنجاح.')
        return super().post(request, *args, **kwargs)

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

class AdminStaffDeleteView(StaffRequiredMixin, DeleteView):
    model = User
    template_name = 'admin/confirm_delete.html'
    success_url = reverse_lazy('settings:admin_staff')

    def post(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            messages.error(request, 'لا يمكنك حذف حسابك الخاص.')
            return redirect(self.success_url)
        messages.success(request, 'تم حذف الموظف بنجاح.')
        return super().post(request, *args, **kwargs)

class AdminCustomerDeleteView(StaffRequiredMixin, DeleteView):
    model = User
    template_name = 'admin/confirm_delete.html'
    success_url = reverse_lazy('settings:admin_customers')

    def post(self, request, *args, **kwargs):
        messages.success(self.request, 'تم حذف المستخدم بنجاح.')
        return super().post(request, *args, **kwargs)

from django.contrib.auth import logout
from django.shortcuts import redirect

def custom_logout_view(request):
    logout(request)
    return redirect('home')
