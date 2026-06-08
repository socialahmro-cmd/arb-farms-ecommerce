import os

filepath = '/Users/pc/Downloads/arb-farms-ecommerce-main/city-landing/index.html'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Inject CSS animations into <head>
css = """
  <style>
    :root {
      --color-forest: #2b422a;
      --color-gold: #c29d59;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    
    .city-hero {
      background: linear-gradient(135deg, var(--color-forest) 0%, #1a2a1a 100%);
      position: relative;
    }
    .city-hero::after {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: url('data:image/svg+xml;utf8,<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)"/></svg>');
      pointer-events: none;
    }
    
    .product-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-radius: 16px;
      overflow: hidden;
    }
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
    }
    .product-image-container {
      background: #f8f9fa;
      padding: 1.5rem;
      transition: background 0.3s ease;
    }
    .product-card:hover .product-image-container {
      background: #f1f3f5;
    }
    .product-image-base {
      transition: transform 0.4s ease;
    }
    .product-card:hover .product-image-base {
      transform: scale(1.08);
    }
  </style>
</head>
"""
content = content.replace('</head>', css)

# 2. Add animation classes to sections
content = content.replace('class="bg-forest py-5 text-white text-center position-relative overflow-hidden"', 'class="city-hero py-5 text-white text-center fade-in-up"')
content = content.replace('class="container py-5 my-md-4"', 'class="container py-5 my-md-4 fade-in-up delay-2"')

# 3. Add products-db.js script
script_injection = '<script src="/js/products-db.js"></script>\n  <script src="/js/cities-db.js"></script>'
content = content.replace('<script src="/js/cities-db.js"></script>', script_injection)

# 4. Enhance JS rendering for products
old_js = """grid.innerHTML = popular.map(p => `
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
        `).join('');"""

new_js = """grid.innerHTML = popular.map((p, index) => `
          <div class="col-sm-6 col-lg-4 fade-in-up" style="animation-delay: ${0.2 + (index * 0.1)}s;">
            <div class="card h-100 product-card border-0 shadow-sm">
              <div class="product-image-container text-center position-relative">
                <span class="position-absolute top-0 start-0 m-3 badge bg-gold text-forest rounded-pill">Top Seller</span>
                <a href="/product/${p.id}" class="product-image-link d-block">
                  <img src="/${p.image}" class="product-image-base img-fluid" alt="${p.name}" style="max-height: 200px; object-fit: contain;">
                </a>
              </div>
              <div class="card-body p-4 text-center">
                <p class="text-muted small mb-1 text-uppercase tracking-wide">${p.category.replace('-', ' ')}</p>
                <h3 class="h5 my-2 font-primary"><a href="/product/${p.id}" class="text-decoration-none text-dark">${p.name}</a></h3>
                <div class="d-flex justify-content-center align-items-center mt-3">
                  <span class="text-primary fw-bold fs-5 me-2">Rs. ${p.price.toLocaleString()}</span>
                  <span class="text-muted small">/ ${p.weight}</span>
                </div>
                <a href="/product/${p.id}" class="btn btn-outline-primary w-100 mt-4 rounded-pill">View Details</a>
              </div>
            </div>
          </div>
        `).join('');"""
content = content.replace(old_js, new_js)

with open(filepath, 'w') as f:
    f.write(content)

print("city-landing/index.html updated successfully.")
