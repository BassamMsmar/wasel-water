import os
from PIL import Image

def convert_image_to_webp(image_path):
    img_name, ext = os.path.splitext(os.path.basename(image_path))
    webp_path = os.path.join(os.path.dirname(image_path), f'{img_name}.webp')
    
    with Image.open(image_path) as img:
        img = img.convert('RGB')
        img.save(webp_path, 'WEBP', quality=80)
    
    return webp_path
