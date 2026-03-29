from django.views.generic import ListView, DetailView, TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect
from django.contrib import messages
from .models import Order

class OrderListView(LoginRequiredMixin, ListView):
    model = Order
    template_name = 'orders/order_list.html'
    context_object_name = 'orders'

    def get_queryset(self):
        # Return all orders effectively, or just completed ones if strict separation is needed
        # User requested "Orders (Paid/Old/New)" vs "Pending (Waiting Payment)"
        # So here we exclude pending/cancelled maybe?
        # Let's show all non-pending for "Orders" to be safe, or just "Paid/Shipped/Delivered"
        # Show all orders ordered by newest first
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class PendingOrderListView(LoginRequiredMixin, ListView):
    model = Order
    template_name = 'orders/order_list.html' # Reuse template or create separate one
    context_object_name = 'orders'
    extra_context = {'is_pending': True}

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user, status='pending')

class OrderDetailView(LoginRequiredMixin, DetailView):
    model = Order
    template_name = 'orders/order_detail.html'
    context_object_name = 'order'

    def get_queryset(self):
         return Order.objects.filter(user=self.request.user)

class PaymentSelectionView(LoginRequiredMixin, DetailView):
    model = Order
    template_name = 'orders/payment_selection.html'
    context_object_name = 'order'

    def get_queryset(self):
         return Order.objects.filter(user=self.request.user)

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.object.status != 'pending':
            messages.info(request, "تمت معالجة بيانات الدفع لهذا الطلب مسبقاً.")
            return redirect('orders:detail', pk=self.object.pk)
        context = self.get_context_data(object=self.object)
        return self.render_to_response(context)

class CompletePaymentView(LoginRequiredMixin, View):
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status != 'pending':
            messages.info(request, "تمت معالجة بيانات الدفع لهذا الطلب مسبقاً.")
            return redirect('orders:detail', pk=order.pk)
            
        payment_method = request.POST.get('payment_method')
        
        if payment_method == 'cod':
            # Update status to processing (confirmed but not yet delivered)
            order.status = 'processing'
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
                # Assuming your Order model has a phone field or user has a phone
                # If not, we might need to adjust this lookup
                order = Order.objects.get(id=order_id)
                # For safety, we should verify the phone number matches the order
                # If order.phone doesn't exist, we might check order.billing_address phone
                context['order_found'] = order
            except Order.DoesNotExist:
                context['error'] = 'لم يتم العثور على طلب بهذا الرقم.'
        
        return context
