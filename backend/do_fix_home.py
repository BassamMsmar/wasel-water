import re

file_path = r"E:\Code\wasel-water\backend\templates\home.html"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace everything starting from <div class="pcard-body"> down to the closing </div> of <div class="col-lg-...">
# Actually the easiest way is to match <div class="pcard-body"> until its matching </div> OR since we know it ends with </a>\s*</div>
pattern = re.compile(r'<div class="pcard-body">.*?</a>\s*</div>', re.DOTALL)

replacement = '''<div class="pcard-body p-3 text-end" style="background:#fff; border-top: 1px solid #f1f3f5;">
            <span class="pcard-brand text-muted mb-1 d-block" style="font-size: 0.75rem;">{{ product.brand.name|default:"عام" }}</span>
            <h6 class="pcard-name fw-bold mb-2" style="font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 42px; line-height: 1.4;"><a href="{% url 'products:product_detail' product.slug %}" class="text-dark text-decoration-none">{{ product.name }}</a></h6>
            
            <div class="d-flex justify-content-between align-items-end mt-3">
              <div class="pcard-price">
                <div class="fw-bold text-primary" style="font-size: 1.2rem; line-height: 1;">{{ product.new_price|floatformat:0 }} <small>ر.س</small></div>
                {% if product.old_price > product.new_price %}
                <del class="text-muted mt-1 d-block" style="font-size: 0.8rem;">{{ product.old_price|floatformat:0 }} ر.س</del>
                {% endif %}
              </div>
              
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
          </div>'''

new_content = pattern.sub(replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Replaced {len(pattern.findall(content))} occurrences in home.html")
