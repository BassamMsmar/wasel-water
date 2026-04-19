from decimal import Decimal
from django.conf import settings
from products.models import Product, Bundle

class Cart:
    def __init__(self, request):
        """
        Initialize the cart.
        """
        self.session = request.session
        self.session_id = getattr(settings, 'CART_SESSION_ID', 'cart')
        cart = self.session.get(self.session_id)
        if not cart:
            # save an empty cart in the session
            cart = self.session[self.session_id] = {}
        self.cart = cart

    def add(self, product, quantity=1, override_quantity=False, item_type='product'):
        """
        Add a product or bundle to the cart or update its quantity.
        """
        item_id = str(product.id)
        # Create a unique key combining type and ID
        cart_key = f"{item_type}_{item_id}"
        
        if cart_key not in self.cart:
            # Determine price based on object type
            price = getattr(product, 'new_price', 0)
            if item_type == 'bundle':
                price = product.total_price  # Bundle property
                
            self.cart[cart_key] = {
                'quantity': 0,
                'price': str(price),
                'item_type': item_type,
                'id': item_id
            }
            
        if override_quantity:
            self.cart[cart_key]['quantity'] = quantity
        else:
            self.cart[cart_key]['quantity'] += quantity
        self.save()

    def save(self):
        # mark the session as "modified" to make sure it gets saved
        self.session.modified = True

    def remove(self, product_id, item_type='product'):
        """
        Remove a product from the cart.
        """
        cart_key = f"{item_type}_{str(product_id)}"
        if cart_key in self.cart:
            del self.cart[cart_key]
            self.save()

    def __iter__(self):
        """
        Iterate over the items in the cart and get the products/bundles from the database.
        """
        product_ids = []
        bundle_ids = []
        
        # Categorize IDs
        for key, item in self.cart.items():
            if item.get('item_type') == 'bundle':
                bundle_ids.append(item['id'])
            else:
                # Default to product if no type or type is product
                product_ids.append(item.get('id', key)) # Fallback for old keys

        products = Product.objects.filter(id__in=product_ids)
        bundles = Bundle.objects.filter(id__in=bundle_ids)
        
        # Helper to find object
        def get_obj(obj_list, obj_id):
            for obj in obj_list:
                if str(obj.id) == str(obj_id):
                    return obj
            return None

        cart_copy = self.cart.copy()
        
        for key, item in cart_copy.items():
            item = item.copy() # IMPORTANT: Work on a copy to avoid modifying the session
            item_type = item.get('item_type', 'product')
            obj_id = item.get('id', key)
            
            if item_type == 'bundle':
                obj = get_obj(bundles, obj_id)
            else:
                obj = get_obj(products, obj_id)
                
            if obj:
                item['product'] = obj # naming it 'product' for template compatibility
                item['price'] = Decimal(item['price'])
                item['total_price'] = item['price'] * item['quantity']
                yield item

    def __len__(self):
        """
        Count all items in the cart.
        """
        return sum(item['quantity'] for item in self.cart.values())

    def get_total_price(self):
        return sum(Decimal(item['price']) * item['quantity'] for item in self.cart.values())

    def clear(self):
        # remove cart from session
        session_id = getattr(settings, 'CART_SESSION_ID', 'cart')
        if session_id in self.session:
            del self.session[session_id]
        self.save()
