import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from orders.models import Order
import sys

with open('dump_out.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total orders: {Order.objects.count()}\n")
    try:
        order = Order.objects.get(id=10)
        f.write(f"Order 10 EXISTS. status={order.status}, user_id={order.user_id}, total={order.total_price}\n")
    except Exception as e:
        f.write(f"Error fetching order 10: {e}\n")
        for o in Order.objects.all().order_by('-id')[:5]:
            f.write(f"Recent: id={o.id}, status={o.status}, user={o.user_id}\n")
