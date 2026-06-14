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
        // ── 1. Load user profile ──────────────────────────────────────────
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();

          document.getElementById('user-name').innerText = userData.name || 'Farmer';
          document.getElementById('user-email').innerText = userData.email || user.email;
          document.getElementById('user-phone').innerText = userData.phone || 'N/A';

          let marla = userData.landSizeMarla || 0;
          let status = userData.landSizeStatus || "pending";
          let tier = userData.tier || "Basic";
          let effectiveMarla = status === 'approved' ? marla : 0;

          document.getElementById('approved-marla').innerText = `${marla} Marlas`;

          const statusEl = document.getElementById('marla-status');
          statusEl.innerText = status.charAt(0).toUpperCase() + status.slice(1);
          if (status === 'approved') {
            statusEl.classList.remove('text-warning');
            statusEl.classList.add('text-success');
          } else if (status === 'rejected') {
            statusEl.classList.remove('text-warning');
            statusEl.classList.add('text-danger');
          }

          document.getElementById('user-tier').innerText = tier;

          if (userData.referralCode) {
            document.getElementById('referral-link').value =
              `${window.location.origin}/register.html?ref=${userData.referralCode}`;
          }

          let progressPercent = Math.min(100, (effectiveMarla / 81) * 100);
          document.getElementById('tier-progress').style.width = `${progressPercent}%`;
          renderPlantSVG(effectiveMarla);
        }

        // ── 2. Load orders ────────────────────────────────────────────────
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

// ── Load and render orders from Firestore ─────────────────────────────────────
async function loadOrders(userId, userPhone) {
  const container = document.getElementById('orders-section');
  if (!container) return;

  container.innerHTML = `
    <div class="card border-0 shadow-sm p-4 mt-4">
      <h3 class="h5 font-primary text-primary mb-3"><i class="bi bi-bag-check me-2"></i>My Orders</h3>
      <div class="text-center py-4 text-muted" id="orders-loading">
        <div class="spinner-border spinner-border-sm text-primary me-2"></div> Loading orders...
      </div>
      <div id="orders-list"></div>
    </div>`;

  try {
    // Query 1: orders linked to Firebase userId
    const q1 = query(collection(db, "orders"), where("userId", "==", userId));
    const snap1 = await getDocs(q1);

    // Query 2: orders placed by same phone (guest orders before account existed)
    let snap2Docs = [];
    if (userPhone) {
      const phone = userPhone.replace(/^0/, ''); // normalize — remove leading 0
      const q2 = query(collection(db, "orders"), where("phone", "==", phone));
      const snap2 = await getDocs(q2);
      snap2Docs = snap2.docs;
    }

    // Merge, deduplicate by orderNumber
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

    const listEl = document.getElementById('orders-list');
    document.getElementById('orders-loading').remove();

    if (allOrders.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-bag-x text-muted" style="font-size:2.5rem;"></i>
          <p class="text-muted mt-3 mb-1">No orders yet.</p>
          <a href="shop.html" class="btn btn-sm btn-primary mt-2">Start Shopping</a>
        </div>`;
      return;
    }

    allOrders.forEach(o => {
      const statusColor = {
        'Awaiting Verification': 'warning',
        'Confirmed': 'success',
        'Processing': 'info',
        'Shipped': 'primary',
        'Delivered': 'success',
        'Cancelled': 'danger'
      }[o.status] || 'secondary';

      const items = (o.items || []).map(item =>
        `<li class="small text-muted">${item.name} × ${item.qty} — <strong>Rs. ${(item.price * item.qty).toLocaleString()}</strong></li>`
      ).join('');

      const displayDate = o.orderDateDisplay || (o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

      listEl.innerHTML += `
        <div class="border rounded-3 p-3 mb-3">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <span class="fw-bold font-primary text-dark">${o.orderNumber}</span>
              <span class="text-muted small ms-2">${displayDate}</span>
            </div>
            <span class="badge bg-${statusColor} text-${statusColor === 'warning' ? 'dark' : 'white'}">${o.status || 'Pending'}</span>
          </div>
          <ul class="mt-2 mb-2 ps-3">${items}</ul>
          <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
            <span class="small text-muted">${o.city} · ${o.paymentMethod}</span>
            <span class="fw-bold text-primary">Rs. ${(o.total || 0).toLocaleString()}</span>
          </div>
        </div>`;
    });

  } catch (err) {
    console.error("Error loading orders:", err);
    const listEl = document.getElementById('orders-list');
    if (listEl) {
      listEl.innerHTML = `<p class="text-danger small">Could not load orders. Please try again.</p>`;
    }
    const loading = document.getElementById('orders-loading');
    if (loading) loading.remove();
  }
}

// ── Plant SVG (unchanged) ──────────────────────────────────────────────────────
function renderPlantSVG(marla) {
  const svg = document.getElementById('farm-svg');
  if (!svg) return;

  let html = '';
  html += `<line x1="10" y1="140" x2="190" y2="140" stroke="#8b5a2b" stroke-width="4" stroke-linecap="round"/>`;

  if (marla < 5) {
    html += `
      <ellipse cx="100" cy="140" rx="8" ry="5" fill="#c49a6c" />
      <path d="M100 135 Q105 120 110 135" fill="none" stroke="#5cb85c" stroke-width="2">
        <animate attributeName="d" values="M100 135 Q105 130 110 135; M100 135 Q105 120 110 135" dur="2s" repeatCount="indefinite" />
      </path>`;
  } else if (marla >= 5 && marla < 21) {
    html += `
      <path d="M100 140 Q95 100 100 70" fill="none" stroke="#4caf50" stroke-width="4" stroke-linecap="round" />
      <path d="M100 110 Q80 100 90 85 Q95 95 100 110" fill="#8bc34a" />
      <path d="M100 90 Q120 80 110 65 Q105 75 100 90" fill="#8bc34a" />`;
  } else if (marla >= 21 && marla < 81) {
    html += `
      <path d="M100 140 Q95 80 100 40" fill="none" stroke="#2e7d32" stroke-width="6" stroke-linecap="round" />
      <path d="M100 110 Q70 100 80 75 Q90 90 100 110" fill="#4caf50" />
      <path d="M100 90 Q130 80 120 55 Q110 70 100 90" fill="#4caf50" />
      <path d="M100 70 Q75 60 85 40 Q95 55 100 70" fill="#66bb6a" />
      <path d="M100 40 Q110 20 100 10 Q90 20 100 40" fill="#8bc34a" />`;
  } else {
    html += `
      <path d="M95 140 L95 60 L105 60 L105 140 Z" fill="#795548" />
      <circle cx="100" cy="50" r="40" fill="#2e7d32">
        <animate attributeName="r" values="38;42;38" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="70" cy="60" r="30" fill="#388e3c" />
      <circle cx="130" cy="60" r="30" fill="#388e3c" />
      <circle cx="80" cy="40" r="6" fill="#ffca28">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="120" cy="50" r="6" fill="#ffca28">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="20" r="6" fill="#ffca28">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite" />
      </circle>`;
  }

  svg.innerHTML = html;
}
