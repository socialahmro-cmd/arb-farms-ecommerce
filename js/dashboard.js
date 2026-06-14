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
    if (user) {
      document.getElementById('dashboard-content').style.display = 'block';
      try {
        // 1. Load user profile
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          document.getElementById('user-name').innerText = userData.name || 'Farmer';
          document.getElementById('user-email').innerText = userData.email || user.email;
          document.getElementById('user-phone').innerText = userData.phone ? '+92 ' + userData.phone : 'N/A';

          let marla = userData.landSizeMarla || 0;
          let status = userData.landSizeStatus || "pending";
          let tier = userData.tier || "Basic";
          let effectiveMarla = status === 'approved' ? marla : 0;

          document.getElementById('approved-marla').innerText = `${marla} Marlas`;

          const statusEl = document.getElementById('marla-status');
          statusEl.innerText = status.charAt(0).toUpperCase() + status.slice(1);
          statusEl.className = 'fs-4 fw-bold ' + (status === 'approved' ? 'text-success' : status === 'rejected' ? 'text-danger' : 'text-warning');

          document.getElementById('user-tier').innerText = tier;

          if (userData.referralCode) {
            document.getElementById('referral-link').value =
              `${window.location.origin}/register.html?ref=${userData.referralCode}`;
          }

          let progressPercent = Math.min(100, (effectiveMarla / 81) * 100);
          document.getElementById('tier-progress').style.width = `${progressPercent}%`;
          renderPlantSVG(effectiveMarla);
        }

        // 2. Load orders
        const userPhone = docSnap.exists() ? docSnap.data().phone : null;
        await loadOrders(user.uid, userPhone);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      window.location.href = "login.html";
    }
  });
});

// ── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Awaiting Verification': { color: 'warning',  text: 'dark',  icon: 'bi-clock-history',       step: 0 },
  'Confirmed':             { color: 'success',  text: 'white', icon: 'bi-check-circle-fill',    step: 1 },
  'Processing':            { color: 'info',     text: 'white', icon: 'bi-gear-fill',            step: 2 },
  'Shipped':               { color: 'primary',  text: 'white', icon: 'bi-truck',                step: 3 },
  'Delivered':             { color: 'success',  text: 'white', icon: 'bi-box-seam-fill',        step: 4 },
  'Cancelled':             { color: 'danger',   text: 'white', icon: 'bi-x-circle-fill',        step: -1 }
};
const STEPS = ['Awaiting Verification', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

// ── LOAD ORDERS ───────────────────────────────────────────────────────────────
async function loadOrders(userId, userPhone) {
  const section = document.getElementById('orders-section');
  if (!section) return;

  section.innerHTML = `
    <div class="card border-0 shadow-sm p-4 mb-4">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h3 class="h5 font-primary text-primary mb-0"><i class="bi bi-bag-check me-2"></i>My Orders</h3>
        <span class="badge bg-light text-dark border" id="order-count-badge">—</span>
      </div>
      <div class="text-center py-5 text-muted" id="orders-loading">
        <div class="spinner-border text-primary mb-3" style="width:2rem;height:2rem;"></div>
        <p class="small mb-0">Fetching your orders...</p>
      </div>
      <div id="orders-list"></div>
    </div>`;

  try {
    // Query by userId
    const q1 = query(collection(db, "orders"), where("userId", "==", userId));
    const snap1 = await getDocs(q1);

    // Query by phone (guest orders)
    let snap2Docs = [];
    if (userPhone) {
      const phone = String(userPhone).replace(/^0/, '');
      const q2 = query(collection(db, "orders"), where("phone", "==", phone));
      const snap2 = await getDocs(q2);
      snap2Docs = snap2.docs;
    }

    // Merge + deduplicate
    const seen = new Set();
    const allOrders = [...snap1.docs, ...snap2Docs]
      .filter(d => {
        const num = d.data().orderNumber;
        if (seen.has(num)) return false;
        seen.add(num);
        return true;
      })
      .map(d => d.data())
      .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

    document.getElementById('orders-loading').remove();
    document.getElementById('order-count-badge').textContent = allOrders.length + ' order' + (allOrders.length !== 1 ? 's' : '');

    // Update sidebar stats
    const sidebarCount = document.getElementById('sidebar-order-count');
    const sidebarStatus = document.getElementById('sidebar-order-status');
    if (sidebarCount) sidebarCount.textContent = allOrders.length;
    if (sidebarStatus && allOrders.length > 0) {
      const latestStatus = allOrders[0].status || 'Pending';
      const cfg = STATUS_CONFIG[latestStatus] || {};
      sidebarStatus.textContent = latestStatus === 'Awaiting Verification' ? 'Awaiting' : latestStatus;
      sidebarStatus.className = `fw-bold fs-6 text-${cfg.color || 'secondary'}`;
    }

    const listEl = document.getElementById('orders-list');

    if (allOrders.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-bag-x text-muted" style="font-size:3rem;opacity:0.4;"></i>
          <p class="text-muted mt-3 mb-1 fw-semibold">No orders yet</p>
          <p class="text-muted small mb-3">Your orders will appear here once you place one.</p>
          <a href="shop.html" class="btn btn-primary btn-sm px-4">
            <i class="bi bi-bag me-1"></i> Shop Now
          </a>
        </div>`;
      return;
    }

    // Most recent = "current order" — pin it at top with full detail
    const [current, ...past] = allOrders;
    listEl.innerHTML = renderCurrentOrder(current);
    if (past.length > 0) {
      listEl.innerHTML += renderPastOrders(past);
    }

    // Expand/collapse toggle for past orders
    listEl.querySelectorAll('.order-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        const isOpen = !target.classList.contains('d-none');
        target.classList.toggle('d-none', isOpen);
        btn.querySelector('i').className = isOpen ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
      });
    });

  } catch (err) {
    console.error("Orders error:", err);
    const listEl = document.getElementById('orders-list');
    if (listEl) listEl.innerHTML = `
      <div class="alert alert-danger small">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Could not load orders: ${err.message}
      </div>`;
    document.getElementById('orders-loading')?.remove();
  }
}

// ── RENDER CURRENT ORDER (pinned, full detail) ────────────────────────────────
function renderCurrentOrder(o) {
  const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG['Awaiting Verification'];
  const isCancelled = o.status === 'Cancelled';
  const currentStep = cfg.step;
  const displayDate = o.orderDateDisplay || (o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

  const stepBar = isCancelled ? `
    <div class="alert alert-danger py-2 px-3 small mb-0">
      <i class="bi bi-x-circle-fill me-2"></i> This order was cancelled.
    </div>` : `
    <div class="d-flex align-items-center gap-0 mb-1 mt-3" style="position:relative;">
      ${STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        return `
          <div class="d-flex flex-column align-items-center flex-fill" style="position:relative;z-index:1;">
            <div class="rounded-circle d-flex align-items-center justify-content-center mb-1 fw-bold"
              style="width:28px;height:28px;font-size:0.7rem;flex-shrink:0;
                     background:${done ? '#365733' : '#e9ecef'};
                     color:${done ? '#fff' : '#adb5bd'};
                     border:2px solid ${active ? '#d4af37' : done ? '#365733' : '#dee2e6'};
                     box-shadow:${active ? '0 0 0 3px rgba(212,175,55,0.25)' : 'none'};">
              ${done ? `<i class="bi bi-check-lg" style="font-size:0.75rem;"></i>` : (i + 1)}
            </div>
            <span class="text-center" style="font-size:0.6rem;color:${done ? '#365733' : '#adb5bd'};font-weight:${active?'700':'400'};line-height:1.2;max-width:60px;">${step.replace('Awaiting Verification', 'Awaiting')}</span>
          </div>
          ${i < STEPS.length - 1 ? `<div style="height:2px;flex:1;background:${i < currentStep ? '#365733' : '#dee2e6'};margin-bottom:20px;margin-top:2px;"></div>` : ''}
        `;
      }).join('')}
    </div>`;

  const items = (o.items || []).map(item => `
    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
      <div>
        <div class="small fw-semibold text-dark">${item.name}</div>
        <div class="text-muted" style="font-size:0.75rem;">${item.weight || ''} × ${item.qty}</div>
      </div>
      <div class="small fw-bold text-dark">Rs. ${(item.price * item.qty).toLocaleString()}</div>
    </div>`).join('');

  return `
    <div class="border rounded-3 overflow-hidden mb-4" style="border-color:#365733 !important;border-width:2px !important;">
      <!-- Header -->
      <div class="px-3 py-2 d-flex align-items-center justify-content-between flex-wrap gap-2"
           style="background:linear-gradient(135deg,#2b422a,#1e2e1d);">
        <div>
          <span class="text-gold fw-bold" style="font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;">Latest Order</span>
          <div class="text-white fw-bold font-primary">${o.orderNumber}</div>
        </div>
        <div class="text-end">
          <span class="badge bg-${cfg.color} text-${cfg.text} px-3 py-2">
            <i class="bi ${cfg.icon} me-1"></i> ${o.status || 'Pending'}
          </span>
        </div>
      </div>

      <div class="p-3">
        <!-- Step bar -->
        ${stepBar}

        <!-- Meta row -->
        <div class="d-flex flex-wrap gap-3 mt-3 mb-3 pb-3 border-bottom">
          <div><span class="text-muted small d-block">Date</span><span class="small fw-semibold">${displayDate}</span></div>
          <div><span class="text-muted small d-block">City</span><span class="small fw-semibold">${o.city || '—'}</span></div>
          <div><span class="text-muted small d-block">Payment</span><span class="small fw-semibold">${o.paymentMethod || '—'}</span></div>
          <div><span class="text-muted small d-block">Shipping</span><span class="small fw-semibold">${o.shipping === 0 ? '<span class="text-success">FREE</span>' : 'Rs. ' + (o.shipping || 0).toLocaleString()}</span></div>
        </div>

        <!-- Items -->
        <div class="mb-3">${items}</div>

        <!-- Total -->
        <div class="d-flex justify-content-between align-items-center pt-2">
          <span class="small text-muted">${(o.items || []).reduce((s, i) => s + i.qty, 0)} item(s)</span>
          <div class="text-end">
            <div class="text-muted small">Order Total</div>
            <div class="fw-bold text-primary fs-5">Rs. ${(o.total || 0).toLocaleString()}</div>
          </div>
        </div>

        ${o.receiptUrl ? `
        <div class="mt-3 pt-3 border-top">
          <a href="${o.receiptUrl}" target="_blank" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-receipt me-1"></i> View Payment Receipt
          </a>
        </div>` : ''}
      </div>
    </div>`;
}

// ── RENDER PAST ORDERS (collapsible list) ─────────────────────────────────────
function renderPastOrders(orders) {
  const rows = orders.map((o, idx) => {
    const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG['Awaiting Verification'];
    const displayDate = o.orderDateDisplay || (o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
    const itemNames = (o.items || []).slice(0, 2).map(i => i.name).join(', ') + ((o.items || []).length > 2 ? ` +${o.items.length - 2} more` : '');
    const detailId = `order-detail-${idx}`;
    const itemRows = (o.items || []).map(item => `
      <div class="d-flex justify-content-between py-1">
        <span class="small text-muted">${item.name} × ${item.qty}</span>
        <span class="small fw-semibold">Rs. ${(item.price * item.qty).toLocaleString()}</span>
      </div>`).join('');

    return `
      <div class="border rounded-3 mb-2 overflow-hidden">
        <div class="d-flex align-items-center justify-content-between px-3 py-2 bg-light order-toggle" 
             data-target="${detailId}" style="cursor:pointer;">
          <div class="d-flex align-items-center gap-3">
            <div>
              <div class="small fw-bold text-dark">${o.orderNumber}</div>
              <div class="text-muted" style="font-size:0.72rem;">${displayDate} · ${itemNames}</div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-${cfg.color} text-${cfg.text}" style="font-size:0.65rem;">${o.status || 'Pending'}</span>
            <span class="fw-bold small text-primary">Rs. ${(o.total || 0).toLocaleString()}</span>
            <i class="bi bi-chevron-down text-muted small"></i>
          </div>
        </div>
        <div class="d-none px-3 pb-3 pt-2" id="${detailId}">
          ${itemRows}
          <div class="d-flex justify-content-between pt-2 mt-1 border-top">
            <span class="small text-muted">Total</span>
            <span class="small fw-bold text-primary">Rs. ${(o.total || 0).toLocaleString()}</span>
          </div>
          ${o.receiptUrl ? `<a href="${o.receiptUrl}" target="_blank" class="btn btn-sm btn-outline-secondary mt-2"><i class="bi bi-receipt me-1"></i> Receipt</a>` : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="mb-2">
      <div class="text-muted small fw-semibold text-uppercase mb-2" style="letter-spacing:0.05em;">
        <i class="bi bi-clock-history me-1"></i> Order History (${orders.length})
      </div>
      ${rows}
    </div>`;
}

// ── PLANT SVG ─────────────────────────────────────────────────────────────────
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
      <circle cx="120" cy="50" r="6" fill="#ffca28"><animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/></circle>
      <circle cx="100" cy="20" r="6" fill="#ffca28"><animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite"/></circle>`;
  }
  svg.innerHTML = html;
}
