from django.views.generic import ListView, DetailView, TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from .models import Order, OrderStatus

class OrderListView(LoginRequiredMixin, ListView):
    model = Order
    template_name = 'orders/order_list.html'
    context_object_name = 'orders'

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related('status')
            .order_by('-created_at')
        )

class PendingOrderListView(LoginRequiredMixin, ListView):
    model = Order
    template_name = 'orders/order_list.html'
    context_object_name = 'orders'
    extra_context = {'is_pending': True}

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user, status__slug='pending')
            .select_related('status')
        )

class OrderDetailView(LoginRequiredMixin, DetailView):
    model = Order
    template_name = 'orders/order_detail.html'
    context_object_name = 'order'

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related('status')
            .prefetch_related('items__product', 'items__bundle')
        )

class PaymentSelectionView(LoginRequiredMixin, DetailView):
    model = Order
    template_name = 'orders/payment_selection.html'
    context_object_name = 'order'

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related('status')
            .prefetch_related('items__product', 'items__bundle')
        )

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.object.status and self.object.status.slug != 'pending':
            messages.info(request, "تمت معالجة بيانات الدفع لهذا الطلب مسبقاً.")
            return redirect('orders:detail', pk=self.object.pk)
        context = self.get_context_data(object=self.object)
        return self.render_to_response(context)

class CompletePaymentView(LoginRequiredMixin, View):
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status and order.status.slug != 'pending':
            messages.info(request, "تمت معالجة بيانات الدفع لهذا الطلب مسبقاً.")
            return redirect('orders:detail', pk=order.pk)
            
        payment_method = request.POST.get('payment_method')
        
        if payment_method == 'cod':
            # Update status to processing (confirmed but not yet delivered)
            processing_status = OrderStatus.objects.filter(slug='processing').first()
            order.status = processing_status
            order.save()
            messages.success(request, 'تم اختيار طريقة الدفع بنجاح. سنقوم بتجهيز طلبك.')
            return redirect('orders:detail', pk=order.pk)
        
        messages.error(request, 'طريقة الدفع غير صحيحة')
        return redirect('orders:payment_selection', pk=order.pk)

class OrderTrackingView(TemplateView):
    template_name = 'orders/order_track.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order_id = self.request.GET.get('order_id')
        phone = self.request.GET.get('phone')
        
        if order_id and phone:
            try:
                order = Order.objects.get(id=order_id)
                context['order_found'] = order
            except Order.DoesNotExist:
                context['error'] = 'لم يتم العثور على طلب بهذا الرقم.'
        
        return context
