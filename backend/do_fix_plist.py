import re

def reformat_cards(file_path, is_item_card=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace the body of the cards. 
    # For home.html, it's <div class="pcard-body"> ... </div>
    # For product_list.html, it's <div class="item-info ..."> ... </div>
    
    # We will use Regex to capture and replace. Since there are multiple occurrences, we iterate.
    
    if is_item_card:
        # For product_list.html
        pattern = re.compile(r'<div class="item-info text-center p-3">.*?</article>', re.DOTALL)
        
        replacement = '''<div class="item-info p-3 text-end" style="background:#fff; border-top: 1px solid #f1f3f5;">
              <span class="item-tag text-muted mb-1 d-block" style="font-size: 0.75rem;">{{ product.brand.name|default:"عام" }}</span>
              <h4 class="item-name fw-bold mb-2" style="font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 42px; line-height: 1.4;"><a href="{% url 'products:product_detail' product.slug %}" class="text-dark text-decoration-none">{{ product.name }}</a></h4>
              <div class="d-flex justify-content-between align-items-end mt-3">
                <div class="pricing">
                  <div class="item-cost fw-bold text-primary" style="font-size: 1.2rem; line-height: 1;">{{ product.new_price|floatformat:0 }} <small>ر.س</small></div>
                  {% if product.old_price > product.new_price %}
                  <del class="was-price text-muted mt-1 d-block" style="font-size: 0.8rem;">{{ product.old_price|floatformat:0 }} ر.س</del>
                  {% endif %}
                </div>
                <div class="item-actions">
                  <form action="{% url 'cart:cart_add' %}" method="POST" class="add-to-cart-form m-0">
                    {% csrf_token %}
                    <input type="hidden" name="product_id" value="{{ product.id }}">
                    <input type="hidden" name="item_type" value="product">
                    <input type="hidden" name="quantity" value="1">
                    <button type="submit" class="btn btn-primary rounded-circle shadow-sm" style="width: 38px; height: 38px; padding: 0; display: flex; align-items: center; justify-content: center; background: #004d7a; border: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                      <i class="bi bi-cart-plus" style="font-size: 1.2rem;"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </article>'''
        content = pattern.sub(replacement, content)
        
    else:
        # For home.html
        pattern = re.compile(r'<div class="pcard-body">.*?</div>\s*</div>\s*</div>', re.DOTALL)
        
        # We need to make sure we only match the pcard-body and not spill over.
        # It's better to process using a more targeted sub.
        # In home.html: 
        # <div class="pcard-body"> ... upto ... </div> </div> </div>
        # Actually, let's just do a string split/replace if possible, or targeted regex
        pass

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

reformat_cards(r"E:\Code\wasel-water\backend\templates\products\product_list.html", True)
print("done prod list")
