import os

filepath = '/Users/pc/Downloads/arb-farms-ecommerce-main/city-landing/index.html'
with open(filepath, 'r') as f:
    content = f.read()

# We need a clean structure. Let's just create a new HTML file that includes the header and footer but a simplified body.
# To do this robustly, we can use the same header and footer from index.html.

header_end = content.find('</nav>') + 6
footer_start = content.find('<footer')

new_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title id="seo-title">Organic Farm Delivery | ARB Farms Pakistan</title>
  <meta name="description" id="seo-desc" content="Premium organic produce, edible seeds, and livestock feed delivered directly from our farms to your doorstep in Pakistan.">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="/css/index.css" rel="stylesheet">
</head>
<body class="d-flex flex-column min-vh-100">
""" + content[content.find('<nav'):header_end] + """

  <!-- City Hero Section -->
  <section class="bg-forest py-5 text-white text-center position-relative overflow-hidden">
    <div class="container py-md-5 position-relative z-2">
      <h1 class="display-4 font-primary mb-3" id="city-title">Premium Organic Delivery in <span id="city-name-header">Pakistan</span></h1>
      <p class="lead text-white-50 mx-auto" style="max-width: 600px;" id="city-subtitle">
        Direct from our Multan farms to your doorstep. Explore our range of pure dairy, edible seeds, and high-yield livestock silage.
      </p>
      <div class="mt-4">
        <span class="badge bg-gold text-dark fs-6 px-3 py-2"><i class="bi bi-truck me-2"></i>Estimated Delivery: <span id="city-time">24-48 Hours</span></span>
      </div>
    </div>
  </section>

  <!-- Popular Products -->
  <section class="container py-5 my-md-4">
    <div class="text-center mb-5">
      <h2 class="h1 font-primary text-dark mb-2">Available for Delivery to <span id="city-name-section">your city</span></h2>
      <div class="header-divider mx-auto"></div>
    </div>
    <div class="row g-3 g-lg-4" id="city-products-grid">
      <!-- Injected by JS -->
    </div>
    <div class="text-center mt-5">
      <a href="/shop" class="btn btn-outline-primary px-4 py-2">View All Products <i class="bi bi-arrow-right ms-2"></i></a>
    </div>
  </section>

""" + content[footer_start:]

# Fix script and image paths
new_content = new_content.replace('src="catalog/', 'src="/catalog/')
new_content = new_content.replace('src="js/', 'src="/js/')
new_content = new_content.replace('href="css/', 'href="/css/')
new_content = new_content.replace('href="shop"', 'href="/shop"')
new_content = new_content.replace('href="about"', 'href="/about"')
new_content = new_content.replace('href="contact"', 'href="/contact"')
new_content = new_content.replace('href="calculator"', 'href="/calculator"')

# Add the city logic script before </body>
city_logic = """
  <script src="/js/cities-db.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      let cityId = urlParams.get('city');

      // Clean URL Fallback
      if (!cityId) {
        const pathParts = window.location.pathname.replace(/\\/$/, '').split('/');
        if (pathParts.includes('delivery')) {
          cityId = pathParts[pathParts.length - 1];
        }
      }

      const city = deliveryCities.find(c => c.id === cityId);

      if (city) {
        // Update DOM
        document.getElementById('city-name-header').textContent = city.name + ', ' + city.province;
        document.getElementById('city-name-section').textContent = city.name;
        document.getElementById('city-time').textContent = city.deliveryTime;
        document.getElementById('seo-title').textContent = `Organic Delivery in ${city.name} | ARB Farms`;
        document.getElementById('seo-desc').setAttribute('content', `Buy premium organic produce and livestock feed. Fast delivery to ${city.name}, ${city.province} within ${city.deliveryTime}.`);
        
        // Inject schema
        const schema = {
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Farm Delivery",
          "provider": {
            "@type": "LocalBusiness",
            "name": "ARB Farms"
          },
          "areaServed": {
            "@type": "City",
            "name": city.name
          }
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
      }

      // Render some products
      if (typeof productsDb !== 'undefined') {
        const grid = document.getElementById('city-products-grid');
        const popular = productsDb.slice(0, 6);
        grid.innerHTML = popular.map(p => `
          <div class="col-sm-6 col-lg-4">
            <div class="card h-100 product-card border-0 shadow-sm">
              <div class="product-image-container">
                <a href="/product/${p.id}" class="product-image-link">
                  <img src="/${p.image}" class="product-image-base" alt="${p.name}">
                </a>
              </div>
              <div class="card-body p-3 text-center">
                <h3 class="h6 my-2 font-primary"><a href="/product/${p.id}" class="text-decoration-none text-dark">${p.name}</a></h3>
                <div class="text-primary fw-bold">Rs. ${p.price.toLocaleString()}</div>
              </div>
            </div>
          </div>
        `).join('');
      }
    });
  </script>
</body>
"""

new_content = new_content.replace('</body>', city_logic)

with open(filepath, 'w') as f:
    f.write(new_content)

print("Generated /city-landing/index.html")
