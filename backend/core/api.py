from rest_framework import viewsets
from .models import Section, Company, Banner
from .serializers import SectionSerializer, CompanySerializer, BannerSerializer


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.filter(active=True).order_by('ordering', 'id')
    serializer_class = SectionSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all().order_by('id')
    serializer_class = CompanySerializer


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all().order_by('id')
    serializer_class = BannerSerializer
