import re

cities = [
    # Punjab
    "lahore", "faisalabad", "rawalpindi", "gujranwala", "multan", "bahawalpur", "sargodha", "sialkot", 
    "sheikhupura", "rahim-yar-khan", "jhang", "dera-ghazi-khan", "gujrat", "sahiwal", "okara", "kasur", 
    "chiniot", "kamoke", "hafizabad", "sadeqabad", "burewala", "mandi-bahauddin", "vehari", "daska", "pakpattan",
    # Sindh
    "karachi", "hyderabad", "sukkur", "larkana", "nawabshah", "mirpur-khas", "jacobabad", "shikarpur", 
    "khairpur", "dadu", "tando-adam", "tando-allahyar",
    # KPK
    "peshawar", "mardan", "mingora", "kohat", "abbottabad", "dera-ismail-khan", "nowshera", "swabi",
    # Balochistan
    "quetta", "turbat", "khuzdar", "chaman",
    # Capital
    "islamabad"
]

xml_urls = """
  <!-- Delivery Hub -->
  <url>
    <loc>https://arbfarms.com/delivery/</loc>
    <lastmod>2026-06-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
"""

for city in cities:
    xml_urls += f"""
  <url>
    <loc>https://arbfarms.com/delivery/{city}</loc>
    <lastmod>2026-06-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>"""

filepath = '/Users/pc/Downloads/arb-farms-ecommerce-main/sitemap.xml'
with open(filepath, 'r') as f:
    content = f.read()

if 'arbfarms.com/delivery/lahore' not in content:
    content = content.replace('</urlset>', xml_urls + '\n</urlset>')
    with open(filepath, 'w') as f:
        f.write(content)
    print("Sitemap updated.")
else:
    print("Sitemap already updated.")
