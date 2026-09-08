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
  {
    id: 'game_gow_ragnarok',
    title: 'God of War Ragnarök',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Acción / Mitología',
    primaryPricePyg: 285000,
    secondaryPricePyg: 180000,
    primaryPriceUsd: 38.00,
    secondaryPriceUsd: 24.00,
    priceUsd: 38.00,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    description: 'Kratos y Atreus deben viajar a cada uno de los Nueve Reinos buscando respuestas.',
    isAvailable: true
  },
  {
    id: 'game_cyberpunk2077',
    title: 'Cyberpunk 2077 Ultimate',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'RPG / Mundo Abierto',
    primaryPricePyg: 240000,
    secondaryPricePyg: 155000,
    primaryPriceUsd: 32.00,
    secondaryPriceUsd: 20.67,
    priceUsd: 32.00,
    coverUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=600&q=80',
    description: 'Incluye el juego base con Night City y la expansión de espionaje Phantom Liberty.',
    isAvailable: true
  },
  {
    id: 'game_eldenring',
    title: 'Elden Ring: Shadow of Erdtree',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Action RPG / Souls',
    primaryPricePyg: 310000,
    secondaryPricePyg: 195000,
    primaryPriceUsd: 41.33,
    secondaryPriceUsd: 26.00,
    priceUsd: 41.33,
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    description: 'El aclamado juego del año con su masiva expansión de la Tierra de las Sombras.',
    isAvailable: true
  },
  {
    id: 'game_rdr2',
    title: 'Red Dead Redemption 2',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Mundo Abierto / Western',
    primaryPricePyg: 175000,
    secondaryPricePyg: 110000,
    primaryPriceUsd: 23.33,
    secondaryPriceUsd: 14.67,
    priceUsd: 23.33,
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    description: 'La épica historia de Arthur Morgan y la banda de Van der Linde en el salvaje oeste.',
    isAvailable: true
  },
  {
    id: 'game_hogwarts',
    title: 'Hogwarts Legacy',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Aventura Mágica',
    primaryPricePyg: 260000,
    secondaryPricePyg: 165000,
    primaryPriceUsd: 34.67,
    secondaryPriceUsd: 22.00,
    priceUsd: 34.67,
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    description: 'Vive una aventura mágica en el Colegio Hogwarts en el siglo XIX.',
    isAvailable: true
  },
  {
    id: 'game_re4_remake',
    title: 'Resident Evil 4 Remake',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Survival Horror',
    primaryPricePyg: 270000,
    secondaryPricePyg: 170000,
    primaryPriceUsd: 36.00,
    secondaryPriceUsd: 22.67,
    priceUsd: 36.00,
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    description: 'Leon S. Kennedy viaja a una recóndita aldea europea para rescatar a la hija del presidente.',
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

// SMM Social Media Platforms & Services Config (2-Column Architecture)
const smmPlatformsData = {
  'instagram': {
    id: 'instagram',
    platform: 'Instagram',
    title: 'Instagram Pro',
    bannerGradient: 'linear-gradient(135deg, #405DE6 0%, #833AB4 35%, #C13584 65%, #F56040 85%, #FFDC80 100%)',
    servicesListText: 'Seguidores • Likes • Vistas • Comentarios',
    startingPricePyg: 8775,
    startingPriceUsd: 1.17,
    categories: [
      {
        id: 'views',
        title: 'Visualizaciones / Reels Views',
        badge: '🚀 Impulso Algorítmico',
        desc: 'Reproducciones de alta retención para Reels, videos y Stories en Instagram.',
        base1kPricePyg: 8775,
        base1kPriceUsd: 1.17,
        targetLabel: 'Enlace del Reel / Video de Instagram:',
        targetPlaceholder: 'https://www.instagram.com/reel/... o https://www.instagram.com/p/...',
        packages: [
          { qty: 1000, pricePyg: 8775, priceUsd: 1.17 },
          { qty: 2500, pricePyg: 21500, priceUsd: 2.87 },
          { qty: 5000, pricePyg: 42000, priceUsd: 5.60 },
          { qty: 10000, pricePyg: 79000, priceUsd: 10.53 },
          { qty: 25000, pricePyg: 185000, priceUsd: 24.67 },
          { qty: 50000, pricePyg: 340000, priceUsd: 45.33 }
        ]
      },
      {
        id: 'likes',
        title: 'Likes / Me Gusta Instantáneos',
        badge: '⚡ Entrega Inmediata',
        desc: 'Aumenta el alcance de tus posts y fotos en el algoritmo y sección Explorar.',
        base1kPricePyg: 17550,
        base1kPriceUsd: 2.34,
        targetLabel: 'Enlace de la Publicación de Instagram:',
        targetPlaceholder: 'https://www.instagram.com/p/...',
        packages: [
          { qty: 500, pricePyg: 9000, priceUsd: 1.20 },
          { qty: 1000, pricePyg: 17550, priceUsd: 2.34 },
          { qty: 2500, pricePyg: 42000, priceUsd: 5.60 },
          { qty: 5000, pricePyg: 79000, priceUsd: 10.53 },
          { qty: 10000, pricePyg: 149000, priceUsd: 19.87 }
        ]
      },
      {
        id: 'followers',
        title: 'Seguidores HQ Reales',
        badge: '⭐ Garantía 30 Días',
        desc: 'Cuentas con fotos de perfil, publicaciones y actividad real. Entrega gradual segura.',
        base1kPricePyg: 43875,
        base1kPriceUsd: 5.85,
        targetLabel: 'Usuario o Enlace de tu Perfil de Instagram:',
        targetPlaceholder: '@tu_usuario o https://instagram.com/tu_usuario',
        packages: [
          { qty: 500, pricePyg: 23000, priceUsd: 3.07 },
          { qty: 1000, pricePyg: 43875, priceUsd: 5.85 },
          { qty: 2500, pricePyg: 105000, priceUsd: 14.00 },
          { qty: 5000, pricePyg: 198000, priceUsd: 26.40 },
          { qty: 10000, pricePyg: 375000, priceUsd: 50.00 }
        ]
      },
      {
        id: 'comments',
        title: 'Comentarios Personalizados',
        badge: '💬 100% Cuentas Reales',
        desc: 'Comentarios relevantes y positivos de cuentas en español para tus publicaciones.',
        base1kPricePyg: 85000,
        base1kPriceUsd: 11.33,
        targetLabel: 'Enlace del Post de Instagram:',
        targetPlaceholder: 'https://www.instagram.com/p/...',
        packages: [
          { qty: 25, pricePyg: 15000, priceUsd: 2.00 },
          { qty: 50, pricePyg: 28000, priceUsd: 3.73 },
          { qty: 100, pricePyg: 52000, priceUsd: 6.93 },
          { qty: 250, pricePyg: 115000, priceUsd: 15.33 }
        ]
      }
    ]
  },
  'tiktok': {
    id: 'tiktok',
    platform: 'TikTok',
    title: 'TikTok Viral',
    bannerGradient: 'linear-gradient(135deg, #010101 0%, #00f2fe 30%, #1e1b4b 60%, #fe0979 100%)',
    servicesListText: 'Visualizaciones FYP • Seguidores • Likes • Shares',
    startingPricePyg: 8775,
    startingPriceUsd: 1.17,
    categories: [
      {
        id: 'views',
        title: 'Visualizaciones Virales Para Ti (FYP)',
        badge: '🔥 100% Retención',
        desc: 'Potencia tus videos para entrar en tendencias mundiales y feed Para Ti de TikTok.',
        base1kPricePyg: 8775,
        base1kPriceUsd: 1.17,
        targetLabel: 'Enlace del Video de TikTok:',
        targetPlaceholder: 'https://www.tiktok.com/@usuario/video/...',
        packages: [
          { qty: 2500, pricePyg: 8775, priceUsd: 1.17 },
          { qty: 5000, pricePyg: 16500, priceUsd: 2.20 },
          { qty: 10000, pricePyg: 30000, priceUsd: 4.00 },
          { qty: 25000, pricePyg: 68000, priceUsd: 9.07 },
          { qty: 50000, pricePyg: 125000, priceUsd: 16.67 }
        ]
      },
      {
        id: 'followers',
        title: 'Seguidores Activos TikTok',
        badge: '👤 Habilita Lives & Monetización',
        desc: 'Habilita funciones de LIVE y monetización alcanzando los 1.000 o 10.000 seguidores.',
        base1kPricePyg: 63375,
        base1kPriceUsd: 8.45,
        targetLabel: 'Usuario o Enlace de tu Perfil TikTok:',
        targetPlaceholder: '@tu_usuario o https://tiktok.com/@tu_usuario',
        packages: [
          { qty: 500, pricePyg: 33000, priceUsd: 4.40 },
          { qty: 1000, pricePyg: 63375, priceUsd: 8.45 },
          { qty: 2500, pricePyg: 152000, priceUsd: 20.27 },
          { qty: 5000, pricePyg: 285000, priceUsd: 38.00 }
        ]
      },
      {
        id: 'likes',
        title: 'Likes / Me Gusta en Videos',
        badge: '⚡ Alta Velocidad',
        desc: 'Likes inmediatos para aumentar la probabilidad de viralización de tus videos.',
        base1kPricePyg: 24000,
        base1kPriceUsd: 3.20,
        targetLabel: 'Enlace del Video de TikTok:',
        targetPlaceholder: 'https://www.tiktok.com/@usuario/video/...',
        packages: [
          { qty: 500, pricePyg: 13000, priceUsd: 1.73 },
          { qty: 1000, pricePyg: 24000, priceUsd: 3.20 },
          { qty: 2500, pricePyg: 56000, priceUsd: 7.47 },
          { qty: 5000, pricePyg: 105000, priceUsd: 14.00 }
        ]
      },
      {
        id: 'shares',
        title: 'Compartidos & Guardados',
        badge: '🔄 Factor Viral',
        desc: 'Multiplica las señales de retención y viralidad en el algoritmo de TikTok.',
        base1kPricePyg: 15000,
        base1kPriceUsd: 2.00,
        targetLabel: 'Enlace del Video de TikTok:',
        targetPlaceholder: 'https://www.tiktok.com/@usuario/video/...',
        packages: [
          { qty: 500, pricePyg: 8000, priceUsd: 1.07 },
          { qty: 1000, pricePyg: 15000, priceUsd: 2.00 },
          { qty: 2500, pricePyg: 34000, priceUsd: 4.53 },
          { qty: 5000, pricePyg: 62000, priceUsd: 8.27 }
        ]
      }
    ]
  },
  'youtube': {
    id: 'youtube',
    platform: 'YouTube',
    title: 'YouTube Creator',
    bannerGradient: 'linear-gradient(135deg, #1f0204 0%, #991b1b 45%, #ef4444 100%)',
    servicesListText: 'Suscriptores • Vistas Shorts/Video • Likes',
    startingPricePyg: 22000,
    startingPriceUsd: 2.93,
    categories: [
      {
        id: 'views',
        title: 'Reproducciones Video / Shorts',
        badge: '▶️ Horas de Reproducción',
        desc: 'Vistas de alta retención para posicionar videos en el buscador y recomendaciones.',
        base1kPricePyg: 22000,
        base1kPriceUsd: 2.93,
        targetLabel: 'Enlace del Video o Short de YouTube:',
        targetPlaceholder: 'https://www.youtube.com/watch?v=... o https://youtu.be/...',
        packages: [
          { qty: 1000, pricePyg: 22000, priceUsd: 2.93 },
          { qty: 2500, pricePyg: 52000, priceUsd: 6.93 },
          { qty: 5000, pricePyg: 98000, priceUsd: 13.07 },
          { qty: 10000, pricePyg: 185000, priceUsd: 24.67 }
        ]
      },
      {
        id: 'subscribers',
        title: 'Suscriptores para Canal',
        badge: '⭐ Compatibles con Monetización',
        desc: 'Suscriptores reales para superar la meta de 1.000 subs y monetizar.',
        base1kPricePyg: 95000,
        base1kPriceUsd: 12.67,
        targetLabel: 'Enlace de tu Canal de YouTube:',
        targetPlaceholder: 'https://www.youtube.com/@tu_canal',
        packages: [
          { qty: 100, pricePyg: 15000, priceUsd: 2.00 },
          { qty: 250, pricePyg: 32000, priceUsd: 4.27 },
          { qty: 500, pricePyg: 58000, priceUsd: 7.73 },
          { qty: 1000, pricePyg: 95000, priceUsd: 12.67 }
        ]
      },
      {
        id: 'likes',
        title: 'Likes en Videos / Shorts',
        badge: '👍 100% Permanentes',
        desc: 'Mejora el ratio de me gusta de tus producciones audiovisuales.',
        base1kPricePyg: 28000,
        base1kPriceUsd: 3.73,
        targetLabel: 'Enlace del Video de YouTube:',
        targetPlaceholder: 'https://www.youtube.com/watch?v=...',
        packages: [
          { qty: 250, pricePyg: 9000, priceUsd: 1.20 },
          { qty: 500, pricePyg: 16000, priceUsd: 2.13 },
          { qty: 1000, pricePyg: 28000, priceUsd: 3.73 },
          { qty: 2500, pricePyg: 65000, priceUsd: 8.67 }
        ]
      }
    ]
  },
  'facebook': {
    id: 'facebook',
    platform: 'Facebook',
    title: 'Facebook Fanpage & Perfil',
    bannerGradient: 'linear-gradient(135deg, #061e47 0%, #1877f2 60%, #00c2ff 100%)',
    servicesListText: 'Seguidores Fanpage • Reacciones • Vistas Reels',
    startingPricePyg: 12000,
    startingPriceUsd: 1.60,
    categories: [
      {
        id: 'followers',
        title: 'Seguidores Fanpage / Perfil Profesional',
        badge: '👥 Monetización In-Stream',
        desc: 'Seguidores para monetizar con estrellas y anuncios in-stream.',
        base1kPricePyg: 48000,
        base1kPriceUsd: 6.40,
        targetLabel: 'Enlace de tu Fanpage o Perfil de Facebook:',
        targetPlaceholder: 'https://www.facebook.com/tu_pagina',
        packages: [
          { qty: 500, pricePyg: 26000, priceUsd: 3.47 },
          { qty: 1000, pricePyg: 48000, priceUsd: 6.40 },
          { qty: 2500, pricePyg: 115000, priceUsd: 15.33 },
          { qty: 5000, pricePyg: 215000, priceUsd: 28.67 }
        ]
      },
      {
        id: 'likes',
        title: 'Reacciones (Me Gusta / Me Encanta)',
        badge: '❤️ Reacciones Reales',
        desc: 'Interacciones positivas en tus publicaciones, posts y fotos.',
        base1kPricePyg: 22000,
        base1kPriceUsd: 2.93,
        targetLabel: 'Enlace de la Publicación de Facebook:',
        targetPlaceholder: 'https://www.facebook.com/.../posts/...',
        packages: [
          { qty: 250, pricePyg: 8000, priceUsd: 1.07 },
          { qty: 500, pricePyg: 13000, priceUsd: 1.73 },
          { qty: 1000, pricePyg: 22000, priceUsd: 2.93 },
          { qty: 2500, pricePyg: 50000, priceUsd: 6.67 }
        ]
      }
    ]
  },
  'telegram': {
    id: 'telegram',
    platform: 'Telegram',
    title: 'Telegram Canales & Grupos',
    bannerGradient: 'linear-gradient(135deg, #092c42 0%, #229ed9 60%, #38d6ff 100%)',
    servicesListText: 'Miembros Canales • Vistas Posts • Reacciones',
    startingPricePyg: 6500,
    startingPriceUsd: 0.87,
    categories: [
      {
        id: 'members',
        title: 'Miembros para Canales / Grupos',
        badge: '🚀 Crecimiento Rápido',
        desc: 'Miembros de alta retención para dar credibilidad a tu canal o grupo de Telegram.',
        base1kPricePyg: 32000,
        base1kPriceUsd: 4.27,
        targetLabel: 'Enlace de tu Canal o Grupo de Telegram:',
        targetPlaceholder: 'https://t.me/tu_canal',
        packages: [
          { qty: 500, pricePyg: 18000, priceUsd: 2.40 },
          { qty: 1000, pricePyg: 32000, priceUsd: 4.27 },
          { qty: 2500, pricePyg: 75000, priceUsd: 10.00 },
          { qty: 5000, pricePyg: 140000, priceUsd: 18.67 }
        ]
      },
      {
        id: 'views',
        title: 'Vistas en Últimos Posts',
        badge: '👁️ Visibilidad Garantizada',
        desc: 'Visualizaciones automáticas en los últimos mensajes de tu canal.',
        base1kPricePyg: 6500,
        base1kPriceUsd: 0.87,
        targetLabel: 'Enlace de la Publicación de Telegram:',
        targetPlaceholder: 'https://t.me/tu_canal/123',
        packages: [
          { qty: 1000, pricePyg: 6500, priceUsd: 0.87 },
          { qty: 5000, pricePyg: 28000, priceUsd: 3.73 },
          { qty: 10000, pricePyg: 50000, priceUsd: 6.67 },
          { qty: 25000, pricePyg: 110000, priceUsd: 14.67 }
        ]
      }
    ]
  },
  'x': {
    id: 'x',
    platform: 'X (Twitter)',
    title: 'X (Twitter) Growth',
    bannerGradient: 'linear-gradient(135deg, #0a0a0f 0%, #1e293b 50%, #334155 100%)',
    servicesListText: 'Seguidores • Retweets • Likes • Vistas Tweets',
    startingPricePyg: 28000,
    startingPriceUsd: 3.73,
    categories: [
      {
        id: 'followers',
        title: 'Seguidores HQ para X',
        badge: '✖️ Cuentas con Foto y Bio',
        desc: 'Seguidores de calidad para aumentar tu autoridad en X / Twitter.',
        base1kPricePyg: 55000,
        base1kPriceUsd: 7.33,
        targetLabel: 'Usuario o Enlace de tu Perfil de X:',
        targetPlaceholder: '@tu_usuario o https://x.com/tu_usuario',
        packages: [
          { qty: 250, pricePyg: 16000, priceUsd: 2.13 },
          { qty: 500, pricePyg: 30000, priceUsd: 4.00 },
          { qty: 1000, pricePyg: 55000, priceUsd: 7.33 },
          { qty: 2500, pricePyg: 130000, priceUsd: 17.33 }
        ]
      },
      {
        id: 'retweets',
        title: 'Retweets & Likes en Posts',
        badge: '🔄 Viralidad en Feed X',
        desc: 'Impulsa tus hilos y posts para lograr mayor visibilidad y tendencias.',
        base1kPricePyg: 28000,
        base1kPriceUsd: 3.73,
        targetLabel: 'Enlace del Tweet / Post en X:',
        targetPlaceholder: 'https://x.com/usuario/status/...',
        packages: [
          { qty: 250, pricePyg: 9000, priceUsd: 1.20 },
          { qty: 500, pricePyg: 16000, priceUsd: 2.13 },
          { qty: 1000, pricePyg: 28000, priceUsd: 3.73 },
          { qty: 2500, pricePyg: 65000, priceUsd: 8.67 }
        ]
      }
    ]
  }
};

const state = {
  country: autoDetectUserCountry(),
  currency: 'PYG',
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  wallet: { balanceUsd: 25.0, pendingEscrowUsd: 0.0 },
  exchangeRates: { PYG: 7500, ARS: 1250, BRL: 5.60, USD: 1.0, USDT: 1.0 },
  heroBanners: [],
  activeSlideIndex: 0,
  heroInterval: null,
  subscriptions: [],
  storeProducts: [],
  giftcardBrands: [],
  smmPlatforms: smmPlatformsData,
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

// --- GLOBAL MOUSE DRAG-TO-SCROLL ENGINE (WITH GHOST IMAGE SUPPRESSION) ---
function initDragToScrollEngine() {
  const scrollContainers = document.querySelectorAll('.catalog-scroll-row, .hub-releases-scroll, .services-grid');
  
  scrollContainers.forEach(slider => {
    // Suppress native drag & drop on all inner media
    slider.querySelectorAll('img, a, .game-card, .stream-thumb-card, .giftcard-clean-png-card, .smm-platform-card').forEach(el => {
      el.setAttribute('draggable', 'false');
    });

    slider.addEventListener('dragstart', (e) => e.preventDefault());

    if (slider.dataset.dragInitialized === 'true') return;
    slider.dataset.dragInitialized = 'true';

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    slider.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDown = true;
      hasDragged = false;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    const endDrag = () => {
      if (isDown) {
        isDown = false;
        setTimeout(() => {
          slider.classList.remove('is-dragging');
        }, 50);
      }
    };

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('blur', endDrag);
    window.addEventListener('dragend', endDrag);

    slider.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        slider.classList.remove('is-dragging');
      }
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX);
      if (Math.abs(walk) > 4) {
        e.preventDefault();
        hasDragged = true;
        slider.classList.add('is-dragging');
        slider.scrollLeft = scrollLeft - walk;
      }
    });

    // Suppress click actions if user dragged more than 4px
    slider.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    }, true);
  });
}

// --- SMM 2-COLUMN PLATFORM MODAL CONTROLLER ---
let currentSmmPlatform = 'instagram';
let currentSmmCategory = 'views';
let currentSmmSelectedPackage = null;

window.openSmmPlatformModal = function(platformKey) {
  const modal = document.getElementById('modal-smm-platform');
  if (!modal) return;

  const platform = smmPlatformsData[platformKey] || smmPlatformsData['instagram'];
  currentSmmPlatform = platformKey;

  // Header Details
  const titleEl = document.getElementById('smm-modal-title');
  const badgeEl = document.getElementById('smm-modal-platform-badge');
  const iconEl = document.getElementById('smm-modal-platform-icon');

  if (titleEl) titleEl.textContent = `Servicios para ${platform.platform}`;
  if (badgeEl) badgeEl.textContent = platform.platform.toUpperCase();
  if (iconEl) iconEl.innerHTML = platformSvgIcons[platform.platform] || platformSvgIcons['Instagram'];

  // Render left category tabs
  const tabsList = document.getElementById('smm-category-tabs-list');
  if (tabsList) {
    tabsList.innerHTML = platform.categories.map((cat, idx) => {
      return `
        <button type="button" class="smm-category-tab-btn ${idx === 0 ? 'active' : ''}" onclick="selectSmmCategory('${cat.id}')">
          <span>${cat.title}</span>
        </button>
      `;
    }).join('');
  }

  // Select first category by default
  if (platform.categories.length > 0) {
    window.selectSmmCategory(platform.categories[0].id);
  }

  // Close handlers
  const closeBtn = document.getElementById('btn-close-smm-platform-modal');
  if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };

  modal.style.display = 'grid';
};

window.selectSmmCategory = function(categoryId) {
  const platform = smmPlatformsData[currentSmmPlatform] || smmPlatformsData['instagram'];
  const category = platform.categories.find(c => c.id === categoryId) || platform.categories[0];
  if (!category) return;

  currentSmmCategory = categoryId;

  // Update tabs active state
  document.querySelectorAll('.smm-category-tab-btn').forEach((btn, idx) => {
    if (platform.categories[idx]?.id === categoryId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update right service info
  const titleEl = document.getElementById('smm-selected-service-title');
  const badgeEl = document.getElementById('smm-selected-quality-badge');
  const descEl = document.getElementById('smm-selected-service-desc');
  const rateEl = document.getElementById('smm-rate-indicator');
  const targetLabelEl = document.getElementById('smm-target-input-label');
  const targetInputEl = document.getElementById('smm-target-input');

  if (titleEl) titleEl.textContent = category.title;
  if (badgeEl) badgeEl.textContent = category.badge;
  if (descEl) descEl.textContent = category.desc;
  if (rateEl) rateEl.textContent = `Tarifa: ${formatPrice(category.base1kPriceUsd || (category.base1kPricePyg / 7500))} / 1.000`;
  if (targetLabelEl) targetLabelEl.textContent = `2. ${category.targetLabel || 'Enlace de tu Perfil o Publicación:'}`;
  if (targetInputEl) {
    targetInputEl.placeholder = category.targetPlaceholder || 'https://...';
    targetInputEl.value = '';
  }

  // Render package tiles
  const tilesContainer = document.getElementById('smm-quantity-tiles-grid');
  if (tilesContainer) {
    tilesContainer.innerHTML = category.packages.map((pkg, idx) => {
      const isSelected = idx === 0;
      if (isSelected) currentSmmSelectedPackage = pkg;

      return `
        <div class="smm-quantity-tile ${isSelected ? 'selected' : ''}" onclick="selectSmmPackage(${pkg.qty}, ${pkg.pricePyg}, ${pkg.priceUsd}, this)">
          <span class="smm-tile-amount">${pkg.qty.toLocaleString()}</span>
          <span class="smm-tile-price">${formatPrice(pkg.priceUsd)}</span>
        </div>
      `;
    }).join('');
  }

  updateSmmOrderSummary();
};

window.selectSmmPackage = function(qty, pricePyg, priceUsd, tileEl) {
  currentSmmSelectedPackage = { qty, pricePyg, priceUsd };

  document.querySelectorAll('.smm-quantity-tile').forEach(t => t.classList.remove('selected'));
  if (tileEl) tileEl.classList.add('selected');

  updateSmmOrderSummary();
};

function updateSmmOrderSummary() {
  if (!currentSmmSelectedPackage) return;
  const rate = state.exchangeRatePyg || 7500;
  const pricePyg = currentSmmSelectedPackage.pricePyg || Math.round(currentSmmSelectedPackage.priceUsd * rate);
  const priceUsd = currentSmmSelectedPackage.priceUsd || parseFloat((pricePyg / rate).toFixed(2));

  const totalGsEl = document.getElementById('smm-modal-total-gs');
  const totalUsdEl = document.getElementById('smm-modal-total-usd');

  if (totalGsEl) totalGsEl.textContent = `${pricePyg.toLocaleString('es-PY')} Gs.`;
  if (totalUsdEl) totalUsdEl.textContent = `$${priceUsd.toFixed(2)} USDT`;
}

// --- MOBILE 3D COIN JUMPER & TOOLTIP CONTROLLER ---
function initMobileCoinWidget() {
  const coinWrapper = document.getElementById('coin-3d-animated-wrapper');
  const tooltip = document.getElementById('coin-floating-tooltip');
  const btnMonetize = document.getElementById('sticky-monetize-pill');
  const modalPublish = document.getElementById('modal-publish-stream');

  if (btnMonetize) {
    btnMonetize.onclick = () => {
      if (modalPublish) {
        modalPublish.style.display = 'grid';
        if (typeof initPublishStreamModalPricing === 'function') {
          initPublishStreamModalPricing();
        }
      }
    };
  }

  if (!coinWrapper || !tooltip) return;

  const tooltipMessages = [
    '💰 ¡Genera Ingresos!',
    '✨ Monetiza tus cuentas',
    '💸 Gana dinero cada mes',
    '🔒 Cobro 100% Garantizado'
  ];
  let msgIndex = 0;

  setInterval(() => {
    if (window.innerWidth > 768) return;

    coinWrapper.classList.remove('is-jumping');
    tooltip.classList.remove('is-active');

    void coinWrapper.offsetWidth;

    coinWrapper.classList.add('is-jumping');

    setTimeout(() => {
      msgIndex = (msgIndex + 1) % tooltipMessages.length;
      tooltip.innerHTML = `<span>${tooltipMessages[msgIndex]}</span>`;
      tooltip.classList.add('is-active');
    }, 400);

    setTimeout(() => {
      tooltip.classList.remove('is-active');
    }, 4000);
  }, 6000);
}

// --- 1. HERO ACCORDION BANNER MODULE (ENEBA STYLE) ---
function initHeroAccordion() {
  const container = document.getElementById('eneba-accordion-slides');
  const dotsContainer = document.getElementById('hero-dots-container');
  const prevBtn = document.getElementById('btn-hero-prev');
  const nextBtn = document.getElementById('btn-hero-next');

  if (!container) return;

  // Anti-Flicker: Only render banners if loaded from API, otherwise show clean neutral state
  const banners = (state.heroBanners && state.heroBanners.length >= 4) ? state.heroBanners : null;
  if (!banners) {
    container.innerHTML = `
      <div class="eneba-slide active" style="background: linear-gradient(135deg, #091222 0%, #0d1a38 100%);">
        <div class="eneba-slide-bg horizontal-bg" style="background: none;"></div>
      </div>
    `;
    return;
  }

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
  const banners = (state.heroBanners && state.heroBanners.length >= 4) ? state.heroBanners : null;
  if (!banners) return;

  state.heroInterval = setInterval(() => {
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

// --- 2. RENDER STREAMING SERVICES (CLEAN SQUARE THUMBNAILS - MANUAL SCROLL ONLY, NO AUTO-SCROLL) ---
function renderStreamingServices() {
  const container = document.getElementById('streaming-services-grid');
  if (!container) return;

  // Anti-Flicker: Render shimmer skeleton cards if data is still loading
  const platformList = (state.streamingPlatforms && state.streamingPlatforms.length > 0)
    ? state.streamingPlatforms
    : [];

  if (platformList.length === 0) {
    container.innerHTML = `
      <div class="stream-skeleton-card"></div>
      <div class="stream-skeleton-card"></div>
      <div class="stream-skeleton-card"></div>
      <div class="stream-skeleton-card"></div>
      <div class="stream-skeleton-card"></div>
      <div class="stream-skeleton-card"></div>
      <div class="stream-skeleton-card"></div>
      <div class="stream-skeleton-card"></div>
    `;
    return;
  }

  // Cross-reference stock with live subscriptions
  const activeSubs = Array.isArray(state.subscriptions) ? state.subscriptions : [];

  container.innerHTML = platformList.map(p => {
    const platformKey = (p.id || p.platformKey || p.name || 'netflix').toLowerCase();
    
    // Check if there are active subscriptions with stock for this platform
    const matching = activeSubs.filter(s => {
      if (s.status !== 'active') return false;
      const sName = (s.serviceName || '').toLowerCase();
      return sName.includes(platformKey) || platformKey.includes(sName);
    });

    const hasActiveSlots = matching.some(s => (s.availableSlots || 0) > 0);
    const inStock = (p.hasStock !== undefined) ? p.hasStock : (hasActiveSlots || matching.length > 0);

    const thumbImg = p.thumbnailUrl || p.logoUrl || p.coverImage || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=300&q=80';

    return `
      <div class="stream-thumb-card ${inStock ? '' : 'out-of-stock'}" 
           onclick="window.location.href='/service.html?platform=${platformKey}'" 
           title="${p.name || platformKey} - ${inStock ? 'Disponible' : 'Sin Stock'}">
        <img src="${thumbImg}" alt="${p.name || platformKey}" class="stream-thumb-img" draggable="false" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=300&q=80';">
        ${!inStock ? '<span class="stream-thumb-badge-stock">SIN STOCK</span>' : ''}
      </div>
    `;
  }).join('');
}

// --- 3. RENDER DIGITAL GAMES & STADIUM WAVE DROP/REBOUND ENGINE ---
let gamesWaveTimer = null;
let gamesPoolIndex = 0;

function renderDigitalGames() {
  const container = document.getElementById('digital-games-grid');
  if (!container) return;

  const rawProducts = (Array.isArray(state.storeProducts) && state.storeProducts.length > 0)
    ? state.storeProducts
    : defaultStoreProducts;

  // Anti-Flicker: Skeletons while loading
  if (!rawProducts || rawProducts.length === 0) {
    container.innerHTML = `
      <div class="game-skeleton-card"></div>
      <div class="game-skeleton-card"></div>
      <div class="game-skeleton-card"></div>
      <div class="game-skeleton-card"></div>
      <div class="game-skeleton-card"></div>
      <div class="game-skeleton-card"></div>
    `;
    return;
  }

  const games = rawProducts.filter(p => {
    if (!p) return false;
    if (p.category === 'gift_card') return false;
    return p.category === 'game_key' || p.category === 'digital_game' || !p.category || (typeof p.category === 'string' && p.category.includes('game')) || p.platform === 'PS5' || p.platform === 'PS4' || p.genre;
  });

  if (games.length === 0) {
    container.innerHTML = `<p style="color: var(--text-tertiary); padding: 1.5rem; text-align: center; width: 100%;">No hay videojuegos disponibles en este momento.</p>`;
    return;
  }

  // Display initial 8 games
  const initialGames = games.slice(0, 8);

  container.innerHTML = initialGames.map((g, slotIdx) => {
    const isAvail = g.isAvailable !== false;
    const primaryPrice = g.primaryPriceUsd || g.priceUsd || 39.99;
    const secondaryPrice = g.secondaryPriceUsd || (g.secondaryPricePyg ? (g.secondaryPricePyg / (state.exchangeRatePyg || 7500)) : Math.round(primaryPrice * 0.65));

    return `
      <div class="game-card ${isAvail ? '' : 'disabled'}" data-slot-index="${slotIdx}" onclick="openBuyGameModal('${g.id}')">
        <div class="game-cover-container">
          <img src="${g.coverUrl || g.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}" alt="${g.title || 'Videojuego'}" class="game-cover-img" draggable="false" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';">
        </div>
        <div class="game-card-body">
          <h3 class="game-title" title="${g.title || ''}">${g.title || 'Juego Digital'}</h3>
          <div class="game-prices-inline-list">
            <div class="game-price-inline-row primary-row">
              <span class="game-price-inline-label">Primaria:</span>
              <span class="game-price-inline-val primary-val">${formatPrice(primaryPrice)}</span>
            </div>
            ${g.secondaryPriceUsd || g.secondaryPricePyg ? `
              <div class="game-price-inline-row secondary-row">
                <span class="game-price-inline-label">Secundaria:</span>
                <span class="game-price-inline-val secondary-val">${formatPrice(secondaryPrice)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Start the wave animation cycle every 6s
  initGamesWaveEngine(games);
}

// --- DIGITAL GAMES STADIUM WAVE ENGINE (LEFT-TO-RIGHT WAVE DROP & GROUND REBOUND) ---
function initGamesWaveEngine(allGamesList) {
  const container = document.getElementById('digital-games-grid');
  if (!container) return;

  if (gamesWaveTimer) {
    clearInterval(gamesWaveTimer);
    gamesWaveTimer = null;
  }

  const allGames = (Array.isArray(allGamesList) && allGamesList.length > 0)
    ? allGamesList
    : defaultStoreProducts.filter(p => p.category === 'digital_game');

  if (allGames.length <= 4) return;

  const resetWaveTimer = () => {
    if (gamesWaveTimer) {
      clearInterval(gamesWaveTimer);
      gamesWaveTimer = null;
    }
    gamesWaveTimer = setInterval(runWaveCycle, 6000);
  };

  // Reset timer on user manual interaction
  container.onscroll = () => resetWaveTimer();
  container.ontouchstart = () => { if (gamesWaveTimer) clearInterval(gamesWaveTimer); };
  container.ontouchend = () => resetWaveTimer();
  container.onmousedown = () => { if (gamesWaveTimer) clearInterval(gamesWaveTimer); };
  container.onmouseup = () => resetWaveTimer();
  container.onmouseleave = () => resetWaveTimer();

  const runWaveCycle = () => {
    if (container.dataset.isPaused === 'true' || container.classList.contains('is-dragging')) return;

    const cards = Array.from(container.querySelectorAll('.game-card:not(.disabled)'));
    if (cards.length === 0) return;

    // Advance pool index
    gamesPoolIndex = (gamesPoolIndex + cards.length) % allGames.length;

    // Execute sequential wave from left to right (stadium wave)
    cards.forEach((cardEl, i) => {
      const staggerDelay = i * 130; // 130ms between columns

      setTimeout(() => {
        if (container.classList.contains('is-dragging')) return;

        // Phase 1: Card slides down and fades out
        cardEl.classList.remove('wave-ready-top', 'wave-dropping-in');
        cardEl.classList.add('wave-falling-out');

        setTimeout(() => {
          // Phase 2: Pick next game and update content
          const nextGame = allGames[(gamesPoolIndex + i) % allGames.length];
          if (!nextGame) return;

          const primaryPrice = nextGame.primaryPriceUsd || nextGame.priceUsd || 39.99;
          const secondaryPrice = nextGame.secondaryPriceUsd || (nextGame.secondaryPricePyg ? (nextGame.secondaryPricePyg / (state.exchangeRatePyg || 7500)) : Math.round(primaryPrice * 0.65));

          cardEl.setAttribute('onclick', `openBuyGameModal('${nextGame.id}')`);
          cardEl.innerHTML = `
            <div class="game-cover-container">
              <img src="${nextGame.coverUrl || nextGame.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}" alt="${nextGame.title || 'Videojuego'}" class="game-cover-img" draggable="false" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';">
            </div>
            <div class="game-card-body">
              <h3 class="game-title" title="${nextGame.title || ''}">${nextGame.title || 'Juego Digital'}</h3>
              <div class="game-prices-inline-list">
                <div class="game-price-inline-row primary-row">
                  <span class="game-price-inline-label">Primaria:</span>
                  <span class="game-price-inline-val primary-val">${formatPrice(primaryPrice)}</span>
                </div>
                ${nextGame.secondaryPriceUsd || nextGame.secondaryPricePyg ? `
                  <div class="game-price-inline-row secondary-row">
                    <span class="game-price-inline-label">Secundaria:</span>
                    <span class="game-price-inline-val secondary-val">${formatPrice(secondaryPrice)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `;

          // Position card at top
          cardEl.classList.remove('wave-falling-out');
          cardEl.classList.add('wave-ready-top');

          // Force reflow
          void cardEl.offsetWidth;

          // Phase 3: Drop down with ground rebound bounce
          cardEl.classList.remove('wave-ready-top');
          cardEl.classList.add('wave-dropping-in');

          setTimeout(() => {
            cardEl.classList.remove('wave-dropping-in');
          }, 600);

        }, 260); // 260ms exit duration

      }, staggerDelay);
    });
  };

  gamesWaveTimer = setInterval(runWaveCycle, 6000);
}


// --- 4. RENDER REAL PNG UPLOADED GIFT CARDS (PURE TRANSPARENT PNG CARDS - AUDIO 3) ---
function renderRetailGiftCards() {
  const container = document.getElementById('retail-giftcards-grid');
  if (!container) return;

  // Prefer official giftcard brands from admin if available, or fallback to giftcard store products
  const brandsList = (state.giftcardBrands && state.giftcardBrands.length > 0)
    ? state.giftcardBrands
    : (state.storeProducts ? state.storeProducts.filter(p => p.category === 'gift_card') : []);

  // Anti-Flicker: Skeletons while loading
  if (brandsList.length === 0) {
    container.innerHTML = `
      <div class="giftcard-skeleton-card"></div>
      <div class="giftcard-skeleton-card"></div>
      <div class="giftcard-skeleton-card"></div>
      <div class="giftcard-skeleton-card"></div>
      <div class="giftcard-skeleton-card"></div>
      <div class="giftcard-skeleton-card"></div>
    `;
    return;
  }

  container.innerHTML = brandsList.map(gc => {
    const cardImg = gc.logoImage || gc.logoUrl || gc.coverImage || gc.coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80';
    const cardTitle = gc.name || gc.title || 'Gift Card';
    const cardId = gc.id || gc.brandId || `gc_${Math.random()}`;

    return `
      <div class="giftcard-clean-png-card" onclick="openGiftCardVariationsModal('${cardId}')" title="${cardTitle}">
        <img src="${cardImg}" alt="${cardTitle}" class="giftcard-clean-png-img" draggable="false" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80';">
      </div>
    `;
  }).join('');
}

// Platform SVG Vector Icons (100% SVG, Zero Emojis)
const platformSvgIcons = {
  'Instagram': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  'TikTok': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  'YouTube': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  'Facebook': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  'Telegram': `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>`,
  'X (Twitter)': `<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
};

// --- 5. RENDER SMM SERVICES (COMPACT HORIZONTAL TOP BANNER CARDS - SLIM 42px HEADER) ---
function renderSmmServices() {
  const container = document.getElementById('smm-services-grid');
  if (!container) return;

  const platforms = Object.values(smmPlatformsData);

  container.innerHTML = platforms.map(p => {
    const iconSvg = platformSvgIcons[p.platform] || platformSvgIcons['Instagram'];
    const chips = (p.servicesListText || 'Seguidores • Likes • Vistas')
      .split('•')
      .map(s => `<span class="smm-service-chip">${s.trim()}</span>`)
      .join('');

    const startingPriceFormatted = p.startingPricePyg 
      ? `${p.startingPricePyg.toLocaleString('es-PY')} Gs.` 
      : formatPrice(p.startingPriceUsd || 1.20);

    return `
      <div class="smm-platform-card" onclick="openSmmPlatformModal('${p.id}')" title="Ver servicios de ${p.platform}">
        <div class="smm-platform-banner-wrap" style="background: ${p.bannerGradient || 'linear-gradient(90deg, #1e293b, #0ea5e9)'};">
          <div class="smm-platform-banner-pattern"></div>
          <span class="smm-platform-badge-float">${p.platform}</span>
        </div>
        <div class="smm-platform-card-body">
          <div class="smm-platform-header-row">
            <div class="smm-platform-icon-bubble" style="background: ${p.bannerGradient || 'rgba(0, 194, 255, 0.2)'};">
              ${iconSvg}
            </div>
            <div class="smm-platform-title-wrap">
              <span class="smm-platform-sub-name">${p.platform}</span>
              <h3 class="smm-platform-name">${p.title}</h3>
            </div>
          </div>
          <div class="smm-platform-services-list">
            ${chips}
          </div>
          <div class="smm-platform-footer-row">
            <div>
              <span class="smm-platform-price-lbl">Desde</span>
              <div class="smm-platform-price-val">${startingPriceFormatted}</div>
            </div>
            <span class="btn-smm-explore">Explorar ➔</span>
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

// --- 7. FETCH INITIAL DATA FROM API (LIVE DYNAMIC RECONCILIATION) ---
async function fetchStoreData() {
  try {
    const [subRes, storeRes, bannersRes, smmRes, giftcardsRes, servicesCfgRes, gamesRes, hubsRes] = await Promise.all([
      fetch('/api/subscriptions').then(r => r.json()).catch(() => null),
      fetch('/api/store/products').then(r => r.json()).catch(() => null),
      fetch('/api/banners').then(r => r.json()).catch(() => null),
      fetch('/api/smm/services').then(r => r.json()).catch(() => null),
      fetch('/api/admin/giftcards/brands').then(r => r.json()).catch(() => null),
      fetch('/api/subscriptions/services-config').then(r => r.json()).catch(() => null),
      fetch('/api/admin/games').then(r => r.json()).catch(() => null),
      fetch('/api/streaming-hubs').then(r => r.json()).catch(() => null)
    ]);

    if (hubsRes && hubsRes.platforms && Array.isArray(hubsRes.platforms)) {
      state.streamingPlatforms = hubsRes.platforms;
    }

    if (Array.isArray(subRes) && subRes.length > 0) {
      state.subscriptions = subRes;
    } else if (subRes && subRes.subscriptions && subRes.subscriptions.length > 0) {
      state.subscriptions = subRes.subscriptions;
    }

    if (gamesRes && gamesRes.games && Array.isArray(gamesRes.games) && gamesRes.games.length > 0) {
      state.storeProducts = gamesRes.games;
    } else if (Array.isArray(storeRes) && storeRes.length > 0) {
      state.storeProducts = storeRes;
    } else if (storeRes && storeRes.products && storeRes.products.length > 0) {
      state.storeProducts = storeRes.products;
    }

    if (giftcardsRes && giftcardsRes.brands && Array.isArray(giftcardsRes.brands)) {
      state.giftcardBrands = giftcardsRes.brands;
    }

    if (servicesCfgRes && servicesCfgRes.config) {
      state.servicesConfig = servicesCfgRes.config;
      if (typeof initPublishStreamModalPricing === 'function') {
        initPublishStreamModalPricing();
      }
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

window.openGiftCardVariationsModal = function(id) {
  // Find brand from state.giftcardBrands or state.storeProducts
  const brand = (state.giftcardBrands || []).find(b => b.id === id || b.brandId === id) ||
                (state.storeProducts || []).find(p => p.id === id);
  if (!brand) return;

  const modal = document.getElementById('modal-giftcard-variations');
  if (!modal) {
    if (typeof openBuyGiftCardModal === 'function') openBuyGiftCardModal(id);
    return;
  }

  const cardImg = brand.logoImage || brand.logoUrl || brand.coverImage || brand.coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80';
  const brandName = brand.name || brand.title || 'Tarjeta de Regalo';
  const brandDesc = brand.description || 'Saldo oficial y membresías con entrega digital inmediata a tu cuenta.';

  document.getElementById('modal-gc-cover').src = cardImg;
  document.getElementById('modal-gc-title').textContent = brandName;
  document.getElementById('modal-gc-category').textContent = brand.category || 'GIFT CARD';
  document.getElementById('modal-gc-description').textContent = brandDesc;

  const rate = state.exchangeRatePyg || 7500;
  let variations = brand.variations || [];
  if (!variations || variations.length === 0) {
    variations = [
      { id: `var_${brand.id}_10`, name: `${brandName} $10 USD`, denomination: '$10 USD', priceUsd: 10.00, pricePyg: Math.round(10 * rate) },
      { id: `var_${brand.id}_25`, name: `${brandName} $25 USD`, denomination: '$25 USD', priceUsd: 25.00, pricePyg: Math.round(25 * rate) },
      { id: `var_${brand.id}_50`, name: `${brandName} $50 USD`, denomination: '$50 USD', priceUsd: 50.00, pricePyg: Math.round(50 * rate) },
      { id: `var_${brand.id}_100`, name: `${brandName} $100 USD`, denomination: '$100 USD', priceUsd: 100.00, pricePyg: Math.round(100 * rate) }
    ];
  }

  let selectedVarIndex = 0;

  function renderVariationsGrid() {
    const grid = document.getElementById('modal-gc-variations-grid');
    if (!grid) return;

    grid.innerHTML = variations.map((v, idx) => {
      const isSelected = idx === selectedVarIndex;
      const vPyg = v.pricePyg || Math.round((v.priceUsd || 10) * rate);
      const vUsd = v.priceUsd || parseFloat((vPyg / rate).toFixed(2));
      const isMembership = (v.name || '').toLowerCase().includes('mes') || (v.name || '').toLowerCase().includes('plus') || (v.name || '').toLowerCase().includes('pass') || (v.denomination || '').toLowerCase().includes('mes');

      return `
        <div class="gc-variation-card ${isSelected ? 'selected' : ''}" onclick="selectGcVariation(${idx})">
          <div class="gc-var-header">
            <span class="gc-var-denom">${v.denomination || v.name}</span>
            <span class="gc-var-badge ${isMembership ? 'membership' : 'balance'}">${isMembership ? 'Membresía' : 'Saldo'}</span>
          </div>
          <div class="gc-var-pricing">
            <span class="gc-var-price-gs">${vPyg.toLocaleString('es-PY')} Gs.</span>
            <span class="gc-var-price-usd">$${vUsd.toFixed(2)} USDT</span>
          </div>
        </div>
      `;
    }).join('');

    const currentVar = variations[selectedVarIndex] || variations[0];
    const totalPyg = currentVar.pricePyg || Math.round((currentVar.priceUsd || 10) * rate);
    const totalUsd = currentVar.priceUsd || parseFloat((totalPyg / rate).toFixed(2));

    document.getElementById('modal-gc-total-gs').textContent = `${totalPyg.toLocaleString('es-PY')} Gs.`;
    document.getElementById('modal-gc-total-usd').textContent = `$${totalUsd.toFixed(2)} USDT`;
  }

  window.selectGcVariation = function(idx) {
    selectedVarIndex = idx;
    renderVariationsGrid();
  };

  renderVariationsGrid();

  const confirmBtn = document.getElementById('btn-confirm-gc-buy');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      const currentVar = variations[selectedVarIndex] || variations[0];
      modal.style.display = 'none';
      const targetPriceUsd = currentVar.priceUsd || parseFloat(((currentVar.pricePyg || 75000) / rate).toFixed(2));
      executePurchase(`/api/store/products/${brand.id || 'gc_custom'}/buy`, {
        option: currentVar.name || currentVar.denomination,
        priceUsd: targetPriceUsd
      }, `${brandName} (${currentVar.denomination || currentVar.name})`);
    };
  }

  const closeBtn = document.getElementById('btn-close-gc-modal');
  if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
  modal.style.display = 'grid';
};

window.openBuyGiftCardModal = function(id) {
  openGiftCardVariationsModal(id);
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

  // Publish Streaming Account Modal Handlers (GoSplit Fixed Pricing Model)
  const modalPublish = document.getElementById('modal-publish-stream');
  const btnOpenPublish = document.getElementById('btn-open-publish-modal');
  const btnClosePublish = document.getElementById('btn-close-publish-modal');
  const navSellerPills = document.querySelectorAll('.sub-nav-seller-pill');

  window.initPublishStreamModalPricing = function() {
    const serviceSelect = document.getElementById('user-pub-service');
    const planInput = document.getElementById('user-pub-plan');
    const slotsInput = document.getElementById('user-pub-slots');
    const priceDisplay = document.getElementById('user-pub-fixed-price-preview');
    const commissionDisplay = document.getElementById('user-pub-commission-preview');
    const netEarningsSlot = document.getElementById('user-pub-net-per-slot');
    const netEarningsTotal = document.getElementById('user-pub-net-total');

    if (!serviceSelect) return;

    const servicesConfig = state.servicesConfig || {
      'netflix': { name: 'Netflix Premium 4K', planName: 'Ultra HD 4K (4 Pantallas)', maxSlots: 5, pricePerSlotPyg: 25000, commissionPercent: 10, netPayoutPyg: 22500 },
      'spotify': { name: 'Spotify Premium Familiar', planName: 'Plan Familiar (6 Cuentas)', maxSlots: 5, pricePerSlotPyg: 18000, commissionPercent: 10, netPayoutPyg: 16200 },
      'disney': { name: 'Disney+ Premium & Star+', planName: 'Plan Premium 4K', maxSlots: 4, pricePerSlotPyg: 25000, commissionPercent: 10, netPayoutPyg: 22500 },
      'max': { name: 'Max (HBO Max) 4K', planName: 'Platino 4K Dolby Atmos', maxSlots: 3, pricePerSlotPyg: 22000, commissionPercent: 10, netPayoutPyg: 19800 },
      'youtube': { name: 'YouTube Premium & Music', planName: 'Familiar Sin Anuncios', maxSlots: 5, pricePerSlotPyg: 20000, commissionPercent: 10, netPayoutPyg: 18000 },
      'chatgpt': { name: 'ChatGPT Plus & AI', planName: 'Plus GPT-4o & Canvas', maxSlots: 2, pricePerSlotPyg: 35000, commissionPercent: 10, netPayoutPyg: 31500 },
      'crunchyroll': { name: 'Crunchyroll Mega Fan', planName: 'Mega Fan 4 Pantallas', maxSlots: 4, pricePerSlotPyg: 18000, commissionPercent: 10, netPayoutPyg: 16200 },
      'paramount': { name: 'Paramount+ Premium', planName: 'Plan Estándar 3 Pantallas', maxSlots: 3, pricePerSlotPyg: 18000, commissionPercent: 10, netPayoutPyg: 16200 }
    };

    const updateCalculations = () => {
      const selectedKey = serviceSelect.value;
      const cfg = servicesConfig[selectedKey] || Object.values(servicesConfig).find(c => (c.name || '').toLowerCase() === (selectedKey || '').toLowerCase()) || servicesConfig['netflix'];

      if (planInput && cfg) planInput.value = cfg.planName || 'Plan Compartido';
      if (slotsInput && cfg) {
        slotsInput.max = cfg.maxSlots || 5;
        if (parseInt(slotsInput.value, 10) > (cfg.maxSlots || 5)) {
          slotsInput.value = cfg.maxSlots || 5;
        }
      }

      const pricePyg = cfg ? cfg.pricePerSlotPyg : 25000;
      const commPct = cfg ? (cfg.commissionPercent !== undefined ? cfg.commissionPercent : 10) : 10;
      const netPerSlot = cfg ? cfg.netPayoutPyg : Math.round(pricePyg * (1 - commPct / 100));
      const slots = parseInt(slotsInput?.value, 10) || 1;
      const totalNet = netPerSlot * slots;

      if (priceDisplay) priceDisplay.textContent = `${pricePyg.toLocaleString('es-PY')} Gs.`;
      if (commissionDisplay) commissionDisplay.textContent = `${commPct}%`;
      if (netEarningsSlot) netEarningsSlot.textContent = `${netPerSlot.toLocaleString('es-PY')} Gs.`;
      if (netEarningsTotal) netEarningsTotal.textContent = `${totalNet.toLocaleString('es-PY')} Gs.`;
    };

    serviceSelect.onchange = updateCalculations;
    if (slotsInput) slotsInput.oninput = updateCalculations;
    updateCalculations();
  };

  if (btnOpenPublish && modalPublish) {
    btnOpenPublish.onclick = () => {
      modalPublish.style.display = 'grid';
      initPublishStreamModalPricing();
    };
  }

  if (btnClosePublish && modalPublish) {
    btnClosePublish.onclick = () => modalPublish.style.display = 'none';
  }

  navSellerPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalPublish) {
        modalPublish.style.display = 'grid';
        initPublishStreamModalPricing();
      }
    });
  });

  const publishForm = document.getElementById('form-user-publish-stream');
  if (publishForm) {
    publishForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = state.currentUser ? state.currentUser.id : 'usr_client1';
      const serviceKey = document.getElementById('user-pub-service').value;

      const payload = {
        serviceKey,
        serviceName: document.getElementById('user-pub-service').selectedOptions[0]?.text || serviceKey,
        planName: document.getElementById('user-pub-plan')?.value,
        totalSlots: document.getElementById('user-pub-slots').value,
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
          window.showToast('success', '¡Cuenta Publicada!', data.message || 'Tu cuenta ha sido publicada con éxito en el catálogo.');
          if (modalPublish) modalPublish.style.display = 'none';
          await fetchStoreData();
          if (data.subscription?.id) {
            openGroupChatModal(data.subscription.id);
          }
        } else {
          window.showToast('error', 'Error al Publicar', data.error || 'No se pudo publicar la cuenta.');
        }
      } catch (err) {
        window.showToast('error', 'Error de Red', 'Error al publicar cuenta de streaming.');
      }
    });
  }
  // SMM 2-Column Package Order Form Submission
  const formSmmPackageOrder = document.getElementById('form-smm-package-order');
  if (formSmmPackageOrder) {
    formSmmPackageOrder.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = state.currentUser ? state.currentUser.id : 'usr_client1';
      const targetInput = document.getElementById('smm-target-input');
      const link = targetInput ? targetInput.value.trim() : '';

      if (!link) {
        window.showToast('warning', 'Enlace Requerido', 'Por favor ingresa el enlace de tu perfil o publicación.');
        return;
      }
      if (!currentSmmSelectedPackage) {
        window.showToast('warning', 'Selecciona un Paquete', 'Por favor elige la cantidad deseada para continuar.');
        return;
      }

      try {
        const res = await fetch('/api/smm/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify({
            serviceId: `${currentSmmPlatform}_${currentSmmCategory}`,
            serviceTitle: `${smmPlatformsData[currentSmmPlatform]?.platform || ''} - ${currentSmmCategory}`,
            link,
            quantity: currentSmmSelectedPackage.qty,
            pricePyg: currentSmmSelectedPackage.pricePyg,
            priceUsd: currentSmmSelectedPackage.priceUsd
          })
        });
        const data = await res.json();
        if (data.success) {
          const modal = document.getElementById('modal-smm-platform');
          if (modal) modal.style.display = 'none';
          if (targetInput) targetInput.value = '';
          window.showToast('success', '¡Orden SMM Procesada!', data.message || `Tu orden de ${currentSmmSelectedPackage.qty.toLocaleString()} para ${smmPlatformsData[currentSmmPlatform]?.platform || 'red social'} está en camino.`);
          updateUserBalanceDisplay();
        } else {
          if (data.error && data.error.toLowerCase().includes('saldo')) {
            window.showToast('warning', 'Saldo Insuficiente', 'Tu saldo no cubre esta orden. Abriendo recargas SIPAP / USDT...');
            const modal = document.getElementById('modal-smm-platform');
            if (modal) modal.style.display = 'none';
            setTimeout(() => {
              const modalDeposit = document.getElementById('modal-deposit');
              if (modalDeposit) {
                updateUserBalanceDisplay();
                modalDeposit.style.display = 'grid';
              }
            }, 800);
          } else {
            window.showToast('error', 'Error en Orden', data.error || 'No se pudo procesar la orden.');
          }
        }
      } catch (err) {
        window.showToast('error', 'Error de Red', 'Error al procesar la orden de redes sociales.');
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
  initMobileCoinWidget();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMarketplace);
} else {
  initializeMarketplace();
}



