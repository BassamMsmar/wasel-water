from django.utils.translation import gettext_lazy as _
from django.db import models
from django.conf import settings

# Create your models here.
class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("سلة التسوق")
        verbose_name_plural = _("سلال التسوق")

    def __str__(self):
        return f"Cart of {self.user}"
