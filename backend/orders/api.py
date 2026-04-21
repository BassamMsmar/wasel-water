from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from drf_spectacular.utils import extend_schema
from .models import Order, OrderItem
from .serializers import (
    CheckoutSerializer,
    CheckoutResponseSerializer,
    OrderSerializer,
    OrderItemSerializer,
)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)


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
