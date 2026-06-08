import os
import glob

base_path = '/Users/pc/Downloads/arb-farms-ecommerce-main'
html_files = glob.glob(os.path.join(base_path, '**', '*.html'), recursive=True)

delivery_link = '<li><a href="/delivery" class="text-white-50 text-decoration-none">Nationwide Delivery Hub</a></li>\n            '

updated_count = 0

for filepath in html_files:
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # Check for the main pattern
    search_pattern_1 = '<li><a href="legal/shipping-policy"'
    if search_pattern_1 in content and '/delivery"' not in content[content.find(search_pattern_1)-200:content.find(search_pattern_1)]:
        content = content.replace(search_pattern_1, delivery_link + search_pattern_1)
        
    search_pattern_2 = '<li><a href="../legal/shipping-policy.html"'
    if search_pattern_2 in content and '/delivery"' not in content[content.find(search_pattern_2)-200:content.find(search_pattern_2)]:
        content = content.replace(search_pattern_2, delivery_link + search_pattern_2)

    search_pattern_3 = '<li><a href="/legal/shipping-policy"'
    if search_pattern_3 in content and '/delivery"' not in content[content.find(search_pattern_3)-200:content.find(search_pattern_3)]:
        content = content.replace(search_pattern_3, delivery_link + search_pattern_3)

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        updated_count += 1

print(f"Updated footer in {updated_count} HTML files.")
