// GamesBoy.net - Master ENEBA Marketplace Core Engine

const state = {
  activeView: 'client', // 'client' | 'seller' | 'admin'
  adminSubView: 'dashboard', // 'dashboard' | 'banners' | 'settings'
  currency: localStorage.getItem('gb_currency') || 'USD',
  currentUser: { id: 'usr_client1', name: 'Lucas_Py', role: 'client', avatar: '🎮' },
  wallet: { balanceUsd: 25.0, pendingEscrowUsd: 0.0 },
  exchangeRates: { PYG: 7500 },
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
  { id: 'smm_ig_followers', platform: 'Instagram', name: 'Seguidores Reales Latinos', priceUsd: 4.50, icon: '📸', desc: '1,000 Seguidores de alta calidad con entrega gradual y garantía de reposición.' },
  { id: 'smm_tiktok_views', platform: 'TikTok', name: 'Visualizaciones Virales', priceUsd: 2.00, icon: '🎵', desc: '10,000 Views para impulsar tus videos en el algoritmo Para Ti.' },
  { id: 'smm_yt_subscribers', platform: 'YouTube', name: 'Suscriptores para Monetización', priceUsd: 8.00, icon: '▶️', desc: '500 Suscriptores orgánicos compatibles con el programa de socios.' },
  { id: 'smm_x_retweets', platform: 'X (Twitter)', name: 'Likes & Retweets', priceUsd: 3.00, icon: '✖️', desc: '500 Interacciones rápidas para posicionar tus publicaciones y tendencias.' }
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
  if (state.currency === 'PYG') {
    const pyg = Math.round(amountUsd * state.exchangeRates.PYG);
    return `₲ ${pyg.toLocaleString('es-PY')}`;
  }
  return `USD $${amountUsd.toFixed(2)}`;
}

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
      // If clicking inside a CTA link, allow navigation
      if (e.target.closest('a')) return;
      setActiveSlide(idx);
    });
    slide.addEventListener('mouseenter', () => {
      stopHeroAutoplay();
    });
    slide.addEventListener('mouseleave', () => {
      startHeroAutoplay();
    });
  });

  // Dots click
  if (dotsContainer) {
    dotsContainer.querySelectorAll('.hero-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index, 10);
        setActiveSlide(idx);
      });
    });
  }

  // Arrows
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
    if (i === index) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });

  dots.forEach((d, i) => {
    if (i === index) {
      d.classList.add('active');
    } else {
      d.classList.remove('active');
    }
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

// --- 2. RENDER STREAMING SERVICES (8 SERVICES WITH SLOTS) ---
function renderStreamingServices() {
  const container = document.getElementById('streaming-services-grid');
  if (!container) return;

  const services = state.subscriptions.filter(s => s.category === 'streaming');
  if (services.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); grid-column: 1/-1;">Cargando servicios de streaming...</p>`;
    return;
  }

  container.innerHTML = services.map(s => {
    const isAvail = s.availableSlots > 0;
    const slotsIcons = Array(s.totalSlots).fill(0).map((_, i) => 
      `<span style="color: ${i < (s.totalSlots - s.availableSlots) ? 'var(--text-tertiary)' : 'var(--accent-cyan)'}; font-size: 0.8rem;">👤</span>`
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
        <h3 class="stream-title">${s.serviceName.split(' ')[0]}</h3>
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

// --- 3. RENDER DIGITAL GAMES (8 PS5 COVER CARDS) ---
function renderDigitalGames() {
  const container = document.getElementById('digital-games-grid');
  if (!container) return;

  const games = state.storeProducts.filter(p => p.category === 'game_key');
  if (games.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); grid-column: 1/-1;">Cargando juegos digitales...</p>`;
    return;
  }

  container.innerHTML = games.map(g => {
    return `
      <div class="game-card" onclick="openBuyGameModal('${g.id}')">
        <div class="game-platform-band">${g.platform || 'PS5'}</div>
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

// --- 4. RENDER REALISTIC RETAIL GIFT CARDS WITH HANG-TAB ---
function renderRetailGiftCards() {
  const container = document.getElementById('retail-giftcards-grid');
  if (!container) return;

  const giftcards = state.storeProducts.filter(p => p.category === 'gift_card');
  if (giftcards.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); grid-column: 1/-1;">Cargando tarjetas de regalo...</p>`;
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
      <h3 style="font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 4px;">${smm.name}</h3>
      <div style="font-size: 0.72rem; color: var(--accent-purple); text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">${smm.platform}</div>
      <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 1rem;">${smm.desc}</p>
      <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-family: var(--font-mono); font-size: 1rem; font-weight: 800; color: #ffffff;">${formatPrice(smm.priceUsd)}</span>
        <button class="btn-primary-block" style="width: auto; padding: 6px 14px; font-size: 0.8rem;" onclick="alert('Servicio SMM vinculado a la API del proveedor. Tu orden se enviará de forma instantánea al saldo disponible.')">Comprar</button>
      </div>
    </div>
  `).join('');
}

// --- 6. RENDER USER VAULT (CREDENTIALS) ---
function renderMyVault() {
  const container = document.getElementById('vault-list-container');
  if (!container) return;

  if (state.myVault.length === 0) {
    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); padding: 2.5rem; text-align: center; color: var(--text-tertiary);">
        <div style="font-size: 2.5rem; margin-bottom: 10px;">🔐</div>
        <p style="font-size: 0.95rem; color: var(--text-secondary);">Tu bóveda está vacía.</p>
        <p style="font-size: 0.8rem;">Adquiere una suscripción de streaming o un juego digital para visualizar tus credenciales, claves y PINs encriptados.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.myVault.map(v => `
    <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 1.2rem;">⚡</span>
          <strong style="color: #ffffff; font-size: 1.05rem;">${v.serviceName}</strong>
          <span class="badge-official">ACTIVO</span>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-secondary);">Perfil Asignado: <strong>#${v.slotNumber}</strong> | PIN: <strong style="color: var(--accent-cyan);">${v.assignedPin}</strong></div>
      </div>
      <button class="btn-primary-block" style="width: auto; padding: 8px 16px; font-size: 0.85rem;" onclick="alert('Credenciales: ${v.credentialsEncrypted || 'Acceso directo'}')">🔑 Ver Claves</button>
    </div>
  `).join('');
}

// --- 7. ADMIN BANNER MANAGER ---
function renderAdminBannersForm() {
  const container = document.getElementById('admin-banners-form-container');
  if (!container) return;

  const banners = (state.heroBanners && state.heroBanners.length >= 4) ? state.heroBanners : defaultBanners;

  container.innerHTML = banners.slice(0, 4).map((b, idx) => `
    <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
      <h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 1rem;">
        🖼️ Portada #${idx + 1}: ${b.title || 'Slide ' + (idx + 1)}
      </h3>
      
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Título Principal</label>
          <input type="text" class="form-input banner-in-title" data-idx="${idx}" value="${b.title || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Subtítulo / Tagline</label>
          <input type="text" class="form-input banner-in-tagline" data-idx="${idx}" value="${b.tagline || ''}">
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Badge / Plataforma (ej: PS5, XBOX, PC)</label>
          <input type="text" class="form-input banner-in-badge" data-idx="${idx}" value="${b.badge || 'PS5'}">
        </div>
        <div class="form-group">
          <label class="form-label">Texto del Botón CTA</label>
          <input type="text" class="form-input banner-in-cta-text" data-idx="${idx}" value="${b.ctaText || 'Comprar ahora'}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">URL Imagen Horizontal (Expandida ~16:9)</label>
        <input type="url" class="form-input banner-in-img-h" data-idx="${idx}" value="${b.imgHorizontal || ''}" required>
      </div>

      <div class="form-group">
        <label class="form-label">URL Imagen Vertical (Comprimida ~3:4)</label>
        <input type="url" class="form-input banner-in-img-v" data-idx="${idx}" value="${b.imgVertical || ''}" required>
      </div>

      <div class="form-group">
        <label class="form-label">Enlace de Destino (Link al tocar la imagen)</label>
        <input type="text" class="form-input banner-in-cta-url" data-idx="${idx}" value="${b.ctaUrl || '#section-games'}">
      </div>
    </div>
  `).join('');
}

// --- 8. FETCH INITIAL DATA FROM API ---
async function fetchStoreData() {
  try {
    const [subRes, storeRes, bannersRes] = await Promise.all([
      fetch('/api/subscriptions').then(r => r.json()).catch(() => []),
      fetch('/api/store/products').then(r => r.json()).catch(() => []),
      fetch('/api/banners').then(r => r.json()).catch(() => ({ banners: defaultBanners }))
    ]);

    if (Array.isArray(subRes)) {
      state.subscriptions = subRes;
    } else if (subRes.subscriptions) {
      state.subscriptions = subRes.subscriptions;
    }

    if (Array.isArray(storeRes)) {
      state.storeProducts = storeRes;
    } else if (storeRes.products) {
      state.storeProducts = storeRes.products;
    }

    if (bannersRes && bannersRes.banners && bannersRes.banners.length >= 4) {
      state.heroBanners = bannersRes.banners;
    } else {
      state.heroBanners = defaultBanners;
    }

    // Render all modules
    initHeroAccordion();
    renderStreamingServices();
    renderDigitalGames();
    renderRetailGiftCards();
    renderSmmServices();
    renderMyVault();
    renderAdminBannersForm();
  } catch (err) {
    console.error('Error loading initial marketplace data:', err);
    initHeroAccordion();
    renderSmmServices();
  }
}

// --- 9. PURCHASE FLOW MODALS ---
window.openBuySubscriptionModal = function(id) {
  const sub = state.subscriptions.find(s => s.id === id);
  if (!sub) return;

  const priceText = formatPrice(sub.pricePerSlotUsd);
  if (confirm(`¿Deseas comprar un cupo para "${sub.serviceName}" por ${priceText} / mes con entrega inmediata a tu Bóveda?`)) {
    executePurchase('/api/subscriptions/purchase', { subscriptionId: sub.id, paymentMethod: 'internal_wallet' });
  }
};

window.openBuyGameModal = function(id) {
  const game = state.storeProducts.find(p => p.id === id);
  if (!game) return;

  const priceText = formatPrice(game.priceUsd);
  if (confirm(`¿Deseas comprar el código digital de "${game.title}" (${game.platform}) por ${priceText}?`)) {
    executePurchase('/api/store/purchase', { productId: game.id, paymentMethod: 'internal_wallet' });
  }
};

window.openBuyGiftCardModal = function(id) {
  const gc = state.storeProducts.find(p => p.id === id);
  if (!gc) return;

  const priceText = formatPrice(gc.priceUsd);
  if (confirm(`¿Deseas comprar la tarjeta de regalo "${gc.title}" por ${priceText} con código instantáneo?`)) {
    executePurchase('/api/store/purchase', { productId: gc.id, paymentMethod: 'internal_wallet' });
  }
};

async function executePurchase(url, body) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 ¡Compra exitosa! Revisa tu Bóveda de credenciales y códigos.`);
      fetchStoreData();
    } else {
      if (data.error && data.error.includes('Saldo insuficiente')) {
        if (confirm('Saldo insuficiente en tu billetera. ¿Deseas recargar saldo ahora con SIPAP Paraguay o USDT Binance?')) {
          document.getElementById('modal-deposit').style.display = 'grid';
        }
      } else {
        alert(`Aviso: ${data.error || 'No se pudo completar la orden.'}`);
      }
    }
  } catch (e) {
    alert('Error al procesar la compra.');
  }
}

// --- 10. SETUP EVENT LISTENERS & ROUTING ---
function setupEventListeners() {
  // Currency Switcher
  const currencySelector = document.getElementById('currency-selector');
  if (currencySelector) {
    currencySelector.value = state.currency;
    currencySelector.addEventListener('change', (e) => {
      state.currency = e.target.value;
      localStorage.setItem('gb_currency', state.currency);
      const indicator = document.getElementById('footer-currency-indicator');
      if (indicator) indicator.textContent = `${state.currency} (${state.currency === 'USD' ? '$' : '₲'})`;
      renderStreamingServices();
      renderDigitalGames();
      renderRetailGiftCards();
      renderSmmServices();
    });
  }

  // Portal Switcher (Client / Seller / Admin)
  const tabClient = document.getElementById('tab-client');
  const tabSeller = document.getElementById('tab-seller');
  const tabAdmin = document.getElementById('tab-admin');
  const viewClient = document.getElementById('view-client');
  const viewSeller = document.getElementById('view-seller');
  const viewAdmin = document.getElementById('view-admin');

  function switchPortalView(view) {
    state.activeView = view;
    if (tabClient) tabClient.classList.toggle('active', view === 'client');
    if (tabSeller) tabSeller.classList.toggle('active', view === 'seller');
    if (tabAdmin) tabAdmin.classList.toggle('active', view === 'admin');

    if (viewClient) viewClient.style.display = view === 'client' ? 'block' : 'none';
    if (viewSeller) viewSeller.style.display = view === 'seller' ? 'block' : 'none';
    if (viewAdmin) viewAdmin.style.display = view === 'admin' ? 'block' : 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (tabClient) tabClient.onclick = () => switchPortalView('client');
  if (tabSeller) tabSeller.onclick = () => switchPortalView('seller');
  if (tabAdmin) tabAdmin.onclick = () => switchPortalView('admin');

  // Admin Subviews Tabs
  const tabAdminDash = document.getElementById('tab-admin-dash');
  const tabAdminBanners = document.getElementById('tab-admin-banners');
  const tabAdminSettings = document.getElementById('tab-admin-settings');
  const subviewDash = document.getElementById('admin-subview-dashboard');
  const subviewBanners = document.getElementById('admin-subview-banners');
  const subviewSettings = document.getElementById('admin-subview-settings');

  function switchAdminSubView(sub) {
    state.adminSubView = sub;
    if (tabAdminDash) tabAdminDash.classList.toggle('active', sub === 'dashboard');
    if (tabAdminBanners) tabAdminBanners.classList.toggle('active', sub === 'banners');
    if (tabAdminSettings) tabAdminSettings.classList.toggle('active', sub === 'settings');

    if (subviewDash) subviewDash.style.display = sub === 'dashboard' ? 'block' : 'none';
    if (subviewBanners) subviewBanners.style.display = sub === 'banners' ? 'block' : 'none';
    if (subviewSettings) subviewSettings.style.display = sub === 'settings' ? 'block' : 'none';
  }

  if (tabAdminDash) tabAdminDash.onclick = () => switchAdminSubView('dashboard');
  if (tabAdminBanners) tabAdminBanners.onclick = () => switchAdminSubView('banners');
  if (tabAdminSettings) tabAdminSettings.onclick = () => switchAdminSubView('settings');

  // Admin Banners Form Submit
  const formAdminBanners = document.getElementById('form-admin-banners');
  if (formAdminBanners) {
    formAdminBanners.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titles = formAdminBanners.querySelectorAll('.banner-in-title');
      const taglines = formAdminBanners.querySelectorAll('.banner-in-tagline');
      const badges = formAdminBanners.querySelectorAll('.banner-in-badge');
      const ctaTexts = formAdminBanners.querySelectorAll('.banner-in-cta-text');
      const ctaUrls = formAdminBanners.querySelectorAll('.banner-in-cta-url');
      const imgHs = formAdminBanners.querySelectorAll('.banner-in-img-h');
      const imgVs = formAdminBanners.querySelectorAll('.banner-in-img-v');

      const updatedBanners = [];
      titles.forEach((t, i) => {
        updatedBanners.push({
          id: `banner_custom_${i}`,
          title: t.value,
          tagline: taglines[i]?.value || '',
          badge: badges[i]?.value || 'DESTACADO',
          ctaText: ctaTexts[i]?.value || 'Comprar ahora',
          ctaUrl: ctaUrls[i]?.value || '#section-games',
          imgHorizontal: imgHs[i]?.value || '',
          imgVertical: imgVs[i]?.value || '',
          sortOrder: i,
          isActive: true
        });
      });

      try {
        const res = await fetch('/api/banners/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ banners: updatedBanners })
        });
        const data = await res.json();
        if (data.success) {
          alert('✅ ¡Banners actualizados y publicados en el Hero con éxito!');
          state.heroBanners = data.banners;
          initHeroAccordion();
        } else {
          alert('Error al actualizar banners');
        }
      } catch (err) {
        alert('Error al conectar con el servidor.');
      }
    });
  }

  // Modals Open/Close
  const modalDeposit = document.getElementById('modal-deposit');
  const btnOpenDeposit = document.getElementById('btn-open-deposit-modal');
  const btnCloseDeposit = document.getElementById('btn-close-deposit-modal');
  if (btnOpenDeposit && modalDeposit) btnOpenDeposit.onclick = () => modalDeposit.style.display = 'grid';
  if (btnCloseDeposit && modalDeposit) btnCloseDeposit.onclick = () => modalDeposit.style.display = 'none';

  const modalAuth = document.getElementById('modal-auth');
  const btnOpenLogin = document.getElementById('btn-open-login-modal');
  const btnOpenReg = document.getElementById('btn-open-register-modal');
  const btnCloseAuth = document.getElementById('btn-close-auth-modal');
  if (btnOpenLogin && modalAuth) btnOpenLogin.onclick = () => modalAuth.style.display = 'grid';
  if (btnOpenReg && modalAuth) btnOpenReg.onclick = () => modalAuth.style.display = 'grid';
  if (btnCloseAuth && modalAuth) btnCloseAuth.onclick = () => modalAuth.style.display = 'none';

  // Deposit Methods Tab Toggle
  const tabPaySipap = document.getElementById('tab-pay-sipap');
  const tabPayBinance = document.getElementById('tab-pay-binance');
  const boxPaySipap = document.getElementById('box-pay-sipap');
  const boxPayBinance = document.getElementById('box-pay-binance');

  if (tabPaySipap && tabPayBinance) {
    tabPaySipap.onclick = () => {
      tabPaySipap.classList.add('active');
      tabPayBinance.classList.remove('active');
      if (boxPaySipap) boxPaySipap.style.display = 'block';
      if (boxPayBinance) boxPayBinance.style.display = 'none';
    };
    tabPayBinance.onclick = () => {
      tabPayBinance.classList.add('active');
      tabPaySipap.classList.remove('active');
      if (boxPaySipap) boxPaySipap.style.display = 'none';
      if (boxPayBinance) boxPayBinance.style.display = 'block';
    };
  }
}

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  fetchStoreData();
});
