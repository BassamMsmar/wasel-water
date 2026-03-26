from django.urls import path
from .views import OrderListView, PendingOrderListView, OrderDetailView, PaymentSelectionView, CompletePaymentView, OrderTrackingView

app_name = 'orders'

urlpatterns = [
    path('', OrderListView.as_view(), name='order_list'),
    path('pending/', PendingOrderListView.as_view(), name='pending_list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='detail'),
    path('<int:pk>/payment/', PaymentSelectionView.as_view(), name='payment_selection'),
    path('<int:pk>/complete-payment/', CompletePaymentView.as_view(), name='complete_payment'),
    path('track/', OrderTrackingView.as_view(), name='track'),
]
