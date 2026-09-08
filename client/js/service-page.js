// GamesBoy.net - Dedicated Streaming Platform Hub Engine (service-page.js)

const state = {
  platformKey: 'netflix',
  hub: null,
  groups: [],
  selectedGroup: null,
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  wallet: { balanceUsd: 25.0 },
  exchangeRatePyg: 7500
};

// --- HELPER: FORMAT PRICES IN GUARANÍES & USD ---
function formatPriceGs(amountUsd) {
  const rate = state.exchangeRatePyg || 7500;
  const pyg = Math.round((parseFloat(amountUsd) || 0) * rate);
  return `${pyg.toLocaleString('es-PY')} Gs.`;
}

// --- EXTRACT PLATFORM KEY FROM URL QUERY OR PATHNAME ---
function getPlatformFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('platform') || params.get('id') || params.get('service') || 'netflix';
  return raw.toLowerCase().trim();
}

// --- INITIALIZE PAGE ---
async function initHubPage() {
  state.platformKey = getPlatformFromUrl();
  initUserSession();
  setupEventListeners();
  await loadHubData();
}

// --- 1. LOAD PLATFORM DATA & GROUPS FROM API ---
async function loadHubData() {
  try {
    const res = await fetch(`/api/streaming-hubs/${state.platformKey}`);
    const data = await res.json();

    if (data.success && data.hub) {
      state.hub = data.hub;
      state.groups = data.groups || [];
      renderHubView();
    } else {
      showToast('error', 'Error al Cargar Plataforma', 'No se pudieron cargar los datos de este servicio.');
    }
  } catch (err) {
    console.error('Error fetching hub data:', err);
    showToast('error', 'Error de Red', 'No se pudo conectar con el servidor.');
  }
}

// --- 2. RENDER THE COMPLETE DEDICATED HUB PAGE ---
function renderHubView() {
  const hub = state.hub;
  if (!hub) return;

  // Set Page Title
  document.title = `${hub.name} - GamesBoy.net | Cuentas Compartidas con Garantía de Reembolso`;

  // Breadcrumb
  const breadcrumbPlatform = document.getElementById('hub-breadcrumb-platform');
  if (breadcrumbPlatform) breadcrumbPlatform.textContent = hub.name;

  // 1. Panoramic Horizontal Hero Banner
  const heroBackdrop = document.getElementById('hub-hero-backdrop');
  if (heroBackdrop) {
    heroBackdrop.style.backgroundImage = `url('${hub.bannerHorizontal || ''}')`;
  }
  const heroBadge = document.getElementById('hub-badge-quality');
  if (heroBadge) heroBadge.textContent = hub.badgeText || 'ULTRA HD 4K • DOLBY ATMOS';

  const heroTitle = document.getElementById('hub-hero-title');
  if (heroTitle) heroTitle.textContent = hub.name;

  const heroTagline = document.getElementById('hub-hero-tagline');
  if (heroTagline) heroTagline.textContent = hub.tagline || '';

  const heroDesc = document.getElementById('hub-hero-desc');
  if (heroDesc) heroDesc.textContent = hub.description || '';

  // 2. Metrics Bar (Minimalist & Sleek)
  const metrics = hub.metrics || {};
  const elAcc = document.getElementById('hub-metric-accounts');
  const elUsr = document.getElementById('hub-metric-users');
  const elSav = document.getElementById('hub-metric-savings');
  const elRat = document.getElementById('hub-metric-rating');

  if (elAcc) elAcc.textContent = `${metrics.activeAccounts || state.groups.length * 4} Cuentas`;
  if (elUsr) elUsr.textContent = `+${metrics.activeUsersMonth || 140} Usuarios`;
  if (elSav) elSav.textContent = `Hasta -${metrics.avgSavingsPercent || 75}% OFF`;
  if (elRat) elRat.textContent = `${metrics.rating || '4.95 / 5.0'} ★`;

  // 3. Render Groups List in Main Section
  renderGroupsList();

  // 4. Render Sidebar Releases & Top Rankings
  renderSidebarReleases();
}

// --- 3. RENDER RELEASES & NOVEDADES (IN NARROW RIGHT SIDEBAR) ---
function renderSidebarReleases() {
  const container = document.getElementById('hub-sidebar-releases-list');
  if (!container) return;

  const releases = (state.hub && state.hub.releases && state.hub.releases.length > 0) 
    ? state.hub.releases 
    : [];

  if (releases.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); font-size: 0.78rem; padding: 0.5rem 0;">No hay estrenos registrados en este momento.</p>`;
    return;
  }

  container.innerHTML = releases.map(rel => `
    <div class="hub-sidebar-release-item">
      <div class="hub-sidebar-rel-thumb">
        <img src="${rel.posterUrl || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=150&q=80'}" alt="${rel.title}" loading="lazy">
      </div>
      <div class="hub-sidebar-rel-info">
        <span class="hub-sidebar-rel-badge">${rel.type || 'Oficial'}</span>
        <h4 class="hub-sidebar-rel-title">${rel.title}</h4>
        <div class="hub-sidebar-rel-date">${rel.releaseDate || 'Estreno 2025'}</div>
        <p class="hub-sidebar-rel-synopsis">${rel.synopsis || ''}</p>
      </div>
    </div>
  `).join('');
}

// --- 4. RENDER HOST GROUPS LIST WITH INVERTED SLOT SILHOUETTES & RULES BUTTON ---
function renderGroupsList() {
  const container = document.getElementById('hub-groups-list');
  if (!container) return;

  if (state.groups.length === 0) {
    container.innerHTML = `
      <div style="background: rgba(16, 20, 32, 0.7); border: 1px solid var(--border-medium); border-radius: 14px; padding: 2.5rem 1.5rem; text-align: center;">
        <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">No hay grupos de anfitriones abiertos en este momento para esta plataforma.</p>
        <button class="btn-primary-block" style="width: auto; margin: 0 auto; padding: 10px 22px;" onclick="window.location.href='/?publish=true'">
          ¿Tienes una cuenta familiar? Sé el primer anfitrión ➔
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.groups.map(g => {
    const isAvail = g.availableSlots > 0;
    const occupiedSlots = g.totalSlots - g.availableSlots;
    const host = g.host || { id: 'usr_admin', name: 'Anfitrión Verificado', avatar: '/assets/branding/icon.png', rating: '4.9 ★', badge: '⭐ Anfitrión Verificado' };
    const hostId = host.id || g.sellerId || 'usr_seller1';

    // INVERTED SLOTS SILHOUETTES:
    // ENCENDIDO / BRILLANTE / GLOW = OCUPADO
    // APAGADO / TENUE / GRIS = DISPONIBLE
    let slotsSvg = '';
    for (let i = 0; i < g.totalSlots; i++) {
      const isOccupied = i < occupiedSlots;
      slotsSvg += `
        <div class="slot-sil-wrap" title="${isOccupied ? 'Perfil Ocupado' : 'Perfil Disponible para unirse'}">
          <svg class="slot-sil-icon ${isOccupied ? 'slot-occupied' : 'slot-available'}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      `;
    }

    return `
      <div class="hub-group-card ${isAvail ? '' : 'disabled'}">
        <!-- Host Profile Info (Linked to Public Seller Profile) -->
        <div class="hub-group-host-column">
          <div class="hub-group-host-avatar-wrap">
            <img src="${host.avatar || '/assets/branding/icon.png'}" alt="${host.name}" class="hub-group-host-avatar">
          </div>
          <div class="hub-group-host-details">
            <a href="/seller.html?id=${hostId}" class="hub-group-host-name-link" title="Ver perfil público del vendedor y reseñas">
              ${host.name} ➔
            </a>
            <span class="hub-group-host-badge">${host.badge || '⭐ Anfitrión Verificado'}</span>
            <span class="hub-group-host-rating">Valoración: <strong style="color: #fbbf24;">${host.rating}</strong></span>
          </div>
        </div>

        <!-- Plan & Profile Details -->
        <div class="hub-group-plan-column">
          <div class="hub-group-plan-title">${g.planName}</div>
          <div class="hub-group-plan-features">
            <span>🛡️ PIN Privado</span>
            <span>•</span>
            <span>📱 1 Dispositivo Simultáneo</span>
            <span>•</span>
            <span>⚡ Entrega Inmediata</span>
          </div>
          
          <!-- Inverted Slots Bar with Visual Guide -->
          <div class="hub-group-slots-bar">
            <div class="hub-group-slots-icons">${slotsSvg}</div>
            <span class="hub-group-slots-text">
              <strong style="color: var(--accent-emerald);">${g.availableSlots} libres</strong> de ${g.totalSlots} cupos
              <span class="slots-legend">(${occupiedSlots} ocupados)</span>
            </span>
          </div>

          <!-- Rules & Info Button -->
          <button type="button" class="btn-group-rules-link" onclick="openRulesModal('${g.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>Ver Reglas del Grupo & Normas</span>
          </button>
        </div>

        <!-- Pricing & Action -->
        <div class="hub-group-action-column">
          <div class="hub-group-pricing">
            <span class="hub-group-price-label">Mensualidad</span>
            <span class="hub-group-price-gs">${formatPriceGs(g.pricePerSlotUsd)}</span>
            <span class="hub-group-price-usd">$${parseFloat(g.pricePerSlotUsd).toFixed(2)} USDT</span>
          </div>
          <button class="btn-hub-join-group ${isAvail ? '' : 'disabled'}" onclick="openEscrowModal('${g.id}')">
            ${isAvail ? 'Unirse al Grupo ➔' : 'Agotado'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// --- 5. GROUP RULES MODAL CONTROLLER ---
window.openRulesModal = function(groupId) {
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return;

  const modal = document.getElementById('modal-group-rules');
  const title = document.getElementById('rules-group-title');
  const subtitle = document.getElementById('rules-group-subtitle');
  const instructions = document.getElementById('rules-host-instructions');

  if (title) title.textContent = `Reglas del Grupo: ${group.serviceName}`;
  if (subtitle) subtitle.textContent = `Plan: ${group.planName} • Anfitrión: ${group.host?.name || 'Verificado'}`;
  if (instructions) instructions.textContent = group.instructions || 'Perfil privado exclusivo con PIN personal. Uso estricto de 1 pantalla a la vez. No compartir credenciales con terceros.';

  if (modal) modal.style.display = 'grid';
};

window.closeRulesModal = function() {
  const modal = document.getElementById('modal-group-rules');
  if (modal) modal.style.display = 'none';
};

// --- 6. REFUND GUARANTEE MODAL CONTROLLER ---
window.openEscrowModal = function(groupId) {
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return;

  state.selectedGroup = group;

  const modal = document.getElementById('modal-escrow-join');
  const planBadge = document.getElementById('modal-escrow-plan-badge');
  const subName = document.getElementById('modal-escrow-sub-name');
  const hostName = document.getElementById('modal-escrow-host-name');
  const priceGs = document.getElementById('modal-escrow-price-gs');
  const priceUsd = document.getElementById('modal-escrow-price-usd');
  const userBalance = document.getElementById('modal-escrow-user-balance');

  if (planBadge) planBadge.textContent = group.planName;
  if (subName) subName.textContent = group.serviceName;
  if (hostName) hostName.textContent = group.host?.name || 'Anfitrión Verificado';
  if (priceGs) priceGs.textContent = formatPriceGs(group.pricePerSlotUsd);
  if (priceUsd) priceUsd.textContent = `$${parseFloat(group.pricePerSlotUsd).toFixed(2)} USDT / mes`;

  const curBalUsd = state.currentUser?.balanceUsd !== undefined ? state.currentUser.balanceUsd : (state.wallet?.balanceUsd || 0);
  if (userBalance) userBalance.textContent = formatPriceGs(curBalUsd);

  if (modal) modal.style.display = 'grid';
};

function closeEscrowModal() {
  const modal = document.getElementById('modal-escrow-join');
  if (modal) modal.style.display = 'none';
  state.selectedGroup = null;
}

// --- 7. EXECUTE REFUND GUARANTEED SUBSCRIPTION PURCHASE ---
async function handleConfirmEscrowBuy() {
  const group = state.selectedGroup;
  if (!group) return;

  if (!state.currentUser) {
    showToast('warning', 'Inicia Sesión', 'Debes iniciar sesión para unirte a un grupo.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1200);
    return;
  }

  // Strict Admin Isolation: Admin is an auditor, cannot purchase client slots
  if (state.currentUser.role === 'admin') {
    showToast('warning', 'Rol Administrador', 'Las cuentas de administración actúan como auditores. Utiliza una cuenta de cliente para realizar compras.');
    return;
  }

  const userId = state.currentUser.id;
  const btn = document.getElementById('btn-confirm-escrow-buy');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Procesando Activación Segura...';
  }

  try {
    const res = await fetch(`/api/subscriptions/${group.id}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      }
    });

    const data = await res.json();

    if (data.success) {
      closeEscrowModal();
      showToast('success', '¡Membresía Activada!', data.message || `Tu perfil ha sido asignado con éxito bajo la Garantía de Reembolso GamesBoy.`);
      
      // Update local balance
      updateUserBalance();

      // Redirect directly to dedicated purchases page after 1.5s
      setTimeout(() => {
        window.location.href = '/purchases.html';
      }, 1500);
    } else {
      if (data.error && data.error.includes('Saldo insuficiente')) {
        closeEscrowModal();
        showToast('warning', 'Saldo Insuficiente', 'Tu saldo no cubre esta membresía. Abriendo recargas SIPAP...');
        const modalDeposit = document.getElementById('modal-deposit');
        if (modalDeposit) modalDeposit.style.display = 'grid';
      } else {
        showToast('error', 'Aviso', data.error || 'No se pudo procesar la suscripción.');
      }
    }
  } catch (err) {
    showToast('error', 'Error de Conexión', 'Ocurrió un error al procesar la compra protegida.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>Aceptar y Activar Perfil ➔</span>';
    }
  }
}

// --- 8. USER SESSION & WALLET SYNC ---
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

    const adminMenu = document.getElementById('menu-item-admin-container');
    if (adminMenu && user.role === 'admin') adminMenu.style.display = 'block';
  };

  if (state.currentUser && state.currentUser.name) {
    if (unloggedGroup) unloggedGroup.style.display = 'none';
    if (loggedGroup) loggedGroup.style.display = 'inline-flex';
    updateUserDisplay(state.currentUser);
    updateUserBalance();
  } else {
    if (unloggedGroup) unloggedGroup.style.display = 'inline-flex';
    if (loggedGroup) loggedGroup.style.display = 'none';
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
      state.wallet = data.wallet;
      if (state.currentUser) state.currentUser.balanceUsd = data.wallet.balanceUsd;
    }
    if (data.exchangeRatePyg) state.exchangeRatePyg = data.exchangeRatePyg;
  } catch (e) {}

  const rate = state.exchangeRatePyg || 7500;
  const balUsd = state.currentUser?.balanceUsd !== undefined ? state.currentUser.balanceUsd : (state.wallet?.balanceUsd || 0);
  const balPyg = Math.round(balUsd * rate);

  if (balanceEl) balanceEl.textContent = `${balPyg.toLocaleString('es-PY')} Gs.`;
}

// --- 9. EVENT LISTENERS SETUP ---
function setupEventListeners() {
  const btnCloseEscrow = document.getElementById('btn-close-escrow-modal');
  const btnCancelEscrow = document.getElementById('btn-cancel-escrow');
  const btnConfirmEscrow = document.getElementById('btn-confirm-escrow-buy');

  if (btnCloseEscrow) btnCloseEscrow.onclick = closeEscrowModal;
  if (btnCancelEscrow) btnCancelEscrow.onclick = closeEscrowModal;
  if (btnConfirmEscrow) btnConfirmEscrow.onclick = handleConfirmEscrowBuy;

  const btnCloseRules = document.getElementById('btn-close-rules-modal');
  const btnRulesOk = document.getElementById('btn-rules-ok');
  if (btnCloseRules) btnCloseRules.onclick = window.closeRulesModal;
  if (btnRulesOk) btnRulesOk.onclick = window.closeRulesModal;

  const btnOpenDeposit = document.getElementById('btn-open-deposit-modal');
  const modalDeposit = document.getElementById('modal-deposit');
  const btnCloseDeposit = document.getElementById('btn-close-deposit-modal');

  if (btnOpenDeposit && modalDeposit) {
    btnOpenDeposit.onclick = () => { modalDeposit.style.display = 'grid'; };
  }
  if (btnCloseDeposit && modalDeposit) {
    btnCloseDeposit.onclick = () => { modalDeposit.style.display = 'none'; };
  }

  const tabLocal = document.getElementById('tab-pay-local');
  const tabBinance = document.getElementById('tab-pay-binance');
  const boxLocal = document.getElementById('box-pay-local');
  const boxBinance = document.getElementById('box-pay-binance');

  if (tabLocal && tabBinance && boxLocal && boxBinance) {
    tabLocal.onclick = () => {
      tabLocal.classList.add('active');
      tabBinance.classList.remove('active');
      boxLocal.style.display = 'block';
      boxBinance.style.display = 'none';
    };
    tabBinance.onclick = () => {
      tabBinance.classList.add('active');
      tabLocal.classList.remove('active');
      boxBinance.style.display = 'block';
      boxLocal.style.display = 'none';
    };
  }
}

// --- 10. TOAST NOTIFICATIONS ---
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

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initHubPage);
