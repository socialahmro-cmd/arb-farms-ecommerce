import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Wraps a Firestore promise with a timeout so it can never hang forever
function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => { window.location.href = "login.html"; });
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "login.html"; return; }

    document.getElementById('dashboard-content').style.display = 'block';

    // ── Load user profile ──────────────────────────────────────────────────
    let userData = {};
    try {
      const snap = await withTimeout(getDoc(doc(db, "users", user.uid)));
      if (snap.exists()) userData = snap.data();
    } catch (e) {
      console.warn("User doc fetch failed:", e.message);
    }

    document.getElementById('user-name').innerText  = userData.name  || user.displayName || 'Farmer';
    document.getElementById('user-email').innerText = userData.email || user.email || 'N/A';
    document.getElementById('user-phone').innerText = userData.phone || 'N/A';

    const marla  = userData.landSizeMarla  || 0;
    const status = userData.landSizeStatus || "pending";
    const tier   = userData.tier           || "Basic";

    document.getElementById('approved-marla').innerText = `${marla} Marlas`;
    document.getElementById('user-tier').innerText = tier;

    const statusEl = document.getElementById('marla-status');
    statusEl.innerText = status.charAt(0).toUpperCase() + status.slice(1);
    statusEl.className = 'fs-4 fw-bold ' +
      (status === 'approved' ? 'text-success' : status === 'rejected' ? 'text-danger' : 'text-warning');

    if (userData.referralCode) {
      const el = document.getElementById('referral-link');
      if (el) el.value = `${window.location.origin}/register.html?ref=${userData.referralCode}`;
    }

    const effectiveMarla = status === 'approved' ? marla : 0;
    document.getElementById('tier-progress').style.width = `${Math.min(100, (effectiveMarla / 81) * 100)}%`;
    renderPlantSVG(effectiveMarla);

    // ── Load orders ────────────────────────────────────────────────────────
    await loadOrders(user, userData.phone || '');
  });
});

async function safeQuery(q) {
  try {
    const snap = await withTimeout(getDocs(q));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (e) {
    console.warn("Query failed:", e.code || e.message);
    return [];
  }
}

async function loadOrders(user, storedPhone) {
  const container = document.getElementById('orders-container');
  const badge     = document.getElementById('orders-count-badge');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-4 text-muted">
      <div class="spinner-border spinner-border-sm me-2" role="status"></div>
      Loading your orders...
    </div>`;

  const seen   = new Set();
  const merged = [];

  function addOrders(docs) {
    docs.forEach(o => {
      const key = o.orderNumber || o.id;
      if (key && !seen.has(key)) { seen.add(key); merged.push(o); }
    });
  }

  try {
    // ── 1. Query by EMAIL (works for logged-in checkouts) ──────────────────
    if (user.email) {
      addOrders(await safeQuery(query(collection(db, 'orders'), where('email', '==', user.email))));
      console.log(`After email query: ${merged.length} orders`);
    }

    // ── 2. Query by UID (works for logged-in checkouts) ───────────────────
    addOrders(await safeQuery(query(collection(db, 'orders'), where('uid', '==', user.uid))));
    console.log(`After uid query: ${merged.length} orders`);

    // ── 3. Query by ALL phone variants from user profile ──────────────────
    // storedPhone from Firestore users doc (e.g. "03001234567" or "3001234567")
    const phones = phoneVariants(storedPhone);
    console.log("Trying phone variants:", phones);

    for (const field of ['phone', 'phoneAlt', 'phonePlus92']) {
      for (const v of phones) {
        addOrders(await safeQuery(query(collection(db, 'orders'), where(field, '==', v))));
      }
    }
    console.log(`After phone queries: ${merged.length} orders`);

    // ── 4. localStorage fallback (same device/browser guest orders) ────────
    const localOrders = JSON.parse(localStorage.getItem('arb_all_orders') || '[]');
    for (const lo of localOrders) {
      if (!lo.orderNumber || seen.has(lo.orderNumber)) continue;
      try {
        const snap = await withTimeout(getDoc(doc(db, 'orders', lo.orderNumber)));
        addOrders([snap.exists() ? { ...lo, ...snap.data(), id: snap.id } : lo]);
      } catch (e) {
        addOrders([lo]);
      }
    }
    console.log(`Final order count: ${merged.length}`);

  } finally {
    // ── Always runs — spinner is always replaced ───────────────────────────
    merged.sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

    if (badge) badge.textContent = `${merged.length} order${merged.length !== 1 ? 's' : ''}`;

    if (merged.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-bag-x" style="font-size:3rem;opacity:0.3;"></i>
          <p class="mt-3 mb-2">No orders found.</p>
          <a href="shop.html" class="btn btn-sm btn-primary mt-1">Start Shopping</a>
        </div>`;
      return;
    }

    const statusColors = {
      'Awaiting Verification': ['warning',   'dark'],
      'Awaiting Receipt':      ['secondary', 'white'],
      'Processing':            ['info',      'dark'],
      'Dispatched':            ['primary',   'white'],
      'Delivered':             ['success',   'white'],
      'Cancelled':             ['danger',    'white'],
    };

    container.innerHTML = merged.map(order => {
      const [bg, txt] = statusColors[order.status] || ['secondary', 'white'];
      const items = order.items || [];
      const itemsHtml = items.length
        ? items.map(i => `<span class="badge bg-light text-dark border me-1 mb-1">${i.name} ×${i.qty}</span>`).join('')
        : '<span class="text-muted small">—</span>';
      const receiptBadge = order.receiptUploaded
        ? `<span class="badge bg-success-subtle text-success border border-success-subtle ms-2">Receipt ✓</span>`
        : `<span class="badge bg-warning-subtle text-warning border border-warning-subtle ms-2">Receipt Pending</span>`;

      return `
        <div class="border rounded-3 p-3 mb-3 bg-white shadow-sm">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
            <div>
              <span class="fw-bold text-dark" style="font-family:monospace">${order.orderNumber || '—'}</span>
              ${receiptBadge}
              <span class="text-muted small ms-2">${order.orderDate || ''}</span>
            </div>
            <span class="badge bg-${bg} text-${txt}">${order.status || 'Pending'}</span>
          </div>
          <div class="mb-2">${itemsHtml}</div>
          <div class="d-flex flex-wrap gap-3 small text-muted border-top pt-2">
            <span><i class="bi bi-geo-alt me-1"></i>${order.city || '—'}</span>
            <span><i class="bi bi-credit-card me-1"></i>${order.paymentMethod || '—'}</span>
            <span class="fw-bold text-dark ms-auto">Rs. ${(order.total || 0).toLocaleString()}</span>
          </div>
        </div>`;
    }).join('');
  }
}

function phoneVariants(phone) {
  if (!phone) return [];
  // Normalize: strip spaces, strip +92 prefix
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+92/, '0');
  // Ensure leading zero
  const withZero    = cleaned.startsWith('0') ? cleaned : '0' + cleaned;  // 03001234567
  const withoutZero = withZero.slice(1);                                    // 3001234567
  const withPlus92  = '+92' + withoutZero;                                  // +923001234567
  return [...new Set([withZero, withoutZero, withPlus92])];
}

function renderPlantSVG(marla) {
  const svg = document.getElementById('farm-svg');
  if (!svg) return;
  let h = `<line x1="10" y1="140" x2="190" y2="140" stroke="#8b5a2b" stroke-width="4" stroke-linecap="round"/>`;
  if (marla < 5) {
    h += `<ellipse cx="100" cy="140" rx="8" ry="5" fill="#c49a6c"/>
      <path d="M100 135 Q105 120 110 135" fill="none" stroke="#5cb85c" stroke-width="2">
        <animate attributeName="d" values="M100 135 Q105 130 110 135;M100 135 Q105 120 110 135" dur="2s" repeatCount="indefinite"/>
      </path>`;
  } else if (marla < 21) {
    h += `<path d="M100 140 Q95 100 100 70" fill="none" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
      <path d="M100 110 Q80 100 90 85 Q95 95 100 110" fill="#8bc34a"/>
      <path d="M100 90 Q120 80 110 65 Q105 75 100 90" fill="#8bc34a"/>`;
  } else if (marla < 81) {
    h += `<path d="M100 140 Q95 80 100 40" fill="none" stroke="#2e7d32" stroke-width="6" stroke-linecap="round"/>
      <path d="M100 110 Q70 100 80 75 Q90 90 100 110" fill="#4caf50"/>
      <path d="M100 90 Q130 80 120 55 Q110 70 100 90" fill="#4caf50"/>
      <path d="M100 70 Q75 60 85 40 Q95 55 100 70" fill="#66bb6a"/>
      <path d="M100 40 Q110 20 100 10 Q90 20 100 40" fill="#8bc34a"/>`;
  } else {
    h += `<path d="M95 140 L95 60 L105 60 L105 140 Z" fill="#795548"/>
      <circle cx="100" cy="50" r="40" fill="#2e7d32"><animate attributeName="r" values="38;42;38" dur="4s" repeatCount="indefinite"/></circle>
      <circle cx="70" cy="60" r="30" fill="#388e3c"/>
      <circle cx="130" cy="60" r="30" fill="#388e3c"/>
      <circle cx="80" cy="40" r="6" fill="#ffca28"><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="120" cy="50" r="6" fill="#ffca28"><animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/></circle>`;
  }
  svg.innerHTML = h;
}
