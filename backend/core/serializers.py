from rest_framework import serializers
from .models import Section, Company, Banner
from products.serializers import ProductSerializer

class SectionSerializer(serializers.ModelSerializer):
    products_details = ProductSerializer(source='products', many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'
