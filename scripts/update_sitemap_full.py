import re
import os
from datetime import datetime

base_path = '/Users/pc/Downloads/arb-farms-ecommerce-main'

# Core pages
core_pages = [
    '', 'shop', 'about', 'compare', 'calculator', 'contact', 'delivery'
]

# Extract product IDs
with open(os.path.join(base_path, 'js', 'products-db.js'), 'r') as f:
    products_db_content = f.read()

match = re.search(r'const productsDb = \[(.*?)\];', products_db_content, re.DOTALL)
if match:
    block = match.group(1)
    product_ids = re.findall(r'id:\s*"([^"]+)"', block)
else:
    product_ids = []

# Extract city IDs
with open(os.path.join(base_path, 'js', 'cities-db.js'), 'r') as f:
    cities_db_content = f.read()

city_ids = re.findall(r'"id":\s*"([^"]+)"', cities_db_content)

today = datetime.now().strftime('%Y-%m-%d')

xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

# Core Pages
xml += '  <!-- Core Pages -->\n'
for page in core_pages:
    url_path = f'/{page}' if page else ''
    priority = '1.0' if not page else '0.8'
    xml += f"""  <url>
    <loc>https://arbfarms.com{url_path}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>{priority}</priority>
  </url>\n"""

# Product Pages
xml += '  <!-- Product Pages -->\n'
for pid in product_ids:
    xml += f"""  <url>
    <loc>https://arbfarms.com/product/{pid}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n"""

# City Pages
xml += '  <!-- Programmatic City Landing Pages -->\n'
for cid in city_ids:
    xml += f"""  <url>
    <loc>https://arbfarms.com/delivery/{cid}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n"""

xml += '</urlset>\n'

with open(os.path.join(base_path, 'sitemap.xml'), 'w') as f:
    f.write(xml)

print(f"Sitemap generated successfully. Added {len(core_pages)} core pages, {len(product_ids)} products, and {len(city_ids)} city landing pages.")
