/**
 * fomo.js - Dynamic Announcement Banner & Social Proof Engine
 * ARB Farms E-commerce
 */

// 1. Pakistani cities for localized order notifications
const pakistaniCities = [
  "Karachi, Sindh", "Lahore, Punjab", "Islamabad, Capital", "Rawalpindi, Punjab",
  "Faisalabad, Punjab", "Multan, Punjab", "Peshawar, KPK", "Quetta, Balochistan",
  "Sialkot, Punjab", "Gujranwala, Punjab", "Hyderabad, Sindh", "Sargodha, Punjab",
  "Sahiwal, Punjab", "Bahawalpur, Punjab", "Dera Ghazi Khan, Punjab", "Sheikhupura, Punjab"
];

// 2. Featured product dataset for popups
const fomoProducts = [
  { name: "Organic Desi Ghee", image: "catalog/ogn-013-desi-ghee-500gm.svg" },
  { name: "Sidr Honey Large", image: "catalog/honey.svg" },
  { name: "Premium Silage Animal Feed", image: "catalog/ogn-041-silage-40kg.svg" },
  { name: "Edible Chia Seeds", image: "catalog/ogn-028-chia-seed-250gm.svg" },
  { name: "Organic Wheat Seeds", image: "catalog/ogn-018-gandum-40kg.svg" },
  { name: "Basil Seed (Tukh Malanga)", image: "catalog/ogn-051-basil-seed-250gm.svg" },
  { name: "High-Nutrient Fodder Hay", image: "catalog/ogn-042-hay-40kg.svg" }
];

// 3. Campaign configuration based on date thresholds
const seasonalCampaigns = [
  {
    name: "Ramadan Prep",
    startMonth: 2, // March
    endMonth: 3,   // April
    bannerText: "🌙 Ramadan Prep: Fuel your Sehri & Iftar with pure Organic Honey & Desi Ghee. Order before courier shutdown!",
    discountCode: "RAMADANKHALIS"
  },
  {
    name: "Mango Season Pre-Order",
    startMonth: 4, // May
    endMonth: 7,   // August
    bannerText: "🥭 Fresh Multan Chaunsa Mangoes pre-orders are 85% full! Direct farm-to-table shipping begins soon.",
    discountCode: "MANGO2026"
  },
  {
    name: "Rabi Sowing Cycle",
    startMonth: 9, // October
    endMonth: 10,  // November
    bannerText: "🌾 Rabi Crop Alert: High-germination Wheat and Fodder Seeds are selling fast. Secure your yield!",
    discountCode: "RABIDEAL"
  },
  {
    name: "Kharif Sowing Cycle",
    startMonth: 3, // April
    endMonth: 5,   // June
    bannerText: "🌱 Spring Sowing: High-germination Okra, Gourd & vegetable seeds ready for dispatch.",
    discountCode: "KHARIFAGRI"
  },
  {
    name: "Peak Winter Health",
    startMonth: 11, // December
    endMonth: 1,    // February
    bannerText: "❄️ Winter Wellness: Warm up with cold-pressed Oils and Raw Honey. Buy the Winter Bundle now!",
    discountCode: "WINTERPURE"
  },
  {
    name: "Independence Day Sale",
    startMonth: 7, // August (Only triggered August 1st - 15th)
    endMonth: 7,
    bannerText: "🇵🇰 Jashn-e-Azadi Special! Flat 14% Off across all organic foods and agricultural seeds.",
    discountCode: "AZADI14"
  }
];

const defaultCampaign = {
  bannerText: "📦 50% Advance 50% After Delivery available all over Pakistan!",
  discountCode: "ARBFRESH"
};

// 4. Initialize Banners and Popup Cycles
document.addEventListener("DOMContentLoaded", () => {
  setupSeasonalBanner();
  startSocialProofPopups();
});

// 5. Load dynamic banner matching current season
function setupSeasonalBanner() {
  const bannerEl = document.getElementById("fomo-announcement-banner");
  if (!bannerEl) return;
  
  // Check if user dismissed the announcement banner for this session
  if (sessionStorage.getItem("dismissed_announcement") === "true") {
    bannerEl.style.display = "none";
    return;
  }
  
  const now = new Date();
  const currentMonth = now.getMonth(); 
  const currentDate = now.getDate();
  
  let activeCampaign = defaultCampaign;
  
  for (const campaign of seasonalCampaigns) {
    if (campaign.name === "Independence Day Sale") {
      if (currentMonth === 7 && currentDate <= 15) {
        activeCampaign = campaign;
        break;
      }
      continue;
    }
    
    if (campaign.startMonth <= campaign.endMonth) {
      if (currentMonth >= campaign.startMonth && currentMonth <= campaign.endMonth) {
        activeCampaign = campaign;
        break;
      }
    } else {
      if (currentMonth >= campaign.startMonth || currentMonth <= campaign.endMonth) {
        activeCampaign = campaign;
        break;
      }
    }
  }
  
  // Split banner text to make it single line responsive
  const bannerText = activeCampaign.bannerText;
  let mainText = bannerText;
  let subText = "";
  
  const splitIndex = bannerText.indexOf('!');
  if (splitIndex !== -1) {
    mainText = bannerText.substring(0, splitIndex + 1);
    subText = bannerText.substring(splitIndex + 1).trim();
  } else {
    const dotIndex = bannerText.indexOf('.');
    if (dotIndex !== -1) {
      mainText = bannerText.substring(0, dotIndex + 1);
      subText = bannerText.substring(dotIndex + 1).trim();
    }
  }
  
  bannerEl.innerHTML = `
    <div class="banner-content-wrapper">
      <!-- Spacer for centering on large viewports -->
      <div class="d-none d-lg-block" style="width: 32px;"></div>
      
      <!-- Interactive & Single Line Center Content -->
      <div class="announcement-text-container">
        <span class="text-truncate">
          <span class="announcement-main-text">${mainText}</span>
          ${subText ? `<span class="announcement-sub-text d-none d-lg-inline ms-1 text-white-50">${subText}</span>` : ''}
        </span>
        
        <!-- Clipboard-Interactive Copy Code Toggler -->
        <button type="button" class="btn-copy-coupon" id="copy-coupon-btn" onclick="window.copyCouponCode(event, '${activeCampaign.discountCode}')" title="Click to copy coupon code">
          <span id="coupon-btn-text">Code: ${activeCampaign.discountCode}</span>
          <i class="bi bi-copy" id="coupon-btn-icon"></i>
        </button>
        
        <!-- Redirect CTA Action -->
        <a href="/shop" class="btn-banner-action d-none d-sm-inline-flex">
          Pre-Order <i class="bi bi-chevron-right ms-1" style="font-size: 0.65rem;"></i>
        </a>
      </div>
      
      <!-- Dismiss Trigger -->
      <button type="button" class="btn-banner-close" aria-label="Dismiss Announcement" onclick="window.dismissSeasonalBanner(event)">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;
}

// Global helper handlers for announcement actions
window.dismissSeasonalBanner = function(event) {
  if (event) event.stopPropagation();
  const bannerEl = document.getElementById("fomo-announcement-banner");
  if (bannerEl) {
    bannerEl.style.maxHeight = bannerEl.offsetHeight + "px";
    bannerEl.offsetHeight; // force reflow
    bannerEl.style.maxHeight = "0";
    bannerEl.style.padding = "0";
    bannerEl.style.opacity = "0";
    bannerEl.style.borderBottom = "none";
    sessionStorage.setItem("dismissed_announcement", "true");
    setTimeout(() => {
      bannerEl.style.display = "none";
    }, 300);
  }
};

window.copyCouponCode = function(event, code) {
  if (event) event.stopPropagation();
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById("copy-coupon-btn");
    if (!btn) return;
    
    const textEl = document.getElementById("coupon-btn-text");
    const iconEl = document.getElementById("coupon-btn-icon");
    
    // Animate and feedback status
    btn.style.transform = "scale(1.08)";
    btn.style.backgroundColor = "var(--color-success, #28a745)";
    btn.style.color = "#ffffff";
    textEl.textContent = "Copied! ✓";
    iconEl.className = "bi bi-check-lg";
    
    setTimeout(() => {
      textEl.textContent = "Code: " + code;
      btn.style.backgroundColor = "";
      btn.style.color = "";
      iconEl.className = "bi bi-copy";
      btn.style.transform = "";
    }, 2000);
  }).catch(err => {
    console.error("Could not copy code to clipboard:", err);
  });
};


// 6. Localized popup builder
function startSocialProofPopups() {
  const popupContainer = document.createElement("div");
  popupContainer.id = "fomo-popup-container";
  popupContainer.style.position = "fixed";
  popupContainer.style.bottom = "20px";
  popupContainer.style.left = "20px";
  popupContainer.style.zIndex = "9999";
  popupContainer.style.maxWidth = "350px";
  popupContainer.style.width = "calc(100% - 40px)";
  popupContainer.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease";
  popupContainer.style.opacity = "0";
  popupContainer.style.transform = "translateY(50px)";
  
  // Media Queries check to prevent overlap on small mobile screens
  if (window.innerWidth < 576) {
    popupContainer.style.maxWidth = "280px";
    popupContainer.style.bottom = "10px";
    popupContainer.style.left = "10px";
  }
  
  document.body.appendChild(popupContainer);
  
  // Trigger first notification shortly after load, then repeat
  setTimeout(() => {
    showRandomNotification(popupContainer);
  }, 4000);
  
  setInterval(() => {
    showRandomNotification(popupContainer);
  }, Math.random() * (25000 - 15000) + 15000);
}

function showRandomNotification(container) {
  // Slide out first
  container.style.opacity = "0";
  container.style.transform = "translateY(50px)";
  
  setTimeout(() => {
    const randomCity = pakistaniCities[Math.floor(Math.random() * pakistaniCities.length)];
    const randomProduct = fomoProducts[Math.floor(Math.random() * fomoProducts.length)];
    const randomMinutes = Math.floor(Math.random() * 58) + 2;
    const randomQty = Math.floor(Math.random() * 3) + 1;
    
    container.innerHTML = `
      <div class="card border-0 shadow-lg" style="background-color: var(--color-accent-light, #fdfaf4); border-left: 5px solid var(--color-primary, #365733) !important; border-radius: var(--radius-md, 12px);">
        <div class="card-body p-3 d-flex align-items-center gap-3">
          <img src="${randomProduct.image}" alt="${randomProduct.name}" style="width: 50px; height: 50px; object-fit: contain; border-radius: var(--radius-sm, 6px); background: #fff; padding: 2px;">
          <div style="flex-grow: 1;">
            <p class="mb-0 text-dark" style="font-size: 0.8rem; font-weight: 700;">Someone in <span style="color: var(--color-primary, #365733);">${randomCity}</span></p>
            <p class="mb-1 text-dark text-truncate" style="font-size: 0.75rem; font-weight: 500; max-width: 200px;">ordered <span style="font-weight: 700;">${randomQty}x ${randomProduct.name}</span></p>
            <span class="text-muted" style="font-size: 0.65rem; display: block;"><i class="bi bi-clock-history"></i> ${randomMinutes} minutes ago &bull; <span class="text-success fw-bold"><i class="bi bi-patch-check-fill"></i> Verified</span></span>
          </div>
          <button type="button" class="btn-close ms-auto align-self-start" style="font-size: 0.65rem;" onclick="this.closest('#fomo-popup-container').style.opacity = '0';"></button>
        </div>
      </div>
    `;
    
    // Slide in
    container.classList.add("fomo-popup-active");
    container.style.opacity = "1";
    container.style.transform = "translateY(0)";
    
    // Slide out after 7 seconds
    setTimeout(() => {
      container.style.opacity = "0";
      container.style.transform = "translateY(50px)";
      container.classList.remove("fomo-popup-active");
    }, 7000);
    
  }, 500);
}
