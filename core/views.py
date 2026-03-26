from django.shortcuts import render
from products.models import Product, Offer, Brand, Category
from django.db.models import Count


from .models import Banner, Company, Section

# Create your views here.
def home(request):
    """
    Display the home page with featured products, categories, and ads.
    """

    #products 
    offers = Offer.objects.all()
    latest_products = Product.objects.filter(active=True)[:10]
    bundle_products = Product.objects.filter(product_type='bundle')[:6]
    banners = Banner.objects.all()
    brands = Brand.objects.all()
    categories = Category.objects.all()
    company = Company.objects.first()

    # Sections Logic
    sections = Section.objects.filter(active=True)
    for section in sections:
        if section.section_type == 'most_sold':
            # Order by sales_count descending
            section.items = Product.objects.filter(active=True).order_by('-sales_count')[:10]
        elif section.section_type == 'newest':
            section.items = Product.objects.filter(active=True).order_by('-id')[:10]
        else:
            section.items = section.products.all()

    #banners
    banner_offer = Banner.objects.filter(type='offer')
    banner_bundle = Banner.objects.filter(type='bundle')

    context = {
        'latest_products': latest_products,
        'offers': offers,
        'bundle_products': bundle_products,
        'banners': banners,
        'brands': brands,
        'categories': categories,
        'company': company,
        'sections': sections,
    }
    
    return render(request, 'home.html', context)


def about(request):
    company = Company.objects.first()
    return render(request, 'about.html', {'company': company})


def contact(request):
    company = Company.objects.first()
    return render(request, 'contact.html', {'company': company})


def privacy(request):
    company = Company.objects.first()
    return render(request, 'privacy.html', {'company': company})


def tos(request):
    company = Company.objects.first()
    return render(request, 'tos.html', {'company': company})


def return_policy(request):
    company = Company.objects.first()
    return render(request, 'return-policy.html', {'company': company})