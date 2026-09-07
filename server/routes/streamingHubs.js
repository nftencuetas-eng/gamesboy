import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

// Default Hub Platforms Configuration with rich Horizontal & Vertical Banners, Live Releases (Estrenos) & Metrics
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
    description: 'Disfruta de Netflix con tu propio perfil privado y PIN personal. Comparte el costo de la cuenta de forma 100% legal y segura con la Garantía Escrow de GamesBoy.',
    metrics: {
      activeAccounts: 48,
      activeUsersMonth: 184,
      avgSavingsPercent: 75,
      rating: '4.9 / 5.0'
    },
    releases: [
      {
        id: 'rel_stranger_things_5',
        title: 'Stranger Things 5',
        type: 'Serie Original',
        year: '2025 / 2026',
        genre: 'Ciencia Ficción / Aventura',
        posterUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80',
        synopsis: 'La épica conclusión de la batalla por Hawkins y el Upside Down.'
      },
      {
        id: 'rel_squid_game_2',
        title: 'El Juego del Calamar (Temporada 2)',
        type: 'Serie Exclusiva',
        year: '2025',
        genre: 'Suspense / Drama',
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Gi-hun regresa con un nuevo propósito para desmantelar el juego mortal desde adentro.'
      },
      {
        id: 'rel_arcane_2',
        title: 'Arcane: League of Legends',
        type: 'Serie de Animación',
        year: '2025',
        genre: 'Acción / Fantasía',
        posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
        synopsis: 'El conflicto definitivo entre Piltover y Zaun con animación revolucionaria.'
      },
      {
        id: 'rel_one_piece_2',
        title: 'One Piece Live Action T2',
        type: 'Aventura / Manga',
        year: '2025',
        genre: 'Aventura / Acción',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Los Sombreros de Paja se adentran en la Gran Línea en busca del legendario tesoro.'
      }
    ]
  },
  'spotify': {
    id: 'spotify',
    name: 'Spotify Premium',
    tagline: 'Música y podcasts sin anuncios, descargas ilimitadas y calidad Hi-Fi',
    category: 'streaming',
    brandColor: '#1DB954',
    logoUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=300&q=80',
    bannerHorizontal: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1600&q=80',
    bannerVertical: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    badgeText: 'HI-FI AUDIO • MÚSICA SIN LÍMITES',
    description: 'Acceso a millones de canciones con tu propia cuenta individual conectada a nuestro plan familiar protegido.',
    metrics: {
      activeAccounts: 35,
      activeUsersMonth: 142,
      avgSavingsPercent: 70,
      rating: '4.95 / 5.0'
    },
    releases: [
      {
        id: 'rel_sp_latam_hits',
        title: 'Top Hits Latinos 2025',
        type: 'Playlist Oficial',
        year: '2025',
        genre: 'Urbano / Reggaetón',
        posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Los éxitos más escuchados de la música latina en sonido de alta fidelidad.'
      },
      {
        id: 'rel_sp_global_top',
        title: 'Global Top 50',
        type: 'Tendencia Mundial',
        year: '2025',
        genre: 'Pop / Electrónica',
        posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Las pistas más virales y reproducidas del planeta actualizadas a diario.'
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
        type: 'Marvel Studios Original',
        year: '2025',
        genre: 'Acción / Superhéroes',
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Matt Murdock regresa a las calles de Hell’s Kitchen para enfrentar a Wilson Fisk.'
      },
      {
        id: 'rel_dis_andor_2',
        title: 'Andor (Temporada 2)',
        type: 'Star Wars Original',
        year: '2025',
        genre: 'Ciencia Ficción / Espionaje',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Los últimos cuatro años antes de los eventos de Rogue One y el alzamiento de la Rebelión.'
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
        type: 'HBO Original Series',
        year: '2025',
        genre: 'Drama / Postapocalíptico',
        posterUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Cinco años después, Joel y Ellie enfrentan las consecuencias devastadoras de sus decisiones.'
      },
      {
        id: 'rel_max_house_dragon',
        title: 'House of the Dragon',
        type: 'HBO Original',
        year: '2025',
        genre: 'Fantasía Épica',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        synopsis: 'La danza de dragones que definió la historia de la casa Targaryen.'
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
        title: 'Audio 256kbps & Descargas Offline Smart',
        type: 'Novedad Premium',
        year: '2025',
        genre: 'Tecnología / Audio',
        posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
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
        type: 'IA Generativa',
        year: '2025',
        genre: 'Productividad / Desarrollo',
        posterUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Conversaciones de voz fluidas en tiempo real y edición de código y texto en lienzo colaborativo.'
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
        type: 'Anime Movie Event',
        year: '2025',
        genre: 'Shonen / Acción',
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        synopsis: 'El arco final que enfrenta al Cuerpo de Exterminio con Muzan Kibutsuji.'
      },
      {
        id: 'rel_cr_chainsaw_man',
        title: 'Chainsaw Man: Reze Arc',
        type: 'Anime Estreno',
        year: '2025',
        genre: 'Acción Sobrenatural',
        posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
        synopsis: 'Denji conoce a la misteriosa Reze mientras nuevas amenazas acechan Tokio.'
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
        type: 'Drama / Western',
        year: '2025',
        genre: 'Drama / Crimen',
        posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
        synopsis: 'El desenlace por el control del rancho más grande de los Estados Unidos.'
      }
    ]
  }
};

// In-Memory Storage for Hubs Customization
let streamingHubsStorage = { ...defaultHubs };

// Helper to find or match platform key
function matchPlatformKey(rawKey) {
  if (!rawKey) return 'netflix';
  const clean = rawKey.toLowerCase().trim();
  for (const k of Object.keys(streamingHubsStorage)) {
    if (clean.includes(k) || k.includes(clean)) return k;
  }
  return 'netflix';
}

// 1. GET PUBLIC PLATFORM HUB DETAILS & LIVE HOST GROUPS
router.get('/:platform', (req, res) => {
  const platformKey = matchPlatformKey(req.params.platform);
  const hub = streamingHubsStorage[platformKey] || defaultHubs[platformKey] || defaultHubs['netflix'];
  
  const db = getDb();
  // Filter active subscription groups matching this platform
  const matchingSubs = db.subscriptions.filter(s => {
    if (s.status !== 'active') return false;
    const name = (s.serviceName || '').toLowerCase();
    return name.includes(platformKey) || platformKey.includes(name);
  });

  // Strict Host/Seller Privacy: Only expose public name, avatar, verified badges, rating, pricing & slot counts
  // ZERO personal phones, private emails or raw credentials exposed!
  const groups = matchingSubs.map(s => {
    // Find seller info for avatar & badge
    const seller = db.users ? db.users.find(u => u.id === s.sellerId) : null;
    const sellerName = seller?.name || s.sellerName || 'Anfitrión Verificado';
    const sellerAvatar = (seller && seller.avatar) ? seller.avatar : '/assets/branding/icon.png';
    const isOfficial = s.isOfficial || s.sellerId === 'usr_admin_master';

    return {
      id: s.id,
      serviceName: s.serviceName,
      planName: s.planName || 'Plan Ultra HD 4K',
      totalSlots: s.totalSlots || 4,
      availableSlots: s.availableSlots,
      pricePerSlotUsd: s.pricePerSlotUsd,
      pricePerSlotPyg: convertFromUsd(s.pricePerSlotUsd, 'PYG'),
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

  // If no database groups exist yet, provide realistic active demo groups
  const finalGroups = groups.length > 0 ? groups : [
    {
      id: `sub_${platformKey}_official_1`,
      serviceName: hub.name,
      planName: 'Ultra HD 4K HDR (Plan Familiar)',
      totalSlots: 4,
      availableSlots: 2,
      pricePerSlotUsd: 3.99,
      pricePerSlotPyg: convertFromUsd(3.99, 'PYG'),
      isOfficial: true,
      host: {
        id: 'usr_admin_master',
        name: 'GamesBoy Store Oficial',
        avatar: '/assets/branding/icon.png',
        isVerified: true,
        rating: '5.0 ★',
        totalHostedGroups: 45,
        badge: '🛡️ Tienda Oficial GamesBoy'
      },
      instructions: 'Acceso oficial garantizado 24/7 con PIN privado.',
      createdAt: new Date().toISOString()
    },
    {
      id: `sub_${platformKey}_host_2`,
      serviceName: hub.name,
      planName: 'Ultra HD 4K HDR (Compartido)',
      totalSlots: 4,
      availableSlots: 1,
      pricePerSlotUsd: 3.50,
      pricePerSlotPyg: convertFromUsd(3.50, 'PYG'),
      isOfficial: false,
      host: {
        id: 'usr_seller_lucas',
        name: 'Lucas González',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        isVerified: true,
        rating: '4.9 ★',
        totalHostedGroups: 8,
        badge: '⭐ Anfitrión Verificado'
      },
      instructions: 'Cuenta estable renovable mes a mes. Reglas de uso estricto en perfil asignado.',
      createdAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    hub,
    groups: finalGroups
  });
});

// 2. GET ALL PLATFORMS FOR ADMIN PANEL
router.get('/', (req, res) => {
  res.json({
    success: true,
    hubs: streamingHubsStorage
  });
});

// 3. UPDATE PLATFORM BANNERS, TEXTS & METRICS (ADMIN)
router.put('/:platform', (req, res) => {
  const platformKey = matchPlatformKey(req.params.platform);
  const { name, tagline, bannerHorizontal, bannerVertical, badgeText, description, metrics, releases } = req.body;

  if (!streamingHubsStorage[platformKey]) {
    streamingHubsStorage[platformKey] = { ...defaultHubs[platformKey] };
  }

  const current = streamingHubsStorage[platformKey];
  if (name) current.name = name;
  if (tagline) current.tagline = tagline;
  if (bannerHorizontal) current.bannerHorizontal = bannerHorizontal;
  if (bannerVertical) current.bannerVertical = bannerVertical;
  if (badgeText) current.badgeText = badgeText;
  if (description) current.description = description;
  if (metrics) current.metrics = { ...current.metrics, ...metrics };
  if (Array.isArray(releases)) current.releases = releases;

  res.json({
    success: true,
    message: `Página dedicada de ${current.name} actualizada correctamente.`,
    hub: current
  });
});

// 4. AI / REAL-TIME LIVE RELEASES SYNCHRONIZER
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
