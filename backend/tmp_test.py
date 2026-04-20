from orders.models import Order
print([(o.id, getattr(o.user, 'username', o.user), o.status, o.total_price) for o in Order.objects.all()])
