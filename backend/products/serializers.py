from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from django.db.models import Avg, Count
from .models import Product, ProductImages, Brand, Category, Offer, Review, Bundle, BundleItem, Flag, FeaturedProduct


class BrandSerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'image', 'logo', 'products_count',
            'cover_image', 'description',
            'seo_title', 'seo_description', 'seo_keywords', 'seo_canonical_url',
        ]

    def get_products_count(self, obj):
        # يستخدم قيمة annotate إذا كانت موجودة لتفادي استعلام إضافي
        if hasattr(obj, 'products_count'):
            return obj.products_count
        return obj.product_brand.filter(active=True).count()

    def get_logo(self, obj):
        return obj.image.url if obj.image else None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'image',
            'seo_title', 'seo_description', 'seo_keywords', 'seo_canonical_url',
        ]


class ProductImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImages
        fields = ['id', 'image']


class ProductSerializer(TaggitSerializer, serializers.ModelSerializer):
    tags = TagListSerializerField()
    product_image = ProductImagesSerializer(many=True, read_only=True)
    brand_data = BrandSerializer(source='brand', read_only=True)
    category_data = CategorySerializer(source='category', many=True, read_only=True)

    price = serializers.SerializerMethodField()
    stock = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()
    is_new = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    flag_name = serializers.SerializerMethodField()
    images = ProductImagesSerializer(source='product_image', many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'flag', 'flag_name', 'image',
            'old_price', 'new_price',
            'price', 'stock', 'is_available',
            'discount_percent', 'is_new',
            'rating', 'reviews_count',
            'description', 'subtitle', 'descriptions',
            'active',
            'quantity', 'brand', 'brand_data',
            'category', 'category_data',
            'product_image', 'images',
            'tags', 'sales_count', 'product_type',
            'sku', 'linkVideo', 'create_at',
            'seo_title', 'seo_description', 'seo_keywords', 'seo_canonical_url',
        ]

    def get_price(self, obj):
        return obj.new_price if obj.new_price else obj.old_price

    def get_stock(self, obj):
        return obj.quantity

    def get_is_available(self, obj):
        return obj.quantity > 0 and obj.active

    def get_rating(self, obj):
        # إذا تم استخدام annotate() في القائمة سيتم استخدام القيمة المحسوبة مسبقاً
        if hasattr(obj, 'avg_rating') and obj.avg_rating is not None:
            return round(obj.avg_rating, 1)
        avg = obj.review_product.aggregate(avg=Avg('rate'))['avg']
        return round(avg, 1) if avg else 0.0

    def get_reviews_count(self, obj):
        # إذا تم استخدام annotate() في القائمة سيتم استخدام القيمة المحسوبة مسبقاً
        if hasattr(obj, 'reviews_count_annotated'):
            return obj.reviews_count_annotated
        return obj.review_product.count()

    def get_discount_percent(self, obj):
        return obj.discount_percentage

    def get_is_new(self, obj):
        return bool(obj.flag and obj.flag.name.lower() == 'new')

    def get_flag_name(self, obj):
        return obj.flag.name.lower() if obj.flag else None

    def get_description(self, obj):
        return obj.descriptions or obj.subtitle or ''


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'


class FlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flag
        fields = '__all__'


class FeaturedProductSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = FeaturedProduct
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class BundleItemSerializer(serializers.ModelSerializer):
    item_details = ProductSerializer(source='item', read_only=True)

    class Meta:
        model = BundleItem
        fields = '__all__'


class BundleSerializer(serializers.ModelSerializer):
    bundle_items_details = BundleItemSerializer(source='bundle_items', many=True, read_only=True)

    class Meta:
        model = Bundle
        fields = '__all__'
