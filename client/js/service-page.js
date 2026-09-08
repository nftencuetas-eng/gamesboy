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
  initLiveSearch();
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

  // 2. Metrics Bar (Minimalist & Sleek 1-Line)
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

  const sidebarCard = container.closest('.hub-sidebar-card');
  const releases = (state.hub && state.hub.releases && state.hub.releases.length > 0) 
    ? state.hub.releases 
    : [];

  // Hide the cartelera card completely for non-entertainment services (e.g. Canva, ChatGPT)
  if (releases.length === 0) {
    if (sidebarCard) sidebarCard.style.display = 'none';
    return;
  }

  if (sidebarCard) sidebarCard.style.display = 'block';

  container.innerHTML = releases.map(rel => `
    <div class="hub-sidebar-release-item">
      <div class="hub-sidebar-rel-thumb">
        <img src="${rel.posterUrl || '/assets/branding/icon.png'}" alt="${rel.title}" loading="lazy">
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

// --- 4. RENDER HOST GROUPS LIST WITH EMPTY / SOLD-OUT STATES & WAITING LIST ---
function renderGroupsList() {
  const container = document.getElementById('hub-groups-list');
  if (!container) return;

  const hub = state.hub || {};
  const pricePyg = hub.pricePerSlotPyg || 25000;
  const netSlotPyg = hub.netPerSlotPyg || Math.round(pricePyg * 0.9);
  const maxSlots = hub.maxSlots || 5;
  const potentialPyg = hub.potentialMonthlyEarningsPyg || (netSlotPyg * maxSlots);
  const waitingCount = hub.waitingCount || 0;

  const totalAvailSlots = (state.groups || []).reduce((sum, g) => sum + (g.availableSlots || 0), 0);
  const hasAvailableSeats = state.groups.length > 0 && totalAvailSlots > 0;

  // SCENARIO 1: NO ACCOUNTS PUBLISHED YET OR ALL ACCOUNTS ARE SOLD OUT (0 SEATS AVAILABLE)
  if (!hasAvailableSeats) {
    const isSoldOut = state.groups.length > 0 && totalAvailSlots === 0;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- MONETIZATION / HOST INVITATION CARD -->
        <div style="background: linear-gradient(135deg, rgba(16, 21, 38, 0.92) 0%, rgba(9, 14, 26, 0.98) 100%); border: 1.5px solid rgba(251, 191, 36, 0.4); border-radius: 18px; padding: 2rem; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6); position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; width: 140px; height: 140px; background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
          
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 1.6rem;">💡</span>
            <h3 style="font-size: 1.25rem; font-weight: 900; color: #ffffff; margin: 0;">
              ${isSoldOut ? `¡Todos los cupos de ${hub.name} están ocupados!` : `¿Tienes una cuenta de ${hub.name}?`}
            </h3>
          </div>

          <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 1.25rem;">
            Sé el próximo anfitrión y comparte los cupos libres de tu cuenta familiar con usuarios verificados. GamesBoy retiene los pagos y te garantiza el cobro puntual de tu saldo cada 30 días con <strong>Bóveda Escrow</strong>.
          </p>

          <!-- Live Potential Earnings Box -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 14px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
            <div>
              <span style="font-size: 0.72rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700;">Ganancia Neta por Asiento:</span>
              <div style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 800; color: var(--accent-emerald);">${netSlotPyg.toLocaleString('es-PY')} Gs.</div>
            </div>
            <div>
              <span style="font-size: 0.72rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700;">Ingreso Máximo por Cuenta (${maxSlots} cupos):</span>
              <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 900; color: #ffd700;">Hasta ${potentialPyg.toLocaleString('es-PY')} Gs. / mes</div>
            </div>
          </div>

          <button class="btn-primary-block" style="width: auto; padding: 12px 28px; font-size: 0.95rem; font-weight: 800; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: none; color: #000; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4); display: inline-flex; align-items: center; gap: 8px;" onclick="window.location.href='/monetizar'">
            <span>Publicar Mi Cuenta y Empezar a Ganar ➔</span>
          </button>
        </div>

        <!-- HIGH DEMAND & WAITING LIST DEMAND WIDGET -->
        <div style="background: rgba(16, 20, 32, 0.75); border: 1px solid rgba(0, 194, 255, 0.25); border-radius: 18px; padding: 1.75rem; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); padding: 4px 14px; border-radius: 20px; margin-bottom: 12px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 8px #ef4444;"></span>
            <span style="font-size: 0.76rem; font-weight: 800; color: #ef4444; text-transform: uppercase;">ALTA DEMANDA EN VIVO</span>
          </div>

          <h3 style="font-size: 1.3rem; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
            Hay <strong id="waiting-count-display" style="color: #ef4444; font-size: 1.45rem; font-family: var(--font-mono);">${waitingCount} personas esperando</strong> por un asiento en ${hub.name}
          </h3>

          <p style="font-size: 0.86rem; color: var(--text-secondary); max-width: 580px; margin: 0 auto 1.5rem auto; line-height: 1.5;">
            Actualmente no hay cupos libres disponibles para compra inmediata. Haz clic en el botón de abajo para unirte a la lista de espera y recibir notificación instantánea cuando un usuario comparta su cuenta.
          </p>

          <!-- Interactive Waiting List Button -->
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <button type="button" id="btn-join-waiting-list" class="btn-primary-block" style="width: auto; padding: 13px 30px; font-size: 0.95rem; font-weight: 800; background: linear-gradient(135deg, rgba(0, 194, 255, 0.25) 0%, rgba(0, 112, 243, 0.2) 100%); border: 1.5px solid var(--accent-cyan); color: #ffffff; border-radius: 12px; cursor: pointer; box-shadow: 0 0 25px rgba(0, 194, 255, 0.25); display: inline-flex; align-items: center; gap: 10px;" onclick="joinWaitingList()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span id="btn-join-waiting-text">🙋‍♂️ Me gustaría adquirir un asiento / Unirme a la Lista de Espera</span>
            </button>
          </div>
        </div>

      </div>
    `;
    return;
  }

  // SCENARIO 2: ACTIVE GROUPS WITH AVAILABLE SEATS EXIST
  container.innerHTML = state.groups.map(g => {
    const isAvail = g.availableSlots > 0;
    const occupiedSlots = g.totalSlots - g.availableSlots;
    const host = g.host || { id: 'usr_admin', name: 'Anfitrión Verificado', avatar: '/assets/branding/icon.png', rating: '4.9 ★', badge: '⭐ Anfitrión Verificado' };
    const hostId = host.id || g.sellerId || 'usr_seller1';

    // SLOTS SILHOUETTES:
    // LIBRE = PRENDIDO / VERDE BRILLANTE / GLOW
    // OCUPADO = APAGADO / TENUE / GRIS
    let slotsSvg = '';
    const totalSlotsCount = Math.max(1, g.totalSlots || 5);
    const availCount = Math.min(totalSlotsCount, Math.max(0, g.availableSlots !== undefined ? g.availableSlots : totalSlotsCount));
    const occupiedCount = totalSlotsCount - availCount;

    if (totalSlotsCount <= 12) {
      for (let i = 1; i <= totalSlotsCount; i++) {
        const profile = g.profiles ? (g.profiles[i] || g.profiles[String(i)] || g.profiles[i - 1]) : null;
        const isOccupied = profile ? (profile.isOccupied === true || profile.isAvailable === false) : (i > availCount);

        slotsSvg += `
          <div class="slot-sil-wrap" title="${isOccupied ? 'Perfil Ocupado / Personal' : 'Perfil Disponible para unirse'}">
            <svg class="slot-sil-icon ${isOccupied ? 'slot-occupied' : 'slot-available'}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        `;
      }
    } else {
      slotsSvg = `
        <div class="slot-sil-wrap" style="padding: 3px 10px; border-radius: 8px; background: rgba(0, 194, 255, 0.08); border: 1px solid rgba(0, 194, 255, 0.25);" title="${availCount} de ${totalSlotsCount} cupos disponibles">
          <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--accent-emerald);">
            👤 ${availCount} / ${totalSlotsCount} cupos libres
          </span>
        </div>
      `;
    }

    return `
      <div class="hub-group-card ${isAvail ? '' : 'disabled'}" onclick="openGroupDetailModal('${g.id}')" style="cursor: pointer;">
        <!-- Host Profile Info (Linked to Public Seller Profile) -->
        <div class="hub-group-host-column">
          <div class="hub-group-host-avatar-wrap">
            <img src="${host.avatar || '/assets/branding/icon.png'}" alt="${host.name}" class="hub-group-host-avatar">
          </div>
          <div class="hub-group-host-details">
            <a href="/seller.html?id=${hostId}" class="hub-group-host-name-link" onclick="event.stopPropagation();" title="Ver perfil público del vendedor y reseñas">
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
          
          <!-- Slots Bar with Visual Guide -->
          <div class="hub-group-slots-bar">
            <div class="hub-group-slots-icons">${slotsSvg}</div>
            <span class="hub-group-slots-text">
              <strong style="color: var(--accent-emerald);">${availCount} libres</strong> de ${totalSlotsCount} cupos
              <span class="slots-legend">(${occupiedCount} ocupados)</span>
            </span>
          </div>

          <!-- Rules & Info Button -->
          <button type="button" class="btn-group-rules-link" onclick="event.stopPropagation(); openGroupDetailModal('${g.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>Ver Detalles, Perfiles & Reglas ➔</span>
          </button>
        </div>

        <!-- Pricing & Action -->
        <div class="hub-group-action-column">
          <div class="hub-group-pricing">
            <span class="hub-group-price-label">Mensualidad</span>
            <span class="hub-group-price-gs">${formatPriceGs(g.pricePerSlotUsd)}</span>
            <span class="hub-group-price-usd">$${parseFloat(g.pricePerSlotUsd).toFixed(2)} USDT</span>
          </div>
          <button class="btn-hub-join-group ${isAvail ? '' : 'disabled'}" onclick="event.stopPropagation(); openGroupDetailModal('${g.id}')">
            ${isAvail ? 'Ver Grupo & Perfiles ➔' : 'Agotado'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// --- 5. JOIN WAITING LIST HANDLER ---
window.joinWaitingList = async function() {
  const btn = document.getElementById('btn-join-waiting-list');
  const btnText = document.getElementById('btn-join-waiting-text');
  const countDisplay = document.getElementById('waiting-count-display');

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Sumándote a la lista de espera...';

  try {
    const res = await fetch(`/api/streaming-hubs/${state.platformKey}/waiting-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.currentUser?.id || null,
        email: state.currentUser?.email || null
      })
    });
    const data = await res.json();

    if (data.success) {
      if (countDisplay) {
        countDisplay.textContent = `${data.waitingCount} personas esperando`;
      }
      if (btn) {
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        btn.style.borderColor = 'var(--accent-emerald)';
      }
      if (btnText) {
        btnText.textContent = `✅ ¡Te has sumado a la lista de espera! (${data.waitingCount} en fila)`;
      }
      showToast('success', '¡Lista de Espera Confirmada!', data.message);
    } else {
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = '🙋‍♂️ Me gustaría adquirir un asiento / Unirme a la Lista de Espera';
      showToast('error', 'Aviso', data.error || 'No se pudo registrar en la lista de espera');
    }
  } catch (err) {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = '🙋‍♂️ Me gustaría adquirir un asiento / Unirme a la Lista de Espera';
    showToast('error', 'Error de Conexión', 'No se pudo conectar con el servidor.');
  }
};

// --- 5. 2-COLUMN GROUP DETAIL POP-UP MODAL (1/4 RULES + 3/4 PROFILES & ACTIVATION) ---
window.openGroupDetailModal = function(groupId) {
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return;

  state.selectedGroup = group;

  const modal = document.getElementById('modal-group-detail');
  const planBadge = document.getElementById('modal-detail-plan-badge');
  const title = document.getElementById('modal-detail-title');
  const subtitle = document.getElementById('modal-detail-subtitle');
  const priceGs = document.getElementById('modal-detail-price-gs');
  const priceUsd = document.getElementById('modal-detail-price-usd');
  const hostAvatar = document.getElementById('modal-detail-host-avatar');
  const hostName = document.getElementById('modal-detail-host-name');
  const hostRating = document.getElementById('modal-detail-host-rating');
  const hostInstructions = document.getElementById('modal-detail-host-instructions');
  const slotsSummary = document.getElementById('modal-detail-slots-summary');
  const profilesGrid = document.getElementById('modal-detail-profiles-grid');
  const buyBtnText = document.getElementById('btn-group-detail-buy-text');

  if (planBadge) planBadge.textContent = group.planName || 'Plan Ultra HD 4K';
  if (title) title.textContent = group.serviceName || 'Suscripción de Streaming';
  if (subtitle) subtitle.textContent = `Membresía compartida • PIN exclusivo asignado`;
  if (priceGs) priceGs.textContent = formatPriceGs(group.pricePerSlotUsd);
  if (priceUsd) priceUsd.textContent = `$${parseFloat(group.pricePerSlotUsd).toFixed(2)} USDT / mes`;

  const host = group.host || { name: 'Anfitrión Verificado', avatar: '/assets/branding/icon.png', rating: '4.9 ★', badge: '⭐ Anfitrión Verificado' };
  if (hostAvatar) hostAvatar.src = host.avatar || '/assets/branding/icon.png';
  if (hostName) hostName.textContent = host.name || 'Anfitrión Verificado';
  if (hostRating) hostRating.textContent = `${host.rating || '4.9 ★'} • ${host.badge || '⭐ Anfitrión Verificado'}`;
  if (hostInstructions) hostInstructions.textContent = group.instructions || 'Perfil privado exclusivo con PIN personal. Entrega inmediata en Bóveda tras unirse.';

  const totalCap = Math.max(1, group.totalSlots || 5);
  const availCount = Math.min(totalCap, Math.max(0, group.availableSlots !== undefined ? group.availableSlots : totalCap));
  const occupiedSlots = totalCap - availCount;

  if (slotsSummary) slotsSummary.textContent = `${availCount} de ${totalCap} Libres`;

  // Render per-profile matrix (LIBRE = PRENDIDO / OCUPADO = APAGADO)
  if (profilesGrid) {
    let tilesHtml = '';
    if (totalCap <= 20) {
      let firstFreeFound = false;
      for (let i = 1; i <= totalCap; i++) {
        const profile = group.profiles ? (group.profiles[i] || group.profiles[String(i)] || group.profiles[i - 1]) : null;
        const isOccupied = profile ? (profile.isOccupied === true || profile.isAvailable === false) : (i > availCount);
        const profileName = profile?.name ? profile.name : `Cupo ${i}`;
        
        let isSelected = false;
        if (!isOccupied && !firstFreeFound) {
          isSelected = true;
          firstFreeFound = true;
        }

        tilesHtml += `
          <div class="profile-slot-tile ${isOccupied ? 'occupied' : 'available'} ${isSelected ? 'selected' : ''}" 
               title="${isOccupied ? `Perfil Ocupado (${profileName})` : `Perfil Disponible para ti (${profileName})`}">
            <svg class="slot-sil-icon ${isOccupied ? 'slot-occupied' : 'slot-available'}" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span class="profile-tile-num">${profileName}</span>
            <span class="profile-tile-status ${isOccupied ? 'occ' : 'lib'}">
              ${isOccupied ? 'Ocupado' : 'Disponible'}
            </span>
          </div>
        `;
      }
    } else {
      const percentOccupied = Math.round((occupiedSlots / totalCap) * 100);
      tilesHtml = `
        <div style="grid-column: 1 / -1; background: rgba(0,0,0,0.35); border: 1px solid rgba(0,194,255,0.2); border-radius: 12px; padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="font-size: 0.9rem; font-weight: 700; color: #fff;">Panel Multiusuario (${totalCap} cupos)</span>
            <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald); font-size: 0.95rem;">${availCount} cupos disponibles</span>
          </div>
          <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden; margin-bottom: 0.75rem;">
            <div style="width: ${percentOccupied}%; height: 100%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald)); border-radius: 6px;"></div>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">
            ✨ Tu cuenta o invitación privada será asignada automáticamente en el cupo disponible con acceso total e inmediato.
          </p>
        </div>
      `;
    }
    profilesGrid.innerHTML = tilesHtml;
  }

  if (buyBtnText) {
    buyBtnText.textContent = `Unirme a este Grupo • ${formatPriceGs(group.pricePerSlotUsd)} (Garantía 30 Días) ➔`;
  }

  if (modal) modal.style.display = 'grid';
};

window.closeGroupDetailModal = function() {
  const modal = document.getElementById('modal-group-detail');
  if (modal) modal.style.display = 'none';
};

// --- 6. CONFIRM JOIN FROM 2-COLUMN MODAL WITH ESCROW GUARANTEE ---
window.confirmGroupDetailJoin = function() {
  if (!state.selectedGroup) return;
  closeGroupDetailModal();
  openEscrowModal(state.selectedGroup.id);
};

// --- GROUP RULES MODAL CONTROLLER ---
window.openRulesModal = function(groupId) {
  openGroupDetailModal(groupId);
};

window.closeRulesModal = function() {
  const modal = document.getElementById('modal-group-rules');
  if (modal) modal.style.display = 'none';
};

// --- REFUND GUARANTEE MODAL CONTROLLER ---
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

// --- 11. LIVE SEARCH & INSTANT AUTOCOMPLETE ---
function initLiveSearch() {
  const btnSearchToggle = document.getElementById('btn-search-toggle');
  const searchExpandable = document.getElementById('header-search-expandable');
  const btnSearchClose = document.getElementById('btn-search-close');
  const searchInput = document.getElementById('main-search-input');
  const dropdown = document.getElementById('search-dropdown-results');

  if (btnSearchToggle && searchExpandable && searchInput) {
    btnSearchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = searchExpandable.classList.toggle('expanded');
      if (isExpanded) {
        searchInput.focus();
      } else {
        searchInput.value = '';
        if (dropdown) dropdown.style.display = 'none';
      }
    });
  }

  if (btnSearchClose && searchExpandable && searchInput) {
    btnSearchClose.addEventListener('click', (e) => {
      e.stopPropagation();
      searchExpandable.classList.remove('expanded');
      searchInput.value = '';
      if (dropdown) dropdown.style.display = 'none';
    });
  }

  // Pre-load searchable items if needed
  let searchableItems = [];
  fetch('/api/store/products')
    .then(r => r.json())
    .then(data => {
      if (data.products) {
        searchableItems = data.products.map(p => ({
          name: p.title || p.name,
          type: p.category === 'streaming' ? 'Suscripción' : (p.category === 'game_key' ? 'Juego Digital' : 'Tarjeta'),
          price: p.priceUsd,
          id: p.id,
          category: p.category
        }));
      }
    })
    .catch(() => {});

  if (searchInput && dropdown) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        dropdown.style.display = 'none';
        return;
      }

      const results = searchableItems.filter(item => item.name && item.name.toLowerCase().includes(query));

      if (results.length === 0) {
        dropdown.innerHTML = `<div style="padding: 12px; color: var(--text-tertiary); font-size: 0.85rem;">No se encontraron resultados para "${query}"</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = results.slice(0, 6).map(r => `
        <div style="padding: 10px 14px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="handleServiceSearchResultClick('${r.category}', '${r.id}')">
          <div>
            <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff;">${r.name}</div>
            <span style="font-size: 0.72rem; color: var(--accent-cyan); text-transform: uppercase;">${r.type}</span>
          </div>
          <strong style="color: #ffffff; font-family: var(--font-mono); font-size: 0.88rem;">${formatPriceGs(r.price)}</strong>
        </div>
      `).join('');

      dropdown.style.display = 'block';
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#header-search-wrapper')) {
      if (dropdown) dropdown.style.display = 'none';
      if (searchExpandable && !searchInput?.value.trim()) {
        searchExpandable.classList.remove('expanded');
      }
    }
  });
}

window.handleServiceSearchResultClick = function(category, id) {
  const dropdown = document.getElementById('search-dropdown-results');
  if (dropdown) dropdown.style.display = 'none';
  if (category === 'streaming') {
    window.location.href = `/service.html?platform=${id}`;
  } else {
    window.location.href = `/?buyProd=${id}`;
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initHubPage);
