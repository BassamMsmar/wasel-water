from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView, TemplateView
from django.db.models import Count, Q
from django.db.models.aggregates import Avg
# from .tasks import send_emails
from .models import Product, Brand, Review, ProductImages, Category, Offer, Bundle
# Create your views here.
from django.http import JsonResponse
from django.template.loader import render_to_string



class BundleList(ListView):
    model = Bundle
    queryset = Bundle.objects.all()
    template_name = 'products/bundle_list.html'
    paginate_by = 20


class ProductList(ListView):
    model = Product
    paginate_by = 20

    def get_queryset(self):
        queryset = Product.objects.filter(product_type='single')
        query = self.request.GET.get('q')
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | 
                Q(descriptions__icontains=query)
            )
        return queryset
    



class ProductDetail(DetailView):
    model =Product
    queryset = Product.objects.all()



    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["reviews"] = Review.objects.filter(product=self.get_object())
        context["related_products"] = Product.objects.filter(brand=self.get_object().brand) 
        return context
    

class BrandList(ListView):
    model = Brand    #context : object_list, model_list
    # paginate_by = 20 # User wants all brands and products on one page
    queryset = Brand.objects.prefetch_related('product_brand').all()
 

class BrandDetail(ListView):
    model = Product     #context : object_list, model_list
    template_name = 'products/brand_detail.html'


    def get_queryset(self):
        brand = get_object_or_404(Brand, slug=self.kwargs['slug'])
        return super().get_queryset().filter(brand=brand) 
    

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["brand"] = get_object_or_404(Brand, slug=self.kwargs['slug'])
        return context


class CategoryList(ListView):
    model = Category
    paginate_by = 20
    queryset = Category.objects.all()


class CategoryDetail(ListView):
    model = Product     #context : object_list, model_list
    template_name = 'products/category_detail.html'

    def get_queryset(self):
        category = get_object_or_404(Category, slug=self.kwargs['slug'])
        return super().get_queryset().filter(category=category)  
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["category"] = get_object_or_404(Category, slug=self.kwargs['slug'])
        return context


class OfferList(ListView):
    model = Offer
    queryset = Offer.objects.all()
    paginate_by = 20


class OfferDetail(DetailView):
    model = Offer
    queryset = Offer.objects.all()



