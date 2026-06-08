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

# Create Tabs Navigation
tabs_nav_html = '<ul class="nav nav-pills custom-tabs flex-nowrap overflow-auto hide-scrollbar mb-4 pb-2" id="provinceTabs" role="tablist">\n'
is_first = True
for idx, province in enumerate(provinces.keys()):
    active_cls = "active" if is_first else ""
    aria_sel = "true" if is_first else "false"
    tab_id = province.lower().replace(" ", "-")
    tabs_nav_html += f'''
    <li class="nav-item" role="presentation">
      <button class="nav-link {active_cls} rounded-pill px-4 py-2 me-2 font-primary whitespace-nowrap" id="{tab_id}-tab" data-bs-toggle="tab" data-bs-target="#{tab_id}" type="button" role="tab" aria-controls="{tab_id}" aria-selected="{aria_sel}">{province}</button>
    </li>
    '''
    is_first = False
tabs_nav_html += '</ul>\n'

# Create Tabs Content
tabs_content_html = '<div class="tab-content" id="provinceTabsContent">\n'
is_first = True
for province, city_list in provinces.items():
    active_cls = "show active" if is_first else ""
    tab_id = province.lower().replace(" ", "-")
    
    tabs_content_html += f'''
    <div class="tab-pane fade {active_cls}" id="{tab_id}" role="tabpanel" aria-labelledby="{tab_id}-tab">
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden province-card">
        <div class="card-body bg-white p-4">
          <div class="row g-3" id="city-list-{tab_id}">
    '''
    for city in city_list:
        tabs_content_html += f'''
            <div class="col-12 col-sm-6 col-lg-4 city-item" data-name="{city["name"].lower()}">
              <a href="/delivery/{city["id"]}" class="city-link d-flex align-items-center text-decoration-none p-3 rounded-3 border bg-light h-100">
                <div class="icon-box bg-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm">
                  <i class="bi bi-geo-alt-fill text-forest"></i>
                </div>
                <span class="fw-medium text-dark flex-grow-1">{city["name"]}</span>
                <i class="bi bi-chevron-right ms-auto text-muted small transition-arrow"></i>
              </a>
            </div>
        '''
    tabs_content_html += '''
          </div>
        </div>
      </div>
    </div>
    '''
    is_first = False
tabs_content_html += '</div>\n'

custom_css = """
  <style>
    :root {
      --color-forest: #2b422a;
      --color-gold: #c29d59;
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

    /* Search Bar */
    .search-wrapper {
      margin-top: -30px;
      position: relative;
      z-index: 10;
    }
    .search-input {
      border: 2px solid transparent;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border-radius: 50rem !important;
    }
    .search-input:focus {
      border-color: var(--color-gold);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
      outline: none;
    }
    
    /* Tabs */
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .whitespace-nowrap {
      white-space: nowrap;
    }
    .custom-tabs .nav-link {
      color: var(--color-forest);
      background-color: #fff;
      border: 1px solid #dee2e6;
      transition: all 0.3s ease;
    }
    .custom-tabs .nav-link:hover {
      background-color: #f8f9fa;
      border-color: var(--color-forest);
    }
    .custom-tabs .nav-link.active {
      background-color: var(--color-forest);
      color: var(--color-gold);
      border-color: var(--color-forest);
      box-shadow: 0 5px 15px rgba(43, 66, 42, 0.2);
    }
    
    /* City Links */
    .icon-box {
      width: 36px;
      height: 36px;
      transition: all 0.3s ease;
    }
    .city-link {
      transition: all 0.3s ease;
    }
    .city-link:hover {
      background: #fff !important;
      border-color: var(--color-gold) !important;
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
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

    /* Global Search Results state */
    .global-search-mode .nav-pills {
      display: none !important;
    }
    .global-search-mode .tab-content > .tab-pane {
      display: block !important;
      opacity: 1 !important;
    }
    .global-search-mode .province-card {
      box-shadow: none !important;
      background: transparent !important;
    }
    .global-search-mode .card-body {
      padding: 0 !important;
      background: transparent !important;
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
    <div class="container py-md-5 position-relative z-1 mb-4">
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

  <!-- Search Bar -->
  <div class="container search-wrapper fade-in-up" style="animation-delay: 0.1s;">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="position-relative">
          <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted fs-5"></i>
          <input type="text" id="citySearchInput" class="form-control form-control-lg search-input ps-5 py-3" placeholder="Search for your city (e.g. Lahore, Karachi)..." autocomplete="off">
        </div>
      </div>
    </div>
  </div>

  <section class="container py-5 mt-3 fade-in-up" style="animation-delay: 0.2s;" id="directoryContainer">
""" + tabs_nav_html + tabs_content_html + """
    
    <!-- Empty State for Search -->
    <div id="noResults" class="text-center py-5 d-none">
        <i class="bi bi-emoji-frown display-1 text-muted mb-3 d-block"></i>
        <h3 class="h4 text-dark font-primary">No cities found</h3>
        <p class="text-muted">We couldn't find a city matching your search. Please try another name.</p>
    </div>
  </section>

""" + template[footer_start:]

# Inject JS for search functionality right before </body>
search_js = """
  <!-- Delivery Directory Logic -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const searchInput = document.getElementById('citySearchInput');
      const directoryContainer = document.getElementById('directoryContainer');
      const cityItems = document.querySelectorAll('.city-item');
      const noResults = document.getElementById('noResults');
      
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length > 0) {
            // Enter global search mode (hide tabs, show all panes)
            directoryContainer.classList.add('global-search-mode');
            let hasResults = false;
            
            cityItems.forEach(item => {
                const name = item.getAttribute('data-name');
                if (name.includes(query)) {
                    item.style.display = 'block';
                    hasResults = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            if (hasResults) {
                noResults.classList.add('d-none');
            } else {
                noResults.classList.remove('d-none');
            }
        } else {
            // Exit global search mode
            directoryContainer.classList.remove('global-search-mode');
            noResults.classList.add('d-none');
            cityItems.forEach(item => {
                item.style.display = 'block';
            });
        }
      });
    });
  </script>
</body>
"""

new_content = new_content.replace('</body>', search_js)

with open('/Users/pc/Downloads/arb-farms-ecommerce-main/delivery/index.html', 'w') as f:
    f.write(new_content)

print("Generated completely refactored /delivery/index.html with Tabs and Dynamic Search")
