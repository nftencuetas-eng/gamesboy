// GamesBoy.net - Master ENEBA Marketplace Core Engine

// Multi-Country & Multi-Currency Universal Configuration
const countryConfig = {
  'PY': {
    code: 'PY',
    name: 'Paraguay',
    flag: '🇵🇾',
    currency: 'Gs.',
    symbol: 'Gs.',
    rateToUsd: 7500, // 1 USD = 7,500 PYG
    format: (amtUsd) => `${Math.round(amtUsd * 7500).toLocaleString('es-PY')} Gs.`,
    localPayment: {
      title: '🇵🇾 Transferencia Bancaria Paraguay (SIPAP)',
      bank: 'Banco Familiar / Itaú Paraguay',
      holder: 'GamesBoy Paraguay S.A.',
      doc: 'RUC: 80091234-5',
      account: '01-445566-7',
      alias: 'gamesboy.py'
    }
  },
  'AR': {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    currency: 'ARS',
    symbol: '$',
    rateToUsd: 1250, // 1 USD = 1,250 ARS
    format: (amtUsd) => `$ ${(amtUsd * 1250).toLocaleString('es-AR')} ARS`,
    localPayment: {
      title: '🇦🇷 Transferencia Bancaria Argentina (CBU / CVU)',
      bank: 'Banco Santander / Mercado Pago Argentina',
      holder: 'GamesBoy Argentina SRL',
      doc: 'CUIT: 30-71829910-4',
      account: 'CBU: 0720192888000034829102',
      alias: 'GAMESBOY.ARG.MP'
    }
  },
  'BR': {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    currency: 'BRL',
    symbol: 'R$',
    rateToUsd: 5.60, // 1 USD = 5.60 BRL
    format: (amtUsd) => `R$ ${(amtUsd * 5.60).toFixed(2).replace('.', ',')}`,
    localPayment: {
      title: '🇧🇷 Pix Instantâneo Brasil (Chave Pix)',
      bank: 'Banco Nubank / Itaú Brasil',
      holder: 'GamesBoy Brasil Pagamentos Ltda.',
      doc: 'CNPJ: 48.910.234/0001-50',
      account: 'Chave Pix (E-mail): pagamentos@gamesboy.net',
      alias: 'pix.gamesboy.br'
    }
  },
  'PA': {
    code: 'PA',
    name: 'Panamá',
    flag: '🇵🇦',
    currency: 'USD',
    symbol: '$',
    rateToUsd: 1.00,
    format: (amtUsd) => `$ ${amtUsd.toFixed(2)} USD`,
    localPayment: {
      title: '🇵🇦 Transferencia Bancaria Panamá (ACH / Yappy)',
      bank: 'Banco General Panamá',
      holder: 'GamesBoy Latin America Corp.',
      doc: 'RUC: 155692019-2-2024 DV 88',
      account: 'Cuenta Corriente: 03-99-01-445566-0',
      alias: 'Yappy: +507 6899-2311'
    }
  },
  'GLOBAL': {
    code: 'GLOBAL',
    name: 'Global Cripto',
    flag: '🌐',
    currency: 'USDT',
    symbol: '₮',
    rateToUsd: 1.00,
    format: (amtUsd) => `$ ${amtUsd.toFixed(2)} USDT`,
    localPayment: {
      title: '🌐 Criptomoneda USDT (Binance Pay / BEP20)',
      bank: 'Binance Pay / Trust Wallet',
      holder: 'GamesBoy Global Treasury',
      doc: 'Red: BEP-20 / TRC-20',
      account: '0x71C9414B3b27bA134a6C3f07a757657A82e4b92F',
      alias: 'Binance Pay ID: 849201934'
    }
  }
};

function autoDetectUserCountry() {
  const saved = localStorage.getItem('gb_country');
  if (saved && countryConfig[saved]) return saved;

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Asuncion')) return 'PY';
    if (tz.includes('Buenos_Aires') || tz.includes('Cordoba') || tz.includes('Argentina')) return 'AR';
    if (tz.includes('Sao_Paulo') || tz.includes('Fortaleza') || tz.includes('Manaus') || tz.includes('Brazil')) return 'BR';
    if (tz.includes('Panama')) return 'PA';
  } catch (e) {}

  return 'PY';
}

const state = {
  country: autoDetectUserCountry(),
  currency: 'PYG',
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  wallet: { balanceUsd: 25.0, pendingEscrowUsd: 0.0 },
  exchangeRates: { PYG: 7500, ARS: 1250, BRL: 5.60, USD: 1.0, USDT: 1.0 },
  heroBanners: [],
  activeSlideIndex: 1, // Default Spider-Man 2
  heroInterval: null,
  subscriptions: [],
  storeProducts: [],
  myVault: [],
  cart: [],
  depositMethod: 'local'
};

state.currency = countryConfig[state.country]?.currency || 'PYG';

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

// --- UNIVERSAL FORMAT CURRENCY HELPER ---
function formatPrice(amountUsd) {
  const cfg = countryConfig[state.country] || countryConfig['PY'];
  return cfg.format(amountUsd);
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

  // Render Slides with pure artwork without dark text overlay
  container.innerHTML = banners.slice(0, 4).map((b, idx) => {
    const isActive = idx === state.activeSlideIndex;
    const targetUrl = b.ctaUrl || '#section-games';
    return `
      <div class="eneba-slide ${isActive ? 'active' : ''}" data-slide-index="${idx}" data-target-url="${targetUrl}">
        <div class="eneba-slide-bg horizontal-bg" style="background-image: url('${b.imgHorizontal || ''}');"></div>
        <div class="eneba-slide-bg vertical-bg" style="background-image: url('${b.imgVertical || ''}');"></div>
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
    slide.addEventListener('click', () => {
      if (slide.classList.contains('active')) {
        const url = slide.dataset.targetUrl;
        if (url && url !== '#') window.location.href = url;
      } else {
        setActiveSlide(idx);
      }
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

// --- 2. RENDER STREAMING SERVICES (WIDESCREEN HORIZONTAL CARDS & SVG SILHOUETTES) ---
function renderStreamingServices() {
  const container = document.getElementById('streaming-services-grid');
  if (!container) return;

  const services = state.subscriptions.filter(s => s.category === 'streaming');
  if (services.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); padding: 1rem;">Cargando servicios de streaming...</p>`;
    return;
  }

  const brandImages = {
    'Netflix': 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80',
    'Spotify': 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=400&q=80',
    'Disney': 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=400&q=80',
    'Max': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80',
    'YouTube': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80',
    'Crunchyroll': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    'Apple': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    'Paramount': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
    'ChatGPT': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80'
  };

  const brandColors = {
    'Netflix': '#E50914',
    'Spotify': '#1DB954',
    'Disney': '#113CCF',
    'Max': '#002BE7',
    'YouTube': '#FF0000',
    'Crunchyroll': '#F47521',
    'Apple': '#A2AAAD',
    'Paramount': '#0064FF',
    'ChatGPT': '#10A37F'
  };

  container.innerHTML = services.map(s => {
    const isAvail = s.availableSlots > 0;
    
    let matchedBrand = 'Netflix';
    for (const key of Object.keys(brandImages)) {
      if (s.serviceName.toLowerCase().includes(key.toLowerCase())) {
        matchedBrand = key;
        break;
      }
    }
    const coverImg = brandImages[matchedBrand] || brandImages['Netflix'];
    const accentColor = brandColors[matchedBrand] || '#00c2ff';

    // SVG silhouette human icons for profiles
    const occupiedSlots = s.totalSlots - s.availableSlots;
    let slotsSvg = '';
    for (let i = 0; i < s.totalSlots; i++) {
      const isOccupied = i < occupiedSlots;
      slotsSvg += `
        <svg class="slot-sil-icon ${isOccupied ? 'slot-occupied' : 'slot-available'}" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      `;
    }

    return `
      <div class="stream-card-wide" onclick="openBuySubscriptionModal('${s.id}')">
        <div class="stream-card-visual" style="background-image: url('${coverImg}');">
          <div class="stream-visual-overlay"></div>
          <span class="stream-brand-badge" style="background: ${accentColor};">${matchedBrand}</span>
        </div>
        <div class="stream-card-content">
          <div class="stream-card-header">
            <h3 class="stream-card-title">${s.serviceName}</h3>
            <span class="stream-card-plan">${s.planName}</span>
          </div>
          
          <div class="stream-card-pricing">
            <span class="stream-price-tag-label">Desde</span>
            <span class="stream-price-tag-val">${formatPrice(s.pricePerSlotUsd)}</span>
          </div>

          <div class="stream-card-slots">
            <div class="stream-slots-icons">${slotsSvg}</div>
            <span class="stream-slots-text">${s.availableSlots} de ${s.totalSlots} libres</span>
          </div>

          <button class="btn-stream-cta-modern ${isAvail ? '' : 'disabled'}">
            ${isAvail ? 'Ver Perfiles ➔' : 'Agotado'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// --- 3. RENDER DIGITAL GAMES (CLEAN 3D BOX ART WITH STRAIGHT EDGES) ---
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
          <div class="game-spine-highlight"></div>
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

// --- 4. RENDER REALISTIC VERTICAL RETAIL GIFT CARDS (ROUNDED CORNERS) ---
function renderRetailGiftCards() {
  const container = document.getElementById('retail-giftcards-grid');
  if (!container) return;

  const giftcards = state.storeProducts.filter(p => p.category === 'gift_card');
  if (giftcards.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); padding: 1rem;">Cargando tarjetas de regalo...</p>`;
    return;
  }

  const brandDisplayNames = {
    'psn': 'PlayStation',
    'xbox': 'Xbox',
    'nintendo': 'Nintendo eShop',
    'steam': 'Steam Wallet',
    'googleplay': 'Google Play',
    'apple': 'Apple Store',
    'netflix': 'Netflix Gift',
    'spotify': 'Spotify Gift',
    'roblox': 'Roblox'
  };

  container.innerHTML = giftcards.map(gc => {
    const themeKey = gc.brandTheme || 'psn';
    const themeClass = `theme-${themeKey}`;
    const brandName = brandDisplayNames[themeKey] || gc.title.split(' ')[0] || 'Gift Card';
    const denom = gc.title.includes('$') ? gc.title.match(/\$[0-9]+/)?.[0] || '$10' : '$10';

    return `
      <div class="giftcard-vertical-card" onclick="openBuyGiftCardModal('${gc.id}')">
        <div class="giftcard-v-face ${themeClass}">
          <div class="giftcard-peg-hole"></div>
          <div class="giftcard-v-logo-brand">${brandName}</div>
          <div class="giftcard-v-denom">${denom}</div>
          <div class="giftcard-v-gloss"></div>
        </div>
        <div class="giftcard-v-body">
          <h3 class="giftcard-v-title">${gc.title}</h3>
          <div class="giftcard-v-pricing">
            <span class="giftcard-v-label">Desde</span>
            <span class="giftcard-v-val">${formatPrice(gc.priceUsd)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- 5. RENDER SMM SERVICES (HORIZONTAL BANNERS & ROUNDED CORNERS) ---
function renderSmmServices() {
  const container = document.getElementById('smm-services-grid');
  if (!container) return;

  container.innerHTML = smmServices.map(smm => `
    <div class="smm-banner-card">
      <div class="smm-banner-header">
        <span class="smm-platform-badge">${smm.platform}</span>
        <span class="smm-icon-large">${smm.icon}</span>
      </div>
      <div class="smm-banner-body">
        <h3 class="smm-banner-title">${smm.name}</h3>
        <p class="smm-banner-desc">${smm.desc}</p>
        <div class="smm-banner-footer">
          <span class="smm-banner-price">${formatPrice(smm.priceUsd)}</span>
          <button class="btn-smm-buy" onclick="alert('Servicio SMM vinculado a la API del proveedor.')">Adquirir ➔</button>
        </div>
      </div>
    </div>
  `).join('');
}

// --- 6. RENDER USER VAULT (CREDENTIALS & GROUP CHAT ACCESS) ---
async function renderMyVault() {
  const container = document.getElementById('vault-list-container');
  const section = document.getElementById('my-vault-section');
  if (!container || !section) return;

  const userId = state.currentUser ? state.currentUser.id : 'usr_client1';

  try {
    const res = await fetch('/api/subscriptions/my-vault', {
      headers: { 'x-user-id': userId }
    });
    const slots = await res.json();
    state.myVault = Array.isArray(slots) ? slots : [];
  } catch (e) {
    console.error('Error fetching user vault:', e);
  }

  if (state.myVault.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = state.myVault.map(v => {
    const isExpiringSoon = v.daysRemaining <= 3;
    const discountBadge = isExpiringSoon 
      ? `<span class="renewal-countdown-badge urgent">⚡ Renovar Anticipado (-5% OFF)</span>`
      : `<span class="renewal-countdown-badge">⏳ Vence en ${v.daysRemaining} días</span>`;

    return `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: 12px; padding: 1.25rem; margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span>⚡</span>
            <strong style="color: #ffffff; font-size: 1.05rem;">${v.serviceName}</strong>
            <span class="badge-official">ACTIVO</span>
            ${discountBadge}
          </div>
          <div style="font-size: 0.84rem; color: var(--text-secondary);">
            Perfil Asignado: <strong style="color: #ffffff;">#${v.slotNumber || 1}</strong> | 
            PIN: <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${v.assignedPin || '1234'}</strong> | 
            Vencimiento: <span style="color: ${isExpiringSoon ? 'var(--accent-red)' : 'var(--text-tertiary)'}; font-weight: 700;">${new Date(v.expiresAt).toLocaleDateString('es-PY')}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn-primary-block" style="width: auto; padding: 8px 16px; font-size: 0.82rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue)); border-radius: 8px !important;" onclick="openGroupChatModal('${v.subscriptionId}')">
            💬 Ver Grupo & Chat
          </button>
          ${isExpiringSoon ? `
            <button class="btn-renew-discount-cta" style="width: auto; padding: 8px 14px; margin-top: 0; font-size: 0.82rem;" onclick="renewSubscriptionWithDiscount('${v.subscriptionId}')">
              ⚡ Renovar (-5%)
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
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
  if (confirm(`¿Deseas comprar un cupo para "${sub.serviceName}" por ${priceText} / mes con entrega inmediata a tu Bóveda y acceso al grupo privado?`)) {
    executePurchase(`/api/subscriptions/${sub.id}/buy`, {}, sub.serviceName, sub.id);
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

async function executePurchase(url, body, productName, subId = null) {
  const userId = state.currentUser ? state.currentUser.id : 'usr_client1';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 ¡Compra exitosa de "${productName}"! Se ha añadido de forma inmediata a tus Productos / Bóveda.`);
      await fetchStoreData();
      if (subId) {
        openGroupChatModal(subId);
      }
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

// --- 9. STREAMING GROUP & INTERNAL CHAT ENGINE ---
state.activeGroupSubId = null;

window.openGroupChatModal = async function(subId) {
  state.activeGroupSubId = subId;
  const modal = document.getElementById('modal-group-chat');
  if (!modal) return;

  modal.style.display = 'grid';
  await refreshGroupChatView(subId);
};

async function refreshGroupChatView(subId) {
  const userId = state.currentUser ? state.currentUser.id : 'usr_client1';
  
  try {
    const res = await fetch(`/api/subscriptions/${subId}/group`, {
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();

    if (!data.success || !data.group) {
      alert(data.error || 'No se pudo cargar la información del grupo.');
      return;
    }

    const group = data.group;

    // Header info
    document.getElementById('group-modal-title').textContent = group.serviceName;
    document.getElementById('group-modal-plan-badge').textContent = group.planName;
    document.getElementById('group-modal-admin-name').innerHTML = `Admin: <strong style="color: var(--accent-cyan);">${group.adminName}</strong> • ${group.occupiedSlots} de ${group.totalSlots} cupos ocupados`;

    // Credentials & Instructions
    document.getElementById('group-credentials-content').textContent = group.credentials || '🔐 Solo miembros confirmados del grupo tienen acceso.';
    document.getElementById('group-instructions-text').textContent = group.instructions || 'Usa exclusivamente tu perfil asignado y no modifiques la contraseña.';

    // Expiration & Renewal Box
    const renewalBox = document.getElementById('group-renewal-box');
    const countdownBadge = document.getElementById('group-renewal-countdown');
    const renewBtn = document.getElementById('btn-group-renew-discount');
    const priceSpan = document.getElementById('group-renew-discount-price');
    const myProfileNum = document.getElementById('group-my-profile-num');
    const myPin = document.getElementById('group-my-pin');
    const myExpDate = document.getElementById('group-my-expiration-date');

    if (group.isOwner) {
      countdownBadge.textContent = '👑 Eres el Administrador de la Cuenta';
      countdownBadge.className = 'renewal-countdown-badge';
      myProfileNum.textContent = 'Cuenta Principal';
      myPin.textContent = 'Control Total';
      myExpDate.textContent = 'Monitoreando y administrando grupo';
      if (renewBtn) renewBtn.style.display = 'none';
    } else if (group.userSlot) {
      const isUrgent = group.userSlot.daysRemaining <= 3;
      countdownBadge.textContent = `⏳ Vence en ${group.userSlot.daysRemaining} días`;
      countdownBadge.className = isUrgent ? 'renewal-countdown-badge urgent' : 'renewal-countdown-badge';
      myProfileNum.textContent = `#${group.userSlot.slotNumber}`;
      myPin.textContent = group.userSlot.assignedPin || 'N/A';
      myExpDate.textContent = `Vence el: ${new Date(group.userSlot.expiresAt).toLocaleDateString('es-PY')}`;

      if (group.userSlot.eligibleForDiscount && renewBtn) {
        renewBtn.style.display = 'flex';
        priceSpan.textContent = formatPrice(group.userSlot.discountedPriceUsd);
      } else if (renewBtn) {
        renewBtn.style.display = 'none';
      }
    } else {
      countdownBadge.textContent = 'Visualizador';
      myProfileNum.textContent = '-';
      myPin.textContent = '-';
      myExpDate.textContent = 'No tienes un cupo activo en esta cuenta';
      if (renewBtn) renewBtn.style.display = 'none';
    }

    // Members list (Strict Privacy: Avatar & Display Name ONLY, NO emails)
    const membersContainer = document.getElementById('group-members-list-container');
    document.getElementById('group-members-count').textContent = group.members.length;

    membersContainer.innerHTML = group.members.map(m => `
      <div class="group-member-item ${m.isOwner ? 'is-admin' : ''}">
        <div class="member-avatar-box">${m.avatar || '🎮'}</div>
        <div style="flex: 1; overflow: hidden;">
          <div class="member-name-text">${m.name} ${m.isOwner ? '👑' : ''}</div>
          <span class="member-role-tag">${m.role}</span>
        </div>
      </div>
    `).join('');

    // Chat messages
    const chatContainer = document.getElementById('group-chat-messages');
    chatContainer.innerHTML = group.chatMessages.map(msg => {
      if (msg.isSystem) {
        return `<div class="chat-system-notification">${msg.text}</div>`;
      }

      const isMe = msg.senderId === userId;
      const isAdminMsg = msg.isOwnerAdmin;
      const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="chat-msg-row ${isMe ? 'sent-by-me' : ''} ${isAdminMsg ? 'is-admin-msg' : ''}">
          <div class="chat-msg-avatar">${msg.senderAvatar || '🎮'}</div>
          <div class="chat-bubble">
            <div class="chat-sender-header">
              <span class="chat-sender-name">${msg.senderName}</span>
              ${isAdminMsg ? `<span class="chat-admin-badge">👑 Administrador</span>` : ''}
            </div>
            <div class="chat-msg-text">${msg.text}</div>
            <div class="chat-msg-time">${timeStr}</div>
          </div>
        </div>
      `;
    }).join('');

    chatContainer.scrollTop = chatContainer.scrollHeight;

  } catch (e) {
    console.error('Error refreshing group view:', e);
  }
}

// Renew with 5% Discount
window.renewSubscriptionWithDiscount = async function(subId) {
  const targetSubId = subId || state.activeGroupSubId;
  if (!targetSubId) return;

  const userId = state.currentUser ? state.currentUser.id : 'usr_client1';

  if (!confirm('¿Deseas renovar tu suscripción por 30 días más aplicando el 5% de descuento anticipado desde tu saldo?')) {
    return;
  }

  try {
    const res = await fetch(`/api/subscriptions/${targetSubId}/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      }
    });
    const data = await res.json();

    if (data.success) {
      alert(`🎉 ${data.message}`);
      await fetchStoreData();
      if (state.activeGroupSubId === targetSubId) {
        refreshGroupChatView(targetSubId);
      }
    } else {
      alert(`Aviso: ${data.error || 'No se pudo procesar la renovación.'}`);
    }
  } catch (e) {
    alert('Error al renovar suscripción.');
  }
};

// --- 10. LIVE SEARCH & INSTANT AUTOCOMPLETE ---
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

// --- 11. SETUP USER SESSION, MULTI-CURRENCY, LIVE BALANCE & DEPOSIT MODAL ---
// --- 11. SETUP USER SESSION, MULTI-CURRENCY, LIVE BALANCE & DEPOSIT MODAL ---
async function updateUserBalanceDisplay() {
  const balanceEl = document.getElementById('nav-user-balance-amount');
  if (!balanceEl) return;

  const userId = state.currentUser ? state.currentUser.id : null;
  if (!userId) {
    balanceEl.textContent = formatPrice(0);
    return;
  }

  try {
    const res = await fetch('/api/wallet/balance', {
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    if (data.wallet && data.wallet.balanceUsd !== undefined) {
      state.wallet = data.wallet;
      if (state.currentUser) state.currentUser.balanceUsd = data.wallet.balanceUsd;
    }
  } catch (e) {}

  const balUsd = state.currentUser?.balanceUsd !== undefined ? state.currentUser.balanceUsd : (state.wallet?.balanceUsd || 0);
  balanceEl.textContent = formatPrice(balUsd);
}

function updateDepositModalForCountry() {
  const cfg = countryConfig[state.country] || countryConfig['PY'];
  const flagIcon = document.getElementById('header-flag-icon');
  if (flagIcon) flagIcon.textContent = cfg.flag;

  const tabLocalLabel = document.getElementById('tab-pay-local-label');
  if (tabLocalLabel) tabLocalLabel.textContent = `${cfg.flag} Pago Local (${cfg.name})`;

  const localFieldsContainer = document.getElementById('box-pay-local-fields');
  if (localFieldsContainer && cfg.localPayment) {
    const p = cfg.localPayment;
    localFieldsContainer.innerHTML = `
      <div style="font-weight: 800; font-size: 0.88rem; color: #ffffff; margin-bottom: 8px;">${p.title}</div>
      <div class="payment-field-row"><span>Entidad / Banco:</span><strong>${p.bank}</strong></div>
      <div class="payment-field-row"><span>Titular:</span><strong>${p.holder}</strong></div>
      <div class="payment-field-row"><span>Identificación:</span><strong>${p.doc}</strong></div>
      <div class="payment-field-row"><span>N° Cuenta / Chave:</span><strong>${p.account}</strong></div>
      <div class="payment-field-row"><span>Alias / Referencia:</span><strong style="color: var(--accent-cyan);">${p.alias}</strong></div>
    `;
  }

  const labelAmount = document.getElementById('label-deposit-amount');
  const amountInput = document.getElementById('deposit-amount-input');
  const convertedPreview = document.getElementById('deposit-converted-preview');

  if (labelAmount) {
    labelAmount.textContent = `Monto a Transferir en ${cfg.name} (${cfg.symbol} ${cfg.currency}):`;
  }

  if (amountInput) {
    amountInput.placeholder = (cfg.currency === 'Gs.') ? 'ej: 100000' : (cfg.currency === 'ARS' ? 'ej: 15000' : (cfg.currency === 'BRL' ? 'ej: 100' : 'ej: 25'));
    
    // Live calculation listener
    amountInput.oninput = () => {
      const val = parseFloat(amountInput.value);
      if (isNaN(val) || val <= 0) {
        if (convertedPreview) convertedPreview.innerHTML = `⚡ Acreditación estimada: <strong>$ 0.00 USDT</strong>`;
        return;
      }
      const usdt = (val / cfg.rateToUsd).toFixed(2);
      if (convertedPreview) {
        convertedPreview.innerHTML = `⚡ Acreditación estimada en tu cuenta: <strong style="color: var(--accent-emerald);">$ ${usdt} USDT</strong>`;
      }
    };
  }
}

function initUserSession() {
  const unloggedGroup = document.getElementById('auth-unlogged-group');
  const loggedGroup = document.getElementById('auth-logged-group');
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');
  const dropdownUserName = document.getElementById('dropdown-user-name');
  const dropdownUserEmail = document.getElementById('dropdown-user-email');
  const dropdownUserAvatarLg = document.getElementById('dropdown-user-avatar-lg');

  if (state.currentUser && state.currentUser.name) {
    if (unloggedGroup) unloggedGroup.style.display = 'none';
    if (loggedGroup) loggedGroup.style.display = 'flex';
    if (navUserName) navUserName.textContent = state.currentUser.name;
    if (navUserAvatar) navUserAvatar.textContent = state.currentUser.avatar || '🎮';
    if (dropdownUserName) dropdownUserName.textContent = state.currentUser.name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = state.currentUser.email || 'usuario@gamesboy.net';
    if (dropdownUserAvatarLg) dropdownUserAvatarLg.textContent = state.currentUser.avatar || '🎮';
    updateUserBalanceDisplay();
  } else {
    if (unloggedGroup) unloggedGroup.style.display = 'flex';
    if (loggedGroup) loggedGroup.style.display = 'none';
  }

  // Profile Dropdown Toggle
  const profileWrapper = document.getElementById('user-profile-wrapper');
  const btnProfileToggle = document.getElementById('btn-user-profile-toggle');
  const dropdownMenu = document.getElementById('user-profile-dropdown-menu');

  if (btnProfileToggle && dropdownMenu && profileWrapper) {
    btnProfileToggle.onclick = (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.style.display === 'block';
      dropdownMenu.style.display = isOpen ? 'none' : 'block';
      profileWrapper.classList.toggle('open', !isOpen);
    };

    document.addEventListener('click', (e) => {
      if (!profileWrapper.contains(e.target)) {
        dropdownMenu.style.display = 'none';
        profileWrapper.classList.remove('open');
      }
    });
  }

  // Profile Dropdown Actions
  const menuItemVault = document.getElementById('menu-item-vault');
  if (menuItemVault) {
    menuItemVault.onclick = () => {
      if (dropdownMenu) dropdownMenu.style.display = 'none';
      const vaultSec = document.getElementById('my-vault-section');
      if (vaultSec) {
        vaultSec.style.display = 'block';
        vaultSec.scrollIntoView({ behavior: 'smooth' });
      }
    };
  }

  const menuItemDeposit = document.getElementById('menu-item-deposit');
  if (menuItemDeposit) {
    menuItemDeposit.onclick = () => {
      if (dropdownMenu) dropdownMenu.style.display = 'none';
      const modal = document.getElementById('modal-deposit');
      if (modal) {
        updateDepositModalForCountry();
        modal.style.display = 'grid';
      }
    };
  }

  const menuItemPublish = document.getElementById('menu-item-publish');
  if (menuItemPublish) {
    menuItemPublish.onclick = () => {
      if (dropdownMenu) dropdownMenu.style.display = 'none';
      const modal = document.getElementById('modal-publish-stream');
      if (modal) modal.style.display = 'grid';
    };
  }

  const btnLogoutUser = document.getElementById('btn-logout-user');
  if (btnLogoutUser) {
    btnLogoutUser.onclick = () => {
      localStorage.removeItem('gb_user');
      window.location.reload();
    };
  }

  // Profile Settings Modal Handlers
  const modalProfile = document.getElementById('modal-profile-settings');
  const menuItemEditProfile = document.getElementById('menu-item-edit-profile');
  const btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
  const formEditProfile = document.getElementById('form-edit-user-profile');
  const editProfileNameInput = document.getElementById('edit-profile-name');

  if (menuItemEditProfile && modalProfile) {
    menuItemEditProfile.onclick = () => {
      if (dropdownMenu) dropdownMenu.style.display = 'none';
      if (editProfileNameInput && state.currentUser) {
        editProfileNameInput.value = state.currentUser.name || '';
      }
      modalProfile.style.display = 'grid';
    };
  }

  if (btnCloseProfileModal && modalProfile) {
    btnCloseProfileModal.onclick = () => modalProfile.style.display = 'none';
  }

  let selectedAvatar = state.currentUser?.avatar || '🎮';
  const avatarButtons = document.querySelectorAll('.btn-avatar-choice');
  avatarButtons.forEach(btn => {
    btn.onclick = () => {
      avatarButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.dataset.avatar || '🎮';
    };
  });

  if (formEditProfile) {
    formEditProfile.onsubmit = (e) => {
      e.preventDefault();
      const newName = editProfileNameInput.value.trim();
      if (!newName) return;

      if (!state.currentUser) {
        state.currentUser = { id: 'usr_client1', email: 'usuario@gamesboy.net', role: 'client' };
      }
      state.currentUser.name = newName;
      state.currentUser.avatar = selectedAvatar;
      localStorage.setItem('gb_user', JSON.stringify(state.currentUser));

      if (navUserName) navUserName.textContent = newName;
      if (navUserAvatar) navUserAvatar.textContent = selectedAvatar;
      if (dropdownUserName) dropdownUserName.textContent = newName;
      if (dropdownUserAvatarLg) dropdownUserAvatarLg.textContent = selectedAvatar;

      if (modalProfile) modalProfile.style.display = 'none';
      alert('✨ ¡Perfil actualizado con éxito!');
    };
  }

  const countrySelect = document.getElementById('country-branch-select');
  if (countrySelect) {
    countrySelect.value = state.country;
    countrySelect.addEventListener('change', (e) => {
      state.country = e.target.value;
      state.currency = countryConfig[state.country]?.currency || 'Gs.';
      localStorage.setItem('gb_country', state.country);
      localStorage.setItem('gb_currency', state.currency);

      const indicator = document.getElementById('footer-currency-indicator');
      if (indicator) {
        const cfg = countryConfig[state.country];
        indicator.textContent = `${cfg.name} (${cfg.currency})`;
      }

      updateUserBalanceDisplay();
      updateDepositModalForCountry();
      renderStreamingServices();
      renderDigitalGames();
      renderRetailGiftCards();
      renderSmmServices();
      renderMyVault();
    });
  }

  // Initial deposit modal setup
  updateDepositModalForCountry();

  // Deposit Modal Tabs (Local vs Binance USDT)
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

  // Deposit Modal Open/Close
  const modalDeposit = document.getElementById('modal-deposit');
  const btnOpenDeposit = document.getElementById('btn-open-deposit-modal');
  const btnCloseDeposit = document.getElementById('btn-close-deposit-modal');
  if (btnOpenDeposit && modalDeposit) {
    btnOpenDeposit.onclick = () => {
      updateDepositModalForCountry();
      modalDeposit.style.display = 'grid';
    };
  }
  if (btnCloseDeposit && modalDeposit) {
    btnCloseDeposit.onclick = () => modalDeposit.style.display = 'none';
  }

  const depositForm = document.getElementById('form-submit-deposit');
  if (depositForm) {
    depositForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('¡Comprobante recibido con éxito! Tu saldo en USDT se acreditará en tu cuenta una vez verificado.');
      if (modalDeposit) modalDeposit.style.display = 'none';
    });
  }

  // Group Chat Modal Handlers
  const modalGroupChat = document.getElementById('modal-group-chat');
  const btnCloseGroup = document.getElementById('btn-close-group-modal');
  if (btnCloseGroup && modalGroupChat) {
    btnCloseGroup.onclick = () => { modalGroupChat.style.display = 'none'; state.activeGroupSubId = null; };
  }

  const groupChatForm = document.getElementById('form-group-send-chat');
  if (groupChatForm) {
    groupChatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('group-chat-input-text');
      const text = input.value.trim();
      if (!text || !state.activeGroupSubId) return;

      const userId = state.currentUser ? state.currentUser.id : 'usr_client1';
      try {
        const res = await fetch(`/api/subscriptions/${state.activeGroupSubId}/group/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (data.success) {
          input.value = '';
          refreshGroupChatView(state.activeGroupSubId);
        }
      } catch (err) {
        console.error('Error sending chat message:', err);
      }
    });
  }

  const btnRenewGroupModal = document.getElementById('btn-group-renew-discount');
  if (btnRenewGroupModal) {
    btnRenewGroupModal.onclick = () => renewSubscriptionWithDiscount(state.activeGroupSubId);
  }

  // Publish Streaming Account Modal Handlers
  const modalPublish = document.getElementById('modal-publish-stream');
  const btnOpenPublish = document.getElementById('btn-open-publish-modal');
  const btnClosePublish = document.getElementById('btn-close-publish-modal');
  const navSellerPills = document.querySelectorAll('.sub-nav-seller-pill');

  if (btnOpenPublish && modalPublish) btnOpenPublish.onclick = () => modalPublish.style.display = 'grid';
  if (btnClosePublish && modalPublish) btnClosePublish.onclick = () => modalPublish.style.display = 'none';
  navSellerPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalPublish) modalPublish.style.display = 'grid';
    });
  });

  const publishForm = document.getElementById('form-user-publish-stream');
  if (publishForm) {
    publishForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = state.currentUser ? state.currentUser.id : 'usr_client1';

      const payload = {
        serviceName: document.getElementById('user-pub-service').value,
        planName: document.getElementById('user-pub-plan').value,
        totalSlots: document.getElementById('user-pub-slots').value,
        pricePerSlotUsd: document.getElementById('user-pub-price').value,
        credentials: document.getElementById('user-pub-creds').value,
        pins: document.getElementById('user-pub-pins').value || '{}',
        instructions: document.getElementById('user-pub-instructions').value
      };

      try {
        const res = await fetch('/api/subscriptions/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('🎉 ¡Tu cuenta ha sido publicada con éxito! Eres el Administrador de este nuevo grupo.');
          if (modalPublish) modalPublish.style.display = 'none';
          await fetchStoreData();
          openGroupChatModal(data.subscription.id);
        } else {
          alert(data.error || 'No se pudo publicar la cuenta.');
        }
      } catch (err) {
        alert('Error al publicar cuenta de streaming.');
      }
    });
  }
}

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  initUserSession();
  initLiveSearch();
  fetchStoreData();
});


