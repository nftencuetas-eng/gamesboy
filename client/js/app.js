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

// Fallback Default Streaming Subscriptions
const defaultSubscriptions = [
  {
    id: 'sub_netflix_4k',
    serviceName: 'Netflix Premium 4K HDR',
    category: 'streaming',
    planName: 'Ultra HD 4 Pantallas',
    totalSlots: 4,
    availableSlots: 2,
    pricePerSlotUsd: 3.99,
    pricePyg: 30000,
    renewDiscountPercent: 5
  },
  {
    id: 'sub_spotify_prem',
    serviceName: 'Spotify Premium',
    category: 'streaming',
    planName: 'Individual / Familiar',
    totalSlots: 6,
    availableSlots: 4,
    pricePerSlotUsd: 2.50,
    pricePyg: 19000,
    renewDiscountPercent: 5
  },
  {
    id: 'sub_disney_prem',
    serviceName: 'Disney+ & Star+ Premium',
    category: 'streaming',
    planName: 'Plan Estándar sin Anuncios',
    totalSlots: 4,
    availableSlots: 1,
    pricePerSlotUsd: 3.20,
    pricePyg: 24000,
    renewDiscountPercent: 5
  },
  {
    id: 'sub_max_hbo',
    serviceName: 'Max (HBO Max Oficial)',
    category: 'streaming',
    planName: 'Platino 4K + Dolby Atmos',
    totalSlots: 4,
    availableSlots: 3,
    pricePerSlotUsd: 2.80,
    pricePyg: 21000,
    renewDiscountPercent: 5
  },
  {
    id: 'sub_yt_premium',
    serviceName: 'YouTube Premium & Music',
    category: 'streaming',
    planName: 'Familiar Sin Anuncios',
    totalSlots: 5,
    availableSlots: 2,
    pricePerSlotUsd: 2.99,
    pricePyg: 22500,
    renewDiscountPercent: 5
  },
  {
    id: 'sub_chatgpt_plus',
    serviceName: 'ChatGPT Plus & Team GPT-4o',
    category: 'streaming',
    planName: 'Acceso Directo GPT-4o',
    totalSlots: 3,
    availableSlots: 1,
    pricePerSlotUsd: 6.50,
    pricePyg: 49000,
    renewDiscountPercent: 5
  },
  {
    id: 'sub_crunchyroll',
    serviceName: 'Crunchyroll Mega Fan',
    category: 'streaming',
    planName: 'Mega Fan 4 Pantallas',
    totalSlots: 4,
    availableSlots: 3,
    pricePerSlotUsd: 2.20,
    pricePyg: 16500,
    renewDiscountPercent: 5
  },
  {
    id: 'sub_paramount',
    serviceName: 'Paramount+ Premium',
    category: 'streaming',
    planName: 'Plan Completo HD',
    totalSlots: 3,
    availableSlots: 2,
    pricePerSlotUsd: 2.30,
    pricePyg: 17500,
    renewDiscountPercent: 5
  }
];

// Fallback Default Store Products (Games & Gift Cards)
const defaultStoreProducts = [
  // JUEGOS DIGITALES
  {
    id: 'game_fc25_digital',
    title: 'EA SPORTS FC 25',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Deportes / Fútbol',
    primaryPricePyg: 320000,
    secondaryPricePyg: 210000,
    primaryPriceUsd: 42.67,
    secondaryPriceUsd: 28.00,
    priceUsd: 42.67,
    coverUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    description: 'Edición oficial PlayStation 5 con licencias completas y Modo Carrera.',
    isAvailable: true
  },
  {
    id: 'game_spiderman2_game',
    title: 'Marvel Spider-Man 2',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Acción / Aventura',
    primaryPricePyg: 295000,
    secondaryPricePyg: 185000,
    primaryPriceUsd: 39.33,
    secondaryPriceUsd: 24.67,
    priceUsd: 39.33,
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    description: 'Juega como Peter Parker y Miles Morales enfrentando a Venom en Nueva York.',
    isAvailable: true
  },
  {
    id: 'game_gtav_premium',
    title: 'Grand Theft Auto V Premium',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Mundo Abierto',
    primaryPricePyg: 160000,
    secondaryPricePyg: 105000,
    primaryPriceUsd: 21.33,
    secondaryPriceUsd: 14.00,
    priceUsd: 21.33,
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    description: 'Incluye Modo Historia completo, GTA Online y Criminal Enterprise Starter Pack.',
    isAvailable: true
  },
  {
    id: 'game_lastofus_1',
    title: 'The Last of Us Part I',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Acción / Drama',
    primaryPricePyg: 280000,
    secondaryPricePyg: 175000,
    primaryPriceUsd: 37.33,
    secondaryPriceUsd: 23.33,
    priceUsd: 37.33,
    coverUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
    description: 'Reconstruido desde cero para PS5 con gráficos de última generación.',
    isAvailable: true
  },
  {
    id: 'game_wukong',
    title: 'Black Myth: Wukong',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Action RPG',
    primaryPricePyg: 340000,
    secondaryPricePyg: 220000,
    primaryPriceUsd: 45.33,
    secondaryPriceUsd: 29.33,
    priceUsd: 45.33,
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    description: 'Encarna al Predestinado en una aventura mística por la mitología china.',
    isAvailable: true
  },
  {
    id: 'game_cod_bo6_digital',
    title: 'Call of Duty: Black Ops 6',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'FPS / Shooter',
    primaryPricePyg: 395000,
    secondaryPricePyg: 255000,
    primaryPriceUsd: 52.67,
    secondaryPriceUsd: 34.00,
    priceUsd: 52.67,
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    description: 'Campaña de espionaje cinematográfica, multijugador y regreso de Zombies por rondas.',
    isAvailable: true
  },

  // RETAIL GIFT CARDS
  {
    id: 'gc_psn_10',
    title: 'PlayStation Store $10 USD',
    category: 'gift_card',
    platform: 'PlayStation',
    brand: 'PlayStation',
    brandTheme: 'psn',
    pricePyg: 85000,
    priceUsd: 10.00,
    coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    description: 'Tarjeta oficial de PlayStation Network para canjear en la PS Store.'
  },
  {
    id: 'gc_steam_10',
    title: 'Steam Wallet $10 USD',
    category: 'gift_card',
    platform: 'Steam',
    brand: 'Steam',
    brandTheme: 'steam',
    pricePyg: 85000,
    priceUsd: 10.00,
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo para recargar tu billetera Steam y comprar juegos o ítems en PC.'
  },
  {
    id: 'gc_xbox_10',
    title: 'Xbox Gift Card $10 USD',
    category: 'gift_card',
    platform: 'Xbox',
    brand: 'Xbox',
    brandTheme: 'xbox',
    pricePyg: 85000,
    priceUsd: 10.00,
    coverUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo oficial para comprar juegos, DLCs y suscripciones en Xbox y Windows.'
  },
  {
    id: 'gc_netflix_15',
    title: 'Netflix Gift Card $15 USD',
    category: 'gift_card',
    platform: 'Netflix',
    brand: 'Netflix',
    brandTheme: 'netflix',
    pricePyg: 125000,
    priceUsd: 15.00,
    coverUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo oficial de regalo para canjear en cuentas de Netflix.'
  },
  {
    id: 'gc_spotify_1m',
    title: 'Spotify Premium 1 Mes',
    category: 'gift_card',
    platform: 'Spotify',
    brand: 'Spotify',
    brandTheme: 'spotify',
    pricePyg: 45000,
    priceUsd: 5.99,
    coverUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=400&q=80',
    description: 'Música sin anuncios y descargas offline en Spotify.'
  },
  {
    id: 'gc_googleplay_10',
    title: 'Google Play $10 USD',
    category: 'gift_card',
    platform: 'Google Play',
    brand: 'Google Play',
    brandTheme: 'googleplay',
    pricePyg: 85000,
    priceUsd: 10.00,
    coverUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo para juegos, apps, películas y diamantes en Android.'
  },
  {
    id: 'gc_apple_10',
    title: 'Apple Store & iTunes $10',
    category: 'gift_card',
    platform: 'Apple',
    brand: 'Apple',
    brandTheme: 'apple',
    pricePyg: 85000,
    priceUsd: 10.00,
    coverUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo para App Store, iCloud, Apple Music y compras en iOS.'
  },
  {
    id: 'gc_roblox_10',
    title: 'Roblox $10 (800 Robux)',
    category: 'gift_card',
    platform: 'Roblox',
    brand: 'Roblox',
    brandTheme: 'roblox',
    pricePyg: 85000,
    priceUsd: 10.00,
    coverUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80',
    description: 'Canjea 800 Robux para personalizar tu avatar y comprar pases en Roblox.'
  }
];

// SMM Social Media Packages (Base API Ready)
const smmServices = [
  { id: 'smm_ig_followers', platform: 'Instagram', name: 'Seguidores Reales Latinos', priceUsd: 4.50, icon: '📸', desc: '1,000 Seguidores de alta calidad con entrega gradual y reposición.' },
  { id: 'smm_tiktok_views', platform: 'TikTok', name: 'Visualizaciones Virales', priceUsd: 2.00, icon: '🎵', desc: '10,000 Views para impulsar tus videos en el algoritmo Para Ti.' },
  { id: 'smm_yt_subscribers', platform: 'YouTube', name: 'Suscriptores para Monetización', priceUsd: 8.00, icon: '▶️', desc: '500 Suscriptores orgánicos compatibles con el programa de socios.' },
  { id: 'smm_x_retweets', platform: 'X (Twitter)', name: 'Likes & Retweets', priceUsd: 3.00, icon: '✖️', desc: '500 Interacciones rápidas para posicionar tus publicaciones.' }
];

const state = {
  country: autoDetectUserCountry(),
  currency: 'PYG',
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  wallet: { balanceUsd: 25.0, pendingEscrowUsd: 0.0 },
  exchangeRates: { PYG: 7500, ARS: 1250, BRL: 5.60, USD: 1.0, USDT: 1.0 },
  heroBanners: defaultBanners,
  activeSlideIndex: 1, // Default Spider-Man 2
  heroInterval: null,
  subscriptions: defaultSubscriptions,
  storeProducts: defaultStoreProducts,
  smmServices: smmServices,
  myVault: [],
  cart: [],
  depositMethod: 'local'
};

state.currency = countryConfig[state.country]?.currency || 'PYG';

// --- UNIVERSAL FORMAT CURRENCY HELPER (NATIVE GUARANÍES Gs.) ---
function formatPrice(amountUsd) {
  const rate = state.exchangeRatePyg || 7500;
  const pyg = Math.round((parseFloat(amountUsd) || 0) * rate);
  return `${pyg.toLocaleString('es-PY')} Gs.`;
}

// --- GLOBAL CAROUSEL SCROLLER ---
window.scrollCarousel = function(containerId, offset) {
  const el = document.getElementById(containerId);
  if (el) {
    el.scrollBy({ left: offset, behavior: 'smooth' });
  }
};

// --- GLOBAL MOUSE DRAG-TO-SCROLL ENGINE FOR ALL HORIZONTAL CAROUSELS & ROWS ---
function initDragToScrollEngine() {
  const scrollContainers = document.querySelectorAll('.catalog-scroll-row, .hub-releases-scroll, .services-grid');
  
  scrollContainers.forEach(slider => {
    if (slider.dataset.dragInitialized === 'true') return;
    slider.dataset.dragInitialized = 'true';

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;
    let movedDistance = 0;

    slider.addEventListener('mousedown', (e) => {
      // Only drag on left click (button 0)
      if (e.button !== 0) return;
      isDown = true;
      hasDragged = false;
      movedDistance = 0;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        setTimeout(() => {
          slider.classList.remove('is-dragging');
        }, 50);
      }
    });

    slider.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        slider.classList.remove('is-dragging');
      }
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - slider.offsetLeft;
      movedDistance = Math.abs(x - startX);
      if (movedDistance > 5) {
        e.preventDefault();
        hasDragged = true;
        slider.classList.add('is-dragging');
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
      }
    });

    // Suppress click actions if user dragged more than 5px
    slider.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    }, true);
  });
}

// --- SALES LETTER INTERACTIVE CALCULATOR ---
window.setCalcMode = function(mode) {
  const tabSavings = document.getElementById('calc-tab-savings');
  const tabEarnings = document.getElementById('calc-tab-earnings');
  const controlsSavings = document.getElementById('calc-savings-controls');
  const controlsEarnings = document.getElementById('calc-earnings-controls');
  const resultSavings = document.getElementById('calc-result-savings-box');
  const resultEarnings = document.getElementById('calc-result-earnings-box');

  if (mode === 'savings') {
    tabSavings?.classList.add('active');
    tabEarnings?.classList.remove('active');
    if (controlsSavings) controlsSavings.style.display = 'block';
    if (controlsEarnings) controlsEarnings.style.display = 'none';
    if (resultSavings) resultSavings.style.display = 'flex';
    if (resultEarnings) resultEarnings.style.display = 'none';
  } else {
    tabEarnings?.classList.add('active');
    tabSavings?.classList.remove('active');
    if (controlsSavings) controlsSavings.style.display = 'none';
    if (controlsEarnings) controlsEarnings.style.display = 'block';
    if (resultSavings) resultSavings.style.display = 'none';
    if (resultEarnings) resultEarnings.style.display = 'flex';
  }
  window.updateCalculator();
};

window.updateCalculator = function() {
  const isSavings = document.getElementById('calc-tab-savings')?.classList.contains('active');
  const rate = state.exchangeRate || 7500;

  if (isSavings) {
    const slider = document.getElementById('calc-services-slider');
    const servicesCount = parseInt(slider?.value || '3', 10);
    const displayEl = document.getElementById('calc-services-display');
    if (displayEl) {
      displayEl.textContent = `${servicesCount} ${servicesCount === 1 ? 'servicio' : 'plataformas'}`;
    }

    // Active chips styling
    const chips = document.querySelectorAll('.calc-services-chips .service-chip');
    chips.forEach((chip, idx) => {
      if (idx < servicesCount) chip.classList.add('active');
      else chip.classList.remove('active');
    });

    const traditionalMonthly = servicesCount * 85000;
    const gamesboyMonthly = servicesCount * 22000;
    const monthlySaved = traditionalMonthly - gamesboyMonthly;
    const annualSaved = monthlySaved * 12;
    const annualSavedUsd = Math.round(annualSaved / rate);

    const tradEl = document.getElementById('calc-traditional-price');
    const gbEl = document.getElementById('calc-gamesboy-price');
    const annEl = document.getElementById('calc-annual-savings');
    const annUsdEl = document.getElementById('calc-annual-savings-usd');

    if (tradEl) tradEl.textContent = `${traditionalMonthly.toLocaleString('es-PY')} Gs./mes`;
    if (gbEl) gbEl.textContent = `${gamesboyMonthly.toLocaleString('es-PY')} Gs./mes`;
    if (annEl) annEl.textContent = `${annualSaved.toLocaleString('es-PY')} Gs.`;
    if (annUsdEl) annUsdEl.textContent = `≈ $${annualSavedUsd} USD al año en tu bolsillo`;
  } else {
    const slider = document.getElementById('calc-slots-slider');
    const slotsCount = parseInt(slider?.value || '4', 10);
    const displayEl = document.getElementById('calc-slots-display');
    if (displayEl) {
      displayEl.textContent = `${slotsCount} ${slotsCount === 1 ? 'cupo libre' : 'cupos libres'}`;
    }

    const monthlyEarnings = slotsCount * 45000;
    const annualEarnings = monthlyEarnings * 12;
    const annualEarningsUsd = Math.round(annualEarnings / rate);

    const monthlyEl = document.getElementById('calc-monthly-earnings');
    const annEl = document.getElementById('calc-annual-earnings');
    const annUsdEl = document.getElementById('calc-annual-earnings-usd');

    if (monthlyEl) monthlyEl.textContent = `+${monthlyEarnings.toLocaleString('es-PY')} Gs./mes`;
    if (annEl) annEl.textContent = `+${annualEarnings.toLocaleString('es-PY')} Gs.`;
    if (annUsdEl) annUsdEl.textContent = `≈ +$${annualEarningsUsd} USD al año sin esfuerzo`;
  }
};

function initSalesCalculator() {
  window.updateCalculator();
}

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

    const platformSlug = matchedBrand.toLowerCase();

    return `
      <div class="stream-card-wide" onclick="window.location.href='/service.html?platform=${platformSlug}'" style="cursor: pointer;">
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

          <button class="btn-stream-cta-modern ${isAvail ? '' : 'disabled'}" onclick="event.stopPropagation(); window.location.href='/service.html?platform=${platformSlug}'">
            ${isAvail ? 'Ver más ➔' : 'Agotado'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// --- 3. RENDER DIGITAL GAMES (CLEAN 3D BOX ART WITH STRAIGHT EDGES & DUAL PRICING) ---
function renderDigitalGames() {
  const container = document.getElementById('digital-games-grid');
  if (!container) return;

  const games = state.storeProducts.filter(p => p.category === 'game_key' || p.category === 'digital_game');
  if (games.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); padding: 1rem;">Cargando juegos digitales...</p>`;
    return;
  }

  container.innerHTML = games.map(g => {
    const isAvail = g.isAvailable !== false;
    const primaryPrice = g.primaryPriceUsd || g.priceUsd || 39.99;
    const secondaryPrice = g.secondaryPriceUsd || Math.round(primaryPrice * 0.65);

    return `
      <div class="game-card ${isAvail ? '' : 'disabled'}" onclick="openBuyGameModal('${g.id}')">
        <div class="game-cover-container">
          <img src="${g.coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}" alt="${g.title}" class="game-cover-img" loading="lazy">
          <div class="game-spine-highlight"></div>
          <span style="position: absolute; top: 8px; left: 8px; background: rgba(0, 194, 255, 0.85); color: #040c1e; font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">${g.platform || 'PS5'}</span>
        </div>
        <div class="game-card-body">
          <h3 class="game-title">${g.title}</h3>
          <div class="game-price-box">
            <div class="game-price-label">Primaria desde</div>
            <div class="game-price-val">${formatPrice(primaryPrice)}</div>
          </div>
          ${g.secondaryPriceUsd ? `
            <div style="font-size: 0.72rem; color: var(--text-tertiary); margin-top: 2px;">
              Secundaria: <strong style="color: var(--accent-cyan);">${formatPrice(secondaryPrice)}</strong>
            </div>
          ` : ''}
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

// Platform SVG Vector Icons (100% SVG, Zero Emojis)
const platformSvgIcons = {
  'Instagram': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  'TikTok': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  'YouTube': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  'Telegram': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`,
  'X (Twitter)': `<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
};

// --- 5. RENDER SMM SERVICES (HORIZONTAL BANNERS & ROUNDED CORNERS) ---
function renderSmmServices() {
  const container = document.getElementById('smm-services-grid');
  if (!container) return;

  const services = (state.smmServices && state.smmServices.length > 0) ? state.smmServices : smmServices;

  container.innerHTML = services.map(smm => {
    const iconSvg = platformSvgIcons[smm.platform] || platformSvgIcons['Instagram'];
    const priceDisplay = smm.pricePer1kUsd ? formatPrice(smm.pricePer1kUsd) : formatPrice(smm.priceUsd || 4.50);

    return `
      <div class="smm-banner-card">
        <div class="smm-banner-header">
          <span class="smm-platform-badge">${smm.platform}</span>
          <div class="smm-icon-large" style="display: grid; place-items: center; width: 36px; height: 36px; color: var(--accent-cyan); background: rgba(0, 194, 255, 0.1); border-radius: 10px;">${iconSvg}</div>
        </div>
        <div class="smm-banner-body">
          <h3 class="smm-banner-title">${smm.name}</h3>
          <p class="smm-banner-desc">${smm.desc || 'Crecimiento orgánico y seguro para tus redes.'}</p>
          <div class="smm-banner-footer">
            <div>
              <span style="font-size: 0.65rem; color: var(--text-tertiary); display: block; text-transform: uppercase;">Por cada 1.000</span>
              <span class="smm-banner-price">${priceDisplay}</span>
            </div>
            <button class="btn-smm-buy" onclick="openBuySmmModal('${smm.id}')">Adquirir ➔</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c2ff" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
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

// --- 7. FETCH INITIAL DATA FROM API (SILENT RECONCILIATION) ---
async function fetchStoreData() {
  try {
    const [subRes, storeRes, bannersRes, smmRes] = await Promise.all([
      fetch('/api/subscriptions').then(r => r.json()).catch(() => null),
      fetch('/api/store/products').then(r => r.json()).catch(() => null),
      fetch('/api/banners').then(r => r.json()).catch(() => null),
      fetch('/api/smm/services').then(r => r.json()).catch(() => null)
    ]);

    if (Array.isArray(subRes) && subRes.length > 0) {
      state.subscriptions = subRes;
    } else if (subRes && subRes.subscriptions && subRes.subscriptions.length > 0) {
      state.subscriptions = subRes.subscriptions;
    }

    if (Array.isArray(storeRes) && storeRes.length > 0) {
      state.storeProducts = storeRes;
    } else if (storeRes && storeRes.products && storeRes.products.length > 0) {
      state.storeProducts = storeRes.products;
    }

    if (bannersRes && bannersRes.banners && bannersRes.banners.length >= 4) {
      state.heroBanners = bannersRes.banners;
    }

    if (smmRes && smmRes.services && Array.isArray(smmRes.services) && smmRes.services.length > 0) {
      state.smmServices = smmRes.services;
    }

    // Re-render only to update dynamic prices or active seller stock
    initHeroAccordion();
    renderStreamingServices();
    renderDigitalGames();
    renderRetailGiftCards();
    renderSmmServices();
    renderMyVault();
    initDragToScrollEngine();
  } catch (err) {
    console.error('Error loading marketplace data:', err);
  }
}

// --- TOAST NOTIFICATION ENGINE (DARK LUXE FINTECH TOASTS) ---
window.showToast = function(type = 'info', title = '', message = '', duration = 4000) {
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
};

// --- SMM ORDER MODAL ENGINE ---
window.openBuySmmModal = function(serviceId) {
  const services = (state.smmServices && state.smmServices.length > 0) ? state.smmServices : smmServices;
  const service = services.find(s => s.id === serviceId) || services[0];
  if (!service) return;

  const modal = document.getElementById('modal-smm-buy');
  if (!modal) return;

  document.getElementById('smm-order-service-id').value = service.id;
  document.getElementById('smm-buy-title').textContent = service.name;
  document.getElementById('smm-buy-platform').textContent = (service.platform || 'SMM').toUpperCase();
  document.getElementById('smm-buy-desc').textContent = service.desc || 'Entrega gradual y automática hacia el enlace indicado.';

  const minQty = service.minQuantity || 100;
  const maxQty = service.maxQuantity || 25000;
  const limitsNote = document.getElementById('smm-order-limits-note');
  if (limitsNote) limitsNote.textContent = `Mín: ${minQty.toLocaleString()} - Máx: ${maxQty.toLocaleString()}`;

  const qtyInput = document.getElementById('smm-order-quantity');
  qtyInput.min = minQty;
  qtyInput.max = maxQty;
  qtyInput.value = minQty >= 1000 ? 1000 : minQty;

  const rate = state.exchangeRatePyg || 7500;
  const base1kPrice = service.pricePer1kUsd || service.priceUsd || 4.50;

  const recalculate = () => {
    const qty = parseInt(qtyInput.value) || 0;
    const totalUsd = parseFloat(((base1kPrice * qty) / 1000).toFixed(2));
    const totalPyg = Math.round(totalUsd * rate);

    document.getElementById('smm-order-total-gs').textContent = `${totalPyg.toLocaleString('es-PY')} Gs.`;
    document.getElementById('smm-order-total-usd').textContent = `$${totalUsd.toFixed(2)} USDT`;
  };

  qtyInput.oninput = recalculate;
  recalculate();

  const closeBtn = document.getElementById('btn-close-smm-modal');
  if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';

  modal.style.display = 'grid';
};

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

  const modal = document.getElementById('modal-product-buy');
  if (!modal) return;

  document.getElementById('modal-buy-cover').src = game.coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
  document.getElementById('modal-buy-platform').textContent = game.platform || 'PS5';
  document.getElementById('modal-buy-title').textContent = game.title;
  document.getElementById('modal-buy-genre').textContent = game.genre || 'Videojuego Digital';
  document.getElementById('modal-buy-description').textContent = game.description || 'Entrega digital con activación y soporte garantizado.';

  // Screenshots
  const screenshotsContainer = document.getElementById('modal-buy-screenshots-container');
  const shots = (game.screenshots && game.screenshots.length > 0) ? game.screenshots : [
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
  ];
  screenshotsContainer.innerHTML = shots.map(url => `
    <img src="${url}" style="height: 85px; width: 140px; object-fit: cover; border-radius: 8px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1);">
  `).join('');

  // Options Grid (Only Primary & Secondary Accounts as per platform business model)
  const rate = state.exchangeRatePyg || 7500;
  const primaryPrice = game.primaryPriceUsd || game.priceUsd || (game.primaryPricePyg ? parseFloat((game.primaryPricePyg / rate).toFixed(2)) : 39.99);
  const secondaryPrice = game.secondaryPriceUsd || (game.secondaryPricePyg ? parseFloat((game.secondaryPricePyg / rate).toFixed(2)) : Math.round(primaryPrice * 0.65));

  let selectedPrice = primaryPrice;
  let selectedOptionTitle = 'Cuenta Primaria';

  const options = [
    { key: 'primary', label: 'Cuenta Primaria', price: primaryPrice, pyg: game.primaryPricePyg || Math.round(primaryPrice * rate), desc: 'Juega con tu propio perfil personal y logros' },
    { key: 'secondary', label: 'Cuenta Secundaria', price: secondaryPrice, pyg: game.secondaryPricePyg || Math.round(secondaryPrice * rate), desc: 'Juega conectado al perfil del juego con activación' }
  ];

  const optionsContainer = document.getElementById('modal-buy-options-grid');
  const updatePriceDisplay = (price) => {
    selectedPrice = price;
    const gs = Math.round(price * rate);
    document.getElementById('modal-buy-total-gs').textContent = `${gs.toLocaleString('es-PY')} Gs.`;
    document.getElementById('modal-buy-total-usd').textContent = `$${price.toFixed(2)} USDT`;
  };

  optionsContainer.innerHTML = options.map((opt, idx) => `
    <div class="buy-option-card ${idx === 0 ? 'selected' : ''}" data-price="${opt.price}" data-label="${opt.label}" style="background: rgba(255,255,255,0.03); border: 1px solid ${idx === 0 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)'}; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.2s ease;">
      <div style="font-size: 0.82rem; font-weight: 800; color: #ffffff;">${opt.label}</div>
      <div style="font-family: var(--font-mono); font-size: 0.92rem; font-weight: 800; color: var(--accent-cyan); margin: 3px 0;">$${opt.price.toFixed(2)}</div>
      <div style="font-size: 0.7rem; color: var(--text-tertiary);">${opt.desc}</div>
    </div>
  `).join('');

  updatePriceDisplay(primaryPrice);

  const optionCards = optionsContainer.querySelectorAll('.buy-option-card');
  optionCards.forEach(card => {
    card.onclick = () => {
      optionCards.forEach(c => {
        c.style.borderColor = 'rgba(255,255,255,0.08)';
        c.style.background = 'rgba(255,255,255,0.03)';
      });
      card.style.borderColor = 'var(--accent-cyan)';
      card.style.background = 'rgba(0,194,255,0.08)';
      const p = parseFloat(card.getAttribute('data-price'));
      selectedOptionTitle = card.getAttribute('data-label');
      updatePriceDisplay(p);
    };
  });

  const confirmBtn = document.getElementById('btn-confirm-product-buy');
  confirmBtn.onclick = () => {
    modal.style.display = 'none';
    executePurchase(`/api/store/products/${game.id}/buy`, { option: selectedOptionTitle, priceUsd: selectedPrice }, `${game.title} (${selectedOptionTitle})`);
  };

  document.getElementById('btn-close-product-buy-modal').onclick = () => modal.style.display = 'none';
  modal.style.display = 'grid';
};

window.openBuyGiftCardModal = function(id) {
  const gc = state.storeProducts.find(p => p.id === id);
  if (!gc) return;

  const modal = document.getElementById('modal-product-buy');
  if (!modal) return;

  document.getElementById('modal-buy-cover').src = gc.coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';
  document.getElementById('modal-buy-platform').textContent = gc.brand || 'GIFT CARD';
  document.getElementById('modal-buy-title').textContent = gc.title;
  document.getElementById('modal-buy-genre').textContent = 'Tarjeta de Regalo Digital';
  document.getElementById('modal-buy-description').textContent = gc.description || 'Código oficial de activación inmediata. Se entrega directamente a tu cuenta al confirmar.';

  document.getElementById('modal-buy-screenshots-container').innerHTML = '';

  const rate = state.exchangeRatePyg || 7500;
  const price = gc.priceUsd || 10.00;
  const gs = Math.round(price * rate);

  document.getElementById('modal-buy-options-grid').innerHTML = `
    <div style="background: rgba(0,194,255,0.08); border: 1px solid var(--accent-cyan); padding: 12px; border-radius: 10px;">
      <div style="font-size: 0.84rem; font-weight: 800; color: #ffffff;">Entrega Instantánea</div>
      <div style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 800; color: var(--accent-cyan); margin-top: 4px;">$${price.toFixed(2)} USDT</div>
      <div style="font-size: 0.72rem; color: var(--text-tertiary);">Código digital disponible en stock</div>
    </div>
  `;

  document.getElementById('modal-buy-total-gs').textContent = `${gs.toLocaleString('es-PY')} Gs.`;
  document.getElementById('modal-buy-total-usd').textContent = `$${price.toFixed(2)} USDT`;

  const confirmBtn = document.getElementById('btn-confirm-product-buy');
  confirmBtn.onclick = () => {
    modal.style.display = 'none';
    executePurchase(`/api/store/products/${gc.id}/buy`, { priceUsd: price }, gc.title);
  };

  document.getElementById('btn-close-product-buy-modal').onclick = () => modal.style.display = 'none';
  modal.style.display = 'grid';
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
      window.showToast('success', '¡Compra Exitosa!', `Has adquirido "${productName}". Entrega y activación en tu Bóveda / Perfil.`);
      await fetchStoreData();
      updateUserBalanceDisplay();
      if (subId) {
        openGroupChatModal(subId);
      }
    } else {
      if (data.error && data.error.includes('Saldo insuficiente')) {
        window.showToast('warning', 'Saldo Insuficiente', 'Tu billetera no cuenta con los fondos necesarios. Redirigiendo a recarga...');
        setTimeout(() => {
          const modal = document.getElementById('modal-deposit');
          if (modal) {
            updateUserBalanceDisplay();
            modal.style.display = 'grid';
          }
        }, 1200);
      } else {
        window.showToast('error', 'Error en la Compra', data.error || 'No se pudo completar la transacción.');
      }
    }
  } catch (e) {
    window.showToast('error', 'Error de Conexión', 'No se pudo conectar con el servidor.');
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

  if (searchInput && dropdown) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        dropdown.style.display = 'none';
        return;
      }

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

window.handleSearchResultClick = function(category, id) {
  const dropdown = document.getElementById('search-dropdown-results');
  if (dropdown) dropdown.style.display = 'none';
  if (category === 'sub') openBuySubscriptionModal(id);
  else openBuyGameModal(id);
};

// --- 11. SETUP USER SESSION, MULTI-CURRENCY, LIVE BALANCE & DEPOSIT MODAL ---
// --- 11. SETUP USER SESSION, LIVE BALANCE, DEPOSIT MODAL & PAYOUT MODAL ---
async function updateUserBalanceDisplay() {
  const balanceEl = document.getElementById('nav-user-balance-amount');
  const payoutBalEl = document.getElementById('payout-available-balance-gs');
  if (!balanceEl && !payoutBalEl) return;

  if (!state.currentUser) {
    if (balanceEl) balanceEl.textContent = '0 Gs.';
    if (payoutBalEl) payoutBalEl.textContent = '0 Gs.';
    return;
  }

  const userId = state.currentUser.id;

  try {
    const res = await fetch('/api/wallet/balance', {
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    if (data.wallet && data.wallet.balanceUsd !== undefined) {
      state.wallet = data.wallet;
      if (state.currentUser) state.currentUser.balanceUsd = data.wallet.balanceUsd;
    }
    if (data.exchangeRatePyg) {
      state.exchangeRatePyg = data.exchangeRatePyg;
    }
    if (data.paymentMethods) {
      state.paymentMethods = data.paymentMethods;
      populatePaymentMethodsData();
    }
  } catch (e) {}

  const rate = state.exchangeRatePyg || 7500;
  const balUsd = state.currentUser?.balanceUsd !== undefined ? state.currentUser.balanceUsd : (state.wallet?.balanceUsd || 0);
  const balPyg = Math.round(balUsd * rate);
  const formattedGs = `${balPyg.toLocaleString('es-PY')} Gs.`;

  if (balanceEl) balanceEl.textContent = formattedGs;
  if (payoutBalEl) payoutBalEl.textContent = formattedGs;
}

function populatePaymentMethodsData() {
  if (!state.paymentMethods) return;
  const p = state.paymentMethods.paraguay;
  const b = state.paymentMethods.binance;

  if (p) {
    if (document.getElementById('deposit-info-bank')) document.getElementById('deposit-info-bank').textContent = p.bank || 'Banco Familiar / Itaú';
    if (document.getElementById('deposit-info-holder')) document.getElementById('deposit-info-holder').textContent = p.accountHolder || 'GamesBoy Paraguay S.A.';
    if (document.getElementById('deposit-info-doc')) document.getElementById('deposit-info-doc').textContent = p.rucOrCi || '80091234-5';
    if (document.getElementById('deposit-info-account')) document.getElementById('deposit-info-account').textContent = p.accountNumber || '01-445566-7';
    if (document.getElementById('deposit-info-alias')) document.getElementById('deposit-info-alias').textContent = p.aliasSipap || 'gamesboy.py';
  }

  if (b) {
    if (document.getElementById('pay-info-binance-id')) document.getElementById('pay-info-binance-id').textContent = b.payId || '849201934';
    if (document.getElementById('pay-info-binance-network')) document.getElementById('pay-info-binance-network').textContent = b.network || 'USDT (Binance Pay / BEP-20 / TRC-20)';
    if (document.getElementById('pay-info-binance-wallet')) document.getElementById('pay-info-binance-wallet').textContent = b.walletAddress || '0x71C9414B3b27bA134a6C3f07a757657A82e4b92F';
    const qrImg = document.getElementById('pay-info-binance-qr-img');
    if (qrImg) {
      qrImg.src = b.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(b.walletAddress || '849201934')}`;
    }
  }

  const rateNote = document.getElementById('deposit-rate-note');
  if (rateNote) {
    const rate = state.exchangeRatePyg || 7500;
    rateNote.textContent = `Tasa de cambio activa: 1 USDT = ${rate.toLocaleString('es-PY')} Gs. Tu saldo se acreditará directamente en Guaraníes.`;
  }
}

function updateDepositCalculator() {
  const amountInput = document.getElementById('deposit-amount-input');
  const currencyInput = document.getElementById('deposit-selected-currency');
  const previewDiv = document.getElementById('deposit-converted-preview');
  const rate = state.exchangeRatePyg || 7500;

  if (!amountInput || !previewDiv) return;

  const val = parseFloat(amountInput.value);
  const currency = currencyInput ? currencyInput.value : 'PYG';

  if (isNaN(val) || val <= 0) {
    previewDiv.innerHTML = `⚡ Se acreditarán: <strong>0 Gs.</strong> en tu saldo`;
    return;
  }

  if (currency === 'USDT') {
    const gs = Math.round(val * rate);
    previewDiv.innerHTML = `⚡ <strong>${val.toFixed(2)} USDT</strong> = <strong style="color: var(--accent-emerald); font-size: 0.95rem;">${gs.toLocaleString('es-PY')} Gs.</strong> (Se acreditarán en tu cuenta)`;
  } else {
    previewDiv.innerHTML = `⚡ Se acreditarán: <strong style="color: var(--accent-emerald); font-size: 0.95rem;">${Math.round(val).toLocaleString('es-PY')} Gs.</strong> en tu saldo`;
  }
}

function initDepositModal() {
  const modalDeposit = document.getElementById('modal-deposit');
  const btnOpenDeposit = document.getElementById('btn-open-deposit-modal');
  const btnCloseDeposit = document.getElementById('btn-close-deposit-modal');

  const tabLocal = document.getElementById('tab-pay-local');
  const tabBinance = document.getElementById('tab-pay-binance');
  const boxLocal = document.getElementById('box-pay-local');
  const boxBinance = document.getElementById('box-pay-binance');
  const currencyInput = document.getElementById('deposit-selected-currency');
  const labelAmount = document.getElementById('label-deposit-amount');
  const amountInput = document.getElementById('deposit-amount-input');
  const labelRef = document.getElementById('label-deposit-ref');
  const refInput = document.getElementById('deposit-reference-input');

  if (tabLocal && tabBinance && boxLocal && boxBinance) {
    tabLocal.onclick = () => {
      tabLocal.classList.add('active');
      tabBinance.classList.remove('active');
      boxLocal.style.display = 'block';
      boxBinance.style.display = 'none';
      if (currencyInput) currencyInput.value = 'PYG';
      if (labelAmount) labelAmount.textContent = 'Monto a Transferir en Guaraníes (Gs.):';
      if (amountInput) { amountInput.placeholder = 'ej: 100000'; amountInput.step = '1000'; }
      if (labelRef) labelRef.textContent = 'N° de Transferencia / Comprobante SIPAP:';
      if (refInput) refInput.placeholder = 'ej: SIPAP-781923';
      updateDepositCalculator();
    };

    tabBinance.onclick = () => {
      tabBinance.classList.add('active');
      tabLocal.classList.remove('active');
      boxBinance.style.display = 'block';
      boxLocal.style.display = 'none';
      if (currencyInput) currencyInput.value = 'USDT';
      if (labelAmount) labelAmount.textContent = 'Monto a Transferir en USDT (Cripto):';
      if (amountInput) { amountInput.placeholder = 'ej: 10'; amountInput.step = 'any'; }
      if (labelRef) labelRef.textContent = 'Binance Pay Order ID o TXID / Hash:';
      if (refInput) refInput.placeholder = 'ej: 289102910 o Hash Binance';
      updateDepositCalculator();
    };
  }

  if (amountInput) {
    amountInput.oninput = updateDepositCalculator;
  }

  if (btnOpenDeposit && modalDeposit) {
    btnOpenDeposit.onclick = () => {
      updateUserBalanceDisplay();
      modalDeposit.style.display = 'grid';
    };
  }
  if (btnCloseDeposit && modalDeposit) {
    btnCloseDeposit.onclick = () => modalDeposit.style.display = 'none';
  }

  const depositForm = document.getElementById('form-submit-deposit');
  if (depositForm) {
    depositForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = state.currentUser ? state.currentUser.id : 'usr_client1';
      const amount = parseFloat(amountInput.value);
      const currency = currencyInput ? currencyInput.value : 'PYG';
      const reference = refInput.value.trim();
      const fileInput = document.getElementById('deposit-receipt-file');

      if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido a recargar.');
        return;
      }

      // Helper to submit deposit request
      const sendDeposit = async (receiptData = '') => {
        try {
          const res = await fetch('/api/wallet/deposit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId
            },
            body: JSON.stringify({
              amount,
              currency,
              method: currency === 'USDT' ? 'binance_usdt' : 'sipap_paraguay',
              reference,
              receiptData
            })
          });
          const data = await res.json();
          if (data.success) {
            alert(`🎉 ${data.message}`);
            depositForm.reset();
            updateDepositCalculator();
            if (modalDeposit) modalDeposit.style.display = 'none';
            updateUserBalanceDisplay();
          } else {
            alert(`Aviso: ${data.error || 'No se pudo registrar la recarga.'}`);
          }
        } catch (err) {
          alert('Error de conexión al enviar comprobante.');
        }
      };

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = () => sendDeposit(reader.result);
        reader.readAsDataURL(file);
      } else {
        sendDeposit(reference);
      }
    });
  }
}

function initPayoutModal() {
  const modalPayout = document.getElementById('modal-payout');
  const btnClosePayout = document.getElementById('btn-close-payout-modal');
  const formPayout = document.getElementById('form-submit-payout');
  const methodSelect = document.getElementById('payout-method-select');
  const amountInput = document.getElementById('payout-amount-pyg-input');
  const previewText = document.getElementById('payout-amount-converted-preview');
  const fieldsSipap = document.getElementById('payout-fields-sipap');
  const fieldsBinance = document.getElementById('payout-fields-binance');

  const updatePayoutPreview = () => {
    const rate = state.exchangeRatePyg || 7500;
    const gs = parseFloat(amountInput.value) || 0;
    const method = methodSelect.value;

    if (method === 'binance_usdt') {
      const usdt = (gs / rate).toFixed(2);
      previewText.innerHTML = `⚡ Retiras <strong>${gs.toLocaleString('es-PY')} Gs.</strong> ➔ Recibirás aprox. <strong style="color: var(--accent-emerald);">${usdt} USDT</strong> en Binance (Tasa: ${rate.toLocaleString('es-PY')} Gs./USDT)`;
    } else {
      previewText.innerHTML = `⚡ Se transferirán <strong style="color: var(--accent-emerald);">${gs.toLocaleString('es-PY')} Gs.</strong> directamente a tu cuenta bancaria.`;
    }
  };

  if (methodSelect) {
    methodSelect.addEventListener('change', () => {
      if (methodSelect.value === 'binance_usdt') {
        if (fieldsSipap) fieldsSipap.style.display = 'none';
        if (fieldsBinance) fieldsBinance.style.display = 'block';
      } else {
        if (fieldsSipap) fieldsSipap.style.display = 'block';
        if (fieldsBinance) fieldsBinance.style.display = 'none';
      }
      updatePayoutPreview();
    });
  }

  if (amountInput) {
    amountInput.oninput = updatePayoutPreview;
  }

  if (btnClosePayout && modalPayout) {
    btnClosePayout.onclick = () => modalPayout.style.display = 'none';
  }

  if (formPayout) {
    formPayout.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = state.currentUser ? state.currentUser.id : 'usr_client1';
      const amountPyg = parseFloat(amountInput.value);
      const method = methodSelect.value;

      let accountDetails = {};
      if (method === 'binance_usdt') {
        accountDetails = { binanceDestination: document.getElementById('payout-binance-dest')?.value || '' };
      } else {
        accountDetails = { bankDetails: document.getElementById('payout-bank-details')?.value || '' };
      }

      try {
        const res = await fetch('/api/seller/payout-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify({
            amountPyg,
            method,
            accountDetails
          })
        });
        const data = await res.json();
        if (data.success) {
          alert(`🎉 ${data.message}`);
          formPayout.reset();
          if (modalPayout) modalPayout.style.display = 'none';
          updateUserBalanceDisplay();
        } else {
          alert(`Aviso: ${data.error || 'No se pudo procesar la solicitud de retiro.'}`);
        }
      } catch (err) {
        alert('Error al solicitar retiro.');
      }
    });
  }
}

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

    const roleBadge = document.querySelector('.user-role-badge');
    const adminMenuContainer = document.getElementById('menu-item-admin-container');

    if (user.role === 'admin') {
      if (roleBadge) {
        roleBadge.textContent = 'Administrador Master';
        roleBadge.style.color = '#f59e0b';
      }
      if (adminMenuContainer) adminMenuContainer.style.display = 'block';
    } else if (user.role === 'seller') {
      if (roleBadge) {
        roleBadge.textContent = 'Vendedor Verificado';
        roleBadge.style.color = '#34d399';
      }
      if (adminMenuContainer) adminMenuContainer.style.display = 'none';
    } else {
      if (roleBadge) {
        roleBadge.textContent = 'Cliente Verificado';
        roleBadge.style.color = '#00c2ff';
      }
      if (adminMenuContainer) adminMenuContainer.style.display = 'none';
    }

    const avatarSrc = (user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/assets'))) 
      ? user.avatar 
      : '/assets/branding/icon.png';

    if (navUserAvatarImg) navUserAvatarImg.src = avatarSrc;
    if (dropdownUserAvatarImg) dropdownUserAvatarImg.src = avatarSrc;
  };

  if (state.currentUser && state.currentUser.name) {
    if (unloggedGroup) {
      unloggedGroup.classList.add('is-hidden');
      unloggedGroup.style.display = 'none';
    }
    if (loggedGroup) {
      loggedGroup.classList.remove('is-hidden');
      loggedGroup.style.display = 'inline-flex';
    }
    updateUserDisplay(state.currentUser);
    updateUserBalanceDisplay();

    // Sync latest profile from backend
    fetch('/api/auth/profile', { headers: { 'x-user-id': state.currentUser.id } })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          state.currentUser = { ...state.currentUser, ...data.user, balanceUsd: data.balanceUsd };
          localStorage.setItem('gb_user', JSON.stringify(state.currentUser));
          updateUserDisplay(state.currentUser);
          updateUserBalanceDisplay();
        }
      })
      .catch(() => {});
  } else {
    if (unloggedGroup) {
      unloggedGroup.classList.remove('is-hidden');
      unloggedGroup.style.display = 'inline-flex';
    }
    if (loggedGroup) {
      loggedGroup.classList.add('is-hidden');
      loggedGroup.style.display = 'none';
    }
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
  const menuItemDeposit = document.getElementById('menu-item-deposit');
  if (menuItemDeposit) {
    menuItemDeposit.onclick = () => {
      if (dropdownMenu) dropdownMenu.style.display = 'none';
      const modal = document.getElementById('modal-deposit');
      if (modal) {
        updateUserBalanceDisplay();
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

  // Sticky Right Monetize Pill ("Generar Ingresos")
  const stickyMonetizePill = document.getElementById('sticky-monetize-pill');
  if (stickyMonetizePill) {
    stickyMonetizePill.onclick = () => {
      const modal = document.getElementById('modal-publish-stream');
      if (modal) modal.style.display = 'grid';
    };
  }

  const handleLogout = () => {
    localStorage.removeItem('gb_user');
    localStorage.removeItem('gb_admin_session');
    localStorage.removeItem('gb_token');
    window.location.href = '/';
  };

  const btnHeaderLogout = document.getElementById('btn-header-logout');
  if (btnHeaderLogout) btnHeaderLogout.onclick = handleLogout;

  const btnLogoutUser = document.getElementById('btn-logout-user');
  if (btnLogoutUser) btnLogoutUser.onclick = handleLogout;

  // Init Modals
  initDepositModal();
  initPayoutModal();

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
  // SMM Order Form Submission
  const formSmmOrder = document.getElementById('form-smm-order');
  if (formSmmOrder) {
    formSmmOrder.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = state.currentUser ? state.currentUser.id : 'usr_client1';
      const serviceId = document.getElementById('smm-order-service-id').value;
      const link = document.getElementById('smm-order-link').value.trim();
      const quantity = parseInt(document.getElementById('smm-order-quantity').value, 10);

      if (!serviceId || !link || !quantity || quantity <= 0) {
        window.showToast('warning', 'Campos Incompletos', 'Por favor ingresa un enlace válido y la cantidad deseada.');
        return;
      }

      try {
        const res = await fetch('/api/smm/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify({ serviceId, link, quantity })
        });
        const data = await res.json();
        if (data.success) {
          const modalSmm = document.getElementById('modal-smm-buy');
          if (modalSmm) modalSmm.style.display = 'none';
          formSmmOrder.reset();
          window.showToast('success', '¡Orden SMM Enviada!', data.message || `Tu orden de ${quantity.toLocaleString()} unidades ha sido procesada hacia la API del proveedor.`);
          updateUserBalanceDisplay();
        } else {
          if (data.error && data.error.includes('Saldo insuficiente')) {
            window.showToast('warning', 'Saldo Insuficiente', 'Tu saldo no cubre esta orden. Abriendo recargas SIPAP / USDT...');
            const modalSmm = document.getElementById('modal-smm-buy');
            if (modalSmm) modalSmm.style.display = 'none';
            setTimeout(() => {
              const modalDeposit = document.getElementById('modal-deposit');
              if (modalDeposit) {
                updateUserBalanceDisplay();
                modalDeposit.style.display = 'grid';
              }
            }, 1000);
          } else {
            window.showToast('error', 'Error en Orden SMM', data.error || 'No se pudo procesar la orden.');
          }
        }
      } catch (err) {
        window.showToast('error', 'Error de Red', 'Error al conectar con la API de Impulso Digital.');
      }
    });
  }
}

// --- REAL-TIME WEBSOCKET ENGINE ---
function initWebSocketClient() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  let ws = null;
  const connect = () => {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('⚡ Connected to GamesBoy Realtime WebSocket Engine');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeEvent(data);
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setTimeout(connect, 4000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      setTimeout(connect, 5000);
    }
  };

  connect();
}

function handleRealtimeEvent(data) {
  if (!data || !data.type) return;

  const currentUserId = state.currentUser ? state.currentUser.id : null;

  switch (data.type) {
    case 'DEPOSIT_APPROVED': {
      const { deposit, userWallet } = data.payload || {};
      if (deposit && deposit.userId === currentUserId) {
        if (userWallet) {
          state.wallet = userWallet;
        }
        updateUserBalanceDisplay();
        window.showToast('success', '¡Recarga Acreditada!', `Tu comprobante de ${deposit.localAmount ? deposit.localAmount.toLocaleString('es-PY') + ' Gs.' : '$' + deposit.amountUsd} ha sido aprobado exitosamente.`);
      }
      break;
    }
    case 'SMM_ORDER_CREATED': {
      const { order, userWallet } = data.payload || {};
      if (order && order.userId === currentUserId) {
        if (userWallet) {
          state.wallet = userWallet;
        }
        updateUserBalanceDisplay();
      }
      break;
    }
    case 'NEW_CHAT_MESSAGE': {
      const { subscriptionId } = data.payload || {};
      if (state.activeGroupSubId === subscriptionId) {
        refreshGroupChatView(subscriptionId);
      }
      break;
    }
    case 'PRICE_UPDATE': {
      fetchStoreData();
      break;
    }
  }
}

// --- 0ms SYNCHRONOUS HYDRATION ENGINE (ZERO FLICKER) ---
function instantRenderCatalog() {
  try {
    initHeroAccordion();
    renderStreamingServices();
    renderDigitalGames();
    renderRetailGiftCards();
    renderSmmServices();
    initDragToScrollEngine();
    initSalesCalculator();
  } catch (err) {
    console.warn('Instant hydration warning:', err);
  }
}

function initializeMarketplace() {
  initUserSession();
  initLiveSearch();
  instantRenderCatalog(); // Immediate 0ms paint - eliminates all reload flicker
  fetchStoreData();        // Silent background update & seller sync
  initWebSocketClient();
  initDragToScrollEngine();
  initSalesCalculator();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMarketplace);
} else {
  initializeMarketplace();
}



