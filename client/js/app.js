// GamesBoy.net - Master ENEBA Marketplace Core Engine

const state = {
  country: localStorage.getItem('gb_country') || 'PY',
  currency: localStorage.getItem('gb_currency') || 'PYG',
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  wallet: { balanceUsd: 25.0, pendingEscrowUsd: 0.0 },
  exchangeRates: { PYG: 7500, USD: 1.0 },
  heroBanners: [],
  activeSlideIndex: 1, // Default Spider-Man 2
  heroInterval: null,
  subscriptions: [],
  storeProducts: [],
  myVault: [],
  cart: [],
  depositMethod: 'sipap'
};

// SMM Social Media Packages (Base API Ready)
const smmServices = [
  { id: 'smm_ig_followers', platform: 'Instagram', name: 'Seguidores Reales Latinos', priceUsd: 4.50, icon: '📸', desc: '1,000 Seguidores de alta calidad con entrega gradual y reposición.' },
  { id: 'smm_tiktok_views', platform: 'TikTok', name: 'Visualizaciones Virales', priceUsd: 2.00, icon: '🎵', desc: '10,000 Views para impulsar tus videos en el algoritmo Para Ti.' },
  { id: 'smm_yt_subscribers', platform: 'YouTube', name: 'Suscriptores para Monetización', priceUsd: 8.00, icon: '▶️', desc: '500 Suscriptores orgánicos compatibles con el programa de socios.' },
  { id: 'smm_x_retweets', platform: 'X (Twitter)', name: 'Likes & Retweets', priceUsd: 3.00, icon: '✖️', desc: '500 Interacciones rápidas para posicionar tus publicaciones.' }
];

// Fallback Default Hero Banners (ENEBA Style)
const defaultBanners = [
  {
    id: 'banner_fc25',
    title: 'EA SPORTS FC 25',
    tagline: 'CLUBES, ULTIMATE TEAM & MODO CARRERA',
    badge: 'PS5 • XBOX • PC',
    imgHorizontal: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80',
    imgVertical: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Ver Ediciones',
    ctaUrl: '#section-games',
    sortOrder: 0
  },
  {
    id: 'banner_spiderman2',
    title: 'MARVEL SPIDER-MAN 2',
    tagline: 'BE GREATER. TOGETHER.',
    badge: 'PS5 EXCLUSIVE',
    imgHorizontal: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    imgVertical: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Comprar ahora',
    ctaUrl: '#section-games',
    sortOrder: 1
  },
  {
    id: 'banner_cod_bo6',
    title: 'CALL OF DUTY: BLACK OPS 6',
    tagline: 'LA VERDAD MIENTE. VUELVE EL REY DEL SHOOTER',
    badge: 'CROSS-GEN BUNDLE',
    imgHorizontal: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
    imgVertical: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Comprar Código',
    ctaUrl: '#section-games',
    sortOrder: 2
  },
  {
    id: 'banner_gta6',
    title: 'GRAND THEFT AUTO VI',
    tagline: 'BIENVENIDO A LEONIDA & VICE CITY',
    badge: 'NEXT-GEN PRE-ORDER',
    imgHorizontal: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
    imgVertical: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Reservar Ahora',
    ctaUrl: '#section-games',
    sortOrder: 3
  }
];

// --- FORMAT CURRENCY HELPER ---
function formatPrice(amountUsd) {
  if (state.currency === 'PYG' || state.country === 'PY') {
    const pyg = Math.round(amountUsd * state.exchangeRates.PYG);
    return `₲ ${pyg.toLocaleString('es-PY')}`;
  }
  return `USD $${amountUsd.toFixed(2)}`;
}

// --- GLOBAL CAROUSEL SCROLLER ---
window.scrollCarousel = function(containerId, offset) {
  const el = document.getElementById(containerId);
  if (el) {
    el.scrollBy({ left: offset, behavior: 'smooth' });
  }
};

// --- 1. HERO ACCORDION BANNER MODULE (ENEBA STYLE) ---
function initHeroAccordion() {
  const container = document.getElementById('eneba-accordion-slides');
  const dotsContainer = document.getElementById('hero-dots-container');
  const prevBtn = document.getElementById('btn-hero-prev');
  const nextBtn = document.getElementById('btn-hero-next');

  if (!container) return;

  const banners = (state.heroBanners && state.heroBanners.length >= 4) ? state.heroBanners : defaultBanners;

  // Render Slides
  container.innerHTML = banners.slice(0, 4).map((b, idx) => {
    const isActive = idx === state.activeSlideIndex;
    return `
      <div class="eneba-slide ${isActive ? 'active' : ''}" data-slide-index="${idx}">
        <div class="eneba-slide-bg horizontal-bg" style="background-image: url('${b.imgHorizontal || ''}');"></div>
        <div class="eneba-slide-bg vertical-bg" style="background-image: url('${b.imgVertical || ''}');"></div>
        <div class="eneba-slide-overlay"></div>
        
        <!-- Collapsed Info -->
        <div class="eneba-collapsed-info">
          <span class="eneba-collapsed-badge">${b.badge || 'DESTACADO'}</span>
          <span class="eneba-collapsed-title">${b.title}</span>
        </div>

        <!-- Expanded Content -->
        <div class="eneba-expanded-content">
          <div class="eneba-platform-tag">
            <span>${b.badge || 'OFICIAL'}</span>
          </div>
          <h2 class="eneba-expanded-title">${b.title}</h2>
          <p class="eneba-expanded-tagline">${b.tagline || ''}</p>
          <div class="eneba-expanded-actions">
            <a href="${b.ctaUrl || '#section-games'}" class="btn-eneba-cta">
              <span>${b.ctaText || 'Comprar ahora'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Render Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = banners.slice(0, 4).map((_, idx) => `
      <span class="hero-dot ${idx === state.activeSlideIndex ? 'active' : ''}" data-index="${idx}"></span>
    `).join('');
  }

  // Attach Click / Hover listeners to each slide
  const slides = container.querySelectorAll('.eneba-slide');
  slides.forEach((slide) => {
    const idx = parseInt(slide.dataset.slideIndex, 10);
    slide.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      setActiveSlide(idx);
    });
    slide.addEventListener('mouseenter', () => stopHeroAutoplay());
    slide.addEventListener('mouseleave', () => startHeroAutoplay());
  });

  if (dotsContainer) {
    dotsContainer.querySelectorAll('.hero-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index, 10);
        setActiveSlide(idx);
      });
    });
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      const prevIdx = (state.activeSlideIndex - 1 + banners.length) % banners.length;
      setActiveSlide(prevIdx);
    };
  }
  if (nextBtn) {
    nextBtn.onclick = () => {
      const nextIdx = (state.activeSlideIndex + 1) % banners.length;
      setActiveSlide(nextIdx);
    };
  }

  startHeroAutoplay();
}

function setActiveSlide(index) {
  state.activeSlideIndex = index;
  const slides = document.querySelectorAll('.eneba-slide');
  const dots = document.querySelectorAll('.hero-dot');

  slides.forEach((s, i) => {
    if (i === index) s.classList.add('active');
    else s.classList.remove('active');
  });

  dots.forEach((d, i) => {
    if (i === index) d.classList.add('active');
    else d.classList.remove('active');
  });
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  state.heroInterval = setInterval(() => {
    const banners = (state.heroBanners && state.heroBanners.length >= 4) ? state.heroBanners : defaultBanners;
    const nextIdx = (state.activeSlideIndex + 1) % banners.length;
    setActiveSlide(nextIdx);
  }, 6000);
}

function stopHeroAutoplay() {
  if (state.heroInterval) {
    clearInterval(state.heroInterval);
    state.heroInterval = null;
  }
}

// --- 2. RENDER STREAMING SERVICES (SINGLE ROW SCROLL) ---
function renderStreamingServices() {
  const container = document.getElementById('streaming-services-grid');
  if (!container) return;

  const services = state.subscriptions.filter(s => s.category === 'streaming');
  if (services.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); padding: 1rem;">Cargando servicios de streaming...</p>`;
    return;
  }

  container.innerHTML = services.map(s => {
    const isAvail = s.availableSlots > 0;
    const slotsIcons = Array(s.totalSlots).fill(0).map((_, i) => 
      `<span style="color: ${i < (s.totalSlots - s.availableSlots) ? 'var(--text-tertiary)' : 'var(--accent-cyan)'};">👤</span>`
    ).join('');

    let logoIcon = '🍿';
    if (s.serviceName.includes('Spotify')) logoIcon = '🎧';
    if (s.serviceName.includes('Disney')) logoIcon = '🏰';
    if (s.serviceName.includes('Max')) logoIcon = '🎬';
    if (s.serviceName.includes('YouTube')) logoIcon = '▶️';
    if (s.serviceName.includes('Crunchyroll')) logoIcon = '🍥';
    if (s.serviceName.includes('Apple')) logoIcon = '🍎';
    if (s.serviceName.includes('Paramount')) logoIcon = '⭐';

    return `
      <div class="stream-card" onclick="openBuySubscriptionModal('${s.id}')">
        <div class="stream-logo-box">${logoIcon}</div>
        <h3 class="stream-title">${s.serviceName}</h3>
        <div class="stream-price-label">Desde</div>
        <div class="stream-price-val">${formatPrice(s.pricePerSlotUsd)}</div>
        <div class="stream-slots-row" title="${s.availableSlots} cupos libres de ${s.totalSlots}">
          ${slotsIcons}
        </div>
        <button class="stream-action-btn">
          ${isAvail ? 'Ver perfiles ➔' : 'Agotado'}
        </button>
      </div>
    `;
  }).join('');
}

// --- 3. RENDER DIGITAL GAMES (CLEAN PS4 / PS5 BOX ART) ---
function renderDigitalGames() {
  const container = document.getElementById('digital-games-grid');
  if (!container) return;

  const games = state.storeProducts.filter(p => p.category === 'game_key');
  if (games.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); padding: 1rem;">Cargando juegos digitales...</p>`;
    return;
  }

  container.innerHTML = games.map(g => {
    return `
      <div class="game-card" onclick="openBuyGameModal('${g.id}')">
        <div class="game-cover-container">
          <img src="${g.coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}" alt="${g.title}" class="game-cover-img" loading="lazy">
        </div>
        <div class="game-card-body">
          <h3 class="game-title">${g.title}</h3>
          <div class="game-price-box">
            <div class="game-price-label">Desde</div>
            <div class="game-price-val">${formatPrice(g.priceUsd)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- 4. RENDER REALISTIC RETAIL GIFT CARDS (VERTICAL & STRAIGHT) ---
function renderRetailGiftCards() {
  const container = document.getElementById('retail-giftcards-grid');
  if (!container) return;

  const giftcards = state.storeProducts.filter(p => p.category === 'gift_card');
  if (giftcards.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); padding: 1rem;">Cargando tarjetas de regalo...</p>`;
    return;
  }

  container.innerHTML = giftcards.map(gc => {
    const themeClass = `theme-${gc.brandTheme || 'psn'}`;
    const denom = gc.title.includes('$') ? gc.title.match(/\$[0-9]+/)?.[0] || '$10' : '$10';

    return `
      <div class="retail-gift-card" onclick="openBuyGiftCardModal('${gc.id}')">
        <div class="giftcard-hang-header">
          <div class="hang-hole"></div>
        </div>
        <div class="giftcard-face ${themeClass}">
          <div class="giftcard-logo-icon">${gc.icon || '🎁'}</div>
          <div class="giftcard-denom-badge">${denom}</div>
        </div>
        <div class="giftcard-body">
          <h3 class="giftcard-title">${gc.title}</h3>
          <div class="giftcard-price-label">Desde</div>
          <div class="giftcard-price-val">${formatPrice(gc.priceUsd)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// --- 5. RENDER SMM SERVICES ---
function renderSmmServices() {
  const container = document.getElementById('smm-services-grid');
  if (!container) return;

  container.innerHTML = smmServices.map(smm => `
    <div class="smm-card">
      <div class="smm-icon-box" style="background: rgba(168, 85, 247, 0.12); color: var(--accent-purple);">${smm.icon}</div>
      <h3 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 4px;">${smm.name}</h3>
      <div style="font-size: 0.72rem; color: var(--accent-purple); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">${smm.platform}</div>
      <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.35; margin-bottom: 0.85rem;">${smm.desc}</p>
      <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 800; color: #ffffff;">${formatPrice(smm.priceUsd)}</span>
        <button class="btn-primary-block" style="width: auto; padding: 4px 12px; font-size: 0.75rem;" onclick="alert('Servicio SMM vinculado a la API del proveedor.')">Comprar</button>
      </div>
    </div>
  `).join('');
}

// --- 6. RENDER USER VAULT (CREDENTIALS) ---
function renderMyVault() {
  const container = document.getElementById('vault-list-container');
  const section = document.getElementById('my-vault-section');
  if (!container || !section) return;

  if (state.myVault.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = state.myVault.map(v => `
    <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); padding: 1.25rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span>⚡</span>
          <strong style="color: #ffffff; font-size: 1rem;">${v.serviceName}</strong>
          <span class="badge-official">ACTIVO</span>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary);">Perfil Asignado: <strong>#${v.slotNumber || 1}</strong> | PIN: <strong style="color: var(--accent-cyan);">${v.assignedPin || '1234'}</strong></div>
      </div>
      <button class="btn-primary-block" style="width: auto; padding: 6px 14px; font-size: 0.8rem;" onclick="alert('Credenciales: ${v.credentialsEncrypted || 'Acceso directo'}')">🔑 Ver Claves</button>
    </div>
  `).join('');
}

// --- 7. FETCH INITIAL DATA FROM API ---
async function fetchStoreData() {
  try {
    const [subRes, storeRes, bannersRes] = await Promise.all([
      fetch('/api/subscriptions').then(r => r.json()).catch(() => []),
      fetch('/api/store/products').then(r => r.json()).catch(() => []),
      fetch('/api/banners').then(r => r.json()).catch(() => ({ banners: defaultBanners }))
    ]);

    if (Array.isArray(subRes)) state.subscriptions = subRes;
    else if (subRes.subscriptions) state.subscriptions = subRes.subscriptions;

    if (Array.isArray(storeRes)) state.storeProducts = storeRes;
    else if (storeRes.products) state.storeProducts = storeRes.products;

    if (bannersRes && bannersRes.banners && bannersRes.banners.length >= 4) state.heroBanners = bannersRes.banners;
    else state.heroBanners = defaultBanners;

    initHeroAccordion();
    renderStreamingServices();
    renderDigitalGames();
    renderRetailGiftCards();
    renderSmmServices();
    renderMyVault();
  } catch (err) {
    console.error('Error loading marketplace data:', err);
    initHeroAccordion();
    renderSmmServices();
  }
}

// --- 8. PURCHASE FLOW MODALS & INSTANT DELIVERY ---
window.openBuySubscriptionModal = function(id) {
  const sub = state.subscriptions.find(s => s.id === id);
  if (!sub) return;

  const priceText = formatPrice(sub.pricePerSlotUsd);
  if (confirm(`¿Deseas comprar un cupo para "${sub.serviceName}" por ${priceText} / mes con entrega inmediata a tu Bóveda?`)) {
    executePurchase('/api/subscriptions/purchase', { subscriptionId: sub.id, paymentMethod: 'internal_wallet' }, sub.serviceName);
  }
};

window.openBuyGameModal = function(id) {
  const game = state.storeProducts.find(p => p.id === id);
  if (!game) return;

  const priceText = formatPrice(game.priceUsd);
  if (confirm(`¿Deseas comprar el código digital de "${game.title}" por ${priceText}?`)) {
    executePurchase('/api/store/purchase', { productId: game.id, paymentMethod: 'internal_wallet' }, game.title);
  }
};

window.openBuyGiftCardModal = function(id) {
  const gc = state.storeProducts.find(p => p.id === id);
  if (!gc) return;

  const priceText = formatPrice(gc.priceUsd);
  if (confirm(`¿Deseas comprar la tarjeta de regalo "${gc.title}" por ${priceText}?`)) {
    executePurchase('/api/store/purchase', { productId: gc.id, paymentMethod: 'internal_wallet' }, gc.title);
  }
};

async function executePurchase(url, body, productName) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 ¡Compra exitosa de "${productName}"! Se ha añadido de forma inmediata a tus Productos / Bóveda.`);
      state.myVault.push({
        serviceName: productName,
        slotNumber: 1,
        assignedPin: '4455',
        credentialsEncrypted: 'Entrega instantánea GamesBoy.net'
      });
      renderMyVault();
      fetchStoreData();
    } else {
      if (data.error && data.error.includes('Saldo insuficiente')) {
        if (confirm('Saldo insuficiente en tu billetera. ¿Deseas recargar saldo ahora con SIPAP Paraguay o USDT Binance?')) {
          const modal = document.getElementById('modal-deposit');
          if (modal) modal.style.display = 'grid';
        }
      } else {
        alert(`Aviso: ${data.error || 'No se pudo completar la compra.'}`);
      }
    }
  } catch (e) {
    alert('Error de conexión al procesar la compra.');
  }
}

// --- 9. LIVE SEARCH & INSTANT AUTOCOMPLETE ---
function initLiveSearch() {
  const searchInput = document.getElementById('main-search-input');
  const dropdown = document.getElementById('search-dropdown-results');
  const clearBtn = document.getElementById('btn-search-clear');

  if (!searchInput || !dropdown) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      dropdown.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }

    if (clearBtn) clearBtn.style.display = 'block';

    const allItems = [
      ...state.subscriptions.map(s => ({ name: s.serviceName, type: 'Suscripción', price: s.pricePerSlotUsd, id: s.id, category: 'sub' })),
      ...state.storeProducts.map(p => ({ name: p.title, type: p.category === 'game_key' ? 'Juego Digital' : 'Tarjeta Regalo', price: p.priceUsd, id: p.id, category: 'prod' }))
    ];

    const results = allItems.filter(item => item.name.toLowerCase().includes(query));

    if (results.length === 0) {
      dropdown.innerHTML = `<div style="padding: 12px; color: var(--text-tertiary); font-size: 0.85rem;">No se encontraron resultados para "${query}"</div>`;
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = results.slice(0, 6).map(r => `
      <div style="padding: 10px 14px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="handleSearchResultClick('${r.category}', '${r.id}')">
        <div>
          <div style="font-size: 0.88rem; font-weight: 700; color: #ffffff;">${r.name}</div>
          <span style="font-size: 0.72rem; color: var(--accent-cyan); text-transform: uppercase;">${r.type}</span>
        </div>
        <strong style="color: #ffffff; font-family: var(--font-mono); font-size: 0.88rem;">${formatPrice(r.price)}</strong>
      </div>
    `).join('');

    dropdown.style.display = 'block';
  });

  if (clearBtn) {
    clearBtn.onclick = () => {
      searchInput.value = '';
      dropdown.style.display = 'none';
      clearBtn.style.display = 'none';
    };
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#header-search-wrapper')) {
      dropdown.style.display = 'none';
    }
  });
}

window.handleSearchResultClick = function(category, id) {
  const dropdown = document.getElementById('search-dropdown-results');
  if (dropdown) dropdown.style.display = 'none';
  if (category === 'sub') openBuySubscriptionModal(id);
  else openBuyGameModal(id);
};

// --- 10. SETUP USER SESSION & COUNTRY SELECTOR ---
function initUserSession() {
  const unloggedGroup = document.getElementById('auth-unlogged-group');
  const loggedGroup = document.getElementById('auth-logged-group');
  const navUserName = document.getElementById('nav-user-name');

  if (state.currentUser && state.currentUser.name) {
    if (unloggedGroup) unloggedGroup.style.display = 'none';
    if (loggedGroup) loggedGroup.style.display = 'flex';
    if (navUserName) navUserName.textContent = state.currentUser.name;
  } else {
    if (unloggedGroup) unloggedGroup.style.display = 'flex';
    if (loggedGroup) loggedGroup.style.display = 'none';
  }

  const countrySelect = document.getElementById('country-branch-select');
  if (countrySelect) {
    countrySelect.value = state.country;
    countrySelect.addEventListener('change', (e) => {
      state.country = e.target.value;
      state.currency = (state.country === 'PY') ? 'PYG' : 'USD';
      localStorage.setItem('gb_country', state.country);
      localStorage.setItem('gb_currency', state.currency);

      const indicator = document.getElementById('footer-currency-indicator');
      if (indicator) indicator.textContent = (state.country === 'PY') ? 'PYG (₲)' : 'USD ($)';

      renderStreamingServices();
      renderDigitalGames();
      renderRetailGiftCards();
      renderSmmServices();
    });
  }

  // Modals
  const modalDeposit = document.getElementById('modal-deposit');
  const btnOpenDeposit = document.getElementById('btn-open-deposit-modal');
  const btnCloseDeposit = document.getElementById('btn-close-deposit-modal');
  if (btnOpenDeposit && modalDeposit) btnOpenDeposit.onclick = () => modalDeposit.style.display = 'grid';
  if (btnCloseDeposit && modalDeposit) btnCloseDeposit.onclick = () => modalDeposit.style.display = 'none';

  // Deposit Submit Form
  const depositForm = document.getElementById('form-submit-deposit');
  if (depositForm) {
    depositForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('¡Comprobante recibido con éxito! Tu saldo se acreditará una vez verificado por la administración.');
      if (modalDeposit) modalDeposit.style.display = 'none';
    });
  }
}

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  initUserSession();
  initLiveSearch();
  fetchStoreData();
});
