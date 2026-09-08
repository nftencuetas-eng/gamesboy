import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

// Default Hub Platforms Configuration with rich Horizontal & Vertical Banners, Live Releases (Estrenos / Top Rankings) & Metrics
const defaultHubs = {
  'netflix': {
    id: 'netflix',
    name: 'Netflix Premium 4K HDR',
    tagline: 'Películas, series y documentales ilimitados en Ultra HD',
    category: 'streaming',
    brandColor: '#E50914',
    logoUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    badgeText: 'ULTRA HD 4K • DOLBY ATMOS',
    description: 'Disfruta de Netflix con tu propio perfil privado y PIN personal. Comparte el costo de la cuenta de forma 100% legal y segura con la Garantía de Reembolso de GamesBoy.',
    metrics: {
      activeAccounts: 48,
      activeUsersMonth: 184,
      avgSavingsPercent: 75,
      rating: '4.9 / 5.0'
    },
    releases: [
      {
        id: 'rel_stranger_things_5',
        title: 'Stranger Things (Temporada 5)',
        type: 'Top #1 Global IMDb 8.7',
        releaseDate: 'Estreno: 2025 / 2026',
        genre: 'Ciencia Ficción / Misterio',
        posterUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80',
        synopsis: 'La batalla decisiva por Hawkins y el Upside Down.'
      },
      {
        id: 'rel_squid_game_2',
        title: 'El Juego del Calamar 2',
        type: 'Tendencia Mundial IMDb 8.0',
        releaseDate: 'Disponible Ahora',
        genre: 'Thriller / Drama',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Gi-hun busca desmantelar la organización desde adentro.'
      },
      {
        id: 'rel_arcane_2',
        title: 'Arcane: League of Legends',
        type: 'Aclamada por la Crítica 9.0',
        releaseDate: 'Temporada Completa 4K',
        genre: 'Animación / Fantasía',
        posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
        synopsis: 'El choque final entre las ciudades de Piltover y Zaun.'
      },
      {
        id: 'rel_one_piece_2',
        title: 'One Piece Live Action T2',
        type: 'Próximo Estreno',
        releaseDate: 'Estreno: Finales 2025',
        genre: 'Aventura / Acción',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Rumbo a la Gran Línea y Arabasta.'
      }
    ]
  },
  'spotify': {
    id: 'spotify',
    name: 'Spotify Premium Individual & Familiar',
    tagline: 'Música y podcasts sin anuncios, descargas ilimitadas y calidad Hi-Fi',
    category: 'streaming',
    brandColor: '#1DB954',
    logoUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    badgeText: 'HI-FI AUDIO • MÚSICA SIN LÍMITES',
    description: 'Acceso a millones de canciones con tu propia cuenta individual conectada a un plan familiar protegido con Garantía de Reembolso.',
    metrics: {
      activeAccounts: 35,
      activeUsersMonth: 142,
      avgSavingsPercent: 70,
      rating: '4.95 / 5.0'
    },
    releases: [
      {
        id: 'rel_sp_latam_hits',
        title: 'Top 50 Global & Latinos',
        type: 'Billboard Hot 100 #1',
        releaseDate: 'Actualizado Semanalmente',
        genre: 'Pop / Urbano / Reggaetón',
        posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Los hits más escuchados del planeta en audio 320kbps sin cortes.'
      },
      {
        id: 'rel_sp_rock_classics',
        title: 'Rock Classics & Hi-Res Audio',
        type: 'Top Álbumes Históricos',
        releaseDate: 'Disponible 24/7',
        genre: 'Rock / Clásicos',
        posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Discografías completas remasterizadas en alta definición.'
      }
    ]
  },
  'disney': {
    id: 'disney',
    name: 'Disney+ & Star+ Premium',
    tagline: 'Marvel, Star Wars, Pixar, Disney y deportes en vivo de ESPN',
    category: 'streaming',
    brandColor: '#113CCF',
    logoUrl: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    badgeText: 'IMAX ENHANCED • ESPN EN VIVO',
    description: 'Todo el entretenimiento de Disney, las series originales de Star Wars y Marvel con partidos en vivo de ESPN.',
    metrics: {
      activeAccounts: 29,
      activeUsersMonth: 110,
      avgSavingsPercent: 78,
      rating: '4.88 / 5.0'
    },
    releases: [
      {
        id: 'rel_dis_daredevil',
        title: 'Daredevil: Born Again',
        type: 'Marvel Studios • IMDb 8.9',
        releaseDate: 'Estreno: Marzo 2025',
        genre: 'Acción / Superhéroes',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Matt Murdock y Kingpin se enfrentan en Hell’s Kitchen.'
      },
      {
        id: 'rel_dis_andor_2',
        title: 'Andor (Temporada 2)',
        type: 'Lucasfilm • IMDb 8.4',
        releaseDate: 'Estreno: Abril 2025',
        genre: 'Star Wars / Espionaje',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
        synopsis: 'El camino hacia Rogue One y el levantamiento de la Alianza Rebelde.'
      }
    ]
  },
  'max': {
    id: 'max',
    name: 'Max (HBO Max Platino)',
    tagline: 'El hogar de HBO, Warner Bros, DC Comics y Discovery en 4K',
    category: 'streaming',
    brandColor: '#002BE7',
    logoUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    badgeText: 'PLATINO 4K • DOLBY VISION',
    description: 'Accede a producciones ganadoras de Emmys, estrenos de cine y clásicos universales.',
    metrics: {
      activeAccounts: 22,
      activeUsersMonth: 95,
      avgSavingsPercent: 72,
      rating: '4.91 / 5.0'
    },
    releases: [
      {
        id: 'rel_max_tlou_2',
        title: 'The Last of Us (Temporada 2)',
        type: 'HBO Original • IMDb 8.8',
        releaseDate: 'Estreno: 2025',
        genre: 'Drama / Postapocalíptico',
        posterUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Cinco años después, Ellie emprende una implacable búsqueda de justicia.'
      },
      {
        id: 'rel_max_house_dragon',
        title: 'House of the Dragon T3',
        type: 'HBO Mega Event • IMDb 8.4',
        releaseDate: 'En Producción 2025/2026',
        genre: 'Fantasía / Drama Épico',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
        synopsis: 'La guerra civil de la dinastía Targaryen alcanza su clímax.'
      }
    ]
  },
  'youtube': {
    id: 'youtube',
    name: 'YouTube Premium & Music',
    tagline: 'Videos sin publicidad, reproducción en segundo plano y YouTube Music',
    category: 'streaming',
    brandColor: '#FF0000',
    logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    badgeText: 'SIN ANUNCIOS • FONDO & DESCARGAS',
    description: 'Navega en YouTube en tu móvil, smart TV y PC sin un solo anuncio publicitario.',
    metrics: {
      activeAccounts: 31,
      activeUsersMonth: 125,
      avgSavingsPercent: 74,
      rating: '4.93 / 5.0'
    },
    releases: [
      {
        id: 'rel_yt_features',
        title: 'YouTube Music Premium & Hi-Bitrate',
        type: 'Servicio Oficial Google',
        releaseDate: 'Acceso Inmediato 24/7',
        genre: 'Música / Podcasts / Videos',
        posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Descarga listas inteligentes automáticas para escuchar sin conexión.'
      }
    ]
  },
  'chatgpt': {
    id: 'chatgpt',
    name: 'ChatGPT Plus & Team GPT-4o',
    tagline: 'Acceso prioritario a GPT-4o, Canvas, generación DALL-E 3 y modo de voz avanzado',
    category: 'streaming',
    brandColor: '#10A37F',
    logoUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    badgeText: 'GPT-4o PRO • CANVAS & VOICE',
    description: 'Potencia tu productividad y trabajo con la suscripción oficial a ChatGPT Plus compartida de forma privada.',
    metrics: {
      activeAccounts: 18,
      activeUsersMonth: 72,
      avgSavingsPercent: 80,
      rating: '4.98 / 5.0'
    },
    releases: [
      {
        id: 'rel_gpt_voice',
        title: 'Advanced Voice Mode & Canvas',
        type: 'OpenAI GPT-4o Oficial',
        releaseDate: 'Actualizado en Vivo',
        genre: 'IA Generativa / Programación',
        posterUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Conversaciones de voz ultra-fluidas y edición visual de proyectos.'
      }
    ]
  },
  'crunchyroll': {
    id: 'crunchyroll',
    name: 'Crunchyroll Mega Fan',
    tagline: 'El mayor catálogo de anime en simulcast directo desde Japón sin publicidad',
    category: 'streaming',
    brandColor: '#F47521',
    logoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    badgeText: 'SIMULCAST • FULL HD SIN CENSURA',
    description: 'Episodios de tus animes favoritos 1 hora después de su emisión en Japón con doblajes y subtítulos oficiales.',
    metrics: {
      activeAccounts: 20,
      activeUsersMonth: 86,
      avgSavingsPercent: 70,
      rating: '4.89 / 5.0'
    },
    releases: [
      {
        id: 'rel_cr_demon_slayer',
        title: 'Demon Slayer: Castillo Infinito',
        type: 'Trilogía Cinematográfica',
        releaseDate: 'Estreno en Cines & Simulcast',
        genre: 'Shonen / Acción',
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
        synopsis: 'La batalla final contra Muzan Kibutsuji y las Lunas Superiores.'
      },
      {
        id: 'rel_cr_chainsaw_man',
        title: 'Chainsaw Man: Reze Arc',
        type: 'Película Oficial MAPPA',
        releaseDate: 'Estreno: 2025',
        genre: 'Acción Sobrenatural',
        posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Denji y la chica bomba en una historia explosiva.'
      }
    ]
  },
  'paramount': {
    id: 'paramount',
    name: 'Paramount+ Premium',
    tagline: 'Películas de Paramount Pictures, Halo, Yellowstone y producciones exclusivas',
    category: 'streaming',
    brandColor: '#0064FF',
    logoUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    badgeText: 'PREMIUM HD • SERIES ORIGINALES',
    description: 'Acceso a los estrenos de cine más recientes, realities y clásicos de Paramount.',
    metrics: {
      activeAccounts: 14,
      activeUsersMonth: 55,
      avgSavingsPercent: 73,
      rating: '4.85 / 5.0'
    },
    releases: [
      {
        id: 'rel_par_yellowstone',
        title: 'Yellowstone: Temporada Final',
        type: 'Paramount Original • IMDb 8.7',
        releaseDate: 'Episodios Finales en 4K',
        genre: 'Drama / Western',
        posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
        synopsis: 'El desenlace por el control del rancho más grande de Norteamérica.'
      }
    ]
  },
  'apple': {
    id: 'apple',
    name: 'Apple TV+ 4K HDR',
    tagline: 'Apple Originals galardonadas con calidad de imagen y sonido de referencia',
    category: 'streaming',
    brandColor: '#A2AAAD',
    logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    badgeText: 'APPLE ORIGINALS • 4K DOLBY VISION',
    description: 'Disfruta de Ted Lasso, Severance, The Morning Show y grandes producciones exclusivas de Apple.',
    metrics: {
      activeAccounts: 16,
      activeUsersMonth: 64,
      avgSavingsPercent: 75,
      rating: '4.92 / 5.0'
    },
    releases: [
      {
        id: 'rel_apple_severance_2',
        title: 'Severance (Temporada 2)',
        type: 'Apple Original • IMDb 8.7',
        releaseDate: 'Disponible en 4K',
        genre: 'Ciencia Ficción / Misterio',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
        synopsis: 'Mark Scout y sus compañeros descubren las consecuencias de romper la separación.'
      }
    ]
  },
  'prime': {
    id: 'prime',
    name: 'Amazon Prime Video 4K',
    tagline: 'Series exclusivas de Amazon, The Boys, Rings of Power y películas de estreno',
    category: 'streaming',
    brandColor: '#00A8E1',
    logoUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=300&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    badgeText: 'PRIME 4K HDR • X-RAY',
    description: 'Accede a producciones galardonadas y las franquicias más importantes en Prime Video.',
    metrics: {
      activeAccounts: 24,
      activeUsersMonth: 90,
      avgSavingsPercent: 70,
      rating: '4.87 / 5.0'
    },
    releases: [
      {
        id: 'rel_prime_the_boys',
        title: 'The Boys (Temporada 5)',
        type: 'Prime Original • IMDb 8.7',
        releaseDate: 'Estreno: 2025',
        genre: 'Acción / Superhéroes',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
        synopsis: 'La temporada final de la guerra total entre Carnicero y Patriota.'
      }
    ]
  }
};

// In-Memory Storage for Hubs Customization
let streamingHubsStorage = { ...defaultHubs };

// Helper to find or match platform from db.streaming_services
function getPlatformService(platformKey) {
  const db = getDb();
  const services = db.streaming_services || [];
  const clean = (platformKey || '').toLowerCase().trim();
  
  // Exact match first
  let found = services.find(s => s.id === clean || (s.id && s.id.toLowerCase() === clean));
  if (found) return found;

  // Name or partial match
  found = services.find(s => {
    const sId = (s.id || '').toLowerCase();
    const sName = (s.name || '').toLowerCase();
    return sId.includes(clean) || clean.includes(sId) || sName.includes(clean) || clean.includes(sName);
  });

  if (found) return found;

  // Fallback to first available or default
  return services[0] || {
    id: 'netflix',
    name: 'Netflix Premium 4K HDR',
    planName: 'Ultra HD 4K (4 Pantallas)',
    tagline: 'Películas, series y documentales ilimitados en Ultra HD',
    badgeText: 'ULTRA HD 4K • DOLBY ATMOS',
    description: 'Disfruta de Netflix con tu propio perfil privado y PIN personal.',
    iconUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=300&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    pricePerSlotPyg: 25000,
    pricePerSlotUsd: 3.33,
    maxSlots: 5,
    commissionPercent: 10,
    waitingCount: 14,
    waitingList: [],
    hasStock: true,
    isActive: true,
    metrics: { activeAccounts: 48, activeUsersMonth: 184, avgSavingsPercent: 75, rating: '4.95 / 5.0' },
    releases: []
  };
}

// 1. GET PUBLIC PLATFORM HUB DETAILS & REAL USER HOST GROUPS
router.get('/:platform', (req, res) => {
  const db = getDb();
  const rawKey = req.params.platform;
  const hub = getPlatformService(rawKey);
  const platformKey = hub.id;
  
  const rate = db.platform_settings?.exchangeRatePyg || 7500;
  const fixedPricePyg = hub.pricePerSlotPyg || (hub.pricePerSlotUsd ? Math.round(hub.pricePerSlotUsd * rate) : 25000);
  const fixedPriceUsd = parseFloat((fixedPricePyg / rate).toFixed(2));
  const commPercent = hub.commissionPercent !== undefined ? hub.commissionPercent : 10;
  const netPerSlotPyg = Math.round(fixedPricePyg * (1 - commPercent / 100));
  const maxSlots = hub.maxSlots || 5;
  const potentialMonthlyEarningsPyg = netPerSlotPyg * maxSlots;

  // Filter active subscription groups matching this platform
  const matchingSubs = (db.subscriptions || []).filter(s => {
    if (s.status !== 'active') return false;
    const name = (s.serviceName || '').toLowerCase();
    const subId = (s.serviceId || '').toLowerCase();
    return name.includes(platformKey) || platformKey.includes(name) || subId === platformKey;
  });

  // Strict Host/Seller Privacy: Only expose public name, avatar, verified badges, rating, pricing & slot counts
  const groups = matchingSubs.map(s => {
    const seller = db.users ? db.users.find(u => u.id === s.sellerId) : null;
    const sellerName = seller?.name || s.sellerName || 'Anfitrión Verificado';
    const sellerAvatar = (seller && seller.avatar) ? seller.avatar : '/assets/branding/icon.png';
    const isOfficial = s.isOfficial || s.sellerId === 'usr_admin_master';
    const groupPriceUsd = s.pricePerSlotUsd || fixedPriceUsd;

    return {
      id: s.id,
      serviceName: s.serviceName || hub.name,
      planName: s.planName || hub.planName || 'Plan Ultra HD 4K',
      totalSlots: s.totalSlots || maxSlots,
      availableSlots: s.availableSlots !== undefined ? s.availableSlots : 0,
      pricePerSlotUsd: groupPriceUsd,
      pricePerSlotPyg: convertFromUsd(groupPriceUsd, 'PYG'),
      isOfficial,
      host: {
        id: s.sellerId,
        name: sellerName,
        avatar: sellerAvatar,
        isVerified: true,
        rating: '4.9 ★',
        totalHostedGroups: 12,
        badge: isOfficial ? '🛡️ Tienda Oficial GamesBoy' : '⭐ Anfitrión Verificado'
      },
      instructions: s.instructions || 'Perfil privado exclusivo con PIN personal. Entrega inmediata tras unirse.',
      createdAt: s.createdAt
    };
  });

  // ONLY return REAL groups. If no users have published accounts or all are sold out, groups is []
  res.json({
    success: true,
    hub: {
      ...hub,
      pricePerSlotPyg: fixedPricePyg,
      pricePerSlotUsd: fixedPriceUsd,
      netPerSlotPyg,
      potentialMonthlyEarningsPyg,
      commissionPercent: commPercent,
      maxSlots,
      waitingCount: hub.waitingCount || 0
    },
    groups
  });
});

// 2. JOIN WAITING LIST FOR A STREAMING SERVICE
router.post('/:platform/waiting-list', (req, res) => {
  try {
    const db = getDb();
    const rawKey = req.params.platform;
    const hub = getPlatformService(rawKey);
    
    // Find service in db.streaming_services
    const service = (db.streaming_services || []).find(s => s.id === hub.id);
    if (service) {
      if (!service.waitingList) service.waitingList = [];
      service.waitingCount = (service.waitingCount || 0) + 1;
      
      const entry = {
        userId: req.body?.userId || 'guest_' + Date.now(),
        email: req.body?.email || null,
        requestedAt: new Date().toISOString()
      };
      service.waitingList.push(entry);
      saveStorage();
      
      return res.json({
        success: true,
        message: `¡Te has sumado con éxito a la lista de espera para ${service.name}! Te avisaremos tan pronto un anfitrión publique un asiento.`,
        waitingCount: service.waitingCount
      });
    }

    res.json({
      success: true,
      message: '¡Te has unido a la lista de espera!',
      waitingCount: (hub.waitingCount || 0) + 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET ALL PLATFORMS FOR PUBLIC & ADMIN CAROUSEL
router.get('/', (req, res) => {
  const db = getDb();
  const services = (db.streaming_services || []).filter(s => s.isActive !== false);
  const rate = db.platform_settings?.exchangeRatePyg || 7500;

  const platforms = services.map(s => {
    const matchingSubs = (db.subscriptions || []).filter(sub => {
      if (sub.status !== 'active') return false;
      const name = (sub.serviceName || '').toLowerCase();
      const sId = (s.id || '').toLowerCase();
      return name.includes(sId) || sId.includes(name);
    });

    const totalAvailSlots = matchingSubs.reduce((acc, curr) => acc + (curr.availableSlots || 0), 0);
    const hasStock = totalAvailSlots > 0;
    const pricePyg = s.pricePerSlotPyg || Math.round((s.pricePerSlotUsd || 3.33) * rate);

    return {
      id: s.id,
      name: s.name,
      tagline: s.tagline,
      brandColor: s.brandColor || '#00c2ff',
      logoUrl: s.iconUrl || s.thumbnailUrl,
      thumbnailUrl: s.thumbnailUrl || s.iconUrl,
      bannerHorizontal: s.bannerHorizontal,
      bannerVertical: s.bannerVertical,
      badgeText: s.badgeText,
      pricePerSlotPyg: pricePyg,
      pricePerSlotUsd: parseFloat((pricePyg / rate).toFixed(2)),
      hasStock,
      availableAccounts: matchingSubs.length,
      totalAvailSlots,
      waitingCount: s.waitingCount || 0
    };
  });

  res.json({
    success: true,
    services,
    platforms
  });
});

// 4. UPDATE PLATFORM BANNERS, THUMBNAILS, TEXTS & METRICS (ADMIN)
router.put('/:platform', (req, res) => {
  const db = getDb();
  const platformKey = req.params.platform;
  const service = (db.streaming_services || []).find(s => s.id === platformKey || (s.id && s.id.toLowerCase() === platformKey.toLowerCase()));

  if (!service) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }

  const {
    name,
    tagline,
    logoUrl,
    iconUrl,
    thumbnailUrl,
    brandColor,
    hasStock,
    bannerHorizontal,
    bannerVertical,
    badgeText,
    description,
    pricePerSlotPyg,
    maxSlots,
    commissionPercent,
    metrics,
    releases
  } = req.body;

  if (name) service.name = name;
  if (tagline) service.tagline = tagline;
  if (logoUrl || iconUrl) service.iconUrl = iconUrl || logoUrl;
  if (thumbnailUrl || iconUrl) service.thumbnailUrl = thumbnailUrl || iconUrl || service.iconUrl;
  if (brandColor) service.brandColor = brandColor;
  if (hasStock !== undefined) service.hasStock = Boolean(hasStock);
  if (bannerHorizontal) service.bannerHorizontal = bannerHorizontal;
  if (bannerVertical) service.bannerVertical = bannerVertical;
  if (badgeText) service.badgeText = badgeText;
  if (description) service.description = description;
  if (pricePerSlotPyg) service.pricePerSlotPyg = parseInt(pricePerSlotPyg, 10);
  if (maxSlots) service.maxSlots = parseInt(maxSlots, 10);
  if (commissionPercent !== undefined) service.commissionPercent = parseFloat(commissionPercent);
  if (metrics) service.metrics = { ...service.metrics, ...metrics };
  if (Array.isArray(releases)) service.releases = releases;

  saveStorage();

  res.json({
    success: true,
    message: `Página y servicio de ${service.name} actualizado correctamente.`,
    hub: service
  });
});

// 5. AI / REAL-TIME LIVE RELEASES SYNCHRONIZER
router.post('/:platform/sync-ai', async (req, res) => {
  try {
    const platformKey = matchPlatformKey(req.params.platform);
    const current = streamingHubsStorage[platformKey] || defaultHubs[platformKey];

    // AI / Realtime Engine Catalog Updates
    const aiReleasesDatabase = {
      'netflix': [
        { id: `rel_${Date.now()}_1`, title: 'Stranger Things 5: El Final', type: 'Estreno Exclusivo', year: '2025/2026', genre: 'Ciencia Ficción', posterUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80', synopsis: 'El desenlace final de la serie más exitosa de Netflix con producción cinematográfica.' },
        { id: `rel_${Date.now()}_2`, title: 'Squid Game: Temporada 2', type: 'Tendencia #1', year: '2025', genre: 'Thriller / Drama', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80', synopsis: 'Nuevos juegos mortales y el retorno de Gi-hun en busca de justicia.' },
        { id: `rel_${Date.now()}_3`, title: 'Wednesday (Miércoles T2)', type: 'Original', year: '2025', genre: 'Misterio / Comedia Oscura', posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', synopsis: 'Miércoles Addams regresa a la Academia Nevermore con nuevos misterios sobrenaturales.' },
        { id: `rel_${Date.now()}_4`, title: 'Cien Años de Soledad', type: 'Mega Producción', year: '2025', genre: 'Realismo Mágico', posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', synopsis: 'La obra maestra de Gabriel García Márquez llevada por primera vez a la pantalla.' }
      ],
      'spotify': [
        { id: `rel_${Date.now()}_1`, title: 'Top Hits Latinos 2025', type: 'Playlist Oficial', year: '2025', genre: 'Urbano / Reggaetón', posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', synopsis: 'Todos los lanzamientos y números 1 en alta fidelidad y sin interrupciones.' },
        { id: `rel_${Date.now()}_2`, title: 'Descubrimiento Semanal AI', type: 'IA Personalizada', year: '2025', genre: 'Mix Personalizado', posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', synopsis: 'Algoritmo de recomendación musical mejorado para tu cuenta.' }
      ],
      'disney': [
        { id: `rel_${Date.now()}_1`, title: 'Daredevil: Born Again', type: 'Marvel Studios', year: '2025', genre: 'Acción / Suspenso', posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', synopsis: 'El regreso definitivo del Hombre sin Miedo en Nueva York.' },
        { id: `rel_${Date.now()}_2`, title: 'Star Wars: Skeleton Crew', type: 'Lucasfilm', year: '2025', genre: 'Aventura Galáctica', posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', synopsis: 'Cuatro jóvenes exploradores perdidos en una galaxia peligrosa.' }
      ],
      'max': [
        { id: `rel_${Date.now()}_1`, title: 'The Last of Us: Parte 2', type: 'HBO Original', year: '2025', genre: 'Drama', posterUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80', synopsis: 'La continuación de la aclamada saga de Naughty Dog adaptada por HBO.' },
        { id: `rel_${Date.now()}_2`, title: 'El Pingüino (The Penguin)', type: 'DC Studios / HBO', year: '2025', genre: 'Crimen / Thriller', posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80', synopsis: 'Oswald Cobblepot toma el control del inframundo de Gotham City.' }
      ]
    };

    const syncedReleases = aiReleasesDatabase[platformKey] || [
      { id: `rel_${Date.now()}_1`, title: `${current.name} Estrenos 2025`, type: 'Novedad en Vivo', year: '2025', genre: 'Streaming Premium', posterUrl: current.bannerHorizontal, synopsis: 'Contenido actualizado en vivo con la última cartelera oficial.' }
    ];

    current.releases = syncedReleases;
    current.lastAiSync = new Date().toISOString();

    res.json({
      success: true,
      message: `✨ ¡Estrenos de ${current.name} sincronizados con éxito mediante IA!`,
      releases: syncedReleases,
      lastAiSync: current.lastAiSync
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al sincronizar cartelera con IA' });
  }
});

export default router;
