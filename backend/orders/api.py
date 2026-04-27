from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema
from accounts.permissions import has_dashboard_access
from .models import Order, OrderItem, Branch, OrderStatus
from .serializers import (
    CheckoutSerializer,
    CheckoutResponseSerializer,
    OrderSerializer,
    OrderItemSerializer,
    BranchSerializer,
    OrderStatusSerializer,
)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        base = (
            Order.objects.select_related('status', 'user')
            .prefetch_related('items__product', 'items__bundle')
        )
        if has_dashboard_access(self.request.user):
            return base
        return base.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all().order_by('name')
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OrderStatus.objects.all().order_by('display_order', 'id')
    serializer_class = OrderStatusSerializer
    permission_classes = [permissions.IsAuthenticated]


class CheckoutAPIView(GenericAPIView):
    serializer_class = CheckoutSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=CheckoutSerializer,
        responses={status.HTTP_201_CREATED: CheckoutResponseSerializer},
    )
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            {
                'id': order.id,
                'status': order.status_slug,
                'total_price': str(order.total_price),
                'message': 'تم استلام الطلب بنجاح',
            },
            status=status.HTTP_201_CREATED,
        )
