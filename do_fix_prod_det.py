import re

path = r"E:\Code\wasel-water\backend\templates\products\product_detail.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS
css_addition = '''  .add-cart-btn {
    background: linear-gradient(135deg, #004d7a 0%, #00b4d8 100%);
    color: #fff; border-radius: 50px; font-weight: bold; font-size: 1.1rem; padding: 12px 20px;
    border: none; transition: 0.3s;
  }
  .add-cart-btn:hover {
    transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 180, 216, 0.2); color: #fff;
  }
  .price-block {
    display: flex; align-items: center; gap: 15px; margin: 20px 0; padding: 15px;
    background: #f8f9fa; border-radius: 12px; border-right: 4px solid #00b4d8; border-left: none;
  }
  .price-block .current-price { font-size: 2rem; font-weight: 800; color: #004d7a; line-height: 1; }
  .price-block .original-price { font-size: 1.2rem; color: #6c757d; text-decoration: line-through; }
  .savings-pill { background: #28a745; color: white; padding: 4px 12px; border-radius: 50px; font-size: 0.85rem; font-weight: bold; }
  .perks-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px;
    margin-top: 2rem; border-top: 1px solid #eee; padding-top: 20px;
  }
  .perk-card {
    text-align: center; padding: 15px 10px; background: #f8f9fa; border-radius: 12px;
    transition: 0.3s; border: 1px solid #e9ecef;
  }
  .perk-card:hover { background: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-color: #00b4d8; }
  .perk-card i { font-size: 1.8rem; color: #004d7a; margin-bottom: 10px; display: block; }
  .perk-card span { font-size: 0.85rem; font-weight: 600; color: #333; }
  .main-image-container { position: relative; border: 1px solid #00b4d8; border-radius: 16px; padding: 20px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: visible; }
  .image-zoom-container { position: absolute; top: 0; right: 105%; width: 100%; height: 100%; z-index: 1000; pointer-events: none; box-shadow: 0 5px 25px rgba(0,0,0,0.15); background: #fff; border-radius: 12px; opacity: 0; transition: opacity 0.2s; }
  .image-zoom-container.drift-active { opacity: 1; pointer-events: auto; }
'''

# Replace old CSS block with new one
content = re.sub(r'\.add-cart-btn \{.*?\}(?=\s*</style>)', css_addition.replace('\\', '\\\\'), content, flags=re.DOTALL)

# 2. Update JS 
js_addition = '''
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Drift Zoom Initialization
  if (typeof Drift !== 'undefined') {
    const zoomElement = document.querySelector('.drift-zoom');
    const paneContainer = document.querySelector('.image-zoom-container');
    if (zoomElement && paneContainer) {
      new Drift(zoomElement, {
        paneContainer: paneContainer,
        inlinePane: 900,
        inlineOffsetY: -85,
        containInline: true,
        hoverBoundingBox: true,
        onShow: function() { paneContainer.classList.add('drift-active'); },
        onHide: function() { paneContainer.classList.remove('drift-active'); }
      });
    }
  } else {
    console.warn("Drift library not loaded.");
  }
  
  // Gallery thumbnails logic
  const thumbs = document.querySelectorAll('.thumb-item');
  const mainImage = document.getElementById('main-product-image');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', function() {
      thumbs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const imgUrl = this.getAttribute('data-image');
      mainImage.src = imgUrl;
      mainImage.setAttribute('data-zoom', imgUrl);
    });
  });
});
</script>
'''

content = re.sub(r'\{%\s*block\s+extra_js\s*%\}', '{% block extra_js %}' + js_addition.replace('\\', '\\\\'), content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated product_detail.html")
