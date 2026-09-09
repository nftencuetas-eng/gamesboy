// GamesBoy.net - Public Seller Profile & Tweet-Style Verified Reviews Engine (seller-profile.js)

const state = {
  sellerId: 'usr_seller1',
  sellerData: null,
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  exchangeRatePyg: 7500
};

// Format Currency
function formatPriceGs(amountUsd) {
  const rate = state.exchangeRatePyg || 7500;
  const pyg = Math.round((parseFloat(amountUsd) || 0) * rate);
  return `${pyg.toLocaleString('es-PY')} Gs.`;
}

// Get Seller ID from URL
function getSellerIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || params.get('seller') || 'usr_seller1';
}

// Relative time formatter (e.g. "Hace 2 horas", "Hace 3 días")
function formatRelativeTime(isoString) {
  if (!isoString) return 'Recientemente';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Hace un momento';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 30) return `Hace ${diffDays} días`;
  return new Date(isoString).toLocaleDateString('es-PY');
}

// Initialize Page
async function initSellerProfile() {
  state.sellerId = getSellerIdFromUrl();
  initUserSession();
  setupStarRating();
  setupReviewForm();
  await loadSellerProfile();
}

// Load Seller Data & Reviews
async function loadSellerProfile() {
  try {
    const res = await fetch(`/api/seller/public/${state.sellerId}`);
    const data = await res.json();

    if (data.success && data.seller) {
      state.sellerData = data;
      renderSellerHeader(data.seller);
      renderSellerListings(data.listings || []);
      renderSellerReviews(data.reviews || []);
    } else {
      showToast('error', 'Vendedor no Encontrado', 'No se pudo cargar la información del anfitrión.');
    }
  } catch (err) {
    console.error('Error loading seller profile:', err);
    showToast('error', 'Error de Red', 'No se pudo conectar con el servidor.');
  }
}

// Render Header & Stats
function renderSellerHeader(seller) {
  document.title = `${seller.name} - Perfil del Vendedor | GamesBoy.net`;

  const breadcrumb = document.getElementById('seller-breadcrumb-name');
  if (breadcrumb) breadcrumb.textContent = seller.name;

  const title = document.getElementById('seller-name-title');
  if (title) title.innerHTML = `<span>${seller.name}</span>`;

  const avatar = document.getElementById('seller-avatar-img');
  if (avatar) avatar.src = seller.avatar || '/assets/branding/icon.png';

  const badge = document.getElementById('seller-badge-text');
  if (badge) badge.textContent = seller.badge || '⭐ Anfitrión Verificado';

  const member = document.getElementById('seller-member-since');
  if (member) member.textContent = `Miembro desde ${seller.memberSince || '2025'}`;

  const score = document.getElementById('seller-stat-score');
  if (score) score.textContent = `${seller.stats?.rating || '5.0'} ★`;

  const revCount = document.getElementById('seller-stat-reviews-count');
  if (revCount) revCount.textContent = `${seller.stats?.totalReviews || 0} Reseñas`;

  const services = document.getElementById('seller-stat-services');
  if (services) services.textContent = seller.stats?.activeListings || 0;

  const sold = document.getElementById('seller-stat-sold');
  if (sold) sold.textContent = seller.stats?.totalSoldSlots || 0;
}

// Render Active Listings / Accounts with Inverted Slots
function renderSellerListings(listings) {
  const container = document.getElementById('seller-listings-container');
  if (!container) return;

  if (listings.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(16, 20, 32, 0.7); border: 1px solid var(--border-medium); border-radius: 14px; padding: 2rem; text-align: center;">
        <p style="color: var(--text-secondary);">Este vendedor no tiene cuentas de streaming publicadas activamente en este momento.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = listings.map(l => {
    const isAvail = l.availableSlots > 0;
    const platformSlug = l.serviceName.toLowerCase().includes('netflix') ? 'netflix'
      : l.serviceName.toLowerCase().includes('spotify') ? 'spotify'
      : l.serviceName.toLowerCase().includes('disney') ? 'disney'
      : l.serviceName.toLowerCase().includes('max') ? 'max'
      : l.serviceName.toLowerCase().includes('youtube') ? 'youtube'
      : l.serviceName.toLowerCase().includes('chatgpt') ? 'chatgpt'
      : l.serviceName.toLowerCase().includes('crunchyroll') ? 'crunchyroll'
      : l.serviceName.toLowerCase().includes('paramount') ? 'paramount'
      : 'netflix';

    const totalSlotsCount = Math.max(1, l.totalSlots || 5);
    const availCount = Math.min(totalSlotsCount, Math.max(0, l.availableSlots !== undefined ? l.availableSlots : totalSlotsCount));
    const shortLogoText = l.serviceName.split(' ')[0].slice(0, 4).toUpperCase();

    const avatarStackHtml = `
      <div class="hub-mini-avatar-stack">
        <img src="/assets/branding/icon.png" alt="${l.serviceName}" class="hub-mini-stack-img">
        <div class="hub-mini-stack-user" style="background: linear-gradient(135deg, #0284c7, #0369a1);">👤</div>
        <div class="hub-mini-stack-user" style="background: linear-gradient(135deg, #9333ea, #7e22ce);">👤</div>
        <span class="hub-mini-stack-count" title="${availCount} de ${totalSlotsCount} cupos libres">
          ${availCount > 0 ? (totalSlotsCount > 6 ? `+${availCount}` : `${availCount} libres`) : 'Lleno'}
        </span>
      </div>
    `;

    return `
      <div class="hub-group-card ${isAvail ? '' : 'disabled'}" onclick="window.location.href='/service.html?platform=${platformSlug}'" title="Haz clic para ver disponibilidad y perfiles">
        <!-- Top Row: Brand Logo + Tag Badge -->
        <div class="hub-mini-card-top">
          <div class="hub-mini-brand-icon" style="background: rgba(0, 194, 255, 0.15); border-color: rgba(0, 194, 255, 0.35);">
            <span class="hub-mini-brand-letter">${shortLogoText}</span>
          </div>
          <span class="hub-mini-badge-pill ${isAvail ? 'verified' : 'incentive'}">
            ${isAvail ? '⚡ Cupos Inmediatos' : '🔒 Agotado'}
          </span>
        </div>

        <!-- Middle Row: Overlapping Avatars & Slot count -->
        <div class="hub-mini-avatars-row">
          ${avatarStackHtml}
        </div>

        <!-- Info: Platform & Plan Name -->
        <div class="hub-mini-info-wrap">
          <h3 class="hub-mini-service-title">${l.serviceName}</h3>
          <p class="hub-mini-plan-subtitle">${l.planName || 'Plan Compartido'}</p>
        </div>

        <!-- Pricing Row -->
        <div class="hub-mini-price-row">
          <div class="hub-mini-price-left">
            <span class="hub-mini-price-lbl">Mínimo por mes</span>
            <div class="hub-mini-price-gs">${formatPriceGs(l.pricePerSlotUsd)}</div>
          </div>
          <div class="hub-mini-price-right">
            <span class="hub-mini-price-usd">$${parseFloat(l.pricePerSlotUsd).toFixed(2)} USD</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Tweet-Style Reviews Stream
function renderSellerReviews(reviews) {
  const container = document.getElementById('seller-reviews-container');
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(16, 20, 32, 0.6); border: 1px solid var(--border-medium); border-radius: 12px; padding: 2rem; text-align: center;">
        <p style="color: var(--text-secondary); margin-bottom: 4px;">Este anfitrión aún no tiene reseñas públicas.</p>
        <span style="font-size: 0.78rem; color: var(--text-tertiary);">Sé el primero en adquirir un cupo y dejar una valoración verificada.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map(rev => {
    const stars = '★'.repeat(rev.rating || 5) + '☆'.repeat(5 - (rev.rating || 5));
    const initials = (rev.buyerName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return `
      <div class="tweet-review-card">
        <div class="tweet-review-header">
          <div class="tweet-review-author">
            <div class="tweet-review-avatar">
              ${initials}
            </div>
            <div>
              <div class="tweet-review-name">
                <span>${rev.buyerName || 'Comprador Anónimo'}</span>
                <span class="tweet-verified-badge">✓ Comprador Verificado</span>
              </div>
              <span class="tweet-review-date">${formatRelativeTime(rev.createdAt)}</span>
            </div>
          </div>
          <div class="tweet-review-stars" title="${rev.rating} de 5 estrellas">
            ${stars}
          </div>
        </div>
        <p class="tweet-review-text">${escapeHtml(rev.comment)}</p>
      </div>
    `;
  }).join('');
}

// Setup Interactive Star Rating
function setupStarRating() {
  const container = document.getElementById('star-selector');
  const input = document.getElementById('input-review-stars');
  if (!container || !input) return;

  const buttons = container.querySelectorAll('.star-btn');
  buttons.forEach(btn => {
    btn.onclick = () => {
      const val = parseInt(btn.getAttribute('data-value'), 10);
      input.value = val;
      buttons.forEach((b, idx) => {
        b.classList.toggle('selected', idx < val);
      });
    };
  });
}

// Setup Form Submission
function setupReviewForm() {
  const form = document.getElementById('form-seller-review');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();

    if (!state.currentUser) {
      showToast('warning', 'Inicia Sesión', 'Debes iniciar sesión para valorar a un anfitrión.');
      setTimeout(() => { window.location.href = '/login'; }, 1200);
      return;
    }

    const rating = parseInt(document.getElementById('input-review-stars').value, 10) || 5;
    const comment = document.getElementById('input-review-text').value.trim();
    const btn = document.getElementById('btn-submit-review');

    if (!comment) {
      showToast('warning', 'Campo Vacío', 'Por favor escribe un comentario para tu reseña.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Publicando...';
    }

    try {
      const res = await fetch(`/api/seller/public/${state.sellerId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': state.currentUser.id
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();

      if (data.success) {
        showToast('success', '¡Reseña Publicada!', data.message || 'Tu valoración ha sido añadida con éxito.');
        document.getElementById('input-review-text').value = '';
        await loadSellerProfile();
      } else {
        showToast('error', 'Acceso Restringido', data.error || 'No se pudo publicar la reseña.');
      }
    } catch (err) {
      showToast('error', 'Error de Red', 'Ocurrió un error al enviar tu reseña.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Publicar Reseña Verificada ➔</span>';
      }
    }
  };
}

// Session & Balance
function initUserSession() {
  const unloggedGroup = document.getElementById('auth-unlogged-group');
  const loggedGroup = document.getElementById('auth-logged-group');
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatarImg = document.getElementById('nav-user-avatar-img');
  const dropdownUserName = document.getElementById('dropdown-user-name');
  const dropdownUserEmail = document.getElementById('dropdown-user-email');
  const dropdownUserAvatarImg = document.getElementById('dropdown-user-avatar-img');

  const updateUserDisplay = (user) => {
    if (!user) return;
    if (navUserName) navUserName.textContent = user.name || 'Usuario';
    if (dropdownUserName) dropdownUserName.textContent = user.name || 'Usuario';
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || 'usuario@gamesboy.net';

    const avatarSrc = (user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/assets'))) 
      ? user.avatar 
      : '/assets/branding/icon.png';

    if (navUserAvatarImg) navUserAvatarImg.src = avatarSrc;
    if (dropdownUserAvatarImg) dropdownUserAvatarImg.src = avatarSrc;

    const roleBadge = document.querySelector('.user-role-badge');
    const adminMenu = document.getElementById('menu-item-admin-container');
    if (user.role === 'admin') {
      if (roleBadge) {
        roleBadge.textContent = 'Administrador Master';
        roleBadge.style.color = '#f59e0b';
      }
      if (adminMenu) adminMenu.style.display = 'block';
    } else if (user.role === 'seller') {
      if (roleBadge) {
        roleBadge.textContent = 'Vendedor Verificado';
        roleBadge.style.color = '#34d399';
      }
      if (adminMenu) adminMenu.style.display = 'none';
    } else {
      if (roleBadge) {
        roleBadge.textContent = 'Cliente Verificado';
        roleBadge.style.color = '#00c2ff';
      }
      if (adminMenu) adminMenu.style.display = 'none';
    }
  };

  if (state.currentUser && (state.currentUser.id || state.currentUser.name)) {
    if (unloggedGroup) {
      unloggedGroup.classList.add('is-hidden');
      unloggedGroup.style.display = 'none';
    }
    if (loggedGroup) {
      loggedGroup.classList.remove('is-hidden');
      loggedGroup.style.removeProperty('display');
      loggedGroup.style.display = 'inline-flex';
    }
    updateUserDisplay(state.currentUser);
    updateUserBalance();

    // Fetch latest profile to keep session fresh
    fetch('/api/auth/profile', { headers: { 'x-user-id': state.currentUser.id } })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          state.currentUser = { ...state.currentUser, ...data.user, balanceUsd: data.balanceUsd };
          localStorage.setItem('gb_user', JSON.stringify(state.currentUser));
          updateUserDisplay(state.currentUser);
          updateUserBalance();
        }
      })
      .catch(() => {});
  } else {
    if (unloggedGroup) {
      unloggedGroup.classList.remove('is-hidden');
      unloggedGroup.style.removeProperty('display');
      unloggedGroup.style.display = 'inline-flex';
    }
    if (loggedGroup) {
      loggedGroup.classList.add('is-hidden');
      loggedGroup.style.display = 'none';
    }
  }

  // Profile dropdown toggle
  const btnToggle = document.getElementById('btn-user-profile-toggle');
  const menu = document.getElementById('user-profile-dropdown-menu');
  const wrapper = document.getElementById('user-profile-wrapper');

  if (btnToggle && menu && wrapper) {
    btnToggle.onclick = (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display === 'block';
      menu.style.display = isOpen ? 'none' : 'block';
      wrapper.classList.toggle('open', !isOpen);
    };

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        menu.style.display = 'none';
        wrapper.classList.remove('open');
      }
    });
  }

  const btnLogout = document.getElementById('btn-header-logout');
  if (btnLogout) {
    btnLogout.onclick = () => {
      localStorage.removeItem('gb_user');
      localStorage.removeItem('gb_token');
      window.location.href = '/';
    };
  }

  const btnOpenDeposit = document.getElementById('btn-open-deposit-modal');
  const modalDeposit = document.getElementById('modal-deposit');
  if (btnOpenDeposit && modalDeposit) {
    btnOpenDeposit.onclick = () => { modalDeposit.style.display = 'grid'; };
  }
}

async function updateUserBalance() {
  if (!state.currentUser) return;
  const balanceEl = document.getElementById('nav-user-balance-amount');

  try {
    const res = await fetch('/api/wallet/balance', {
      headers: { 'x-user-id': state.currentUser.id }
    });
    const data = await res.json();
    if (data.wallet && data.wallet.balanceUsd !== undefined) {
      if (state.currentUser) {
        state.currentUser.balanceUsd = data.wallet.balanceUsd;
        localStorage.setItem('gb_user', JSON.stringify(state.currentUser));
      }
    }
    if (data.exchangeRatePyg) state.exchangeRatePyg = data.exchangeRatePyg;
  } catch (e) {}

  const rate = state.exchangeRatePyg || 7500;
  const balUsd = state.currentUser?.balanceUsd || 0;
  const balPyg = Math.round(balUsd * rate);

  if (balanceEl) balanceEl.textContent = `${balPyg.toLocaleString('es-PY')} Gs.`;
}

// Helpers
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(type = 'info', title = '', message = '', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;

  const icons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div style="flex: 1; min-width: 0;">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-msg">${message}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Cerrar">✕</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  };

  closeBtn.onclick = removeToast;
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

// DOM Load
document.addEventListener('DOMContentLoaded', initSellerProfile);
