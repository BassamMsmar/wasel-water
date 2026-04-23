from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count
from .models import Product, ProductImages, Brand, Category, Offer, Review, Bundle, BundleItem, Flag, FeaturedProduct
from .serializers import (
    ProductSerializer, ProductImagesSerializer, BrandSerializer,
    CategorySerializer, OfferSerializer, ReviewSerializer,
    BundleSerializer, BundleItemSerializer, FlagSerializer, FeaturedProductSerializer
)


class ProductViewSet(viewsets.ModelViewSet):
    # annotate مع prefetch يمنع N+1 في rating وreviews_count لكل منتج
    queryset = (
        Product.objects.filter(active=True)
        .select_related('brand', 'flag')
        .prefetch_related('category', 'product_image')
        .annotate(
            avg_rating=Avg('review_product__rate'),
            reviews_count_annotated=Count('review_product'),
        )
    )
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'category', 'product_type']
    search_fields = ['name', 'subtitle', 'descriptions']
    ordering_fields = ['new_price', 'old_price', 'sales_count', 'create_at']
    ordering = ['-create_at']
    lookup_field = 'slug'

    def get_queryset(self):
        qs = super().get_queryset()
        flag = self.request.query_params.get('flag')
        if flag:
            qs = qs.filter(flag__name__iexact=flag)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(new_price__gte=float(min_price))
        if max_price:
            qs = qs.filter(new_price__lte=float(max_price))
        return qs

    @action(detail=False, methods=['get'], url_path='featured')
    def featured(self, request):
        qs = self.get_queryset().filter(flag__name__iexact='feature')
        serializer = self.get_serializer(qs[:20], many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='best-sellers')
    def best_sellers(self, request):
        qs = self.get_queryset().order_by('-sales_count')
        serializer = self.get_serializer(qs[:20], many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='related')
    def related(self, request, slug=None):
        product = self.get_object()
        cats = product.category.all()
        qs = (
            self.get_queryset()
            .filter(category__in=cats)
            .exclude(pk=product.pk)
            .distinct()[:10]
        )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)



class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.annotate(products_count=Count('product_brand'))
    serializer_class = BrandSerializer
    lookup_field = 'slug'

    @action(detail=True, methods=['get'], url_path='products')
    def products(self, request, slug=None):
        brand = self.get_object()
        qs = (
            Product.objects.filter(brand=brand, active=True)
            .select_related('brand', 'flag')
            .prefetch_related('category', 'product_image')
            .annotate(
                avg_rating=Avg('review_product__rate'),
                reviews_count_annotated=Count('review_product'),
            )
        )
        serializer = ProductSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    @action(detail=True, methods=['get'], url_path='products')
    def products(self, request, slug=None):
        category = self.get_object()
        qs = (
            Product.objects.filter(category=category, active=True)
            .select_related('brand', 'flag')
            .prefetch_related('category', 'product_image')
            .annotate(
                avg_rating=Avg('review_product__rate'),
                reviews_count_annotated=Count('review_product'),
            )
        )
        serializer = ProductSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer


class FlagViewSet(viewsets.ModelViewSet):
    queryset = Flag.objects.all().order_by('name')
    serializer_class = FlagSerializer


class FeaturedProductViewSet(viewsets.ModelViewSet):
    queryset = FeaturedProduct.objects.select_related('product').filter(active=True).order_by('order', '-id')
    serializer_class = FeaturedProductSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BundleViewSet(viewsets.ModelViewSet):
    queryset = Bundle.objects.filter(active=True).prefetch_related('bundle_items__item')
    serializer_class = BundleSerializer
    lookup_field = 'slug'


class BundleItemViewSet(viewsets.ModelViewSet):
    queryset = BundleItem.objects.all()
    serializer_class = BundleItemSerializer
