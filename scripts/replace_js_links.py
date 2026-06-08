import os
import re

directory = '/Users/pc/Downloads/arb-farms-ecommerce-main/js'
files_to_process = [f for f in os.listdir(directory) if f.endswith('.js')]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Replace "index.html" with "/"
    content = re.sub(r'(\.\./)*index\.html', '/', content)

    # 2. Replace ".html" internally in js
    # In JS, URLs might be in strings like `href="${prefix}checkout.html"`
    def html_replacer(match):
        url = match.group(1)
        if url.startswith('http'):
            return f'{url}.html'
        return f'{url}'

    content = re.sub(r'([^"\'`]+)\.html', html_replacer, content)

    # 3. Replace "product/detail?id=" or "../../product/detail?id=" -> "/product/"
    content = re.sub(r'(?:\.\./)?(?:\.\./)?product/detail\?id=([a-zA-Z0-9-]+)', r'/product/\1', content)

    with open(filepath, 'w') as f:
        f.write(content)

for f in files_to_process:
    process_file(os.path.join(directory, f))

print("Done JS")
