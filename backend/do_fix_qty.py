import re

def insert_qty_selector(html):
    # Pattern to find the form
    form_pattern = re.compile(r'<form action="{% url \'cart:cart_add\' %}" method="POST" class="add-to-cart-form m-0">[\s\S]*?<input type="hidden" name="quantity" value="1">\s*<button type="submit"[^>]*>[\s\S]*?</button>\s*</form>')
    
    qty_replacement = '''<form action="{% url 'cart:cart_add' %}" method="POST" class="add-to-cart-form m-0">
                {% csrf_token %}
                <input type="hidden" name="product_id" value="{{ product.id }}">
                <input type="hidden" name="item_type" value="product">
                
                <div class="d-flex align-items-center gap-2">
                  <div class="quantity-wrapper d-flex align-items-center border rounded-pill" style="height: 38px; width: 85px; background: #f8f9fa;">
                    <button class="btn btn-link text-dark p-0 w-25 btn-plus d-flex justify-content-center align-items-center text-decoration-none" type="button" style="font-size: 1.2rem;">+</button>
                    <input type="text" name="quantity" class="form-control text-center border-0 p-0 qty-input bg-transparent w-50" value="1" readonly style="font-size: 0.95rem; font-weight: bold; box-shadow: none;">
                    <button class="btn btn-link text-dark p-0 w-25 btn-minus d-flex justify-content-center align-items-center text-decoration-none" type="button" style="font-size: 1.2rem;">-</button>
                  </div>
                  
                  <button type="submit" class="btn btn-primary rounded-circle shadow-sm flex-shrink-0" style="width: 38px; height: 38px; padding: 0; display: flex; align-items: center; justify-content: center; background: #004d7a; border: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="bi bi-cart-plus" style="font-size: 1.2rem;"></i>
                  </button>
                </div>
              </form>'''
    
    return form_pattern.sub(qty_replacement, html)

def remove_brand_border(html):
    html = html.replace('class="pcard-brand text-muted mb-1 d-block"', 'class="text-muted mb-1 d-block" style="border:none; background:transparent; padding:0;"')
    html = html.replace('class="item-tag text-muted mb-1 d-block"', 'class="text-muted mb-1 d-block" style="border:none; background:transparent; padding:0;"')
    return html

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = insert_qty_selector(content)
    content = remove_brand_border(content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

process_file(r"E:\Code\wasel-water\backend\templates\home.html")
process_file(r"E:\Code\wasel-water\backend\templates\products\product_list.html")
print("Updated successfully.")
