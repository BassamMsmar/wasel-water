from django.views.generic import TemplateView, View
from django.shortcuts import get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.http import require_POST
from products.models import Product, Bundle
from orders.models import Order, OrderItem
from .cart import Cart

# Create your views here.
class CartList(TemplateView):
    template_name = 'cart/cart_detail.html'

class CartCheckout(LoginRequiredMixin, TemplateView):
    template_name = 'cart/checkout.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['cart'] = Cart(self.request)
        if self.request.user.is_authenticated:
            context['addresses'] = self.request.user.addresses.all()
        return context

    def post(self, request, *args, **kwargs):
        cart = Cart(request)
        if len(cart) == 0:
            messages.error(request, "سلة المشتريات فارغة")
            return redirect('cart:cart_detail')

        # Extract all POST fields first
        selected_address_id = request.POST.get('selected_address_id')
        new_location_link = request.POST.get('new_location_link')
        country = request.POST.get('country', '')
        postal_code = request.POST.get('postal_code', '')
        latitude = request.POST.get('latitude') or None
        longitude = request.POST.get('longitude') or None

        if selected_address_id:
            # User chose a saved address
            address = get_object_or_404(self.request.user.addresses, id=selected_address_id)
            first_name = address.full_name.split()[0] if address.full_name else ''
            last_name = " ".join(address.full_name.split()[1:]) if address.full_name else ''
            phone = address.phone_number
            city = address.city
            full_address = f"{address.neighborhood or ''} {address.street or ''} {address.building_number or ''}".strip() or address.city
            location_link = address.location_link
            country = address.country or ''
            postal_code = address.postal_code or ''
            latitude = address.latitude
            longitude = address.longitude
            note = request.POST.get('note', '')
        else:
            first_name = request.POST.get('first_name', '')
            last_name = request.POST.get('last_name', '')
            phone = request.POST.get('phone', '')
            city = request.POST.get('city', '')
            neighborhood = request.POST.get('neighborhood', '')
            street = request.POST.get('street', '')
            building_number = request.POST.get('building_number', '')
            address_line = request.POST.get('address', '')
            note = request.POST.get('note', '')
            location_link = new_location_link or request.session.get('temp_location', '')

            # Build full address from components or fallback to address_line
            if neighborhood or street or building_number:
                full_address = f"{neighborhood} {street} {building_number}".strip()
            else:
                full_address = address_line or city

            # Auto-save address for authenticated users if coords available
            if self.request.user.is_authenticated and latitude and longitude:
                from accounts.models import Address
                from decimal import Decimal, InvalidOperation
                try:
                    lat_dec = Decimal(str(latitude))
                    lng_dec = Decimal(str(longitude))
                    if not Address.objects.filter(user=self.request.user, latitude=lat_dec, longitude=lng_dec).exists():
                        Address.objects.create(
                            user=self.request.user,
                            full_name=f"{first_name} {last_name}".strip(),
                            phone_number=phone,
                            city=city,
                            country=country,
                            neighborhood=neighborhood,
                            street=street,
                            building_number=building_number,
                            postal_code=postal_code,
                            latitude=lat_dec,
                            longitude=lng_dec,
                            is_default=not self.request.user.addresses.exists()
                        )
                except (InvalidOperation, Exception):
                    pass

        if note:
             full_address += f" - ملاحظات: {note}"

        # Create Order
        order = Order.objects.create(
            user=request.user,
            shipping_full_name=f"{first_name} {last_name}",
            shipping_phone=phone,
            shipping_city=city,
            shipping_country=country,
            shipping_postal_code=postal_code,
            shipping_address=full_address,
            shipping_latitude=latitude,
            shipping_longitude=longitude,
            shipping_location_link=location_link,
            total_price=cart.get_total_price(),
            status='pending'
        )

        # Create OrderItems
        for item in cart:
             try:
                 item_type = item.get('item_type', 'product')
                 
                 # item['product'] is the actual object (Product or Bundle) because of Cart.__iter__
                 product_obj = item['product']
                 
                 offset_quantity = int(item['quantity'])
                 price = item['price']

                 if item_type == 'bundle':
                     OrderItem.objects.create(
                         order=order,
                         bundle=product_obj,
                         price=price,
                         quantity=offset_quantity
                     )
                 else:
                     OrderItem.objects.create(
                         order=order,
                         product=product_obj,
                         price=price,
                         quantity=offset_quantity
                     )
             except Exception as e:
                 # Log error? checking next item
                 continue

        # Clear Cart
        cart.clear()
        
        messages.success(request, "تم استلام الطلب، الرجاء اختيار طريقة الدفع")
        # Redirect to payment selection
        return redirect('orders:payment_selection', pk=order.id)

from django.template.loader import render_to_string

@require_POST
def cart_add(request):
    cart = Cart(request)
    product_id = request.POST.get('product_id')
    item_type = request.POST.get('item_type', 'product') # Default to product
    quantity = int(request.POST.get('quantity', 1))
    
    if not product_id:
        return JsonResponse({'error': 'No ID provided'}, status=400)
        
    try:
        if item_type == 'bundle':
            product = get_object_or_404(Bundle, id=product_id)
        else:
            product = get_object_or_404(Product, id=product_id)
            
        cart.add(product=product, quantity=quantity, override_quantity=False, item_type=item_type)
        
        # Generate the updated cart HTML
        cart_html = render_to_string('cart/partials/sidebar_cart.html', {'cart': cart}, request=request)
        
        return JsonResponse({
            'success': True, 
            'cart_count': len(cart),
            'cart_html': cart_html,
            'message': 'تمت الإضافة للسلة بنجاح'
        })
    except Exception as e:
         return JsonResponse({'error': str(e)}, status=500)

@require_POST
def cart_update(request):
    try:
        cart = Cart(request)
        product_id = request.POST.get('product_id')
        quantity = int(request.POST.get('quantity'))
        item_type = request.POST.get('item_type', 'product')
        
        if item_type == 'bundle':
            product = get_object_or_404(Bundle, id=product_id)
        else:
            product = get_object_or_404(Product, id=product_id)
            
        cart.add(product=product, quantity=quantity, override_quantity=True, item_type=item_type)

        cart_html = render_to_string('cart/partials/sidebar_cart.html', {'cart': cart}, request=request)
        
        cart_key = f"{item_type}_{product_id}"
        item_total = float(cart.cart[cart_key]['price']) * quantity if cart_key in cart.cart else 0

        return JsonResponse({
            'qty': len(cart), 
            'message': 'تم تحديث السلة',
            'cart_html': cart_html,
            'total_price': cart.get_total_price(),
            'item_total': item_total
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_POST
def cart_remove(request):
    try:
        cart = Cart(request)
        product_id = request.POST.get('product_id')
        item_type = request.POST.get('item_type', 'product')
        
        # We don't need to fetch the object to remove it, just ID and type
        cart.remove(product_id, item_type=item_type)
        
        cart_html = render_to_string('cart/partials/sidebar_cart.html', {'cart': cart}, request=request)
        
        return JsonResponse({
            'success': True,
            'cart_count': len(cart),
            'cart_html': cart_html,
            'cart_total': cart.get_total_price(),
            'message': 'Item removed'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
