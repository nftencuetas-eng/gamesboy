// GamesBoy.net - Dedicated Streaming Platform Hub Engine (service-page.js)

const state = {
  platformKey: 'netflix',
  hub: null,
  groups: [],
  selectedGroup: null,
  activeFilter: 'all',
  activeSort: 'price-asc',
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  wallet: { balanceUsd: 25.0 },
  exchangeRatePyg: 7500
};

// --- HELPER: FORMAT PRICES IN GUARANÍES & USD ---
function formatPriceGs(amountUsd) {
  const rate = state.exchangeRatePyg || 7500;
  const pyg = Math.round((parseFloat(amountUsd) || 0) * rate);
  return `${pyg.toLocaleString('es-PY')} ₲`;
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

  // 3. Render Top Crown Incentive Banner (GoSplit style)
  renderShareIncentiveBanner();

  // 4. Render Filters & Sorting
  renderFiltersAndSorting();

  // 5. Render Groups List in 3-Column Grid
  renderGroupsList();

  // 6. Render Sidebar Releases & Top Rankings
  renderSidebarReleases();
}

// --- RENDER TOP CROWN INCENTIVE BANNER ---
function renderShareIncentiveBanner() {
  const container = document.getElementById('hub-share-incentive-banner');
  if (!container) return;
  const hub = state.hub;
  if (!hub) return;

  const rate = state.exchangeRatePyg || 7500;
  const maxSlots = hub.maxSlots || 5;
  const shareableSlots = Math.max(1, maxSlots - 1);
  const netSlotPyg = hub.netPerSlotPyg || Math.round((hub.pricePerSlotPyg || 25000) * 0.9);
  const maxEarningsPyg = hub.potentialMonthlyEarningsPyg || (netSlotPyg * shareableSlots);
  const maxEarningsUsd = parseFloat((maxEarningsPyg / rate).toFixed(2));

  container.innerHTML = `
    <div class="hub-share-banner-card" onclick="window.location.href='/monetizar.html?platform=${encodeURIComponent(state.platformKey)}'">
      <div class="hub-share-banner-left">
        <div class="hub-share-banner-icon-box">👑</div>
        <div class="hub-share-banner-text">
          <h4 class="hub-share-banner-title">Compartir mi ${hub.name}</h4>
          <p class="hub-share-banner-sub">
            Con máximo puedes recibir: <strong class="hub-share-payout-val">${maxEarningsPyg.toLocaleString('es-PY')} ₲ / Mes</strong> <span class="hub-share-usd-val">($${maxEarningsUsd.toFixed(2)} USD/mes)</span>
          </p>
        </div>
      </div>
      <button type="button" class="btn-hub-share-action" onclick="event.stopPropagation(); window.location.href='/monetizar.html?platform=${encodeURIComponent(state.platformKey)}'">
        <span>Publicar Cuenta</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>
  `;
}

// --- RENDER FILTER TABS & SORTING BAR ---
function renderFiltersAndSorting() {
  const container = document.getElementById('hub-filters-sorting-bar');
  if (!container) return;
  const groups = state.groups || [];

  // Distinct plans
  const planCounts = {};
  groups.forEach(g => {
    const p = g.planName || 'Plan Estándar';
    planCounts[p] = (planCounts[p] || 0) + 1;
  });

  const planKeys = Object.keys(planCounts);

  let filterPillsHtml = `
    <button type="button" class="hub-filter-pill ${state.activeFilter === 'all' ? 'active' : ''}" onclick="setGroupFilter('all')">
      Todo (${groups.length})
    </button>
  `;

  planKeys.forEach(planName => {
    const isAct = state.activeFilter === planName;
    filterPillsHtml += `
      <button type="button" class="hub-filter-pill ${isAct ? 'active' : ''}" onclick="setGroupFilter('${encodeURIComponent(planName)}')">
        ${planName} (${planCounts[planName]})
      </button>
    `;
  });

  container.innerHTML = `
    <div class="hub-filters-row">
      <div class="hub-filter-pills-wrap">
        ${filterPillsHtml}
      </div>
      <div class="hub-sort-pills-wrap">
        <span class="hub-sort-label">Ordenar:</span>
        <button type="button" class="hub-sort-pill ${state.activeSort === 'price-asc' ? 'active' : ''}" onclick="setGroupSort('price-asc')" title="Menor precio primero">
          ⚡ Menor Precio
        </button>
        <button type="button" class="hub-sort-pill ${state.activeSort === 'slots-desc' ? 'active' : ''}" onclick="setGroupSort('slots-desc')" title="Más asientos libres primero">
          👥 Más Libres
        </button>
        <button type="button" class="hub-sort-pill ${state.activeSort === 'rating-desc' ? 'active' : ''}" onclick="setGroupSort('rating-desc')" title="Mejor calificación">
          ⭐ Confianza
        </button>
      </div>
    </div>
  `;
}

window.setGroupFilter = function(filterVal) {
  state.activeFilter = filterVal === 'all' ? 'all' : decodeURIComponent(filterVal);
  renderFiltersAndSorting();
  renderGroupsList();
};

window.setGroupSort = function(sortVal) {
  state.activeSort = sortVal;
  renderFiltersAndSorting();
  renderGroupsList();
};

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

// --- 4. RENDER HOST GROUPS LIST WITH MINIMALIST GOSPLIT STYLE CARDS ---
function renderGroupsList() {
  const container = document.getElementById('hub-groups-list');
  if (!container) return;

  const hub = state.hub || {};
  let filtered = [...(state.groups || [])];

  // 1. Filter by plan
  if (state.activeFilter && state.activeFilter !== 'all') {
    filtered = filtered.filter(g => (g.planName || '') === state.activeFilter);
  }

  // 2. Sort
  if (state.activeSort === 'price-asc') {
    filtered.sort((a, b) => (parseFloat(a.pricePerSlotUsd) || 0) - (parseFloat(b.pricePerSlotUsd) || 0));
  } else if (state.activeSort === 'slots-desc') {
    filtered.sort((a, b) => (b.availableSlots || 0) - (a.availableSlots || 0));
  } else if (state.activeSort === 'rating-desc') {
    filtered.sort((a, b) => (b.host?.trustScore || 90) - (a.host?.trustScore || 90));
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="hub-empty-groups-notice" style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; background: rgba(16, 21, 38, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;">
        <p style="color: var(--text-secondary); margin-bottom: 12px; font-size: 0.95rem;">No se encontraron cuentas activas con los filtros seleccionados.</p>
        <button type="button" class="hub-filter-pill active" onclick="setGroupFilter('all')" style="margin: 0 auto; display: inline-block;">Ver todas las cuentas</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((g, idx) => {
    const isAvail = (g.availableSlots || 0) > 0;
    const host = g.host || { id: 'usr_admin', name: 'Anfitrión Verificado', avatar: '/assets/branding/icon.png', trustScore: 95, activityText: 'En línea' };
    const totalSlotsCount = Math.max(1, g.totalSlots || hub.maxSlots || 5);
    const availCount = Math.min(totalSlotsCount, Math.max(0, g.availableSlots !== undefined ? g.availableSlots : totalSlotsCount));
    const cleanServiceName = g.serviceName || hub.name || 'Streaming';

    // Build silhouettes: 👤
    let silhouettesHtml = '';
    for (let i = 1; i <= totalSlotsCount; i++) {
      const isSeatFree = i <= availCount;
      silhouettesHtml += `
        <span class="hub-seat-sil-icon ${isSeatFree ? 'is-free' : 'is-occupied'}" title="${isSeatFree ? `Asiento ${i}: Disponible` : `Asiento ${i}: Ocupado`}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </span>
      `;
    }

    return `
      <div class="hub-gosplit-card ${isAvail ? '' : 'is-sold-out'}" onclick="openGroupDetailModal('${g.id}')">
        <!-- Top Row: Host Avatar, Name, Plan & Time -->
        <div class="hub-card-header-row">
          <div class="hub-host-avatar-wrap">
            <img src="${host.avatar}" alt="${host.name}" class="hub-host-avatar-img" onerror="this.src='/assets/branding/icon.png'">
            <span class="hub-host-trust-pill" title="Puntaje de Confianza: ${host.trustScore || 95}%">${host.trustScore || 95}</span>
          </div>
          <div class="hub-host-meta">
            <div class="hub-host-name-line">
              <strong class="hub-host-name">${host.name}</strong>
              <svg class="verified-check" width="13" height="13" viewBox="0 0 24 24" fill="#00c2ff" title="Verificado"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <span class="hub-card-plan-tag">${g.planName || cleanServiceName}</span>
          </div>
          <span class="hub-card-activity-tag">${host.activityText || 'En línea'}</span>
        </div>

        <!-- Middle Row: Pricing -->
        <div class="hub-card-pricing-block">
          <div class="hub-card-price-gs">${formatPriceGs(g.pricePerSlotUsd)} <span class="hub-card-period">/ Mes</span></div>
          <div class="hub-card-price-usd">$${parseFloat(g.pricePerSlotUsd).toFixed(2)} USD</div>
        </div>

        <!-- Seats Row: Silhouettes + Remaining Counter -->
        <div class="hub-card-seats-row">
          <div class="hub-card-silhouettes">
            ${silhouettesHtml}
          </div>
          <span class="hub-card-seats-count">${availCount} ${availCount === 1 ? 'asiento restante' : 'asientos restantes'}</span>
        </div>

        <!-- Action Button -->
        <button type="button" class="btn-join-group-card ${isAvail ? '' : 'disabled'}" onclick="event.stopPropagation(); openGroupDetailModal('${g.id}')">
          ${isAvail ? 'Unirse al Grupo' : 'Grupo Lleno'}
        </button>
      </div>
    `;
  }).join('');

  initGroupCardTiltEffects();
}

function initGroupCardTiltEffects() {
  const container = document.getElementById('hub-groups-list');
  const cards = container ? container.querySelectorAll('.hub-gosplit-card') : [];
  const banner = document.querySelector('.hub-share-banner-card');
  const allInteractiveCards = [...cards];
  if (banner) allInteractiveCards.push(banner);

  allInteractiveCards.forEach((card, idx) => {
    if (!card) return;
    if (card.dataset.tiltAttached === 'true') return;
    card.dataset.tiltAttached = 'true';
    let rafId = null;

    const isBanner = card.classList.contains('hub-share-banner-card');
    const maxTiltAngle = isBanner ? 3.5 : 6;
    const elevatePx = isBanner ? -3 : -5;
    const scaleFactor = isBanner ? 1.01 : 1.025;

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.08s ease-out, box-shadow 0.15s ease, border-color 0.15s ease';
      card.style.zIndex = '12';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normX = (x - rect.width / 2) / (rect.width / 2);
      const normY = (y - rect.height / 2) / (rect.height / 2);

      const rotX = -normY * maxTiltAngle;
      const rotY = normX * maxTiltAngle;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(${elevatePx}px) scale3d(${scaleFactor}, ${scaleFactor}, ${scaleFactor})`;
        if (!isBanner) {
          card.style.boxShadow = `${(-rotY * 1.5).toFixed(1)}px ${(12 + Math.abs(rotX)).toFixed(1)}px 26px rgba(0, 0, 0, 0.75), 0 0 18px rgba(0, 194, 255, 0.22)`;
        } else {
          card.style.boxShadow = `${(-rotY * 1.2).toFixed(1)}px ${(10 + Math.abs(rotX)).toFixed(1)}px 22px rgba(0, 0, 0, 0.65), 0 0 16px rgba(251, 191, 36, 0.22)`;
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.45s ease, border-color 0.45s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
      card.style.boxShadow = '';
      card.style.zIndex = '';
    });
  });
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

  const totalCap = Math.max(1, group.totalSlots || state.hub?.maxSlots || 5);
  const availCount = Math.min(totalCap, Math.max(0, group.availableSlots !== undefined ? group.availableSlots : totalCap));
  const occupiedSlots = totalCap - availCount;

  if (slotsSummary) slotsSummary.textContent = `${availCount} de ${totalCap} Libres`;

  // Render per-profile matrix (LIBRE = PRENDIDO / OCUPADO = APAGADO / INCLICKEABLE)
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
               style="${isOccupied ? 'cursor: not-allowed; opacity: 0.6; pointer-events: none;' : 'cursor: pointer;'}"
               title="${isOccupied ? 'Ocupado' : `Perfil Disponible para ti (${profileName})`}">
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
      state.wallet = data.wallet;
      if (state.currentUser) {
        state.currentUser.balanceUsd = data.wallet.balanceUsd;
        localStorage.setItem('gb_user', JSON.stringify(state.currentUser));
      }
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
