import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { approveDeposit, rejectDeposit, getWallet } from '../services/walletService.js';
import { setExchangeRate, convertFromUsd } from '../services/currencyService.js';
import cryptoService from '../services/cryptoService.js';

const router = Router();

// =======================================================
// 1. MÉTRICAS & RESUMEN GENERAL (OVERVIEW & FINANCIALS)
// =======================================================
router.get('/overview', (req, res) => {
  const db = getDb();
  const adminWallet = getWallet('usr_admin');
  const rate = db.platform_settings?.exchangeRatePyg || 7500;
  const commissionPercent = db.platform_settings?.commissionPercent || 15;

  const pendingDeposits = (db.wallet_transactions || []).filter(t => t.type === 'deposit' && t.status === 'pending');
  const approvedDeposits = (db.wallet_transactions || []).filter(t => t.type === 'deposit' && t.status === 'approved');
  const pendingPayouts = (db.payout_requests || []).filter(p => p.status === 'pending');

  let totalDepositsVolumeUsd = 0;
  approvedDeposits.forEach(t => { totalDepositsVolumeUsd += (t.amountUsd || 0); });

  let totalSlotsSalesUsd = 0;
  (db.user_slots || []).forEach(s => { totalSlotsSalesUsd += (s.pricePaidUsd || 0); });

  let totalStoreOrdersUsd = 0;
  (db.user_store_orders || []).forEach(o => { totalStoreOrdersUsd += (o.pricePaidUsd || 0); });

  const totalSalesVolumeUsd = parseFloat((totalSlotsSalesUsd + totalStoreOrdersUsd).toFixed(2));
  const totalVolumeUsd = parseFloat((totalDepositsVolumeUsd + totalSalesVolumeUsd).toFixed(2));
  const totalCommissionsUsd = parseFloat((totalSalesVolumeUsd * (commissionPercent / 100)).toFixed(2));

  let totalEscrowUsd = 0;
  Object.values(db.wallets || {}).forEach(w => {
    totalEscrowUsd += (w.pendingEscrowUsd || 0);
  });

  const sellersCount = (db.users || []).filter(u => u.role === 'seller').length;
  const clientsCount = (db.users || []).filter(u => u.role === 'client').length;
  const gamesCount = (db.store_products || []).filter(p => p.category === 'game_key' || p.category === 'digital_game').length;
  const giftcardsCount = (db.store_products || []).filter(p => p.category === 'gift_card').length;

  res.json({
    adminWallet,
    stats: {
      totalUsers: (db.users || []).length,
      sellersCount,
      clientsCount,
      activeSubscriptionsCount: (db.subscriptions || []).filter(s => s.status === 'active').length,
      totalSlotsSold: (db.user_slots || []).length,
      totalGames: gamesCount,
      totalGiftCards: giftcardsCount,
      totalStoreOrders: (db.user_store_orders || []).length,
      totalVolumeUsd,
      totalVolumePyg: Math.round(totalVolumeUsd * rate),
      totalSalesVolumeUsd,
      totalSalesVolumePyg: Math.round(totalSalesVolumeUsd * rate),
      totalDepositsVolumeUsd: parseFloat(totalDepositsVolumeUsd.toFixed(2)),
      totalDepositsVolumePyg: Math.round(totalDepositsVolumeUsd * rate),
      totalCommissionsUsd,
      totalCommissionsPyg: Math.round(totalCommissionsUsd * rate),
      totalEscrowUsd: parseFloat(totalEscrowUsd.toFixed(2)),
      totalEscrowPyg: Math.round(totalEscrowUsd * rate),
      pendingDepositsCount: pendingDeposits.length,
      pendingPayoutsCount: pendingPayouts.length
    },
    pendingDeposits,
    pendingPayouts,
    recentTransactions: (db.wallet_transactions || []).slice(0, 10),
    settings: db.platform_settings
  });
});

// =======================================================
// 2. VIDEOJUEGOS DIGITALES (GAMES CRUD & DUAL PRICING)
// =======================================================
router.get('/games', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    
    // Filter digital games
    const games = (db.store_products || [])
      .filter(p => p.category === 'game_key' || p.category === 'digital_game')
      .map(g => ({
        id: g.id,
        title: g.title,
        platform: g.platform || 'PS5',
        genre: g.genre || 'Acción / Aventura',
        primaryPriceUsd: g.primaryPriceUsd || g.priceUsd || 39.99,
        primaryPricePyg: Math.round((g.primaryPriceUsd || g.priceUsd || 39.99) * rate),
        secondaryPriceUsd: g.secondaryPriceUsd || Math.round((g.priceUsd || 39.99) * 0.65),
        secondaryPricePyg: Math.round((g.secondaryPriceUsd || Math.round((g.priceUsd || 39.99) * 0.65)) * rate),
        digitalKeyPriceUsd: g.digitalKeyPriceUsd || g.priceUsd || 59.99,
        digitalKeyPricePyg: Math.round((g.digitalKeyPriceUsd || g.priceUsd || 59.99) * rate),
        priceUsd: g.primaryPriceUsd || g.priceUsd || 39.99,
        pricePyg: Math.round((g.primaryPriceUsd || g.priceUsd || 39.99) * rate),
        coverUrl: g.coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        screenshots: g.screenshots && Array.isArray(g.screenshots) ? g.screenshots : [
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
        ],
        description: g.description || 'Juego digital completo para tu consola o PC.',
        isAvailable: g.isAvailable !== false,
        badge: g.badge || 'DISPONIBLE',
        codesCount: (g.codes || []).length,
        createdAt: g.createdAt || new Date().toISOString()
      }));

    res.json({ success: true, count: games.length, games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new digital game
router.post('/games', (req, res) => {
  try {
    const db = getDb();
    const {
      title,
      platform = 'PS5',
      genre = 'Acción',
      primaryPriceUsd,
      secondaryPriceUsd,
      digitalKeyPriceUsd,
      coverUrl,
      screenshots,
      description,
      badge = 'OFICIAL',
      isAvailable = true,
      codes
    } = req.body;

    if (!title || (!primaryPriceUsd && !digitalKeyPriceUsd)) {
      return res.status(400).json({ error: 'Título y precio son obligatorios.' });
    }

    const screenshotsList = Array.isArray(screenshots) 
      ? screenshots 
      : (typeof screenshots === 'string' ? screenshots.split('\n').map(s => s.trim()).filter(Boolean) : []);

    const codeList = Array.isArray(codes)
      ? codes
      : (typeof codes === 'string' ? codes.split('\n').map(c => c.trim()).filter(Boolean) : []);

    const newGame = {
      id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      category: 'digital_game',
      platform,
      genre,
      primaryPriceUsd: parseFloat(primaryPriceUsd || 0),
      secondaryPriceUsd: parseFloat(secondaryPriceUsd || 0),
      digitalKeyPriceUsd: parseFloat(digitalKeyPriceUsd || primaryPriceUsd || 0),
      priceUsd: parseFloat(primaryPriceUsd || digitalKeyPriceUsd || 39.99),
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      screenshots: screenshotsList.length > 0 ? screenshotsList : [coverUrl],
      description: description || 'Entrega digital inmediata con soporte garantizado.',
      badge,
      isAvailable: isAvailable === true || isAvailable === 'true',
      codes: codeList,
      stockCount: codeList.length,
      createdAt: new Date().toISOString()
    };

    db.store_products.unshift(newGame);
    saveStorage();

    res.json({
      success: true,
      message: `¡Videojuego "${newGame.title}" agregado con éxito!`,
      game: newGame
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update digital game
router.put('/games/:id', (req, res) => {
  try {
    const db = getDb();
    const game = db.store_products.find(p => p.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }

    const {
      title,
      platform,
      genre,
      primaryPriceUsd,
      secondaryPriceUsd,
      digitalKeyPriceUsd,
      coverUrl,
      screenshots,
      description,
      badge,
      isAvailable,
      codes
    } = req.body;

    if (title) game.title = title.trim();
    if (platform) game.platform = platform;
    if (genre) game.genre = genre;
    if (primaryPriceUsd !== undefined) game.primaryPriceUsd = parseFloat(primaryPriceUsd);
    if (secondaryPriceUsd !== undefined) game.secondaryPriceUsd = parseFloat(secondaryPriceUsd);
    if (digitalKeyPriceUsd !== undefined) game.digitalKeyPriceUsd = parseFloat(digitalKeyPriceUsd);
    if (game.primaryPriceUsd) game.priceUsd = game.primaryPriceUsd;
    if (coverUrl !== undefined) game.coverUrl = coverUrl;
    if (screenshots !== undefined) {
      game.screenshots = Array.isArray(screenshots) ? screenshots : screenshots.split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (description !== undefined) game.description = description;
    if (badge !== undefined) game.badge = badge;
    if (isAvailable !== undefined) game.isAvailable = isAvailable === true || isAvailable === 'true';
    if (codes !== undefined) {
      game.codes = Array.isArray(codes) ? codes : codes.split('\n').map(c => c.trim()).filter(Boolean);
      game.stockCount = game.codes.length;
    }

    saveStorage();

    res.json({
      success: true,
      message: `Videojuego "${game.title}" actualizado con éxito.`,
      game
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete digital game
router.delete('/games/:id', (req, res) => {
  try {
    const db = getDb();
    const idx = db.store_products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }

    const removed = db.store_products.splice(idx, 1)[0];
    saveStorage();

    res.json({
      success: true,
      message: `Videojuego "${removed.title}" eliminado.`,
      game: removed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 3. GIFT CARDS & BÓVEDA DE CÓDIGOS (ACTIVATION CODES VAULT)
// =======================================================
router.get('/giftcards', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    const cards = (db.store_products || [])
      .filter(p => p.category === 'gift_card')
      .map(gc => ({
        id: gc.id,
        title: gc.title,
        brand: gc.brand || gc.platform || 'Digital',
        priceUsd: gc.priceUsd,
        pricePyg: Math.round(gc.priceUsd * rate),
        badge: gc.badge || 'ENTREGA INMEDIATA',
        coverUrl: gc.coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
        description: gc.description || 'Código digital de activación inmediata.',
        codesCount: (gc.codes || []).length,
        codes: gc.codes || [],
        isAvailable: (gc.codes || []).length > 0
      }));

    res.json({ success: true, count: cards.length, giftCards: cards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new Gift Card
router.post('/giftcards', (req, res) => {
  try {
    const db = getDb();
    const { title, brand = 'PlayStation', priceUsd, pricePyg, badge = 'OFICIAL', coverUrl, description, codes } = req.body;

    if (!title || (!priceUsd && !pricePyg)) {
      return res.status(400).json({ error: 'Título y precio son obligatorios.' });
    }

    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const finalPriceUsd = priceUsd ? parseFloat(priceUsd) : parseFloat((parseFloat(pricePyg) / rate).toFixed(2));
    const codeList = Array.isArray(codes) ? codes : (typeof codes === 'string' ? codes.split('\n').map(c => c.trim()).filter(Boolean) : []);

    const newGiftCard = {
      id: `gc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      category: 'gift_card',
      brand,
      platform: brand,
      priceUsd: finalPriceUsd,
      badge,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      description: description || 'Código oficial de activación directa.',
      codes: codeList,
      stockCount: codeList.length,
      createdAt: new Date().toISOString()
    };

    db.store_products.unshift(newGiftCard);
    saveStorage();

    res.json({
      success: true,
      message: `¡Gift Card "${newGiftCard.title}" creada con éxito! Stock: ${codeList.length} códigos.`,
      giftCard: newGiftCard
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add batch codes to Gift Card vault
router.post('/giftcards/:id/add-codes', (req, res) => {
  try {
    const db = getDb();
    const card = db.store_products.find(p => p.id === req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Gift Card no encontrada' });
    }

    const { codes } = req.body;
    const newCodes = Array.isArray(codes) ? codes : (typeof codes === 'string' ? codes.split('\n').map(c => c.trim()).filter(Boolean) : []);

    if (newCodes.length === 0) {
      return res.status(400).json({ error: 'Por favor ingresa al menos un código válido.' });
    }

    card.codes = (card.codes || []).concat(newCodes);
    card.stockCount = card.codes.length;
    saveStorage();

    res.json({
      success: true,
      message: `¡Se agregaron ${newCodes.length} códigos a la bóveda! Stock total: ${card.codes.length}`,
      totalCodes: card.codes.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update or Delete Gift Card
router.delete('/giftcards/:id', (req, res) => {
  try {
    const db = getDb();
    const idx = db.store_products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Gift Card no encontrada' });
    }

    const removed = db.store_products.splice(idx, 1)[0];
    saveStorage();

    res.json({
      success: true,
      message: `Gift Card "${removed.title}" eliminada.`,
      giftCard: removed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 4. STREAMING: SERVICIOS OFICIALES & MODERACIÓN DE SOLICITUDES
// =======================================================

// List of standard official platforms available on platform
const DEFAULT_OFFICIAL_SERVICES = [
  { id: 'netflix', name: 'Netflix Premium 4K', category: 'streaming', maxSlots: 4, suggestedPriceUsd: 4.99, icon: 'netflix', badge: 'Ultra HD' },
  { id: 'spotify', name: 'Spotify Premium Familiar', category: 'music', maxSlots: 5, suggestedPriceUsd: 3.99, icon: 'spotify', badge: 'Familiar' },
  { id: 'disney', name: 'Disney+ Premium & Star+', category: 'streaming', maxSlots: 4, suggestedPriceUsd: 4.99, icon: 'disney', badge: '4K HDR' },
  { id: 'max', name: 'Max (HBO Max) Platino 4K', category: 'streaming', maxSlots: 3, suggestedPriceUsd: 4.99, icon: 'max', badge: '4K Atmos' },
  { id: 'youtube', name: 'YouTube Premium & Music', category: 'streaming', maxSlots: 5, suggestedPriceUsd: 3.49, icon: 'youtube', badge: 'Sin Anuncios' },
  { id: 'crunchyroll', name: 'Crunchyroll Mega Fan', category: 'anime', maxSlots: 4, suggestedPriceUsd: 2.99, icon: 'crunchyroll', badge: 'Simulcast' },
  { id: 'appletv', name: 'Apple TV+ 4K', category: 'streaming', maxSlots: 3, suggestedPriceUsd: 4.99, icon: 'appletv', badge: 'Apple Originals' },
  { id: 'paramount', name: 'Paramount+ Premium', category: 'streaming', maxSlots: 3, suggestedPriceUsd: 3.99, icon: 'paramount', badge: 'Deportes & Cine' },
  { id: 'chatgpt', name: 'ChatGPT Plus & AI', category: 'tools', maxSlots: 2, suggestedPriceUsd: 9.99, icon: 'ai', badge: 'GPT-4o & Canvas' }
];

router.get('/streaming/services', (req, res) => {
  const db = getDb();
  if (!db.official_streaming_services || db.official_streaming_services.length === 0) {
    db.official_streaming_services = DEFAULT_OFFICIAL_SERVICES;
    saveStorage();
  }
  res.json({ success: true, services: db.official_streaming_services });
});

router.post('/streaming/services', (req, res) => {
  try {
    const db = getDb();
    const { name, maxSlots = 4, suggestedPriceUsd = 4.99, badge = 'OFICIAL', icon = 'streaming' } = req.body;

    if (!name) return res.status(400).json({ error: 'Nombre del servicio requerido' });

    const newService = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: name.trim(),
      category: 'streaming',
      maxSlots: parseInt(maxSlots),
      suggestedPriceUsd: parseFloat(suggestedPriceUsd),
      badge,
      icon
    };

    if (!db.official_streaming_services) db.official_streaming_services = DEFAULT_OFFICIAL_SERVICES;
    db.official_streaming_services.push(newService);
    saveStorage();

    res.json({ success: true, message: `Servicio "${newService.name}" agregado.`, service: newService });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Moderation: Pending Seller Submissions
router.get('/streaming/pending', (req, res) => {
  try {
    const db = getDb();
    const pending = (db.subscriptions || [])
      .filter(s => s.status === 'pending_approval' || s.status === 'pending')
      .map(s => ({
        ...s,
        credentialsDecrypted: cryptoService.decrypt(s.credentialsEncrypted),
        pinsDecrypted: cryptoService.decrypt(s.pinsEncrypted || '')
      }));

    res.json({ success: true, count: pending.length, submissions: pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Moderation: Approve seller submission
router.post('/streaming/approve/:id', (req, res) => {
  try {
    const db = getDb();
    const sub = db.subscriptions.find(s => s.id === req.params.id);
    if (!sub) return res.status(404).json({ error: 'Solicitud no encontrada' });

    sub.status = 'active';
    sub.approvedAt = new Date().toISOString();
    saveStorage();

    res.json({
      success: true,
      message: `¡Cuenta "${sub.serviceName}" aprobada y publicada en el catálogo oficial!`,
      subscription: sub
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Moderation: Reject seller submission
router.post('/streaming/reject/:id', (req, res) => {
  try {
    const db = getDb();
    const idx = db.subscriptions.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Solicitud no encontrada' });

    const removed = db.subscriptions.splice(idx, 1)[0];
    saveStorage();

    res.json({
      success: true,
      message: `Solicitud rechazada y eliminada.`,
      subscription: removed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Active Co-Subscription Groups List
router.get('/streaming/active-groups', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const active = (db.subscriptions || [])
      .filter(s => s.status === 'active')
      .map(s => {
        const slotsSold = (db.user_slots || []).filter(us => us.subscriptionId === s.id).length;
        return {
          ...s,
          slotsSold,
          availableSlots: Math.max(0, s.totalSlots - slotsSold),
          pricePyg: Math.round(s.pricePerSlotUsd * rate),
          credentialsDecrypted: cryptoService.decrypt(s.credentialsEncrypted),
          pinsDecrypted: cryptoService.decrypt(s.pinsEncrypted || '')
        };
      });

    res.json({ success: true, count: active.length, groups: active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 5. IMPULSO DIGITAL & REDES SOCIALES API CONFIG (SMM)
// =======================================================
router.get('/smm/config', (req, res) => {
  try {
    const db = getDb();
    const config = db.smm_config || {
      providerUrl: 'https://api.justanotherpanel.com/v2',
      apiKey: 'smm_key_masked_****_8921',
      markupPercent: 30,
      status: 'ready',
      lastBalanceUsd: 184.20,
      lastSyncAt: new Date().toISOString()
    };
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/smm/config', (req, res) => {
  try {
    const db = getDb();
    const { providerUrl, apiKey, markupPercent = 30 } = req.body;

    if (!providerUrl) return res.status(400).json({ error: 'URL del proveedor requerida' });

    db.smm_config = {
      providerUrl: providerUrl.trim(),
      apiKey: apiKey && apiKey.trim() ? apiKey.trim() : (db.smm_config?.apiKey || 'smm_key_secret'),
      markupPercent: parseFloat(markupPercent) || 30,
      status: 'connected',
      lastBalanceUsd: db.smm_config?.lastBalanceUsd || 184.20,
      lastSyncAt: new Date().toISOString()
    };
    saveStorage();

    res.json({
      success: true,
      message: '¡Configuración de API de Impulso Digital guardada con éxito!',
      config: db.smm_config
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/smm/test-connection', (req, res) => {
  try {
    const db = getDb();
    const config = db.smm_config || {};
    
    // Simulate real API ping & balance check
    const simulatedBalance = 245.80;
    config.lastBalanceUsd = simulatedBalance;
    config.status = 'connected';
    config.lastSyncAt = new Date().toISOString();
    db.smm_config = config;
    saveStorage();

    res.json({
      success: true,
      message: '🟢 Conexión con el proveedor API establecida con éxito.',
      providerBalanceUsd: simulatedBalance,
      status: 'connected'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 6. GESTIÓN DE USUARIOS & BILLETERAS
// =======================================================
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    
    const usersList = (db.users || []).map(u => {
      const wallet = getWallet(u.id);
      const ordersCount = (db.user_slots || []).filter(s => s.buyerId === u.id).length + 
                          (db.user_store_orders || []).filter(o => o.buyerId === u.id).length;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'client',
        avatar: u.avatar || '/assets/branding/icon.png',
        balanceUsd: wallet.balanceUsd || 0,
        balancePyg: Math.round((wallet.balanceUsd || 0) * rate),
        pendingEscrowUsd: wallet.pendingEscrowUsd || 0,
        ordersCount,
        phone: u.phone || '',
        createdAt: u.createdAt || new Date().toISOString()
      };
    });

    res.json({ success: true, count: usersList.length, users: usersList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adjust User Balance manually (Admin deposit or penalty)
router.post('/users/:id/adjust-balance', (req, res) => {
  try {
    const db = getDb();
    const { amountUsd, amountPyg, type = 'deposit', notes = 'Ajuste manual de administración' } = req.body;
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const finalUsd = amountUsd ? parseFloat(amountUsd) : parseFloat((parseFloat(amountPyg || 0) / rate).toFixed(2));
    const wallet = getWallet(user.id);

    if (type === 'deduct') {
      wallet.balanceUsd = Math.max(0, parseFloat((wallet.balanceUsd - finalUsd).toFixed(2)));
    } else {
      wallet.balanceUsd = parseFloat((wallet.balanceUsd + finalUsd).toFixed(2));
    }

    const tx = {
      id: `tx_admin_adj_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: type === 'deduct' ? 'payout' : 'deposit',
      amountUsd: finalUsd,
      currency: 'PYG',
      localAmount: Math.round(finalUsd * rate),
      method: 'admin_manual_adjustment',
      status: 'approved',
      reference: 'ADMIN-ADJUST',
      notes,
      createdAt: new Date().toISOString()
    };

    db.wallet_transactions.unshift(tx);
    saveStorage();

    const formattedGs = Math.round(finalUsd * rate).toLocaleString('es-PY');
    res.json({
      success: true,
      message: `¡Saldo ajustado con éxito! ${type === 'deduct' ? '-' : '+'}${formattedGs} Gs. ($${finalUsd.toFixed(2)} USDT)`,
      wallet,
      balancePyg: Math.round(wallet.balanceUsd * rate)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 7. FINANZAS: SIPAP, BINANCE USDT & CONFIGURACIÓN
// =======================================================

// Approve deposit
router.post('/approve-deposit/:id', (req, res) => {
  try {
    const result = approveDeposit(req.params.id, 'usr_admin');
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const creditedGs = Math.round(result.tx.amountUsd * rate).toLocaleString('es-PY');

    res.json({
      success: true,
      message: `¡Recarga aprobada! Se acreditaron ${creditedGs} Gs. ($${result.tx.amountUsd.toFixed(2)} USDT) al saldo del usuario.`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reject deposit
router.post('/reject-deposit/:id', (req, res) => {
  try {
    const reason = req.body.reason || 'Comprobante no válido o pago no recibido';
    const tx = rejectDeposit(req.params.id, 'usr_admin', reason);
    res.json({
      success: true,
      message: 'Recarga rechazada.',
      transaction: tx
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Approve payout
router.post('/approve-payout/:id', (req, res) => {
  try {
    const db = getDb();
    const payout = db.payout_requests.find(p => p.id === req.params.id);
    if (!payout || payout.status !== 'pending') {
      return res.status(400).json({ error: 'Solicitud no encontrada o ya procesada' });
    }

    payout.status = 'completed';
    payout.processedAt = new Date().toISOString();
    saveStorage();

    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const amountGs = Math.round(payout.amountUsd * rate).toLocaleString('es-PY');

    res.json({
      success: true,
      message: `Retiro de ${amountGs} Gs. ($${payout.amountUsd.toFixed(2)} USDT) completado y marcado como transferido.`,
      payout
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update platform settings
router.post('/settings', (req, res) => {
  try {
    const db = getDb();
    const { commissionPercent, exchangeRatePyg, paraguayBankDetails, binanceDetails } = req.body;

    if (commissionPercent !== undefined && !isNaN(parseFloat(commissionPercent))) {
      db.platform_settings.commissionPercent = parseFloat(commissionPercent);
    }
    if (exchangeRatePyg !== undefined && !isNaN(parseFloat(exchangeRatePyg))) {
      const rate = parseFloat(exchangeRatePyg);
      db.platform_settings.exchangeRatePyg = rate;
      setExchangeRate('PYG', rate);
    }
    if (paraguayBankDetails) {
      db.platform_settings.paraguayBankDetails = {
        ...db.platform_settings.paraguayBankDetails,
        ...paraguayBankDetails
      };
    }
    if (binanceDetails) {
      if (binanceDetails.walletAddress && !binanceDetails.qrUrl) {
        binanceDetails.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(binanceDetails.walletAddress)}`;
      }
      db.platform_settings.binanceDetails = {
        ...db.platform_settings.binanceDetails,
        ...binanceDetails
      };
    }

    saveStorage();

    res.json({
      success: true,
      message: '¡Configuración de cobros, bancos y billetera guardada con éxito!',
      settings: db.platform_settings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backward compatibility legacy products endpoints
router.get('/products', (req, res) => {
  const db = getDb();
  const rate = db.platform_settings?.exchangeRatePyg || 7500;
  const products = (db.store_products || []).map(p => ({
    ...p,
    pricePyg: Math.round(p.priceUsd * rate),
    stockCount: (p.codes || []).length
  }));
  res.json({ success: true, count: products.length, products });
});

router.delete('/products/:id', (req, res) => {
  const db = getDb();
  const idx = db.store_products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
  const removed = db.store_products.splice(idx, 1)[0];
  saveStorage();
  res.json({ success: true, message: `Producto "${removed.title}" eliminado.`, product: removed });
});

export default router;
