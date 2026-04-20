from django.db import migrations, models


DEFAULT_STATUSES = [
    {'slug': 'pending',    'name': 'في الانتظار',   'color': '#F59E0B', 'display_order': 1, 'is_default': True},
    {'slug': 'processing', 'name': 'قيد التجهيز',   'color': '#3B82F6', 'display_order': 2, 'is_default': False},
    {'slug': 'shipped',    'name': 'تم الشحن',       'color': '#8B5CF6', 'display_order': 3, 'is_default': False},
    {'slug': 'delivered',  'name': 'تم التسليم',     'color': '#10B981', 'display_order': 4, 'is_default': False},
    {'slug': 'cancelled',  'name': 'ملغى',           'color': '#EF4444', 'display_order': 5, 'is_default': False},
]


def seed_statuses(apps, schema_editor):
    OrderStatus = apps.get_model('orders', 'OrderStatus')
    Order = apps.get_model('orders', 'Order')

    # Delete any leftover 'unknown' statuses that have no orders
    OrderStatus.objects.filter(slug__isnull=True).delete()

    # Create or update each default status
    slug_to_obj = {}
    for data in DEFAULT_STATUSES:
        obj, created = OrderStatus.objects.get_or_create(
            slug=data['slug'],
            defaults={
                'name': data['name'],
                'color': data['color'],
                'display_order': data['display_order'],
                'is_default': data['is_default'],
            }
        )
        if not created:
            obj.name = data['name']
            obj.color = data['color']
            obj.display_order = data['display_order']
            obj.is_default = data['is_default']
            obj.save()
        slug_to_obj[data['slug']] = obj

    # Assign pending status to orders that have no status
    pending = slug_to_obj.get('pending')
    if pending:
        Order.objects.filter(status__isnull=True).update(status=pending)


def reverse_seed(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_orderstatus_add_slug_color_order_isdefault'),
    ]

    operations = [
        # 1. Run data migration to populate slug values
        migrations.RunPython(seed_statuses, reverse_seed),
        # 2. Now make slug non-nullable and unique
        migrations.AlterField(
            model_name='orderstatus',
            name='slug',
            field=models.SlugField(
                max_length=50,
                unique=True,
                help_text='مثال: pending, processing — لا تغيّره بعد الإنشاء',
                verbose_name='المعرّف البرمجي',
            ),
        ),
    ]
