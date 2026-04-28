from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_alter_address_phone_number'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='customer',
            options={
                'permissions': [('access_dashboard', 'Can access dashboard')],
                'verbose_name': 'العميل',
                'verbose_name_plural': 'العملاء',
            },
        ),
    ]
