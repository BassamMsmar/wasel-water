# settings/context_processors.py
from django.conf import settings
from .models import Company
from products.models import Category

def company(request):
    """
    يقوم بجلب بيانات الشركة والأقسام من قاعدة البيانات
    ويجعلها متاحة في جميع القوالب.
    """
    try:
        # نفترض أن لديك شركة واحدة فقط في الجدول
        company = Company.objects.first()
    except Company.DoesNotExist:
        company = None

    categories = Category.objects.all()

    context = {
        'company': company,
        'categories': categories,
    }

    if company:
        context.update({
            'company_name': company.name,
            'company_description': company.description,
            'company_title': company.title,
            'company_logo': company.logo.url if company.logo else '',
            'company_cover': company.cover.url if company.cover else '',
            'company_phone': company.phone,
            'company_email': company.email,
            'company_address': company.address,
            'company_facebook': company.facebook,
            'company_twitter': company.twitter,
            'company_instagram': company.instagram,
            'company_linkedin': company.linkedin,
            'company_tiktok': company.tiktok,
            'company_whatsapp': company.whatsapp,
        })
    
    context['GOOGLE_MAPS_API_KEY'] = getattr(settings, 'GOOGLE_MAPS_API_KEY', '')
    
    return context
