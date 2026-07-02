/**
 * main.js - Core E-commerce State Management (Cart, Wishlist, Compare)
 * ARB Farms E-commerce
 */
const SKU_MAP = {
  "ogn-004-milk":"OGN-001","ogn-005":"OGN-002","ogn-006":"OGN-003",
  "ogn-007":"OGN-007","ogn-008":"OGN-008","ogn-009":"OGN-009","ogn-010":"OGN-010",
  "ogn-011":"OGN-011","ogn-012":"OGN-012","ogn-013":"OGN-013","ogn-014":"OGN-014",
  "ogn-015":"OGN-017","ogn-016":"OGN-018","ogn-017":"OGN-019",
  "ogn-066-white-chaunsa-5kg":"OGN-073","ogn-066-white-chaunsa-9kg":"OGN-074",
  "ogn-067-sindhri-5kg":"OGN-075","ogn-067-sindhri-9kg":"OGN-076",
  "ogn-068-dusehri-5kg":"OGN-069","ogn-068-dusehri-9kg":"OGN-070",
  "ogn-069-anwar-ratol-5kg":"OGN-071","ogn-069-anwar-ratol-9kg":"OGN-072",
  "ogn-018":"OGN-045","ogn-018-5kg":"OGN-083","ogn-018-40kg":"OGN-084",
  "ogn-027-edible":"OGN-047","ogn-046":"OGN-048",
  "ogn-028-edible":"OGN-049","ogn-048":"OGN-050",
  "ogn-063":"OGN-065","ogn-064":"OGN-066",
  "ogn-053-moringa":"OGN-055","ogn-054":"OGN-056",
  "ogn-055":"OGN-057","ogn-056":"OGN-058",
  "ogn-057":"OGN-059","ogn-058":"OGN-060",
  "ogn-059":"OGN-061","ogn-060":"OGN-062",
  "ogn-051":"OGN-051","ogn-061-edible":"OGN-052",
  "ogn-052":"OGN-053","ogn-053-pumpkin":"OGN-054",
  "ogn-041":"OGN-043","ogn-042":"OGN-044","ogn-044":"OGN-046",
  "ogn-019":"OGN-021","ogn-020":"OGN-022","ogn-021":"OGN-023","ogn-022":"OGN-024",
  "ogn-023":"OGN-025","ogn-024":"OGN-026","ogn-025":"OGN-027","ogn-026":"OGN-028",
  "ogn-027-seed":"OGN-029","ogn-028-seed":"OGN-030","ogn-029-seed":"OGN-031",
  "ogn-030":"OGN-032","ogn-031":"OGN-033","ogn-032":"OGN-034","ogn-033":"OGN-035",
  "ogn-034":"OGN-036","ogn-035":"OGN-037","ogn-036":"OGN-038","ogn-037":"OGN-039",
  "ogn-038":"OGN-040","ogn-039":"OGN-041","ogn-040":"OGN-042",
  "ogn-061":"OGN-063","ogn-062":"OGN-064","ogn-004-seed":"OGN-085",
};

// Automatically clean up Cache Storage & Service Workers if a new deployment is detected to ensure fresh UI/UX
(async function checkSiteVersion() {
  const CRITICAL_KEYS = ['arb_cart', 'arb_wishlist', 'arb_compare', 'site_version'];
  
  // 1. Clean up temporary cache-busting query parameter from URL address bar if present
  if (window.location.search.includes('update=')) {
    const params = new URLSearchParams(window.location.search);
    params.delete('update');
    const newSearch = params.toString();
    const cleanUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  try {
    // 2. Fetch the latest deployment version from the server (with cache-busting param to bypass intermediate proxies)
    const res = await fetch('/version.json?cb=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    const localVersion = localStorage.getItem('site_version');

    // 3. If version mismatch detected, clear caches and perform upgrade tasks
    if (localVersion && localVersion !== data.version) {
      await runVersionUpgrade(data.version);
    } else if (!localVersion) {
      localStorage.setItem('site_version', data.version);
    }
  } catch (e) {
    console.error("Site version check failed:", e);
  }

  async function runVersionUpgrade(newVersion) {
    // A. Clear Browser Cache Storage
    if ('caches' in window) {
      const names = await caches.keys();
      for (let name of names) {
        await caches.delete(name);
      }
    }
    
    // B. Unregister Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
    }

    // C. Prune Obsolete LocalStorage Keys (keep only critical ones)
    const keys = Object.keys(localStorage);
    for (let key of keys) {
      if (!CRITICAL_KEYS.includes(key)) {
        localStorage.removeItem(key);
      }
    }

    // D. Clear Temporary/Session Cookies (e.g. path=/)
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      // Keep essential cookies, clear others
      if (name && !name.startsWith('ess_')) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    }

    // E. Save New Version
    localStorage.setItem('site_version', newVersion);

    // F. Non-disruptive Reload: Check if user is active or on checkout
    const isUserActive = document.querySelector('input:focus, textarea:focus') !== null;
    const isCheckout = window.location.pathname.includes('checkout');

    if (isCheckout || isUserActive) {
      // Show floating notification instead of immediate reload
      showUpdateNotificationToast(newVersion);
    } else {
      // Reload immediately
      performHardReload(newVersion);
    }
  }

  function performHardReload(newVersion) {
    const params = new URLSearchParams(window.location.search);
    params.set('update', newVersion);
    window.location.href = window.location.pathname + '?' + params.toString() + window.location.hash;
  }

  function showUpdateNotificationToast(newVersion) {
    // Ensure we don't spawn multiple toast notifications
    if (document.getElementById('update-toast')) return;

    // Inject temporary styles for toast slide-in animation if they don't exist
    if (!document.getElementById('update-toast-style')) {
      const style = document.createElement('style');
      style.id = 'update-toast-style';
      style.textContent = `
        @keyframes updateToastSlideIn {
          from { transform: translateY(100px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        #update-toast {
          animation: updateToastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
      document.head.appendChild(style);
    }

    const toast = document.createElement('div');
    toast.id = 'update-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(43, 76, 40, 0.95);
      backdrop-filter: blur(10px);
      color: #ede1ca;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      z-index: 10000;
      max-width: 350px;
      border: 1px solid rgba(237, 225, 202, 0.2);
      font-family: inherit;
    `;
    toast.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 6px; color: #fdfaf4; display: flex; align-items: center; gap: 8px;">
        <span>✨ Update Available</span>
      </div>
      <div style="font-size: 0.85rem; margin-bottom: 12px; line-height: 1.4; color: rgba(253, 250, 244, 0.9);">A new version of ARB Farms is available. Refresh to get the latest features.</div>
      <div style="display: flex; gap: 12px; justify-content: flex-end; align-items: center;">
        <button id="update-toast-later" style="background:transparent; border:none; color:#ede1ca; font-size:0.8rem; cursor:pointer; font-weight: 500; opacity: 0.8; transition: opacity 0.2s;">Later</button>
        <button id="update-toast-now" style="background:#ede1ca; border:none; color:#2b4c28; font-weight:bold; font-size:0.8rem; padding:6px 14px; border-radius:6px; cursor:pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s, background-color 0.2s;">Update Now</button>
      </div>
    `;
    document.body.appendChild(toast);

    const laterBtn = document.getElementById('update-toast-later');
    const nowBtn = document.getElementById('update-toast-now');

    laterBtn.addEventListener('mouseenter', () => laterBtn.style.opacity = '1');
    laterBtn.addEventListener('mouseleave', () => laterBtn.style.opacity = '0.8');
    laterBtn.addEventListener('click', () => {
      toast.style.animation = 'updateToastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
      setTimeout(() => toast.remove(), 300);
    });

    nowBtn.addEventListener('mouseenter', () => {
      nowBtn.style.backgroundColor = '#fdfaf4';
      nowBtn.style.transform = 'scale(1.05)';
    });
    nowBtn.addEventListener('mouseleave', () => {
      nowBtn.style.backgroundColor = '#ede1ca';
      nowBtn.style.transform = 'scale(1)';
    });
    nowBtn.addEventListener('click', () => {
      performHardReload(newVersion);
    });
  }
})();

// 1. Initial State Handlers
const getStorageItem = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setStorageItem = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// 2. Global Badge Count Updater
function updateBadges() {
  const cart = getStorageItem('arb_cart');
  const wishlist = getStorageItem('arb_wishlist');
  
  const cartCountEls = document.querySelectorAll('#cart-count, .mobile-cart-count');
  const wishlistCountEls = document.querySelectorAll('#wishlist-count, .mobile-wishlist-count');
  
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEls.forEach(el => {
    el.textContent = totalQty;
    el.style.display = totalQty > 0 ? 'inline-block' : 'none';
  });
  
  wishlistCountEls.forEach(el => {
    el.textContent = wishlist.length;
    el.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
  });
  
  // Highlight active wishlist buttons on the current page
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.getAttribute('data-id');
    if (wishlist.includes(id)) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="bi bi-heart"></i>';
    }
  });
}

// 3. Cart Actions

// --- Tiered Pricing Logic ---
const tieredPricingConfig = {
  "ogn-061": [ // Okra Seed
    { minQty: 40, price: 2500 },
    { minQty: 1, price: 3000 }
  ]
};

function calculateTieredPrice(id, qty, basePrice) {
  const tiers = tieredPricingConfig[id];
  if (!tiers) return parseFloat(basePrice);
  
  const applicableTier = tiers.find(tier => qty >= tier.minQty);
  return applicableTier ? applicableTier.price : parseFloat(basePrice);
}
// ----------------------------

function addToCart(product) {
  let cart = getStorageItem('arb_cart');
  const existing = cart.find(item => item.id === product.id);
  
  // Parse and normalize weight to kg
  let parsedWeight = 0;
  if (product.weight) {
    let wStr = String(product.weight).toLowerCase().trim();
    let val = parseFloat(wStr);
    if (!isNaN(val)) {
      if (wStr.includes('gm') || wStr.includes('gram') || (val >= 100 && !wStr.includes('kg') && !product.id.toLowerCase().includes('seeds') && !product.id.toLowerCase().includes('wheat') && !product.id.toLowerCase().includes('bales'))) {
        parsedWeight = val / 1000;
      } else {
        parsedWeight = val;
      }
    }
  }

  if (existing) {
    existing.qty += product.qty || 1;
    existing.weight = parsedWeight; // Keep it normalized
    existing.price = calculateTieredPrice(existing.id, existing.qty, existing.basePrice || product.price);
  } else {
    const qty = product.qty || 1;
    const price = calculateTieredPrice(product.id, qty, product.price);
    cart.push({
      id: product.id,
      sku: SKU_MAP[product.id] ?? null,   // ← ADD THIS LINE
      name: product.name.replace(/ (Small|Large|Medium|Bulk)$/i, ''),
      price: price,
      basePrice: parseFloat(product.price),
      weight: parsedWeight,
      category: product.category || '',
      image: product.image || 'catalog/sowing-seeds-v2.svg',
      qty: qty
    });
  }
  
  setStorageItem('arb_cart', cart);
  updateBadges();
  
  if (document.getElementById('sidebar-cart-items')) {
    updateSidebarCart();
  }
  
  // Custom temporary alert toast style
  showToast(`${product.name.replace(/ (Small|Large|Medium|Bulk)$/i, '')} added to cart!`);

  // Open the sidebar offcanvas automatically
  const offcanvasEl = document.getElementById('cartOffcanvas');
  if (offcanvasEl && typeof bootstrap !== 'undefined') {
    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    offcanvas.show();
  }
}

function updateCartQty(id, qty) {
  let cart = getStorageItem('arb_cart');
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty = parseInt(qty);
    if (item.qty <= 0) {
      cart = cart.filter(item => item.id !== id);
    } else {
      item.price = calculateTieredPrice(item.id, item.qty, item.basePrice || item.price);
    }
    setStorageItem('arb_cart', cart);
    updateBadges();
    if (document.getElementById('sidebar-cart-items')) {
      updateSidebarCart();
    }
  }
}

function removeFromCart(id) {
  let cart = getStorageItem('arb_cart');
  cart = cart.filter(item => item.id !== id);
  setStorageItem('arb_cart', cart);
  updateBadges();
  if (document.getElementById('sidebar-cart-items')) {
    updateSidebarCart();
  }
}

// 4. Wishlist Actions
function toggleWishlist(id, name) {
  let wishlist = getStorageItem('arb_wishlist');
  const index = wishlist.indexOf(id);
  
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`${name || 'Product'} removed from wishlist.`);
  } else {
    wishlist.push(id);
    showToast(`${name || 'Product'} saved to wishlist.`);
  }
  
  setStorageItem('arb_wishlist', wishlist);
  updateBadges();
}

// 5. Product Comparison Actions (Max 3 items)
function toggleCompare(id, name) {
  let compareList = getStorageItem('arb_compare');
  const index = compareList.indexOf(id);
  
  if (index > -1) {
    compareList.splice(index, 1);
    showToast(`${name || 'Product'} removed from comparison.`);
  } else {
    if (compareList.length >= 3) {
      showToast("You can compare a maximum of 3 products at a time.", "warning");
      return;
    }
    compareList.push(id);
    showToast(`${name || 'Product'} added to comparison.`);
  }
  
  setStorageItem('arb_compare', compareList);
}

// 6. Global Interactive Event Delegation
document.addEventListener('click', (e) => {
  // Add to Cart
  const cartBtn = e.target.closest('.add-to-cart-btn');
  if (cartBtn) {
    e.preventDefault();
    const product = {
      id: cartBtn.getAttribute('data-id'),
      name: cartBtn.getAttribute('data-name'),
      price: cartBtn.getAttribute('data-price'),
      weight: cartBtn.getAttribute('data-weight'),
      image: cartBtn.getAttribute('data-image'),
      qty: 1
    };
    addToCart(product);
    return;
  }
  
  // Wishlist Toggle
  const wishlistBtn = e.target.closest('.wishlist-btn');
  if (wishlistBtn) {
    e.preventDefault();
    const id = wishlistBtn.getAttribute('data-id');
    const card = wishlistBtn.closest('.product-card');
    const name = card ? card.querySelector('.card-body h3').textContent : 'Product';
    toggleWishlist(id, name);
    return;
  }
  
  // Compare Button Toggle
  const compareBtn = e.target.closest('.compare-btn');
  if (compareBtn) {
    e.preventDefault();
    const id = compareBtn.getAttribute('data-id');
    const card = compareBtn.closest('.product-card');
    const name = card ? card.querySelector('.card-body h3').textContent : 'Product';
    toggleCompare(id, name);
    return;
  }
  
  // Quick View Button Click
  const quickViewBtn = e.target.closest('.quick-view-btn');
  if (quickViewBtn) {
    e.preventDefault();
    const id = quickViewBtn.getAttribute('data-id');
    if (id) {
      openQuickView(id);
    } else {
      const href = quickViewBtn.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    }
    return;
  }
});

// Global Product Variation Selection Handling
document.addEventListener('change', (e) => {
  const select = e.target.closest('.product-variation-selector');
  if (!select) return;

  const selectedOption = select.options[select.selectedIndex];
  if (!selectedOption) return;

  const newId = selectedOption.value;
  const newPrice = parseFloat(selectedOption.getAttribute('data-price')) || 0;
  const isInStock = selectedOption.dataset.instock !== 'false';
const addBtn = card.querySelector('.add-to-cart-btn');
if (addBtn) {
  addBtn.disabled = !isInStock;
  addBtn.classList.toggle('btn-secondary', !isInStock);
  addBtn.classList.toggle('btn-primary', isInStock);
  addBtn.innerHTML = isInStock
    ? '<i class="bi bi-cart-plus"></i> Add'
    : '<i class="bi bi-slash-circle"></i> Out of Stock';
}
  const newWeight = selectedOption.getAttribute('data-weight');
  const newSku = selectedOption.getAttribute('data-sku');
  const newImage = selectedOption.getAttribute('data-image');
  const newHover = selectedOption.getAttribute('data-hover');

  // Find parent product card
  const card = select.closest('.product-card');
  if (!card) return;

  // Calculate pricing
 const origPrice = parseFloat(selectedOption.getAttribute('data-original-price')) || 0;
const hasRealSale = origPrice && origPrice > newPrice;
const regPrice = hasRealSale ? origPrice : Math.round(newPrice * 1.15 / 50) * 50;
const saveAmt = regPrice - newPrice;

  // Update SKU badge
  const skuBadge = card.querySelector('.sku-badge');
  if (skuBadge && newSku) skuBadge.textContent = newSku;

  // Update save badges
  const saveBadgeTop = card.querySelector('.save-badge-top');
  if (saveBadgeTop) {
    saveBadgeTop.textContent = `Save Rs. ${saveAmt.toLocaleString()}`;
  }
  const saveBadgeBottom = card.querySelector('.save-badge-bottom');
  if (saveBadgeBottom) {
    saveBadgeBottom.innerHTML = `<i class="bi bi-tag-fill me-1"></i>Save Rs. ${saveAmt.toLocaleString()}`;
  }

  // Update prices
  const regPriceLabel = card.querySelector('.reg-price-label');
  if (regPriceLabel) {
    regPriceLabel.textContent = `${hasRealSale ? 'Was' : 'Regular'}: Rs. ${regPrice.toLocaleString()}`;
  }
  const priceLabel = card.querySelector('.price-label');
  if (priceLabel) {
    priceLabel.innerHTML = hasRealSale
      ? `<span style="color:#c0392b;">Rs. ${newPrice.toLocaleString()}</span>`
      : `Rs. ${newPrice.toLocaleString()}`;
  }

  // Update weight label
  const weightLabel = card.querySelector('.weight-label');
  if (weightLabel && newWeight) {
    weightLabel.textContent = newWeight;
  }

  // Update interactive buttons
  const wishlistBtn = card.querySelector('.wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.setAttribute('data-id', newId);
  }
  const compareBtn = card.querySelector('.compare-btn');
  if (compareBtn) {
    compareBtn.setAttribute('data-id', newId);
  }
  const quickViewBtn = card.querySelector('.quick-view-btn');
  if (quickViewBtn) {
    quickViewBtn.setAttribute('data-id', newId);
    quickViewBtn.setAttribute('href', `product/detail?id=${newId}`);
  }
  const titleLink = card.querySelector('.product-title-link') || card.querySelector('.card-body h3 a');
  if (titleLink) {
    titleLink.setAttribute('href', `product/detail?id=${newId}`);
  }
  const imgLink = card.querySelector('.product-image-link');
  if (imgLink) {
    imgLink.setAttribute('href', `product/detail?id=${newId}`);
  }

  // Update images
  const baseImg = card.querySelector('.product-image-base');
  if (baseImg && newImage) {
    baseImg.setAttribute('src', newImage);
  }
  const hoverImg = card.querySelector('.product-image-hover');
  if (hoverImg && newHover) {
    hoverImg.setAttribute('src', newHover);
  }

  // Update Add to Cart Button
  const cartBtn = card.querySelector('.add-to-cart-btn');
  if (cartBtn) {
    cartBtn.setAttribute('data-id', newId);
    cartBtn.setAttribute('data-price', newPrice);
    if (newWeight) {
      cartBtn.setAttribute('data-weight', newWeight.replace(/[^0-9.]/g, ''));
    }
    if (newImage) {
      cartBtn.setAttribute('data-image', newImage);
    }
  }
});

// 7. Custom Toast Notification
function showToast(message, type = "success") {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '10000';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = `alert alert-${type === 'success' ? 'success' : 'warning'} shadow-lg border-0`;
  toast.style.minWidth = '250px';
  toast.style.borderRadius = 'var(--radius-sm)';
  toast.style.borderLeft = `5px solid ${type === 'success' ? 'var(--color-primary)' : 'var(--color-secondary)'} !important`;
  toast.style.margin = '0 0 10px 0';
  toast.style.animation = 'slideUpFade 0.3s ease forwards';
  toast.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <i class="bi ${type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'}"></i>
      <span class="fw-semibold text-dark" style="font-size:0.85rem;">${message}</span>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// 8. Path Prefix Helper
function getPathPrefix() {
  const path = window.location.pathname;
  if (path.includes('/product/detail/')) {
    return '../../';
  }
  if (path.includes('/product/') || path.includes('/legal/')) {
    return '../';
  }
  return '';
}

// 9. Sidebar Cart Functions
function injectCartSidebar() {
  if (document.getElementById('cartOffcanvas')) return;

  const prefix = getPathPrefix();
  
  const offcanvasEl = document.createElement('div');
  offcanvasEl.className = 'offcanvas offcanvas-end text-dark';
  offcanvasEl.id = 'cartOffcanvas';
  offcanvasEl.setAttribute('tabindex', '-1');
  offcanvasEl.setAttribute('aria-labelledby', 'cartOffcanvasLabel');
  offcanvasEl.style.zIndex = '1050';
  
  offcanvasEl.innerHTML = `
    <div class="offcanvas-header bg-forest text-white py-3" style="border-bottom: 3px solid var(--color-secondary);">
      <h5 class="offcanvas-title font-primary" id="cartOffcanvasLabel">
        <i class="bi bi-cart3 me-2"></i>Shopping Cart
      </h5>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body d-flex flex-column p-0">
      <!-- Cart items container (scrollable) -->
      <div class="flex-grow-1 overflow-y-auto p-3" id="sidebar-cart-items">
        <!-- Dynamically injected items -->
      </div>
      
      <!-- Summary and CTAs (sticky at bottom) -->
      <div class="p-3 border-top bg-light" id="sidebar-cart-summary">
        <div class="d-flex justify-content-between mb-2">
          <span class="text-muted small">Total Weight:</span>
          <span class="fw-bold small" id="sidebar-cart-weight">0 kg</span>
        </div>
        <div class="d-flex justify-content-between mb-3">
          <span class="h6 mb-0 text-dark fw-bold">Subtotal:</span>
          <span class="h5 mb-0 text-primary fw-bold" id="sidebar-cart-subtotal">Rs. 0</span>
        </div>
        <div class="d-flex flex-column gap-2">
          <a href="${prefix}checkout" id="sidebar-checkout-btn" class="btn btn-primary w-100 py-2.5 font-primary text-uppercase">
            <i class="bi bi-credit-card me-1"></i> Proceed to Checkout
          </a>
          <a href="${prefix}cart" id="sidebar-cart-btn" class="btn btn-outline-secondary w-100 py-2 font-primary text-uppercase">
            View Full Cart
          </a>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(offcanvasEl);
  updateSidebarCart();

  // If user clicks a cart link, open the sidebar offcanvas instead of navigating (except on cart/checkout pages)
  document.addEventListener('click', (e) => {
    const cartLink = e.target.closest('a[href*="cart"]');
    const isSidebarBtn = e.target.closest('#sidebar-cart-btn');
    if (cartLink && !isSidebarBtn) {
      const isCartPage = window.location.pathname.endsWith('cart');
      const isCheckoutPage = window.location.pathname.endsWith('checkout');
      const isThankYouPage = window.location.pathname.endsWith('thank-you');
      if (!isCartPage && !isCheckoutPage && !isThankYouPage) {
        e.preventDefault();
        const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        offcanvas.show();
      }
    }
  });
}

function updateSidebarCart() {
  const cart = JSON.parse(localStorage.getItem('arb_cart')) || [];
  const itemsContainer = document.getElementById('sidebar-cart-items');
  const weightEl = document.getElementById('sidebar-cart-weight');
  const subtotalEl = document.getElementById('sidebar-cart-subtotal');
  const checkoutBtn = document.getElementById('sidebar-checkout-btn');
  const prefix = getPathPrefix();

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-cart-x text-muted display-4 mb-3 d-block"></i>
        <p class="text-muted">Your cart is empty.</p>
        <a href="${prefix}shop" class="btn btn-sm btn-outline-primary mt-2" data-bs-dismiss="offcanvas">Browse Products</a>
      </div>
    `;
    if (weightEl) weightEl.textContent = '0 kg';
    if (subtotalEl) subtotalEl.textContent = 'Rs. 0';
    if (checkoutBtn) checkoutBtn.classList.add('disabled');
    return;
  }

  if (checkoutBtn) checkoutBtn.classList.remove('disabled');

  const totals = calculateCartTotals(cart);

  let html = '';
  cart.forEach(item => {
    const itemTotal = item.price * item.qty;

    let imgSrc = item.image;
    if (prefix && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('../')) {
      imgSrc = prefix + imgSrc;
    }

    const isDiscounted = item.basePrice && item.price < item.basePrice;
    const discountBadge = isDiscounted ? `<span class="badge bg-success mt-1" style="font-size: 0.6rem;">Volume Discount</span>` : '';

    html += `
      <div class="d-flex gap-3 mb-3 pb-3 border-bottom align-items-center">
        <img src="${imgSrc}" alt="${item.name}" class="rounded border" style="width: 60px; height: 60px; object-fit: cover;">
        <div class="flex-grow-1">
          <h6 class="mb-0 text-dark fw-bold" style="font-size: 0.9rem;">${item.name}</h6>
          <span class="text-muted small d-block mb-1">${item.weight} kg | Rs. ${item.price.toLocaleString()}</span>
          ${discountBadge}
          <div class="d-flex align-items-center gap-2 mt-1">
            <div class="btn-group btn-group-sm" style="max-height: 24px;">
              <button class="btn btn-outline-secondary py-0 px-2 sidebar-qty-btn" data-id="${item.id}" data-action="decrease">-</button>
              <span class="px-2 bg-light border-top border-bottom small d-flex align-items-center justify-content-center" style="min-width: 24px;">${item.qty}</span>
              <button class="btn btn-outline-secondary py-0 px-2 sidebar-qty-btn" data-id="${item.id}" data-action="increase">+</button>
            </div>
            <button class="btn btn-link text-danger p-0 ms-auto small text-decoration-none sidebar-remove-btn" data-id="${item.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  if (totals.discount > 0) {
    html += `
      <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
        <span class="text-success fw-bold"><i class="bi bi-tag-fill me-1"></i> Bundle Savings</span>
        <span class="text-success fw-bold">- Rs. ${totals.discount.toLocaleString()}</span>
      </div>
    `;
  }

  itemsContainer.innerHTML = html;
  if (weightEl) weightEl.textContent = `${totals.totalWeight.toFixed(2)} kg`;
  if (subtotalEl) subtotalEl.textContent = `Rs. ${totals.total.toLocaleString()}`;

  // Use event delegation — listeners are attached once on the container,
  // so they survive innerHTML re-renders of individual items.
  // Remove any previously attached delegated listener first.
  if (itemsContainer._sidebarDelegateHandler) {
    itemsContainer.removeEventListener('click', itemsContainer._sidebarDelegateHandler);
  }
  itemsContainer._sidebarDelegateHandler = function(e) {
    // Quantity buttons
    const qtyBtn = e.target.closest('.sidebar-qty-btn');
    if (qtyBtn) {
      e.stopPropagation();
      const id = qtyBtn.getAttribute('data-id');
      const action = qtyBtn.getAttribute('data-action');
      const currentCart = getStorageItem('arb_cart');
      const item = currentCart.find(i => i.id === id);
      if (item) {
        const newQty = action === 'increase' ? item.qty + 1 : item.qty - 1;
        updateCartQty(id, newQty);
        if (typeof renderCart === 'function') renderCart();
      }
      return;
    }
    // Remove / trash buttons
    const removeBtn = e.target.closest('.sidebar-remove-btn');
    if (removeBtn) {
      e.stopPropagation();
      const id = removeBtn.getAttribute('data-id');
      removeFromCart(id);
      if (typeof renderCart === 'function') renderCart();
      return;
    }
  };
  itemsContainer.addEventListener('click', itemsContainer._sidebarDelegateHandler);

  // Render sidebar recommendations
  renderSidebarRecommendations(cart);

  // Render cart page recommendations
  renderCartPageRecommendations(cart);
}

function getRecommendations(cart) {
  // Define candidate products with their FOMO details
  // All IDs, prices, weights and image paths verified against products-db.js and catalog/
  const candidates = [
    {
      id: "ogn-013",
      name: "Desi Ghee Small",
      price: 5000,
      weight: 0.5,
      image: "catalog/ogn-013-desi-ghee-500gm-v2.svg",
      badge: "🔥 Best Seller",
      badgeClass: "bg-danger text-white",
      tagline: "Pure off-grid farm recipe by Ahmad Raees Baloch",
      type: "organic"
    },
    {
      id: "ogn-011",
      name: "Sidr Honey Small",
      price: 5000,
      weight: 0.5,
      image: "catalog/ogn-011-sidr-honey-small-500gm-v2.svg",
      badge: "⚡ Selling Fast",
      badgeClass: "bg-warning text-dark",
      tagline: "100% wild forest harvest — limited stock",
      type: "organic"
    },
    {
      id: "ogn-018",
      name: "Gandum (Wheat) 1 Kg",
      price: 225,
      weight: 1,
      image: "catalog/ogn-018-gandum-40kg-v2.svg",
      badge: "❄️ Season Special",
      badgeClass: "bg-info text-white",
      tagline: "Premium whole organic wheat grains from ARB Farms",
      type: "grain"
    },
    {
      id: "ogn-041",
      name: "Silage 40 kg",
      price: 900,
      weight: 40,
      image: "catalog/ogn-041-silage-40kg-v2.svg",
      badge: "🌾 Animal Feed",
      badgeClass: "bg-success text-white",
      tagline: "Premium corn silage for dairy cows",
      type: "grain"
    }
  ];

  // Exclude items already in the cart
  const cartIds = cart.map(item => item.id);
  let filtered = candidates.filter(c => !cartIds.includes(c.id));

  // If cart has grains or agricultural feed, prioritize grain recommendations
  const grainCategories = ['feed-agri', 'edible-seeds'];
  const hasGrain = cart.some(item => {
    const grainIds = ['ogn-018', 'ogn-041', 'ogn-042', 'ogn-044'];
    return grainIds.includes(item.id) || (item.category && grainCategories.includes(item.category));
  });
  if (hasGrain) {
    filtered.sort((a, b) => (a.type === 'grain' ? -1 : 1));
  } else {
    // Otherwise prioritize organic foods
    filtered.sort((a, b) => (a.type === 'organic' ? -1 : 1));
  }

  return filtered.slice(0, 2);
}

function renderSidebarRecommendations(cart) {
  const itemsContainer = document.getElementById('sidebar-cart-items');
  if (!itemsContainer || cart.length === 0) return;

  const recs = getRecommendations(cart);
  if (recs.length === 0) return;

  const prefix = getPathPrefix();
  
  let recsHtml = `
    <div class="border-top mt-3 pt-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h6 class="mb-0 text-dark fw-bold font-primary" style="font-size:0.85rem;">Deals & Season Specials</h6>
        <span class="badge bg-secondary-subtle text-secondary small" style="font-size:0.6rem; padding: 1px 4px;">FOMO offer</span>
      </div>
      <div class="d-flex flex-column gap-2">
  `;

  recs.forEach(rec => {
    let imgSrc = rec.image;
    if (prefix && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('../')) {
      imgSrc = prefix + imgSrc;
    }

    recsHtml += `
      <div class="d-flex gap-2 p-2 border rounded bg-white align-items-center" style="font-size: 0.8rem;">
        <img src="${imgSrc}" style="width: 45px; height: 45px; object-fit: cover;" class="rounded border">
        <div class="flex-grow-1 min-w-0">
          <div class="d-flex align-items-center gap-1 mb-0.5">
            <span class="badge ${rec.badgeClass}" style="font-size: 0.6rem; padding: 1px 3px;">${rec.badge}</span>
          </div>
          <h6 class="mb-0 fw-bold text-truncate text-dark" style="font-size: 0.8rem;">${rec.name}</h6>
          <span class="text-primary fw-bold" style="font-size: 0.75rem;">Rs. ${rec.price.toLocaleString()}</span>
        </div>
        <button class="btn btn-sm btn-primary add-to-cart-btn py-1 px-2 text-uppercase fw-bold" style="font-size: 0.7rem;" data-id="${rec.id}" data-name="${rec.name}" data-price="${rec.price}" data-weight="${rec.weight}" data-image="${rec.image}">
          + Add
        </button>
      </div>
    `;
  });

  recsHtml += `
      </div>
    </div>
  `;

  itemsContainer.innerHTML += recsHtml;
}

function renderCartPageRecommendations(cart) {
  const container = document.getElementById('cart-page-recommendations');
  if (!container) return;

  if (cart.length === 0) {
    container.classList.add('d-none');
    return;
  }

  const recs = getRecommendations(cart);
  if (recs.length === 0) {
    container.classList.add('d-none');
    return;
  }

  container.classList.remove('d-none');
  const prefix = getPathPrefix();

  let html = `
    <h3 class="h6 text-dark fw-bold font-primary mb-3">
      <i class="bi bi-gift-fill text-warning me-2"></i>Recommended Deals & Season Specials
    </h3>
    <div class="row g-3">
  `;

  recs.forEach(rec => {
    let imgSrc = rec.image;
    if (prefix && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('../')) {
      imgSrc = prefix + imgSrc;
    }

    html += `
      <div class="col-md-6">
        <div class="d-flex gap-3 p-3 border rounded bg-light align-items-center min-w-0">
          <img src="${imgSrc}" style="width: 55px; height: 55px; object-fit: cover;" class="rounded border bg-white flex-shrink-0">
          <div class="flex-grow-1 min-w-0">
            <span class="badge ${rec.badgeClass} mb-1" style="font-size: 0.6rem; padding: 2px 5px;">${rec.badge}</span>
            <h4 class="h6 mb-0 fw-bold text-dark text-truncate" style="font-size: 0.85rem;">${rec.name}</h4>
            <p class="small text-muted mb-0 text-truncate" style="font-size: 0.75rem;">${rec.tagline}</p>
          </div>
          <div class="text-end flex-shrink-0">
            <span class="fw-bold text-primary d-block mb-1" style="font-size: 0.85rem;">Rs. ${rec.price.toLocaleString()}</span>
            <button class="btn btn-sm btn-primary add-to-cart-btn text-uppercase py-1 px-2 fw-bold" style="font-size: 0.7rem;" data-id="${rec.id}" data-name="${rec.name}" data-price="${rec.price}" data-weight="${rec.weight}" data-image="${rec.image}">
              + Add
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// ============================================================
// 11. SEARCH MODULE — Mini Product Index + Overlay
// ============================================================

// Lightweight product index for instant search (no dependency on products-db.js)
const ARB_SEARCH_INDEX = [
  // Dairy & Organic
  { id:"ogn-004-milk", name:"Cow Milk", price:330, weight:"1 Ltr", category:"Dairy", image:"catalog/ogn-004-cow-milk-1ltr-v2.svg", tags:["milk","dairy","fresh","cow"] },
  { id:"ogn-005", name:"Buffalo Milk", price:390, weight:"1 Ltr", category:"Dairy", image:"catalog/ogn-005-buffalo-milk-1ltr-v2.svg", tags:["milk","buffalo","dairy"] },
  { id:"ogn-006", name:"Goat Milk", price:1000, weight:"1 Ltr", category:"Dairy", image:"catalog/ogn-006-goat-milk-1ltr-v2.svg", tags:["milk","goat","dairy"] },
  { id:"ogn-007", name:"Desi Organic Gurr", price:720, weight:"1 Kg", category:"Organic", image:"catalog/ogn-007-desi-organic-gurr-1kg-v2.svg", tags:["gurr","jaggery","sweetener"] },
  { id:"ogn-008", name:"Gurr with Dry Fruits", price:1800, weight:"1 Kg", category:"Organic", image:"catalog/ogn-008-gurr-with-dry-fruits-1kg-v2.svg", tags:["gurr","dry fruits","premium"] },
  { id:"ogn-009", name:"Organic Shakar", price:810, weight:"1 Kg", category:"Organic", image:"catalog/ogn-009-organic-shakar-1kg-v2.svg", tags:["shakar","sugar","brown"] },
  { id:"ogn-010", name:"Organic Shakar Bulk", price:4400, weight:"6 Kg", category:"Organic", image:"catalog/ogn-009-organic-shakar-1kg-v2.svg", tags:["shakar","sugar","bulk"] },
  { id:"ogn-011", name:"Sidr Honey Small", price:5000, weight:"500 gm", category:"Organic", image:"catalog/ogn-011-sidr-honey-small-500gm-v2.svg", tags:["honey","sidr","sweet"] },
  { id:"ogn-012", name:"Sidr Honey Large", price:9000, weight:"1 Kg", category:"Organic", image:"catalog/ogn-011-sidr-honey-small-500gm-v2.svg", tags:["honey","sidr","premium"] },
  { id:"ogn-013", name:"Desi Ghee Small", price:5000, weight:"500 gm", category:"Organic", image:"catalog/ogn-013-desi-ghee-500gm-v2.svg", tags:["ghee","desi","butter","fat"] },
  { id:"ogn-014", name:"Desi Ghee Large", price:9000, weight:"1 Kg", category:"Organic", image:"catalog/ogn-013-desi-ghee-500gm-v2.svg", tags:["ghee","desi","butter","premium"] },
  { id:"ogn-015", name:"Organic Achaar Small", price:700, weight:"400 gm", category:"Organic", image:"catalog/ogn-015-organic-achaar-400gm-v2.svg", tags:["achaar","pickle","mango"] },
  { id:"ogn-016", name:"Organic Achaar Medium", price:1000, weight:"750 gm", category:"Organic", image:"catalog/ogn-016-organic-achaar-750gm-v2.svg", tags:["achaar","pickle"] },
  { id:"ogn-017", name:"Organic Achaar Large", price:1400, weight:"1 Kg", category:"Organic", image:"catalog/ogn-017-organic-achaar-1kg-v2.svg", tags:["achaar","pickle","large"] },
  { id:"ogn-065-mango", name:"Multan Chaunsa Mangoes (Pre-Booking)", price:0, weight:"5 Kg Box", category:"Organic", image:"catalog/ogn-065-mango-5kg-v2.png", tags:["mango","chaunsa","fruit","fresh","organic","pre-booking"] },
  // Edible Seeds
  { id:"ogn-018", name:"Gandum (Wheat)", price:225, weight:"1 Kg", category:"Edible Seeds", image:"catalog/ogn-018-gandum-40kg-v2.svg", tags:["wheat","gandum","grain","flour"] },
  { id:"ogn-018-5kg", name:"Gandum (Wheat) 5 Kg", price:1100, weight:"5 Kg", category:"Edible Seeds", image:"catalog/ogn-018-gandum-40kg-v2.svg", tags:["wheat","gandum","grain","flour"] },
  { id:"ogn-018-40kg", name:"Gandum (Wheat) 40 Kg", price:9000, weight:"40 Kg Maund", category:"Edible Seeds", image:"catalog/ogn-018-gandum-40kg-v2.svg", tags:["wheat","gandum","grain","flour","bulk"] },
  { id:"ogn-027-edible", name:"Kalonji (Black Seed) 250gm", price:720, weight:"250 gm", category:"Edible Seeds", image:"catalog/ogn-027-kalonji-250gm-v2.svg", tags:["kalonji","black seed","superfood"] },
  { id:"ogn-046", name:"Kalonji (Black Seed) 500gm", price:1350, weight:"500 gm", category:"Edible Seeds", image:"catalog/ogn-027-kalonji-250gm-v2.svg", tags:["kalonji","black seed","spice"] },
  { id:"ogn-028-edible", name:"Chia Seed 250gm", price:1400, weight:"250 gm", category:"Edible Seeds", image:"catalog/ogn-028-chia-seed-250gm-v2.svg", tags:["chia","fiber","superfood","weight loss"] },
  { id:"ogn-048", name:"Chia Seed 500gm", price:2700, weight:"500 gm", category:"Edible Seeds", image:"catalog/ogn-028-chia-seed-250gm-v2.svg", tags:["chia","fiber","omega"] },
  { id:"ogn-063", name:"Isapghol 100gm", price:1400, weight:"100 gm", category:"Edible Seeds", image:"catalog/ogn-063-isapghol-100gm-v2.svg", tags:["isapghol","husk","digestion"] },
  { id:"ogn-053-moringa", name:"Moringa Powder 250gm", price:1400, weight:"250 gm", category:"Edible Seeds", image:"catalog/ogn-053-moringa-powder-250gm-v2.svg", tags:["moringa","powder","herbal","health"] },
  { id:"ogn-051", name:"Basil Seed (Tukh Malanga) 250gm", price:720, weight:"250 gm", category:"Edible Seeds", image:"catalog/ogn-051-basil-seed-250gm-v2.svg", tags:["basil","tukh","malanga","seeds"] },
  { id:"ogn-061-edible", name:"Basil Seed (Tukh Malanga) 500gm", price:1350, weight:"500 gm", category:"Edible Seeds", image:"catalog/ogn-051-basil-seed-250gm-v2.svg", tags:["basil","tukh","malanga","seeds"] },
  // Feed & Agri
  { id:"ogn-039-feed", name:"Corn Silage Bale 80Kg", price:3000, weight:"80 Kg", category:"Feed & Agri", image:"catalog/ogn-041-silage-40kg-v2.svg", tags:["feed","silage","fodder","livestock","corn"] },
];

function injectSearchOverlay() {
  if (document.getElementById('search-overlay')) return;

  const prefix = getPathPrefix();

  // Build overlay HTML
  const overlay = document.createElement('div');
  overlay.id = 'search-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Product Search');
  overlay.innerHTML = `
    <button id="search-close-btn" aria-label="Close search"><i class="bi bi-x-lg"></i></button>
    <div id="search-overlay-inner">
      <p class="search-eyebrow"><i class="bi bi-search me-2"></i>Search ARB Farms</p>
      <div class="search-input-wrap">
        <span class="search-icon-left"><i class="bi bi-search"></i></span>
        <input id="search-input" type="search" autocomplete="off" spellcheck="false"
               placeholder="e.g. Desi Ghee, Kalonji, Wheat…" aria-label="Search products" />
        <button id="search-clear-btn" aria-label="Clear search"><i class="bi bi-x-circle-fill"></i></button>
      </div>
      <div class="search-quick-tags" id="search-quick-tags">
        <span class="search-quick-tag" data-query="honey">Honey</span>
        <span class="search-quick-tag" data-query="ghee">Desi Ghee</span>
        <span class="search-quick-tag" data-query="chia">Chia Seeds</span>
        <span class="search-quick-tag" data-query="kalonji">Kalonji</span>
        <span class="search-quick-tag" data-query="moringa">Moringa</span>
        <span class="search-quick-tag" data-query="wheat">Gandum / Wheat</span>
        <span class="search-quick-tag" data-query="lucerne">Lucerne</span>
        <span class="search-quick-tag" data-query="milk">Fresh Milk</span>
      </div>
      <div class="search-kbd-hint">
        <span>Press</span><kbd>ESC</kbd><span>to close</span>
        <span style="margin-left:0.5rem;">·</span>
        <kbd>/</kbd><span>to open from anywhere</span>
      </div>
      <div id="search-results">
        <p class="search-status">Start typing to find products…</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const searchInput = overlay.querySelector('#search-input');
  const clearBtn = overlay.querySelector('#search-clear-btn');
  const closeBtn = overlay.querySelector('#search-close-btn');
  const resultsEl = overlay.querySelector('#search-results');

  // Open / Close helpers
  function openSearch() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 80);
  }
  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    resultsEl.innerHTML = '<p class="search-status">Start typing to find products…</p>';
  }

  // Wire up navbar search triggers
  document.querySelectorAll('#search-trigger, .mobile-search-trigger').forEach(btn => {
    btn.addEventListener('click', openSearch);
  });

  // Close button & backdrop click
  closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeSearch();
      return;
    }
    // "/" opens search (when not typing in a form field)
    if (e.key === '/' && !overlay.classList.contains('open')) {
      const tag = (document.activeElement || {}).tagName || '';
      if (!['INPUT','TEXTAREA','SELECT'].includes(tag)) {
        e.preventDefault();
        openSearch();
      }
    }
  });

  // Quick-tag pills
  overlay.querySelectorAll('.search-quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      searchInput.value = tag.dataset.query;
      clearBtn.classList.add('visible');
      performSearch(tag.dataset.query, resultsEl, prefix);
      searchInput.focus();
    });
  });

  // Live input handling
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    clearBtn.classList.toggle('visible', q.length > 0);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(q, resultsEl, prefix), 120);
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    resultsEl.innerHTML = '<p class="search-status">Start typing to find products…</p>';
    searchInput.focus();
  });
}

function performSearch(query, resultsEl, prefix) {
  if (!query || query.length < 1) {
    resultsEl.innerHTML = '<p class="search-status">Start typing to find products…</p>';
    return;
  }

  const q = query.toLowerCase().trim();
  const matches = ARB_SEARCH_INDEX.filter(p => {
    return p.name.toLowerCase().includes(q)
      || p.category.toLowerCase().includes(q)
      || p.tags.some(t => t.toLowerCase().includes(q));
  });

  if (matches.length === 0) {
    resultsEl.innerHTML = `
      <p class="search-status">
        <i class="bi bi-search me-2"></i>No products found for "<strong style="color:#fff;">${query}</strong>".<br>
        <small>Try: ghee, honey, chia, kalonji, wheat, milk…</small>
      </p>`;
    return;
  }

  // Category label map
  const catLabel = {
    'Dairy': 'Dairy & Milk',
    'Organic': 'Organic Foods',
    'Edible Seeds': 'Edible Seeds',
    'Feed & Agri': 'Feed & Agriculture'
  };

  // Shop page URL per category
  const catUrl = {
    'Dairy': 'shop#dairy-organic',
    'Organic': 'shop#dairy-organic',
    'Edible Seeds': 'shop#edible-seeds',
    'Feed & Agri': 'shop#feed-agri',
  };

  let html = '<div class="search-results-grid">';
  matches.slice(0, 12).forEach((p, i) => {
    let imgSrc = p.image;
    if (prefix && !imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
      imgSrc = prefix + imgSrc;
    }
    const detailHref = `${prefix}product/detail?id=${p.id}`;
    const delay = Math.min(i * 40, 280);
    html += `
      <a class="search-result-card" href="${detailHref}" style="animation-delay:${delay}ms;"
         data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-weight="${p.weight}" data-image="${p.image}">
        <img src="${imgSrc}" alt="${p.name}" loading="lazy">
        <div class="flex-grow-1 min-w-0">
          <div class="src-name">${p.name}</div>
          <div class="src-meta">${catLabel[p.category] || p.category} · ${p.weight}</div>
        </div>
        <div class="src-price">Rs. ${p.price.toLocaleString()}</div>
        <i class="bi bi-chevron-right src-arrow"></i>
      </a>`;
  });
  html += '</div>';

  if (matches.length > 12) {
    html += `<a class="search-view-all" href="${prefix}shop?q=${encodeURIComponent(query)}">
      View all ${matches.length} results <i class="bi bi-arrow-right ms-1"></i>
    </a>`;
  }

  resultsEl.innerHTML = html;
}

// 9.5 Mobile Header Quick Actions Tray Injection
function setupMobileHeader() {
  const container = document.querySelector('nav.navbar .container');
  const toggler = document.querySelector('nav.navbar .navbar-toggler');
  if (!container || !toggler) return;

  if (document.querySelector('.mobile-nav-tray')) return;

  const prefix = getPathPrefix();

  const tray = document.createElement('div');
  tray.className = 'mobile-nav-tray d-flex d-lg-none align-items-center';

  tray.innerHTML = `
    <button class="mobile-search-trigger text-white bg-transparent border-0 fs-5 px-2" aria-label="Search products" title="Search">
      <i class="bi bi-search"></i>
    </button>
    <a href="${prefix}account" class="text-white fs-5 px-2" aria-label="My Account" title="My Account">
      <i class="bi bi-person"></i>
    </a>
    <a href="${prefix}cart" class="position-relative text-white fs-5 px-2" aria-label="View Cart">
      <i class="bi bi-cart3"></i>
      <span class="mobile-cart-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style="font-size: 0.65rem; display: none;">0</span>
    </a>
  `;

  container.insertBefore(tray, toggler);
}

// 10. Document Load Initializations & Assistant Injection
document.addEventListener('DOMContentLoaded', () => {
  setupMobileHeader();
  injectCartSidebar();
  injectSearchOverlay();
  updateBadges();
  injectFaqAssistant();
  initMobileMenuScrollLock();
  initMobileCarouselAutoScroll();
});

function initMobileMenuScrollLock() {
  const mainNavbar = document.getElementById('mainNavbar');
  if (mainNavbar) {
    mainNavbar.addEventListener('show.bs.collapse', () => {
      document.body.classList.add('mobile-menu-open');
    });
    mainNavbar.addEventListener('hide.bs.collapse', () => {
      document.body.classList.remove('mobile-menu-open');
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 992 && document.body.classList.contains('mobile-menu-open')) {
        document.body.classList.remove('mobile-menu-open');
        if (typeof bootstrap !== 'undefined') {
          const bsCollapse = bootstrap.Collapse.getInstance(mainNavbar);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      }
    });
  }
}

function initMobileCarouselAutoScroll() {
  const containers = document.querySelectorAll('.mobile-carousel-scroll');
  if (containers.length === 0) return;

  containers.forEach(container => {
    // Exclude category section to prevent auto-scrolling
    if (container.closest('.category-section-wrapper')) return;

    let intervalId = null;
    let isInteracting = false;

    const startScrolling = () => {
      if (window.innerWidth >= 768) {
        stopScrolling();
        return;
      }
      if (intervalId) return;

      intervalId = setInterval(() => {
        if (isInteracting) return;

        const cards = Array.from(container.children);
        if (cards.length === 0) return;

        const currentScroll = container.scrollLeft;

        // Find the card closest to current scrollLeft
        let activeIndex = 0;
        let minDiff = Infinity;
        cards.forEach((card, index) => {
          const cardLeft = card.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft;
          const diff = Math.abs(cardLeft - currentScroll);
          if (diff < minDiff) {
            minDiff = diff;
            activeIndex = index;
          }
        });

        // Target next card index, looping back to 0
        const nextIndex = (activeIndex + 1) % cards.length;
        const targetCard = cards[nextIndex];

        // Calculate target scrollLeft to center the card in the viewport
        const targetScrollLeft = container.scrollLeft + 
          (targetCard.getBoundingClientRect().left - container.getBoundingClientRect().left) + 
          (targetCard.clientWidth - container.clientWidth) / 2;

        // Temporarily disable scroll snap to allow smooth programmatic scroll
        const originalSnapType = container.style.scrollSnapType || 'x mandatory';
        container.style.setProperty('scroll-snap-type', 'none', 'important');

        container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });

        // Restore scroll snap on scrollend or fallback timeout
        let snapRestored = false;
        const restoreSnap = () => {
          if (snapRestored) return;
          snapRestored = true;
          container.style.setProperty('scroll-snap-type', originalSnapType, 'important');
          container.removeEventListener('scrollend', restoreSnap);
        };

        container.addEventListener('scrollend', restoreSnap);
        setTimeout(restoreSnap, 600); // safety fallback

      }, 4000); // Scroll automatically every 4 seconds
    };

    const stopScrolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Touch and mouse events to temporarily pause scrolling on interaction
    container.addEventListener('touchstart', () => {
      isInteracting = true;
    }, { passive: true });

    container.addEventListener('touchend', () => {
      setTimeout(() => {
        isInteracting = false;
      }, 1500);
    }, { passive: true });

    container.addEventListener('mousedown', () => {
      isInteracting = true;
    });

    container.addEventListener('mouseup', () => {
      isInteracting = false;
    });

    // Start scrolling if on mobile viewport
    startScrolling();

    // Watch for resizing to toggle auto-scroll on/off
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        stopScrolling();
      } else {
        startScrolling();
      }
    });
  });
}


function injectFaqAssistant() {
  if (document.getElementById('faq-assistant-trigger')) return;

  // Create floating trigger
  const trigger = document.createElement('div');
  trigger.id = 'faq-assistant-trigger';
  trigger.innerHTML = '<i class="bi bi-chat-text-fill fs-3"></i>';
  trigger.setAttribute('title', 'Ask Farm Advisor');
  document.body.appendChild(trigger);

  // Create chat container
  const card = document.createElement('div');
  card.id = 'faq-assistant-card';
  card.innerHTML = `
    <div class="assistant-header d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-patch-check-fill text-gold fs-5"></i>
        <div>
          <h5 class="m-0 text-white fs-6 font-primary">Farm Advisor Support</h5>
          <span class="text-white-50" style="font-size:0.7rem;"><span class="text-success">●</span> Online from Multan</span>
        </div>
      </div>
      <button type="button" class="btn-close btn-close-white" id="close-assistant" aria-label="Close"></button>
    </div>
    <div class="assistant-body d-flex flex-column" id="assistant-chat-container">
      <div class="assistant-msg bot">
        Hello! I am your ARB Farms Assistant. How can we support your crop yield or dietary choices today? Select a common topic below:
      </div>
      <div class="faq-buttons-container">
        <button class="btn assistant-faq-btn" data-faq="advance">How do I pay the 100% advance?</button>
        <button class="btn assistant-faq-btn" data-faq="shipping">What are the shipping charges?</button>
        <button class="btn assistant-faq-btn" data-faq="dairy">Can dairy be shipped to Lahore?</button>
      </div>
    </div>
    <div class="assistant-footer text-center">
      <a href="https://wa.me/923200005367" target="_blank" class="btn btn-success btn-sm w-100"><i class="bi bi-whatsapp"></i> Chat Live on WhatsApp</a>
    </div>
  `;
  document.body.appendChild(card);

  // Toggle behavior
  trigger.addEventListener('click', () => {
    card.classList.toggle('open');
  });

  const closeBtn = card.querySelector('#close-assistant');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      card.classList.remove('open');
    });
  }

  // Chat Q&A handler
  const chatContainer = card.querySelector('#assistant-chat-container');
  const faqAnswers = {
    advance: "Our terms require a 100% advance payment via EasyPaisa, JazzCash, or bank transfer (Bank Al-Falah Account: 56235001952299, Title: ARB Farms), with the balance settled upon delivery. After submitting an order, you can upload your receipt on the thank-you screen or share it via WhatsApp for immediate processing.",
    shipping: "Standard products: 1g to 1kg = Rs. 300 flat, 1-6kg = Rs. 300/kg, 6kg+ = Rs. 150/kg. Wheat products: Up to 6kg = Rs. 300/kg, 6-40kg = Rs. 150/kg, 40kg+ = Rs. 1,500/Maund (40kg).",
    dairy: "No, fresh pasteurized dairy products (Cow, Buffalo, and Goat Milk) can only be delivered within Multan city boundaries to maintain freshness. Edible seeds, Desi Ghee, Honey, and livestock feed can be shipped nationwide."
  };

  card.addEventListener('click', (e) => {
    const faqBtn = e.target.closest('.assistant-faq-btn');
    if (!faqBtn) return;

    const faqKey = faqBtn.getAttribute('data-faq');
    const questionText = faqBtn.textContent;
    const answerText = faqAnswers[faqKey];

    // User Message bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'assistant-msg user text-end ms-auto bg-light border p-2 mb-2 rounded';
    userMsg.style.maxWidth = '80%';
    userMsg.style.fontSize = '0.8rem';
    userMsg.innerHTML = `<strong>You:</strong> ${questionText}`;
    chatContainer.appendChild(userMsg);

    // Disable button to prevent duplicate clicks
    faqBtn.style.opacity = '0.5';
    faqBtn.disabled = true;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Simulate Advisor Typing Indicator
    const typing = document.createElement('div');
    typing.className = 'assistant-msg bot typing text-muted small p-2 mb-2';
    typing.innerHTML = '<em>Advisor is typing...</em>';
    chatContainer.appendChild(typing);

    setTimeout(() => {
      typing.remove();
      const botMsg = document.createElement('div');
      botMsg.className = 'assistant-msg bot bg-white border-start border-warning p-2 mb-2 rounded';
      botMsg.style.fontSize = '0.8rem';
      botMsg.innerHTML = `<strong>Advisor:</strong> ${answerText}`;
      chatContainer.appendChild(botMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1000);
  });
}

// --- Quick View Modal Support ---
function getProductsDb() {
  if (typeof productsDb !== 'undefined') {
    return Promise.resolve(productsDb);
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = getPathPrefix() + 'js/products-db.js?v=' + Date.now();
    script.onload = () => {
      if (typeof productsDb !== 'undefined') {
        resolve(productsDb);
      } else {
        reject(new Error("productsDb not defined"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load products-db.js"));
    document.body.appendChild(script);
  });
}

function getProductDescription(product) {
  const name = product.name.toLowerCase();
  if (product.category === 'dairy-organic') {
    if (name.includes('ghee')) {
      return "Pure organic desi ghee, traditionally slow-cooked on firewood to preserve nutrition and yield a premium granular texture and rich aroma.";
    }
    if (name.includes('honey')) {
      return "Raw, unpasteurized Sidr Honey wild-harvested from deep forests. Known for its medicinal properties, thick golden texture, and unique organic floral flavor.";
    }
    if (name.includes('milk')) {
      return "Fresh organic farm-fresh milk sourced from pasture-raised grass-fed cattle. Cleaned, chilled, and delivered with 100% purity guaranteed.";
    }
    if (name.includes('mango')) {
      return "Pre-book premium Multan Chaunsa Mangoes. Direct from our farm in Multan, hand-picked, export quality, 100% natural and fiberless sweet golden pulp.";
    }
    return "Farm fresh premium organic dairy staple, produced under strict hygienic standards at our off-grid farm for natural nutrition.";
  }
  if (product.category === 'feed-agri') {
    return "High-nutritional livestock feed fermented to perfection. Promotes premium milk yields and healthy weight gain in dairy and beef animals.";
  }
  if (product.category === 'edible-seeds') {
    return `Clean, organic dietary ${product.name} superfood. Packed with essential fibers, proteins, minerals, and healthy fats for natural health and wellness.`;
  }
  return "Premium organic agriculture and farm food products direct from ARB Farms in Multan. 100% natural, certified quality, and sustainably produced.";
}

function getCategoryLabel(category) {
  const map = {
    'dairy-organic': 'Dairy & Honey',
    'feed-agri': 'Feed & Agri',
    'edible-seeds': 'Edible Seeds'
  };
  return map[category] || 'Organic Farms';
}

function getProductDetailUrl(product) {
  const prefix = getPathPrefix();
  return `${prefix}product/detail?id=${product.id}`;
}

async function openQuickView(id) {
  try {
    const db = await getProductsDb();
    const product = db.find(p => p.id === id);
    if (!product) {
      showToast("Product not found.", "warning");
      return;
    }
    
    injectQuickViewModal(product);
  } catch (err) {
    console.error("Failed to load quick view:", err);
    showToast("Error loading details.", "warning");
  }
}

function injectQuickViewModal(product) {
  let modalEl = document.getElementById('quickViewModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'quickViewModal';
    modalEl.className = 'modal fade';
    modalEl.setAttribute('tabindex', '-1');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(modalEl);
  }

  const prefix = getPathPrefix();
  let imgSrc = product.image;
  if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('../')) {
    imgSrc = prefix + imgSrc;
  }
  
  const categoryLabel = getCategoryLabel(product.category);
  const descriptionText = getProductDescription(product);
  const detailUrl = getProductDetailUrl(product);

  modalEl.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content qv-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px);">
        <div class="modal-header border-0 pb-0 position-absolute end-0 top-0 z-3">
          <button type="button" class="btn-close m-2 p-2 bg-white rounded-circle shadow-sm" data-bs-dismiss="modal" aria-label="Close" style="font-size: 0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"></button>
        </div>
        <div class="modal-body p-0">
          <div class="row g-0">
            <!-- Left: Image Section -->
            <div class="col-md-6 qv-image-pane d-flex align-items-center justify-content-center p-4 position-relative" style="min-height: 350px;">
              <div class="quick-view-image-wrap w-100 h-100 d-flex align-items-center justify-content-center">
                <img id="qv-img" src="${imgSrc}" class="img-fluid object-fit-contain" alt="${product.name}" style="max-height: 300px; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
              </div>
              <span class="position-absolute bottom-0 start-0 m-3 qv-zoom-indicator"><i class="bi bi-zoom-in me-1"></i>Hover to zoom</span>
            </div>
            <!-- Right: Info Section -->
            <div class="col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-between qv-details-pane">
              <div>
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="text-uppercase text-gold fw-bold tracking-wider" style="font-size: 0.75rem;">${categoryLabel}</span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 fw-semibold" style="font-size: 0.7rem;">In Stock</span>
                </div>
                <h2 class="h4 font-primary text-dark fw-bold mb-2">${product.name}</h2>
                <div class="d-flex align-items-center gap-2 mb-3">
                  <span class="text-gold small"><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-half"></i></span>
                  <span class="text-muted small" style="font-size: 0.8rem;">(4.8 rating)</span>
                </div>
                 <div class="d-flex flex-column gap-1 mb-3 pb-3 border-bottom">
                   <span class="text-muted text-decoration-line-through" style="font-size:0.82rem;">Regular Price: Rs. ${(Math.round(product.price * 1.15 / 50) * 50).toLocaleString()}</span>
                   <div class="d-flex align-items-baseline gap-2 flex-wrap">
                     <span class="text-primary fw-bold fs-3 font-accent">Rs. ${product.price.toLocaleString()}</span>
                     <span class="text-muted small">/ ${product.weight}</span>
                   </div>
                   <span class="badge rounded-pill fw-bold d-inline-flex align-items-center gap-1" style="background:#fff3cd;color:#856404;border:1px solid #ffc107;font-size:0.75rem;width:fit-content;"><i class="bi bi-tag-fill"></i>Save Rs. ${(Math.round(product.price * 1.15 / 50) * 50 - product.price).toLocaleString()}</span>
                 </div>
                <p class="text-muted small mb-4 lh-lg">${descriptionText}</p>
                <div class="text-muted mb-4" style="font-size: 0.8rem;">
                  <div class="mb-1"><span class="fw-semibold text-dark">SKU Code:</span> ${product.sku || product.id.toUpperCase()}</div>
                  <div><span class="fw-semibold text-dark">Delivery:</span> 100% Advance</div>
                </div>
              </div>
              <!-- Interactive Qty & Add to Cart -->
              <div>
                <div class="row g-2 mb-3 align-items-center">
                  <div class="col-4">
                    <div class="input-group input-group-sm border rounded">
                      <button class="btn btn-link text-decoration-none text-dark py-1 px-2 border-0" type="button" id="qv-minus-btn" style="box-shadow:none;">-</button>
                      <input type="text" class="form-control text-center bg-white border-0 py-1 px-0 fw-bold" id="qv-qty-input" value="1" readonly style="font-size: 0.9rem; max-width: 40px; box-shadow:none;">
                      <button class="btn btn-link text-decoration-none text-dark py-1 px-2 border-0" type="button" id="qv-plus-btn" style="box-shadow:none;">+</button>
                    </div>
                  </div>
                  <div class="col-8">
                    <button class="btn btn-primary btn-sm w-100 py-2 fw-bold text-uppercase" id="qv-add-btn">
                      <i class="bi bi-cart-plus me-1"></i> Add To Cart
                    </button>
                  </div>
                </div>
                <div class="text-center">
                  <a href="${detailUrl}" class="text-primary text-decoration-none small fw-semibold font-accent" id="qv-details-link">
                    View Full Product Details <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach quantity interactive logic
  const qtyInput = modalEl.querySelector('#qv-qty-input');
  modalEl.querySelector('#qv-minus-btn').addEventListener('click', () => {
    let val = parseInt(qtyInput.value) || 1;
    if (val > 1) {
      qtyInput.value = val - 1;
    }
  });

  modalEl.querySelector('#qv-plus-btn').addEventListener('click', () => {
    let val = parseInt(qtyInput.value) || 1;
    qtyInput.value = val + 1;
  });

  // Attach add to cart interactive logic
  modalEl.querySelector('#qv-add-btn').addEventListener('click', () => {
    const qty = parseInt(qtyInput.value) || 1;
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      weight: parseFloat(product.weight) || 0,
      image: product.image,
      qty: qty
    };
    
    // Add to cart
    addToCart(cartProduct);
    
    // Hide modal
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    if (modalInstance) {
      modalInstance.hide();
    }
  });

  // Show the modal
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}


// 10. Dynamic SEO & Schema Injection
function injectProductSEO(product) {
  // Update Meta Title & Description
  document.title = `${product.name} | ARB Farms Pakistan`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `Buy ${product.name} directly from ARB Farms in Multan. ${product.weight} package, Rs. ${product.price}. 100% pure & organic. Nationwide shipping across Pakistan.`);
  }

  // Create Product Schema
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [
      `https://arbfarms.com/${product.image}`
    ],
    "description": `Premium ${product.name} sourced directly from ARB Farms in Multan, Pakistan.`,
    "sku": product.sku || product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "PKR",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2027-12-31"
    },
    "brand": {
      "@type": "Brand",
      "name": "ARB Farms"
    }
  };

  // Add AggregateRating if available in local storage or seeded
  // For simplicity, we hardcode a great rating as per the UI
  productSchema.aggregateRating = {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "24"
  };

  const scriptProduct = document.createElement('script');
  scriptProduct.type = 'application/ld+json';
  scriptProduct.text = JSON.stringify(productSchema);
  document.head.appendChild(scriptProduct);

  // Create Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://arbfarms.com/"
    },{
      "@type": "ListItem",
      "position": 2,
      "name": "Shop",
      "item": "https://arbfarms.com/shop"
    },{
      "@type": "ListItem",
      "position": 3,
      "name": product.category ? product.category.replace(/-/g, ' ') : "Products",
      "item": `https://arbfarms.com/shop?category=${product.category}`
    },{
      "@type": "ListItem",
      "position": 4,
      "name": product.name,
      "item": window.location.href
    }]
  };
  
  const scriptBreadcrumb = document.createElement('script');
  scriptBreadcrumb.type = 'application/ld+json';
  scriptBreadcrumb.text = JSON.stringify(breadcrumbSchema);
  document.head.appendChild(scriptBreadcrumb);
}

// ==== BUNDLE CALCULATION LOGIC ====
function calculateCartTotals(cart) {
  let subtotal = 0;
  let totalWeight = 0;
  
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    totalWeight += (item.weight || 0) * item.qty;
  });

  let discount = 0;
  let activeBundles = [];
  
  // Apply Auto-Bundling logic
  if (typeof window.bundlesDb !== 'undefined') {
    // Determine how many of each item is in the cart
    let cartCounts = {};
    cart.forEach(item => {
      cartCounts[item.id] = item.qty;
    });

    window.bundlesDb.forEach(bundle => {
      // Check if all items for this bundle exist in the cart
      const maxPossibleBundles = Math.min(...bundle.items.map(itemId => cartCounts[itemId] || 0));
      
      if (maxPossibleBundles > 0) {
        // Calculate the base price of the items in this bundle
        let bundleBasePrice = 0;
        bundle.items.forEach(itemId => {
          const cartItem = cart.find(i => i.id === itemId);
          if (cartItem) {
            bundleBasePrice += cartItem.price;
          }
        });
        
        // Calculate 5% discount for this bundle
        const bundleDiscount = bundleBasePrice * bundle.discountRate * maxPossibleBundles;
        discount += bundleDiscount;
        
        activeBundles.push({
          name: bundle.name,
          discount: bundleDiscount,
          qty: maxPossibleBundles
        });
        
        // Deduct the counts so items aren't double-counted for other bundles
        bundle.items.forEach(itemId => {
          cartCounts[itemId] -= maxPossibleBundles;
        });
      }
    });
  }

  return {
    subtotal,
    discount,
    total: subtotal - discount,
    totalWeight,
    activeBundles
  };
}

function addBundleToCart(bundleId) {
  if (typeof window.bundlesDb === 'undefined' || typeof window.productsDb === 'undefined') return;
  const bundle = window.bundlesDb.find(b => b.id === bundleId);
  if (!bundle) return;
  
  // Create an array of products to add
  const productsToAdd = bundle.items.map(itemId => window.productsDb.find(p => p.id === itemId)).filter(Boolean);
  
  let currentCart = JSON.parse(localStorage.getItem('arb_cart')) || [];
  
  productsToAdd.forEach(product => {
    const existing = currentCart.find(i => i.id === product.id);
    
    // Parse and normalize weight to kg
    let parsedWeight = 0;
    if (product.weight) {
      let wStr = String(product.weight).toLowerCase().trim();
      let val = parseFloat(wStr);
      if (!isNaN(val)) {
        if (wStr.includes('gm') || wStr.includes('gram') || (val >= 100 && !wStr.includes('kg') && !product.id.toLowerCase().includes('seeds') && !product.id.toLowerCase().includes('wheat') && !product.id.toLowerCase().includes('bales'))) {
          parsedWeight = val / 1000;
        } else {
          parsedWeight = val;
        }
      }
    }

    if (existing) {
      existing.qty += 1;
      existing.weight = parsedWeight; // Keep it normalized
      existing.price = typeof calculateTieredPrice === 'function' ? calculateTieredPrice(existing.id, existing.qty, existing.basePrice || product.price) : product.price;
    } else {
      const price = typeof calculateTieredPrice === 'function' ? calculateTieredPrice(product.id, 1, product.price) : product.price;
      currentCart.push({
        id: product.id,
        sku: SKU_MAP[product.id] ?? null,   // ← ADD THIS LINE
        name: product.name.replace(/ (Small|Large|Medium|Bulk)$/i, ''),
        price: price,
        basePrice: parseFloat(product.price),
        weight: parsedWeight,
        category: product.category || '',
        image: product.image || 'catalog/sowing-seeds-v2.svg',
        qty: 1
      });
    }
  });
  
  localStorage.setItem('arb_cart', JSON.stringify(currentCart));
  
  if (typeof updateBadges === 'function') updateBadges();
  else if (typeof updateCartBadge === 'function') updateCartBadge();
  
  if (document.getElementById('sidebar-cart-items')) {
    updateSidebarCart();
  }
  
  // Show toast notification
  if (typeof showToast === 'function') {
    showToast(`Added ${bundle.name} to cart!`, 'success');
  }

  // Open the sidebar offcanvas automatically
  const offcanvasEl = document.getElementById('cartOffcanvas');
  if (offcanvasEl && typeof bootstrap !== 'undefined') {
    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    offcanvas.show();
  }
}

// Bundle section removed
