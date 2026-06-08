import json
import os

cities = [
    # Punjab
    {"id": "lahore", "name": "Lahore", "province": "Punjab"},
    {"id": "faisalabad", "name": "Faisalabad", "province": "Punjab"},
    {"id": "rawalpindi", "name": "Rawalpindi", "province": "Punjab"},
    {"id": "gujranwala", "name": "Gujranwala", "province": "Punjab"},
    {"id": "multan", "name": "Multan", "province": "Punjab"},
    {"id": "bahawalpur", "name": "Bahawalpur", "province": "Punjab"},
    {"id": "sargodha", "name": "Sargodha", "province": "Punjab"},
    {"id": "sialkot", "name": "Sialkot", "province": "Punjab"},
    {"id": "sheikhupura", "name": "Sheikhupura", "province": "Punjab"},
    {"id": "rahim-yar-khan", "name": "Rahim Yar Khan", "province": "Punjab"},
    {"id": "jhang", "name": "Jhang", "province": "Punjab"},
    {"id": "dera-ghazi-khan", "name": "Dera Ghazi Khan", "province": "Punjab"},
    {"id": "gujrat", "name": "Gujrat", "province": "Punjab"},
    {"id": "sahiwal", "name": "Sahiwal", "province": "Punjab"},
    {"id": "okara", "name": "Okara", "province": "Punjab"},
    {"id": "kasur", "name": "Kasur", "province": "Punjab"},
    {"id": "chiniot", "name": "Chiniot", "province": "Punjab"},
    {"id": "kamoke", "name": "Kamoke", "province": "Punjab"},
    {"id": "hafizabad", "name": "Hafizabad", "province": "Punjab"},
    {"id": "sadeqabad", "name": "Sadeqabad", "province": "Punjab"},
    {"id": "burewala", "name": "Burewala", "province": "Punjab"},
    {"id": "mandi-bahauddin", "name": "Mandi Bahauddin", "province": "Punjab"},
    {"id": "vehari", "name": "Vehari", "province": "Punjab"},
    {"id": "daska", "name": "Daska", "province": "Punjab"},
    {"id": "pakpattan", "name": "Pakpattan", "province": "Punjab"},
    
    # Sindh
    {"id": "karachi", "name": "Karachi", "province": "Sindh"},
    {"id": "hyderabad", "name": "Hyderabad", "province": "Sindh"},
    {"id": "sukkur", "name": "Sukkur", "province": "Sindh"},
    {"id": "larkana", "name": "Larkana", "province": "Sindh"},
    {"id": "nawabshah", "name": "Nawabshah", "province": "Sindh"},
    {"id": "mirpur-khas", "name": "Mirpur Khas", "province": "Sindh"},
    {"id": "jacobabad", "name": "Jacobabad", "province": "Sindh"},
    {"id": "shikarpur", "name": "Shikarpur", "province": "Sindh"},
    {"id": "khairpur", "name": "Khairpur", "province": "Sindh"},
    {"id": "dadu", "name": "Dadu", "province": "Sindh"},
    {"id": "tando-adam", "name": "Tando Adam", "province": "Sindh"},
    {"id": "tando-allahyar", "name": "Tando Allahyar", "province": "Sindh"},

    # KPK
    {"id": "peshawar", "name": "Peshawar", "province": "Khyber Pakhtunkhwa"},
    {"id": "mardan", "name": "Mardan", "province": "Khyber Pakhtunkhwa"},
    {"id": "mingora", "name": "Mingora (Swat)", "province": "Khyber Pakhtunkhwa"},
    {"id": "kohat", "name": "Kohat", "province": "Khyber Pakhtunkhwa"},
    {"id": "abbottabad", "name": "Abbottabad", "province": "Khyber Pakhtunkhwa"},
    {"id": "dera-ismail-khan", "name": "Dera Ismail Khan", "province": "Khyber Pakhtunkhwa"},
    {"id": "nowshera", "name": "Nowshera", "province": "Khyber Pakhtunkhwa"},
    {"id": "swabi", "name": "Swabi", "province": "Khyber Pakhtunkhwa"},

    # Balochistan
    {"id": "quetta", "name": "Quetta", "province": "Balochistan"},
    {"id": "turbat", "name": "Turbat", "province": "Balochistan"},
    {"id": "khuzdar", "name": "Khuzdar", "province": "Balochistan"},
    {"id": "chaman", "name": "Chaman", "province": "Balochistan"},

    # Capital
    {"id": "islamabad", "name": "Islamabad", "province": "Capital Territory"}
]

# Read template structure
with open('/Users/pc/Downloads/arb-farms-ecommerce-main/city-landing/index.html', 'r') as f:
    template = f.read()

header_end = template.find('</nav>') + 6
footer_start = template.find('<footer')

provinces = {}
for c in cities:
    p = c['province']
    if p not in provinces:
        provinces[p] = []
    provinces[p].append(c)

# We want 3 columns mostly, using masonary or just flex wrapping.
html_list = ""
delay = 0.1
for province, city_list in provinces.items():
    html_list += f"""
    <div class="col-md-6 col-lg-4 mb-4 fade-in-up" style="animation-delay: {delay}s;">
      <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden province-card">
        <div class="card-header bg-forest text-gold border-0 py-3">
          <h3 class="h4 font-primary mb-0 d-flex align-items-center">
            <i class="bi bi-map-fill me-2 fs-5"></i> {province}
          </h3>
        </div>
        <div class="card-body bg-white p-4">
          <ul class="list-unstyled mb-0 city-list">
    """
    for city in city_list:
        html_list += f"""
            <li class="mb-2">
              <a href="/delivery/{city["id"]}" class="city-link d-flex align-items-center text-decoration-none p-2 rounded-3">
                <div class="icon-box bg-light rounded-circle d-flex align-items-center justify-content-center me-3">
                  <i class="bi bi-geo-alt-fill text-forest"></i>
                </div>
                <span class="fw-medium text-dark">{city["name"]}</span>
                <i class="bi bi-chevron-right ms-auto text-muted small transition-arrow"></i>
              </a>
            </li>
        """
    html_list += """
          </ul>
        </div>
      </div>
    </div>
    """
    delay += 0.1

custom_css = """
  <style>
    :root {
      --color-forest: #2b422a; /* Brand forest green */
      --color-gold: #c29d59; /* Brand gold */
    }
    .bg-forest { background-color: var(--color-forest) !important; }
    .text-forest { color: var(--color-forest) !important; }
    .text-gold { color: var(--color-gold) !important; }
    
    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
    
    /* Hero Section */
    .delivery-hero {
      background: linear-gradient(135deg, var(--color-forest) 0%, #1a2a1a 100%);
      position: relative;
    }
    .delivery-hero::after {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: url('data:image/svg+xml;utf8,<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)"/></svg>');
      pointer-events: none;
    }
    
    /* Cards */
    .province-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .province-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
    }
    
    /* City Links */
    .icon-box {
      width: 32px;
      height: 32px;
      transition: all 0.3s ease;
    }
    .city-link {
      transition: all 0.3s ease;
      background: transparent;
    }
    .city-link:hover {
      background: #f8f9fa; /* light grey on hover */
      transform: translateX(5px);
    }
    .city-link:hover .icon-box {
      background: var(--color-forest) !important;
    }
    .city-link:hover .icon-box i {
      color: var(--color-gold) !important;
    }
    .city-link:hover span {
      color: var(--color-forest) !important;
    }
    .transition-arrow {
      transition: transform 0.3s ease, color 0.3s ease;
    }
    .city-link:hover .transition-arrow {
      transform: translateX(3px);
      color: var(--color-forest) !important;
    }
  </style>
"""

new_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nationwide Delivery Directory | ARB Farms Pakistan</title>
  <meta name="description" content="Find ARB Farms delivery options and shipping times for all major cities across Pakistan.">
  <link rel="canonical" href="https://arbfarms.com/delivery/">
  
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="/css/index.css" rel="stylesheet">
""" + custom_css + """
</head>
<body class="d-flex flex-column min-vh-100 bg-light">
""" + template[template.find('<nav'):header_end] + """

  <section class="delivery-hero py-5 text-white text-center fade-in-up" style="animation-delay: 0s;">
    <div class="container py-md-5 position-relative z-1">
      <div class="d-inline-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-1 mb-3">
        <span class="badge bg-gold text-forest rounded-pill me-2">NEW</span>
        <span class="small font-primary tracking-wide">Nationwide Network</span>
      </div>
      <h1 class="display-4 font-primary mb-3 text-gold">Delivery Locations Directory</h1>
      <p class="lead text-white-50 mx-auto" style="max-width: 650px;">
        We deliver our premium organic produce and livestock feed to 50 cities across Pakistan. Select your city to explore exclusive delivery times and local specials.
      </p>
    </div>
  </section>

  <section class="container py-5 my-md-2">
    <div class="row g-4 justify-content-center" masonry data-masonry='{"percentPosition": true }'>
""" + html_list + """
    </div>
  </section>

""" + template[footer_start:]

# Remove the city-logic injected script at the bottom since this is the hub page, not a specific city page
# It starts around `document.addEventListener('DOMContentLoaded', () => {`
start_script = new_content.find('<script src="/js/cities-db.js"></script>')
if start_script != -1:
    end_script = new_content.find('</script>\n</body>', start_script)
    if end_script != -1:
        new_content = new_content[:start_script] + new_content[end_script+10:]

# Ensure masonary script is added if needed, or we just rely on flex layout (we used standard cols).
# We can just append masonry CDN if we want a true masonry layout, but row g-4 handles it fine for now.
masonry_script = '<script src="https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js" async></script>\n</body>'
new_content = new_content.replace('</body>', masonry_script)


with open('/Users/pc/Downloads/arb-farms-ecommerce-main/delivery/index.html', 'w') as f:
    f.write(new_content)

print("Generated beautiful /delivery/index.html")
