import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

    let userData = {};
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) userData = docSnap.data();
    } catch (e) {
      console.warn("Could not fetch user doc:", e.message);
    }

    // Populate profile
    document.getElementById('user-name').innerText  = userData.name  || user.displayName || 'Farmer';
    document.getElementById('user-email').innerText = userData.email || user.email       || 'N/A';
    document.getElementById('user-phone').innerText = userData.phone || 'N/A';

    const marla  = userData.landSizeMarla  || 0;
    const status = userData.landSizeStatus || "pending";
    const tier   = userData.tier           || "Basic";
    const effectiveMarla = status === 'approved' ? marla : 0;

    document.getElementById('approved-marla').innerText = `${marla} Marlas`;
    document.getElementById('user-tier').innerText = tier;

    const statusEl = document.getElementById('marla-status');
    statusEl.innerText = status.charAt(0).toUpperCase() + status.slice(1);
    if (status === 'approved') { statusEl.className = 'fs-4 fw-bold text-success'; }
    else if (status === 'rejected') { statusEl.className = 'fs-4 fw-bold text-danger'; }

    if (userData.referralCode) {
      const el = document.getElementById('referral-link');
      if (el) el.value = `${window.location.origin}/register.html?ref=${userData.referralCode}`;
    }

    document.getElementById('tier-progress').style.width = `${Math.min(100, (effectiveMarla / 81) * 100)}%`;
    renderPlantSVG(effectiveMarla);

    // Load orders — try every possible phone variant + uid
    await loadOrders(user.uid, userData.phone || '');
  });
});

// Normalise phone to all variants we might find in Firestore orders
function phoneVariants(phone) {
  if (!phone) return [];
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+92/, '0');
  const withZero    = cleaned.startsWith('0') ? cleaned : '0' + cleaned;
  const withoutZero = withZero.slice(1);           // e.g. 3001234567
  const with92      = '+92' + withoutZero;          // e.g. +923001234567
  // deduplicate
  return [...new Set([withZero, withoutZero, with92, phone.trim()])];
}

async function queryOrdersByPhone(phone) {
  const variants = phoneVariants(phone);
  if (!variants.length) return [];

  const results = [];
  const seen = new Set();
  const ref = collection(db, 'orders');

  for (const v of variants) {
    try {
      const snap = await getDocs(query(ref, where('phone', '==', v)));
      snap.docs.forEach(d => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          results.push({ ...d.data(), id: d.id });
        }
      });
    } catch (e) {
      console.warn(`Firestore query failed for phone variant "${v}":`, e.message);
    }
  }
  return results;
}

async function queryOrdersByUid(uid) {
  try {
    const snap = await getDocs(query(collection(db, 'orders'), where('uid', '==', uid)));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (e) {
    console.warn("Firestore uid query failed:", e.message);
    return [];
  }
}

async function loadOrders(uid, phone) {
  const container = document.getElementById('orders-container');
  const badge     = document.getElementById('orders-count-badge');
  if (!container) return;

  // 1. localStorage orders (saved immediately at checkout — always reliable)
  const localOrders = JSON.parse(localStorage.getItem('arb_all_orders') || '[]');

  // 2. Firestore: query by uid AND all phone variants in parallel
  const [byUid, byPhone] = await Promise.all([
    queryOrdersByUid(uid),
    queryOrdersByPhone(phone)
  ]);

  // 3. Merge all sources, deduplicate by orderNumber
  const seen = new Set();
  const merged = [];
  [...byUid, ...byPhone, ...localOrders].forEach(o => {
    const key = o.orderNumber || o.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(o);
    }
  });

  // 4. Sort newest first (orderDate is a human string like "Jun 14, 2026")
  merged.sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

  if (badge) badge.textContent = `${merged.length} order${merged.length !== 1 ? 's' : ''}`;

  if (merged.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-bag-x" style="font-size:3rem;opacity:0.3;"></i>
        <p class="mt-3 mb-2">No orders found.</p>
        <a href="shop.html" class="btn btn-sm btn-primary">Start Shopping</a>
      </div>`;
    return;
  }

  const statusColor = {
    'Awaiting Verification': 'warning',
    'Awaiting Receipt':      'secondary',
    'Processing':            'info',
    'Dispatched':            'primary',
    'Delivered':             'success',
    'Cancelled':             'danger',
  };

  container.innerHTML = merged.map(order => {
    const color = statusColor[order.status] || 'secondary';
    const textColor = color === 'warning' ? 'dark' : 'white';
    const items = (order.items || []);
    const itemsHtml = items.length
      ? items.map(i => `<span class="badge bg-light text-dark border me-1 mb-1">${i.name} ×${i.qty}</span>`).join('')
      : '<span class="text-muted small">—</span>';

    const receiptBadge = order.receiptUploaded
      ? `<span class="badge bg-success ms-1"><i class="bi bi-check-circle me-1"></i>Receipt ✓</span>`
      : `<span class="badge bg-warning text-dark ms-1"><i class="bi bi-clock me-1"></i>Receipt Pending</span>`;

    return `
      <div class="border rounded-3 p-3 mb-3 bg-white">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
          <div>
            <span class="fw-bold text-dark font-monospace">${order.orderNumber || '—'}</span>
            ${receiptBadge}
            <span class="text-muted small ms-2">${order.orderDate || ''}</span>
          </div>
          <span class="badge bg-${color} text-${textColor}">${order.status || 'Pending'}</span>
        </div>
        <div class="mb-2">${itemsHtml}</div>
        <div class="d-flex flex-wrap gap-3 small text-muted">
          <span><i class="bi bi-geo-alt me-1"></i>${order.city || ''}</span>
          <span><i class="bi bi-cash me-1"></i>${order.paymentMethod || ''}</span>
          <span class="fw-bold text-dark ms-auto">Rs. ${(order.total || 0).toLocaleString()}</span>
        </div>
      </div>`;
  }).join('');
}

function renderPlantSVG(marla) {
  const svg = document.getElementById('farm-svg');
  if (!svg) return;
  let html = `<line x1="10" y1="140" x2="190" y2="140" stroke="#8b5a2b" stroke-width="4" stroke-linecap="round"/>`;
  if (marla < 5) {
    html += `<ellipse cx="100" cy="140" rx="8" ry="5" fill="#c49a6c"/>
      <path d="M100 135 Q105 120 110 135" fill="none" stroke="#5cb85c" stroke-width="2">
        <animate attributeName="d" values="M100 135 Q105 130 110 135;M100 135 Q105 120 110 135" dur="2s" repeatCount="indefinite"/>
      </path>`;
  } else if (marla < 21) {
    html += `<path d="M100 140 Q95 100 100 70" fill="none" stroke="#4caf50" stroke-width="4" stroke-linecap="round"/>
      <path d="M100 110 Q80 100 90 85 Q95 95 100 110" fill="#8bc34a"/>
      <path d="M100 90 Q120 80 110 65 Q105 75 100 90" fill="#8bc34a"/>`;
  } else if (marla < 81) {
    html += `<path d="M100 140 Q95 80 100 40" fill="none" stroke="#2e7d32" stroke-width="6" stroke-linecap="round"/>
      <path d="M100 110 Q70 100 80 75 Q90 90 100 110" fill="#4caf50"/>
      <path d="M100 90 Q130 80 120 55 Q110 70 100 90" fill="#4caf50"/>
      <path d="M100 70 Q75 60 85 40 Q95 55 100 70" fill="#66bb6a"/>
      <path d="M100 40 Q110 20 100 10 Q90 20 100 40" fill="#8bc34a"/>`;
  } else {
    html += `<path d="M95 140 L95 60 L105 60 L105 140 Z" fill="#795548"/>
      <circle cx="100" cy="50" r="40" fill="#2e7d32"><animate attributeName="r" values="38;42;38" dur="4s" repeatCount="indefinite"/></circle>
      <circle cx="70" cy="60" r="30" fill="#388e3c"/>
      <circle cx="130" cy="60" r="30" fill="#388e3c"/>
      <circle cx="80" cy="40" r="6" fill="#ffca28"><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="120" cy="50" r="6" fill="#ffca28"><animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/></circle>`;
  }
  svg.innerHTML = html;
}
