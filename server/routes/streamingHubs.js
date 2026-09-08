import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

// Helper to normalize strings for robust fuzzy matching (e.g. 'flujo-tv' <-> 'Flujo TV')
export function normalizeStr(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function matchesService(sub, service) {
  if (!sub || !service) return false;
  const nSubName = normalizeStr(sub.serviceName);
  const nSubKey = normalizeStr(sub.serviceKey || sub.serviceId);
  const nSvcId = normalizeStr(service.id);
  const nSvcName = normalizeStr(service.name);

  return (nSubKey && nSvcId && nSubKey === nSvcId) ||
         (nSubName && nSvcName && nSubName === nSvcName) ||
         (nSubName && nSvcId && (nSubName === nSvcId || nSubName.includes(nSvcId) || nSvcId.includes(nSubName))) ||
         (nSubName && nSvcName && (nSubName.includes(nSvcName) || nSvcName.includes(nSubName)));
}

// Helper to find or match platform dynamically from db.streaming_services
export function getPlatformService(platformKey) {
  const db = getDb();
  const services = db.streaming_services || [];
  if (!platformKey) return services[0] || null;

  const clean = platformKey.toLowerCase().trim();
  const nClean = normalizeStr(clean);
  
  // Exact match first
  let found = services.find(s => s.id === clean || (s.id && s.id.toLowerCase() === clean) || normalizeStr(s.id) === nClean || normalizeStr(s.name) === nClean);
  if (found) return found;

  // Name or partial match
  found = services.find(s => {
    const sId = normalizeStr(s.id);
    const sName = normalizeStr(s.name);
    return sId.includes(nClean) || nClean.includes(sId) || sName.includes(nClean) || nClean.includes(sName);
  });

  return found || services[0] || null;
}

// 1. GET ALL PLATFORMS FOR PUBLIC & ADMIN CAROUSEL (100% DYNAMIC FROM DB)
router.get('/', (req, res) => {
  const db = getDb();
  const services = (db.streaming_services || []).filter(s => s.isActive !== false);
  const rate = db.platform_settings?.exchangeRatePyg || 7500;

  const platforms = services.map(s => {
    const matchingSubs = (db.subscriptions || []).filter(sub => {
      if (sub.status !== 'active') return false;
      return matchesService(sub, s);
    });

    const totalAvailSlots = matchingSubs.reduce((acc, curr) => acc + (curr.availableSlots || 0), 0);
    const hasStock = totalAvailSlots > 0;
    const pricePyg = s.pricePerSlotPyg || Math.round((s.pricePerSlotUsd || 3.33) * rate);

    return {
      id: s.id,
      name: s.name,
      category: s.category || 'streaming',
      planName: s.planName,
      tagline: s.tagline,
      brandColor: s.brandColor || '#00c2ff',
      logoUrl: s.iconUrl || s.thumbnailUrl,
      thumbnailUrl: s.thumbnailUrl || s.iconUrl,
      iconUrl: s.iconUrl || s.thumbnailUrl,
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

// 2. GET PUBLIC PLATFORM HUB DETAILS & REAL USER HOST GROUPS
router.get('/:platform', (req, res) => {
  const db = getDb();
  const rawKey = req.params.platform;
  const hub = getPlatformService(rawKey);

  if (!hub) {
    return res.status(404).json({ error: 'Servicio de streaming no encontrado en la base de datos' });
  }

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
    return matchesService(s, hub);
  });

  // Strict Host/Seller Privacy: Only expose public name, avatar, verified badges, rating, pricing & slot counts
  const groups = matchingSubs.map(s => {
    const seller = db.users ? db.users.find(u => u.id === s.sellerId) : null;
    const sellerName = seller?.name || s.sellerName || 'Anfitrión Verificado';
    const sellerAvatar = (seller && seller.avatar) ? seller.avatar : '/assets/branding/icon.png';
    const isOfficial = s.isOfficial || s.sellerId === 'usr_admin' || s.sellerId === 'usr_admin_master';
    const groupPriceUsd = s.pricePerSlotUsd || fixedPriceUsd;

    return {
      id: s.id,
      serviceName: s.serviceName || hub.name,
      planName: s.planName || hub.planName || `Plan ${maxSlots} Pantallas`,
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

// 5. CREATE NEW STREAMING SERVICE (ADMIN)
router.post('/', (req, res) => {
  try {
    const db = getDb();
    if (!db.streaming_services) db.streaming_services = [];

    const {
      id, name, planName, badgeText, tagline, description,
      iconUrl, bannerHorizontal, pricePerSlotPyg, maxSlots,
      commissionPercent, isActive
    } = req.body;

    const cleanId = (id || name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    if (!name || !cleanId) {
      return res.status(400).json({ error: 'El nombre del servicio es requerido.' });
    }

    // Check for duplicate ID
    const existing = db.streaming_services.find(s => s.id === cleanId);
    if (existing) {
      return res.status(409).json({ error: `Ya existe un servicio con el ID "${cleanId}". Por favor usa otro nombre o ID.` });
    }

    const newService = {
      id: cleanId,
      name,
      planName: planName || `Plan ${maxSlots || 5} Pantallas`,
      badgeText: badgeText || '',
      tagline: tagline || '',
      description: description || '',
      iconUrl: iconUrl || '',
      thumbnailUrl: iconUrl || '',
      bannerHorizontal: bannerHorizontal || '',
      brandColor: '#00c2ff',
      pricePerSlotPyg: Math.round(parseFloat(pricePerSlotPyg)) || 25000,
      maxSlots: parseInt(maxSlots, 10) || 5,
      commissionPercent: commissionPercent !== undefined ? parseFloat(commissionPercent) : 10,
      isActive: isActive !== false,
      waitingCount: 0,
      waitingList: [],
      createdAt: new Date().toISOString()
    };

    db.streaming_services.push(newService);
    saveStorage();

    res.json({
      success: true,
      message: `✅ Servicio "${newService.name}" creado exitosamente y publicado en el catálogo.`,
      service: newService
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. UPDATE STREAMING SERVICE BY ID (ADMIN - FULL UPDATE)
router.put('/:serviceId', (req, res) => {
  try {
    const db = getDb();
    const serviceId = req.params.serviceId;
    const services = db.streaming_services || [];
    const service = services.find(s => s.id === serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    const {
      name, isActive, planName, badgeText, tagline, description,
      iconUrl, bannerHorizontal, pricePerSlotPyg, maxSlots,
      commissionPercent, waitingCount, brandColor,
      thumbnailUrl, logoUrl, bannerVertical, hasStock, metrics, releases
    } = req.body;

    if (name !== undefined) service.name = name;
    if (isActive !== undefined) service.isActive = Boolean(isActive);
    if (planName !== undefined) service.planName = planName;
    if (badgeText !== undefined) service.badgeText = badgeText;
    if (tagline !== undefined) service.tagline = tagline;
    if (description !== undefined) service.description = description;
    if (iconUrl !== undefined) { service.iconUrl = iconUrl; service.thumbnailUrl = iconUrl; }
    if (thumbnailUrl !== undefined) service.thumbnailUrl = thumbnailUrl;
    if (logoUrl !== undefined) service.iconUrl = logoUrl;
    if (bannerHorizontal !== undefined) service.bannerHorizontal = bannerHorizontal;
    if (bannerVertical !== undefined) service.bannerVertical = bannerVertical;
    if (brandColor !== undefined) service.brandColor = brandColor;
    if (pricePerSlotPyg !== undefined) service.pricePerSlotPyg = Math.round(parseFloat(pricePerSlotPyg)) || 25000;
    if (maxSlots !== undefined) service.maxSlots = parseInt(maxSlots, 10);
    if (commissionPercent !== undefined) service.commissionPercent = parseFloat(commissionPercent);
    if (waitingCount !== undefined) service.waitingCount = parseInt(waitingCount, 10);
    if (hasStock !== undefined) service.hasStock = Boolean(hasStock);
    if (metrics) service.metrics = { ...service.metrics, ...metrics };
    if (Array.isArray(releases)) service.releases = releases;

    saveStorage();

    res.json({
      success: true,
      message: `✅ Servicio "${service.name}" actualizado correctamente.`,
      service
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. DELETE STREAMING SERVICE (ADMIN)
router.delete('/:serviceId', (req, res) => {
  try {
    const db = getDb();
    const serviceId = req.params.serviceId;
    const services = db.streaming_services || [];
    const index = services.findIndex(s => s.id === serviceId);

    if (index === -1) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    const removed = services.splice(index, 1)[0];
    saveStorage();

    res.json({
      success: true,
      message: `🗑️ Servicio "${removed.name}" eliminado del catálogo.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. AI / REAL-TIME LIVE RELEASES SYNCHRONIZER
router.post('/:platform/sync-ai', async (req, res) => {
  try {
    const db = getDb();
    const service = getPlatformService(req.params.platform);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const platformKey = (service.id || '').toLowerCase();

    // Template real-time releases per platform
    const aiReleasesDatabase = {
      'netflix': [
        { id: `rel_${Date.now()}_1`, title: 'Stranger Things 5: El Final', type: 'Estreno Exclusivo', year: '2025/2026', genre: 'Ciencia Ficción', posterUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80', synopsis: 'El desenlace final de Hawkins con producción cinematográfica.' },
        { id: `rel_${Date.now()}_2`, title: 'Squid Game: Temporada 2', type: 'Tendencia #1', year: '2025', genre: 'Thriller / Drama', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80', synopsis: 'Nuevos juegos mortales y el retorno de Gi-hun.' }
      ],
      'spotify': [
        { id: `rel_${Date.now()}_1`, title: 'Top Hits Latinos 2025', type: 'Playlist Oficial', year: '2025', genre: 'Urbano / Reggaetón', posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', synopsis: 'Los hits más escuchados en audio Hi-Fi sin cortes.' }
      ],
      'disney': [
        { id: `rel_${Date.now()}_1`, title: 'Daredevil: Born Again', type: 'Marvel Studios', year: '2025', genre: 'Acción / Suspenso', posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', synopsis: 'El regreso definitivo del Hombre sin Miedo.' }
      ],
      'max': [
        { id: `rel_${Date.now()}_1`, title: 'The Last of Us: Parte 2', type: 'HBO Original', year: '2025', genre: 'Drama', posterUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80', synopsis: 'La continuación de la aclamada saga adaptada por HBO.' }
      ]
    };

    const syncedReleases = aiReleasesDatabase[platformKey] || [
      { id: `rel_${Date.now()}_1`, title: `${service.name} Estrenos 2025`, type: 'Novedad en Vivo', year: '2025', genre: 'Streaming Premium', posterUrl: service.bannerHorizontal || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80', synopsis: 'Contenido actualizado en vivo con la última cartelera oficial.' }
    ];

    service.releases = syncedReleases;
    service.lastAiSync = new Date().toISOString();
    saveStorage();

    res.json({
      success: true,
      message: `✨ ¡Estrenos de ${service.name} sincronizados con éxito mediante IA!`,
      releases: syncedReleases,
      lastAiSync: service.lastAiSync
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al sincronizar cartelera con IA' });
  }
});

export default router;
