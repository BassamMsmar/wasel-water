from .models import Brand, Category

def brands(request):
    """
    Context processor to provide brands and categories to all templates.
    """
    brands = Brand.objects.all()
    categories = Category.objects.all()
    return {
        'brands': brands,
        'categories': categories
    }
