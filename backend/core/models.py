from django.utils.translation import gettext_lazy as _
from django.db import models

# Create your models here.\

SECTIONS = (
    ('most_sold', 'الاكثر مبيعاً'), 
    ('newest', 'الاحدث'), 
    ('category', 'صنف'), 
    ('selected', 'مختارة'), 
)

class Section(models.Model):
    title = models.CharField(max_length=100)
    section_type = models.CharField(max_length=20, choices=SECTIONS, default='selected')
    products = models.ManyToManyField('products.Product', blank=True)
    active = models.BooleanField(default=True)
    ordering = models.IntegerField(default=0)

    class Meta:
        verbose_name = _("القسم")
        verbose_name_plural = _("الأقسام")
        ordering = ['ordering']

    def __str__(self):
        return self.title

class Company(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    logo = models.ImageField(upload_to='Company')
    title = models.CharField(max_length=100 , default='متجر الكتروني')
    cover = models.ImageField(upload_to='Company')
    phone = models.CharField(max_length=100)
    email = models.EmailField()
    address = models.CharField(max_length=100)
    facebook = models.URLField( blank=True , null=True)
    twitter = models.URLField( blank=True , null=True)
    instagram = models.URLField( blank=True , null=True)
    linkedin = models.URLField( blank=True , null=True)
    tiktok = models.URLField( blank=True , null=True)
    whatsapp = models.CharField(max_length=100 , blank=True , null=True)

    class Meta:
        verbose_name = _("الشركة")
        verbose_name_plural = _("الشركات")

    def __str__(self):
        return self.name



TYPE_BANNER = (
    ('offer', 'offer'), #عرض
    ('bundle', 'bundle'), #حزمة
)
class Banner(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='Banner')
    link = models.URLField()
    type = models.CharField(max_length=10, choices=TYPE_BANNER, default='offer')   


    class Meta:
        verbose_name = _("البانر الإعلاني")
        verbose_name_plural = _("البانرات الإعلانية")
    def __str__(self):
        return self.title 

 
