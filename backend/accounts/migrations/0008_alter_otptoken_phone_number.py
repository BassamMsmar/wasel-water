from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0007_customer_branch_customer_role"),
    ]

    operations = [
        migrations.AlterField(
            model_name="otptoken",
            name="phone_number",
            field=models.CharField(max_length=254, verbose_name="Phone Number"),
        ),
    ]
