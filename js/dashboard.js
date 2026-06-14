import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      });
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      document.getElementById('dashboard-content').style.display = 'block';
      
      try {
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
            document.getElementById('referral-link').value = `${window.location.origin}/register.html?ref=${userData.referralCode}`;
          }
          
          let progressPercent = Math.min(100, (effectiveMarla / 81) * 100);
          document.getElementById('tier-progress').style.width = `${progressPercent}%`;
          
          renderPlantSVG(effectiveMarla);

          // Load orders - pass phone for matching
          await loadOrders(userData.phone || '');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Still try to load orders from localStorage as fallback
        await loadOrders('');
      }
    } else {
      window.location.href = "login.html";
    }
  });
});

async function loadOrders(userPhone) {
  const container = document.getElementById('orders-container');
  const badge = document.getElementById('orders-count-badge');
  if (!container) return;

  // 1. Try to get orders from localStorage first (always available, set at checkout)
  const localOrders = JSON.parse(localStorage.getItem('arb_all_orders') || '[]');

  // 2. Try Firestore - query by phone number
  let firestoreOrders = [];
  if (userPhone) {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('phone', '==', userPhone), orderBy('orderDate', 'desc'));
      const snapshot = await getDocs(q);
      firestoreOrders = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (err) {
      console.warn('Firestore orders query failed (may need index):', err.message);
      // Fallback: try without orderBy (avoids index requirement)
      try {
        const ordersRef = collection(db, 'orders');
        const q2 = query(ordersRef, where('phone', '==', userPhone));
        const snapshot2 = await getDocs(q2);
        firestoreOrders = snapshot2.docs.map(d => ({ ...d.data(), id: d.id }))
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      } catch (err2) {
        console.warn('Firestore fallback also failed:', err2.message);
      }
    }
  }

  // 3. Merge: prefer Firestore data (has live status), supplement with localStorage
  const merged = [...firestoreOrders];
  localOrders.forEach(lo => {
    if (!merged.find(o => o.orderNumber === lo.orderNumber)) {
      merged.push(lo);
    }
  });

  // Sort by date descending
  merged.sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

  if (badge) badge.textContent = `${merged.length} order${merged.length !== 1 ? 's' : ''}`;

  if (merged.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-bag-x" style="font-size:3rem; opacity:0.3;"></i>
        <p class="mt-3 mb-2">No orders yet.</p>
        <a href="shop.html" class="btn btn-sm btn-primary">Start Shopping</a>
      </div>`;
    return;
  }

  const statusColors = {
    'Awaiting Verification': 'warning',
    'Awaiting Receipt': 'secondary',
    'Processing': 'info',
    'Dispatched': 'primary',
    'Delivered': 'success',
    'Cancelled': 'danger',
  };

  container.innerHTML = merged.map(order => {
    const statusColor = statusColors[order.status] || 'secondary';
    const items = order.items || [];
    const itemsHtml = items.length > 0
      ? items.map(i => `<span class="badge bg-light text-dark border me-1 mb-1">${i.name} x${i.qty}</span>`).join('')
      : '<span class="text-muted small">No item details</span>';
    const receiptBadge = order.receiptUploaded
      ? `<span class="badge bg-success ms-2"><i class="bi bi-check-circle me-1"></i>Receipt ✓</span>`
      : `<span class="badge bg-danger ms-2"><i class="bi bi-exclamation-circle me-1"></i>No Receipt</span>`;

    return `
      <div class="border rounded-3 p-3 mb-3 bg-light">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
          <div>
            <span class="fw-bold text-dark">${order.orderNumber || 'N/A'}</span>
            ${receiptBadge}
            <span class="text-muted small ms-2">${order.orderDate || ''}</span>
          </div>
          <span class="badge bg-${statusColor} text-${statusColor === 'warning' ? 'dark' : 'white'}">${order.status || 'Pending'}</span>
        </div>
        <div class="mb-2">${itemsHtml}</div>
        <div class="d-flex flex-wrap gap-3 small text-muted">
          <span><i class="bi bi-geo-alt me-1"></i>${order.city || ''}</span>
          <span><i class="bi bi-cash me-1"></i>${order.paymentMethod || ''}</span>
          <span class="fw-bold text-dark">Rs. ${(order.total || 0).toLocaleString()}</span>
        </div>
      </div>`;
  }).join('');
}

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
      </path>
    `;
  } else if (marla >= 5 && marla < 21) {
    html += `
      <path d="M100 140 Q95 100 100 70" fill="none" stroke="#4caf50" stroke-width="4" stroke-linecap="round" />
      <path d="M100 110 Q80 100 90 85 Q95 95 100 110" fill="#8bc34a" />
      <path d="M100 90 Q120 80 110 65 Q105 75 100 90" fill="#8bc34a" />
    `;
  } else if (marla >= 21 && marla < 81) {
    html += `
      <path d="M100 140 Q95 80 100 40" fill="none" stroke="#2e7d32" stroke-width="6" stroke-linecap="round" />
      <path d="M100 110 Q70 100 80 75 Q90 90 100 110" fill="#4caf50" />
      <path d="M100 90 Q130 80 120 55 Q110 70 100 90" fill="#4caf50" />
      <path d="M100 70 Q75 60 85 40 Q95 55 100 70" fill="#66bb6a" />
      <path d="M100 40 Q110 20 100 10 Q90 20 100 40" fill="#8bc34a" />
    `;
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
    `;
  }
  
  svg.innerHTML = html;
}
