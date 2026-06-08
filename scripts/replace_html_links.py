import os
import re

directory = '/Users/pc/Downloads/arb-farms-ecommerce-main'
files_to_process = [f for f in os.listdir(directory) if f.endswith('.html')]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Replace href="index.html" with href="/"
    content = re.sub(r'href="(\.\./)*index\.html"', 'href="/"', content)
    
    # 2. Replace href="page.html" with href="/page"
    def replacer(match):
        url = match.group(1)
        if url.startswith('http'):
            return f'href="{url}.html"'
        return f'href="{url}"'

    content = re.sub(r'href="([^"]+)\.html"', replacer, content)

    # 3. Replace href="product/detail?id=X" -> href="/product/X"
    def product_replacer(match):
        slug = match.group(1)
        return f'href="/product/{slug}"'

    content = re.sub(r'href="(?:(?:\.\./)+)?(?:/)?product/detail\?id=([^"&]+)"', product_replacer, content)

    with open(filepath, 'w') as f:
        f.write(content)

for f in files_to_process:
    process_file(os.path.join(directory, f))

detail_path = os.path.join(directory, 'product/detail/index.html')
if os.path.exists(detail_path):
    process_file(detail_path)

print("Done")
