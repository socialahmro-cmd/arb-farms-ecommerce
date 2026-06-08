import os

filepath = '/Users/pc/Downloads/arb-farms-ecommerce-main/city-landing/index.html'
with open(filepath, 'r') as f:
    content = f.read()

# Enhance JS rendering for products to include city-based filtering
old_js = """grid.innerHTML = popular.map((p, index) => `
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

new_js = """
        // Filter out milk if the city is not Multan
        const filteredProducts = productsDb.filter(p => {
          const isMilk = p.tags && p.tags.includes('milk');
          if (isMilk && cityId !== 'multan') {
            return false; // hide milk in non-Multan cities
          }
          return true;
        });

        const popular = filteredProducts.slice(0, 6);
        grid.innerHTML = popular.map((p, index) => {
          const imgSrc = p.image.startsWith('/') ? p.image : '/' + p.image;
          return `
          <div class="col-sm-6 col-lg-4 fade-in-up" style="animation-delay: ${0.2 + (index * 0.1)}s;">
            <div class="card h-100 product-card border-0 shadow-sm">
              <div class="product-image-container text-center position-relative">
                <span class="position-absolute top-0 start-0 m-3 badge bg-gold text-forest rounded-pill">Top Seller</span>
                <a href="/product/${p.id}" class="product-image-link d-block">
                  <img src="${imgSrc}" class="product-image-base img-fluid" alt="${p.name}" style="max-height: 200px; object-fit: contain;" onerror="this.src='/catalog/arbfarms-logo-v2.svg';">
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
        `}).join('');"""

if "const popular = productsDb.slice(0, 6);" in content:
    content = content.replace("const popular = productsDb.slice(0, 6);\n        " + old_js, new_js)

with open(filepath, 'w') as f:
    f.write(content)

print("city-landing/index.html updated successfully with milk filtering and robust image source.")
