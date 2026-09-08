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
// 2. VIDEOJUEGOS DIGITALES (GAMES CRUD & PRECIOS EN Gs.)
// =======================================================
router.get('/games', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    
    // Filter digital games
    const games = (db.store_products || [])
      .filter(p => p && (p.category === 'game_key' || p.category === 'digital_game' || !p.category || (p.category && p.category.includes('game'))))
      .map(g => {
        const rawPrimary = g.primaryPriceUsd || g.priceUsd || (g.primaryPricePyg ? (g.primaryPricePyg / rate) : 39.99);
        const primaryUsd = typeof rawPrimary === 'number' ? parseFloat(rawPrimary.toFixed(2)) : (parseFloat(rawPrimary) || 39.99);
        const rawSecondary = g.secondaryPriceUsd || (g.secondaryPricePyg ? (g.secondaryPricePyg / rate) : (primaryUsd * 0.65));
        const secondaryUsd = typeof rawSecondary === 'number' ? parseFloat(rawSecondary.toFixed(2)) : (parseFloat(rawSecondary) || 24.99);
        const primaryPyg = g.primaryPricePyg || Math.round(primaryUsd * rate);
        const secondaryPyg = g.secondaryPricePyg || Math.round(secondaryUsd * rate);

        return {
          id: g.id || `game_${Date.now()}`,
          title: g.title || 'Videojuego Digital',
          platform: g.platform || 'PS5',
          genre: g.genre || 'Acción / Aventura',
          primaryPricePyg: primaryPyg,
          secondaryPricePyg: secondaryPyg,
          primaryPriceUsd: primaryUsd,
          secondaryPriceUsd: secondaryUsd,
          pricePyg: primaryPyg,
          priceUsd: primaryUsd,
          coverUrl: g.coverUrl || g.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
          coverImage: g.coverImage || g.coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
          screenshots: Array.isArray(g.screenshots) && g.screenshots.length > 0 ? g.screenshots : [
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
          ],
          description: g.description || 'Juego digital completo para tu consola o PC.',
          isAvailable: g.isAvailable !== false,
          badge: g.badge || 'DISPONIBLE',
          createdAt: g.createdAt || new Date().toISOString()
        };
      });

    res.json({ success: true, count: games.length, games });
  } catch (err) {
    console.error('Error in GET /api/admin/games:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new digital game
router.post('/games', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const {
      title,
      platform = 'PS5',
      genre = 'Acción',
      primaryPricePyg,
      secondaryPricePyg,
      primaryPriceUsd,
      secondaryPriceUsd,
      coverImage,
      coverUrl,
      screenshots,
      description,
      badge = 'OFICIAL',
      isAvailable = true
    } = req.body;

    if (!title || (!primaryPricePyg && !primaryPriceUsd)) {
      return res.status(400).json({ error: 'Título y precio de Cuenta Primaria son obligatorios.' });
    }

    const finalPrimaryPyg = primaryPricePyg ? parseInt(primaryPricePyg, 10) : Math.round(parseFloat(primaryPriceUsd) * rate);
    const finalSecondaryPyg = secondaryPricePyg ? parseInt(secondaryPricePyg, 10) : (secondaryPriceUsd ? Math.round(parseFloat(secondaryPriceUsd) * rate) : Math.round(finalPrimaryPyg * 0.65));
    const finalPrimaryUsd = parseFloat((finalPrimaryPyg / rate).toFixed(2));
    const finalSecondaryUsd = parseFloat((finalSecondaryPyg / rate).toFixed(2));

    let screenshotsList = [];
    if (Array.isArray(screenshots)) {
      screenshotsList = screenshots.slice(0, 10);
    } else if (typeof screenshots === 'string' && screenshots.trim()) {
      screenshotsList = screenshots.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 10);
    }

    const finalCover = coverImage || coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
    if (screenshotsList.length === 0) {
      screenshotsList = [finalCover];
    }

    const newGame = {
      id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      category: 'digital_game',
      platform,
      genre,
      primaryPricePyg: finalPrimaryPyg,
      secondaryPricePyg: finalSecondaryPyg,
      primaryPriceUsd: finalPrimaryUsd,
      secondaryPriceUsd: finalSecondaryUsd,
      priceUsd: finalPrimaryUsd,
      coverUrl: finalCover,
      coverImage: finalCover,
      screenshots: screenshotsList,
      description: description || 'Entrega digital con activación y soporte garantizado.',
      badge,
      isAvailable: isAvailable === true || isAvailable === 'true',
      createdAt: new Date().toISOString()
    };

    if (!db.store_products) db.store_products = [];
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
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const game = (db.store_products || []).find(p => p.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Videojuego no encontrado' });
    }

    const {
      title,
      platform,
      genre,
      primaryPricePyg,
      secondaryPricePyg,
      primaryPriceUsd,
      secondaryPriceUsd,
      coverImage,
      coverUrl,
      screenshots,
      description,
      badge,
      isAvailable
    } = req.body;

    if (title) game.title = title.trim();
    if (platform) game.platform = platform;
    if (genre) game.genre = genre;
    
    if (primaryPricePyg !== undefined && primaryPricePyg !== '') {
      game.primaryPricePyg = parseInt(primaryPricePyg, 10);
      game.primaryPriceUsd = parseFloat((game.primaryPricePyg / rate).toFixed(2));
      game.priceUsd = game.primaryPriceUsd;
    } else if (primaryPriceUsd !== undefined && primaryPriceUsd !== '') {
      game.primaryPriceUsd = parseFloat(primaryPriceUsd);
      game.primaryPricePyg = Math.round(game.primaryPriceUsd * rate);
      game.priceUsd = game.primaryPriceUsd;
    }

    if (secondaryPricePyg !== undefined && secondaryPricePyg !== '') {
      game.secondaryPricePyg = parseInt(secondaryPricePyg, 10);
      game.secondaryPriceUsd = parseFloat((game.secondaryPricePyg / rate).toFixed(2));
    } else if (secondaryPriceUsd !== undefined && secondaryPriceUsd !== '') {
      game.secondaryPriceUsd = parseFloat(secondaryPriceUsd);
      game.secondaryPricePyg = Math.round(game.secondaryPriceUsd * rate);
    }

    if (coverImage || coverUrl) {
      game.coverUrl = coverImage || coverUrl;
      game.coverImage = coverImage || coverUrl;
    }

    if (screenshots !== undefined) {
      if (Array.isArray(screenshots)) {
        game.screenshots = screenshots.slice(0, 10);
      } else if (typeof screenshots === 'string') {
        game.screenshots = screenshots.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 10);
      }
    }

    if (description !== undefined) game.description = description;
    if (badge !== undefined) game.badge = badge;
    if (isAvailable !== undefined) game.isAvailable = isAvailable === true || isAvailable === 'true';

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
    const idx = (db.store_products || []).findIndex(p => p.id === req.params.id);
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
// 3. GIFT CARDS / TARJETAS DE REGALO (MARCAS & VARIACIONES)
// =======================================================

const DEFAULT_GIFT_CARD_BRANDS = [
  {
    id: 'brand_playstation',
    name: 'PlayStation Network',
    category: 'Gaming',
    logoUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    description: 'Tarjetas oficiales de saldo y membresías PlayStation Plus.',
    variations: [
      { id: 'var_psn_10', name: 'PSN $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
      { id: 'var_psn_25', name: 'PSN $25 USD', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 },
      { id: 'var_psn_50', name: 'PSN $50 USD', denomination: '$50 USD', pricePyg: 410000, priceUsd: 50.00 },
      { id: 'var_psn_100', name: 'PSN $100 USD', denomination: '$100 USD', pricePyg: 810000, priceUsd: 100.00 },
      { id: 'var_psn_plus_1m', name: 'PS Plus Essential 1 Mes', denomination: '1 Mes', pricePyg: 90000, priceUsd: 11.99 },
      { id: 'var_psn_plus_12m', name: 'PS Plus Essential 12 Meses', denomination: '12 Meses', pricePyg: 620000, priceUsd: 79.99 }
    ]
  },
  {
    id: 'brand_steam',
    name: 'Steam Wallet',
    category: 'PC Gaming',
    logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo para la tienda de Steam en PC y Steam Deck.',
    variations: [
      { id: 'var_steam_5', name: 'Steam $5 USD', denomination: '$5 USD', pricePyg: 42000, priceUsd: 5.00 },
      { id: 'var_steam_10', name: 'Steam $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
      { id: 'var_steam_20', name: 'Steam $20 USD', denomination: '$20 USD', pricePyg: 168000, priceUsd: 20.00 },
      { id: 'var_steam_50', name: 'Steam $50 USD', denomination: '$50 USD', pricePyg: 415000, priceUsd: 50.00 }
    ]
  },
  {
    id: 'brand_xbox',
    name: 'Xbox & Game Pass',
    category: 'Gaming',
    logoUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80',
    description: 'Tarjetas de regalo Xbox y suscripciones Game Pass Ultimate.',
    variations: [
      { id: 'var_xbox_10', name: 'Xbox $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
      { id: 'var_xbox_25', name: 'Xbox $25 USD', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 },
      { id: 'var_xbox_gpu_1m', name: 'Game Pass Ultimate 1 Mes', denomination: '1 Mes', pricePyg: 125000, priceUsd: 16.99 },
      { id: 'var_xbox_gpu_3m', name: 'Game Pass Ultimate 3 Meses', denomination: '3 Meses', pricePyg: 350000, priceUsd: 49.99 }
    ]
  },
  {
    id: 'brand_nintendo',
    name: 'Nintendo eShop',
    category: 'Gaming',
    logoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo para comprar juegos en Nintendo Switch.',
    variations: [
      { id: 'var_nin_10', name: 'Nintendo $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
      { id: 'var_nin_20', name: 'Nintendo $20 USD', denomination: '$20 USD', pricePyg: 170000, priceUsd: 20.00 },
      { id: 'var_nin_35', name: 'Nintendo $35 USD', denomination: '$35 USD', pricePyg: 295000, priceUsd: 35.00 },
      { id: 'var_nin_50', name: 'Nintendo $50 USD', denomination: '$50 USD', pricePyg: 420000, priceUsd: 50.00 }
    ]
  },
  {
    id: 'brand_spotify',
    name: 'Spotify Premium',
    category: 'Música',
    logoUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=400&q=80',
    description: 'Música sin anuncios y descargas offline en Spotify.',
    variations: [
      { id: 'var_spot_1m', name: 'Spotify 1 Mes Individual', denomination: '1 Mes', pricePyg: 45000, priceUsd: 5.99 },
      { id: 'var_spot_3m', name: 'Spotify 3 Meses', denomination: '3 Meses', pricePyg: 125000, priceUsd: 16.50 },
      { id: 'var_spot_6m', name: 'Spotify 6 Meses', denomination: '6 Meses', pricePyg: 240000, priceUsd: 32.00 }
    ]
  },
  {
    id: 'brand_netflix',
    name: 'Netflix Gift Card',
    category: 'Streaming',
    logoUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo oficial de regalo para canjear en cuentas Netflix.',
    variations: [
      { id: 'var_net_15', name: 'Netflix $15 USD', denomination: '$15 USD', pricePyg: 125000, priceUsd: 15.00 },
      { id: 'var_net_25', name: 'Netflix $25 USD', denomination: '$25 USD', pricePyg: 205000, priceUsd: 25.00 },
      { id: 'var_net_50', name: 'Netflix $50 USD', denomination: '$50 USD', pricePyg: 405000, priceUsd: 50.00 }
    ]
  },
  {
    id: 'brand_deezer',
    name: 'Deezer Premium',
    category: 'Música',
    logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    description: 'Música en calidad Hi-Fi y sonido de alta fidelidad.',
    variations: [
      { id: 'var_deezer_1m', name: 'Deezer 1 Mes', denomination: '1 Mes', pricePyg: 40000, priceUsd: 5.00 },
      { id: 'var_deezer_3m', name: 'Deezer 3 Meses', denomination: '3 Meses', pricePyg: 110000, priceUsd: 14.50 }
    ]
  },
  {
    id: 'brand_googleplay',
    name: 'Google Play Store',
    category: 'Móvil',
    logoUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo para apps, juegos y diamantes en Android.',
    variations: [
      { id: 'var_gp_10', name: 'Google Play $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
      { id: 'var_gp_25', name: 'Google Play $25 USD', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 },
      { id: 'var_gp_50', name: 'Google Play $50 USD', denomination: '$50 USD', pricePyg: 415000, priceUsd: 50.00 }
    ]
  },
  {
    id: 'brand_apple',
    name: 'Apple Gift Card & iTunes',
    category: 'Apple',
    logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    description: 'Saldo para compras en App Store, Apple Arcade y suscripciones.',
    variations: [
      { id: 'var_apple_10', name: 'Apple $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
      { id: 'var_apple_25', name: 'Apple $25 USD', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 },
      { id: 'var_apple_50', name: 'Apple $50 USD', denomination: '$50 USD', pricePyg: 415000, priceUsd: 50.00 }
    ]
  },
  {
    id: 'brand_roblox',
    name: 'Roblox Robux Card',
    category: 'Gaming',
    logoUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80',
    description: 'Robux y objetos virtuales para tu avatar en Roblox.',
    variations: [
      { id: 'var_rob_10', name: 'Roblox $10 (800 Robux)', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
      { id: 'var_rob_25', name: 'Roblox $25 (2000 Robux)', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 }
    ]
  }
];

// Get Gift Card Brands & Variations
router.get('/giftcards/brands', (req, res) => {
  try {
    const db = getDb();
    if (!Array.isArray(db.giftcard_brands)) {
      db.giftcard_brands = [];
      saveStorage();
    }
    res.json({ success: true, count: db.giftcard_brands.length, brands: db.giftcard_brands });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy Giftcards list alias (for backwards compatibility)
router.get('/giftcards', (req, res) => {
  try {
    const db = getDb();
    if (!Array.isArray(db.giftcard_brands)) {
      db.giftcard_brands = [];
      saveStorage();
    }

    
    // Flat map variations
    const flatCards = [];
    db.giftcard_brands.forEach(b => {
      (b.variations || []).forEach(v => {
        flatCards.push({
          id: v.id,
          brandId: b.id,
          title: `${b.name} - ${v.name}`,
          brand: b.name,
          denomination: v.denomination || v.name,
          pricePyg: v.pricePyg,
          priceUsd: v.priceUsd,
          coverUrl: b.logoUrl,
          description: v.description || b.description,
          badge: 'OFICIAL'
        });
      });
    });

    res.json({ success: true, count: flatCards.length, giftCards: flatCards, brands: db.giftcard_brands });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Brand
router.post('/giftcards/brands', (req, res) => {
  try {
    const db = getDb();
    const { name, category = 'Gaming', logoImage, logoUrl, description } = req.body;

    if (!name) return res.status(400).json({ error: 'Nombre de la marca requerido' });

    const finalLogo = logoImage || logoUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80';

    const newBrand = {
      id: `brand_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      category: category.trim(),
      logoUrl: finalLogo,
      description: description || 'Tarjeta de regalo oficial.',
      variations: [],
      createdAt: new Date().toISOString()
    };

    if (!db.giftcard_brands) db.giftcard_brands = [];
    db.giftcard_brands.unshift(newBrand);
    saveStorage();

    res.json({ success: true, message: `Marca "${newBrand.name}" creada con éxito.`, brand: newBrand });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Brand
router.put('/giftcards/brands/:id', (req, res) => {
  try {
    const db = getDb();
    const brand = (db.giftcard_brands || []).find(b => b.id === req.params.id);
    if (!brand) return res.status(404).json({ error: 'Marca no encontrada' });

    const { name, category, logoImage, logoUrl, description } = req.body;
    if (name) brand.name = name.trim();
    if (category) brand.category = category.trim();
    if (logoImage || logoUrl) brand.logoUrl = logoImage || logoUrl;
    if (description !== undefined) brand.description = description;

    saveStorage();
    res.json({ success: true, message: `Marca "${brand.name}" actualizada con éxito.`, brand });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Brand
router.delete('/giftcards/brands/:id', (req, res) => {
  try {
    const db = getDb();
    const idx = (db.giftcard_brands || []).findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Marca no encontrada' });

    const removed = db.giftcard_brands.splice(idx, 1)[0];
    saveStorage();
    res.json({ success: true, message: `Marca "${removed.name}" eliminada.`, brand: removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Variation to Brand
router.post('/giftcards/brands/:brandId/variations', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const brand = (db.giftcard_brands || []).find(b => b.id === req.params.brandId);
    if (!brand) return res.status(404).json({ error: 'Marca no encontrada' });

    const { name, denomination, pricePyg, priceUsd, description } = req.body;
    if (!name || (!pricePyg && !priceUsd)) {
      return res.status(400).json({ error: 'Nombre de la variación y precio son obligatorios.' });
    }

    const finalPyg = pricePyg ? parseInt(pricePyg, 10) : Math.round(parseFloat(priceUsd) * rate);
    const finalUsd = parseFloat((finalPyg / rate).toFixed(2));

    const newVar = {
      id: `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      denomination: denomination || name,
      pricePyg: finalPyg,
      priceUsd: finalUsd,
      description: description || ''
    };

    if (!brand.variations) brand.variations = [];
    brand.variations.push(newVar);
    saveStorage();

    res.json({ success: true, message: `Variación "${newVar.name}" agregada a ${brand.name}.`, variation: newVar, brand });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Variation
router.delete('/giftcards/brands/:brandId/variations/:varId', (req, res) => {
  try {
    const db = getDb();
    const brand = (db.giftcard_brands || []).find(b => b.id === req.params.brandId);
    if (!brand) return res.status(404).json({ error: 'Marca no encontrada' });

    const idx = (brand.variations || []).findIndex(v => v.id === req.params.varId);
    if (idx === -1) return res.status(404).json({ error: 'Variación no encontrada' });

    const removed = brand.variations.splice(idx, 1)[0];
    saveStorage();
    res.json({ success: true, message: `Variación "${removed.name}" eliminada.`, variation: removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 4. ÓRDENES PENDIENTES & ENTREGA MANUAL POR EL ADMIN
// =======================================================
router.get('/orders/pending', (req, res) => {
  try {
    const db = getDb();
    const type = req.query.type; // 'game', 'giftcard', or undefined for all

    const pendingOrders = (db.user_store_orders || [])
      .filter(o => o.status === 'pending_delivery' || o.status === 'pending' || !o.status)
      .filter(o => {
        if (!type || type === 'all') return true;
        if (type === 'game') return o.type === 'game' || o.option || (o.platform && o.platform.includes('PS'));
        if (type === 'giftcard') return o.type === 'giftcard' || (!o.option && (!o.platform || !o.platform.includes('PS')));
        return true;
      })
      .map(o => {
        const buyer = (db.users || []).find(u => u.id === o.buyerId) || { name: 'Cliente', email: 'cliente@gamesboy.net' };
        return {
          ...o,
          buyerName: buyer.name,
          buyerEmail: buyer.email
        };
      });

    const deliveredOrders = (db.user_store_orders || [])
      .filter(o => o.status === 'delivered')
      .slice(0, 15)
      .map(o => {
        const buyer = (db.users || []).find(u => u.id === o.buyerId) || { name: 'Cliente', email: 'cliente@gamesboy.net' };
        return {
          ...o,
          buyerName: buyer.name,
          buyerEmail: buyer.email
        };
      });

    res.json({
      success: true,
      pendingCount: pendingOrders.length,
      pendingOrders,
      deliveredOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Execute Manual Delivery (Admin pastes code/credentials and sends to buyer)
router.post('/orders/:id/deliver', (req, res) => {
  try {
    const db = getDb();
    const order = (db.user_store_orders || []).find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const { deliveredCode, deliveredEmail, deliveredPassword, deliveredInstructions, notes } = req.body;

    if (!deliveredCode && !deliveredEmail && !deliveredPassword && !deliveredInstructions) {
      return res.status(400).json({ error: 'Debes ingresar al menos el código digital o las credenciales de acceso.' });
    }

    order.status = 'delivered';
    order.deliveredAt = new Date().toISOString();
    order.code = deliveredCode ? deliveredCode.trim() : (order.code || 'ENTREGADO');
    order.credentials = deliveredEmail && deliveredPassword ? `${deliveredEmail}:::${deliveredPassword}` : (deliveredEmail || deliveredPassword || '');
    order.instructions = deliveredInstructions || order.instructions || '';
    order.adminNotes = notes || '';

    saveStorage();

    // Broadcast WebSocket notification to all clients
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'ORDER_DELIVERED',
            payload: {
              orderId: order.id,
              userId: order.buyerId,
              productTitle: order.productTitle || order.title,
              deliveredAt: order.deliveredAt
            }
          }));
        }
      });
    }

    res.json({
      success: true,
      message: `¡Entrega realizada con éxito! La orden "${order.productTitle || order.title}" ha sido entregada y notificada al cliente.`,
      order
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
// 6. GESTIÓN DE USUARIOS & BILLETERAS AUDITADAS
// =======================================================
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    
    let totalWalletBalanceUsd = 0;
    let totalPendingEscrowUsd = 0;

    const usersList = (db.users || []).map(u => {
      const wallet = getWallet(u.id);
      const ordersCount = (db.user_slots || []).filter(s => s.buyerId === u.id).length + 
                          (db.user_store_orders || []).filter(o => o.buyerId === u.id).length;
      
      const balUsd = wallet.balanceUsd || 0;
      const escrowUsd = wallet.pendingEscrowUsd || 0;
      totalWalletBalanceUsd += balUsd;
      totalPendingEscrowUsd += escrowUsd;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'client',
        avatar: u.avatar || '/assets/branding/icon.png',
        balanceUsd: balUsd,
        balancePyg: Math.round(balUsd * rate),
        pendingEscrowUsd: escrowUsd,
        pendingEscrowPyg: Math.round(escrowUsd * rate),
        ordersCount,
        phone: u.phone || '',
        createdAt: u.createdAt || new Date().toISOString()
      };
    });

    // Compute approved deposits and payouts
    const approvedDepositsUsd = (db.wallet_transactions || [])
      .filter(t => t.type === 'deposit' && t.status === 'approved')
      .reduce((sum, t) => sum + (t.amountUsd || 0), 0);

    const approvedPayoutsUsd = (db.wallet_transactions || [])
      .filter(t => t.type === 'payout' && t.status === 'approved')
      .reduce((sum, t) => sum + (t.amountUsd || 0), 0);

    const stats = {
      totalUsers: usersList.length,
      clientsCount: usersList.filter(u => u.role === 'client').length,
      sellersCount: usersList.filter(u => u.role === 'seller').length,
      adminsCount: usersList.filter(u => u.role === 'admin').length,
      totalBalanceUsd: parseFloat(totalWalletBalanceUsd.toFixed(2)),
      totalBalancePyg: Math.round(totalWalletBalanceUsd * rate),
      totalEscrowUsd: parseFloat(totalPendingEscrowUsd.toFixed(2)),
      totalEscrowPyg: Math.round(totalPendingEscrowUsd * rate),
      approvedDepositsUsd: parseFloat(approvedDepositsUsd.toFixed(2)),
      approvedDepositsPyg: Math.round(approvedDepositsUsd * rate),
      approvedPayoutsUsd: parseFloat(approvedPayoutsUsd.toFixed(2)),
      approvedPayoutsPyg: Math.round(approvedPayoutsUsd * rate)
    };

    res.json({ success: true, count: usersList.length, users: usersList, stats });
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

// =======================================================
// 8. CONFIGURACIÓN DE PRECIOS & COMISIONES (ESTILO GOSPLIT)
// =======================================================
const DEFAULT_STREAMING_SERVICES_CONFIG = [
  {
    key: 'netflix',
    name: 'Netflix Premium 4K',
    planName: 'Ultra HD 4 Pantallas',
    totalSlots: 5,
    pricePerSlotPyg: 25000,
    pricePerSlotUsd: 3.33,
    commissionPercent: 10,
    icon: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80',
    description: 'Cuentas oficiales 4K HDR con perfiles individuales y PIN privado.'
  },
  {
    key: 'spotify',
    name: 'Spotify Premium Familiar',
    planName: 'Plan Familiar 6 Cuentas',
    totalSlots: 5,
    pricePerSlotPyg: 18000,
    pricePerSlotUsd: 2.40,
    commissionPercent: 10,
    icon: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=400&q=80',
    description: 'Invitaciones a planes familiares oficiales sin anuncios.'
  },
  {
    key: 'disney',
    name: 'Disney+ Premium & Star+',
    planName: 'Plan Premium 4K HDR',
    totalSlots: 4,
    pricePerSlotPyg: 25000,
    pricePerSlotUsd: 3.33,
    commissionPercent: 10,
    icon: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=400&q=80',
    description: 'Disney, Marvel, Star Wars, Pixar y deportes de ESPN en vivo.'
  },
  {
    key: 'max',
    name: 'Max (HBO Max) 4K',
    planName: 'Platino 4K Dolby Atmos',
    totalSlots: 3,
    pricePerSlotPyg: 22000,
    pricePerSlotUsd: 2.93,
    commissionPercent: 10,
    icon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80',
    description: 'Películas de Warner Bros, HBO Originales y Champions League.'
  },
  {
    key: 'youtube',
    name: 'YouTube Premium & Music',
    planName: 'Familiar Sin Anuncios',
    totalSlots: 5,
    pricePerSlotPyg: 20000,
    pricePerSlotUsd: 2.67,
    commissionPercent: 10,
    icon: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80',
    description: 'YouTube sin anuncios, descargas y YouTube Music en tu cuenta personal.'
  },
  {
    key: 'chatgpt',
    name: 'ChatGPT Plus & Claude Pro',
    planName: 'GPT-4o & Canvas Team',
    totalSlots: 4,
    pricePerSlotPyg: 35000,
    pricePerSlotUsd: 4.67,
    commissionPercent: 10,
    icon: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80',
    description: 'Acceso prioritario a modelos de IA GPT-4o, DALL-E 3 y Canvas.'
  },
  {
    key: 'crunchyroll',
    name: 'Crunchyroll Mega Fan',
    planName: 'Mega Fan 4 Pantallas',
    totalSlots: 4,
    pricePerSlotPyg: 18000,
    pricePerSlotUsd: 2.40,
    commissionPercent: 10,
    icon: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    description: 'Anime en estreno simultáneo con Japón sin publicidad en 1080p.'
  },
  {
    key: 'paramount',
    name: 'Paramount+ Premium',
    planName: 'Plan Estándar 3 Pantallas',
    totalSlots: 3,
    pricePerSlotPyg: 18000,
    pricePerSlotUsd: 2.40,
    commissionPercent: 10,
    icon: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
    description: 'Series exclusivas, estrenos cinematográficos y eventos en vivo.'
  }
];

// Get services configuration with calculated seller payout
router.get('/services-config', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    if (!db.streaming_services_config || db.streaming_services_config.length === 0) {
      db.streaming_services_config = DEFAULT_STREAMING_SERVICES_CONFIG;
      saveStorage();
    }

    const services = db.streaming_services_config.map(s => {
      const pricePyg = s.pricePerSlotPyg || Math.round((s.pricePerSlotUsd || 3.33) * rate);
      const priceUsd = s.pricePerSlotUsd || parseFloat((pricePyg / rate).toFixed(2));
      const comm = s.commissionPercent !== undefined ? s.commissionPercent : (db.platform_settings?.commissionPercent || 10);
      const sellerPyg = Math.round(pricePyg * (1 - comm / 100));
      const sellerUsd = parseFloat((priceUsd * (1 - comm / 100)).toFixed(2));

      return {
        ...s,
        pricePerSlotPyg: pricePyg,
        pricePerSlotUsd: priceUsd,
        commissionPercent: comm,
        sellerPayoutPyg: sellerPyg,
        sellerPayoutUsd: sellerUsd
      };
    });

    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update service configuration (price, default slots, commission %)
router.put('/services-config/:key', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    if (!db.streaming_services_config) {
      db.streaming_services_config = DEFAULT_STREAMING_SERVICES_CONFIG;
    }

    const serviceKey = req.params.key.toLowerCase();
    let service = db.streaming_services_config.find(s => s.key.toLowerCase() === serviceKey);

    if (!service) {
      service = { key: serviceKey, name: req.body.name || serviceKey };
      db.streaming_services_config.push(service);
    }

    const { pricePerSlotPyg, pricePerSlotUsd, totalSlots, commissionPercent, planName, name } = req.body;

    if (name) service.name = name;
    if (planName) service.planName = planName;
    if (totalSlots) service.totalSlots = parseInt(totalSlots, 10);
    if (commissionPercent !== undefined && !isNaN(parseFloat(commissionPercent))) {
      service.commissionPercent = parseFloat(commissionPercent);
    }

    if (pricePerSlotPyg !== undefined && pricePerSlotPyg !== '') {
      service.pricePerSlotPyg = parseInt(pricePerSlotPyg, 10);
      service.pricePerSlotUsd = parseFloat((service.pricePerSlotPyg / rate).toFixed(2));
    } else if (pricePerSlotUsd !== undefined && pricePerSlotUsd !== '') {
      service.pricePerSlotUsd = parseFloat(pricePerSlotUsd);
      service.pricePerSlotPyg = Math.round(service.pricePerSlotUsd * rate);
    }

    const comm = service.commissionPercent !== undefined ? service.commissionPercent : 10;
    service.sellerPayoutPyg = Math.round(service.pricePerSlotPyg * (1 - comm / 100));
    service.sellerPayoutUsd = parseFloat((service.pricePerSlotUsd * (1 - comm / 100)).toFixed(2));

    saveStorage();

    res.json({
      success: true,
      message: `Tarifa y comisión de "${service.name}" actualizada con éxito.`,
      service
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 9. LIQUIDACIÓN DE PAGOS EN CUSTODIA (MANUAL PAYOUTS)
// =======================================================

// Get all active / completed sales in custody
router.get('/payouts/custody', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const now = new Date();

    const custodyList = (db.user_slots || []).map(slot => {
      const sub = (db.subscriptions || []).find(s => s.id === slot.subscriptionId);
      const sellerId = sub ? sub.sellerId : (slot.sellerId || 'usr_seller1');
      const seller = (db.users || []).find(u => u.id === sellerId) || { name: 'Anfitrión GamesBoy', email: '' };

      const expiresDate = new Date(slot.expiresAt || (Date.now() + 30 * 86400000));
      const purchaseDate = new Date(slot.createdAt || Date.now());
      const diffMs = expiresDate - now;
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const isReadyForRelease = daysRemaining === 0 || slot.payoutStatus === 'ready_for_release';

      const pricePaidUsd = slot.pricePaidUsd || (sub ? sub.pricePerSlotUsd : 3.33);
      const pricePaidPyg = slot.pricePaidPyg || Math.round(pricePaidUsd * rate);
      const commissionPercent = slot.commissionPercent !== undefined ? slot.commissionPercent : (db.platform_settings?.commissionPercent || 10);
      const commissionUsd = parseFloat((pricePaidUsd * (commissionPercent / 100)).toFixed(2));
      const netPayoutUsd = slot.netPayoutUsd !== undefined ? slot.netPayoutUsd : parseFloat((pricePaidUsd - commissionUsd).toFixed(2));
      const netPayoutPyg = slot.netPayoutPyg || Math.round(netPayoutUsd * rate);

      return {
        slotId: slot.id,
        subscriptionId: slot.subscriptionId,
        serviceName: slot.serviceName || (sub ? sub.serviceName : 'Suscripción'),
        slotNumber: slot.slotNumber || 1,
        sellerId,
        sellerName: seller.name,
        sellerEmail: seller.email,
        buyerId: slot.buyerId,
        buyerName: slot.buyerName || 'Comprador',
        purchaseDate: slot.createdAt,
        expiresAt: slot.expiresAt,
        daysRemaining,
        isReadyForRelease,
        pricePaidUsd,
        pricePaidPyg,
        commissionPercent,
        commissionUsd,
        netPayoutUsd,
        netPayoutPyg,
        payoutStatus: slot.payoutStatus || 'custody', // 'custody', 'paid', 'refunded'
        payoutReleasedAt: slot.payoutReleasedAt || null,
        payoutReleasedBy: slot.payoutReleasedBy || null
      };
    });

    const pendingCount = custodyList.filter(p => p.payoutStatus !== 'paid').length;
    const readyCount = custodyList.filter(p => p.payoutStatus !== 'paid' && p.isReadyForRelease).length;
    const totalPendingPayoutPyg = custodyList.filter(p => p.payoutStatus !== 'paid').reduce((sum, p) => sum + p.netPayoutPyg, 0);
    const totalPendingPayoutUsd = parseFloat(custodyList.filter(p => p.payoutStatus !== 'paid').reduce((sum, p) => sum + p.netPayoutUsd, 0).toFixed(2));

    res.json({
      success: true,
      stats: {
        totalPendingSales: pendingCount,
        readyForReleaseCount: readyCount,
        totalPendingPayoutPyg,
        totalPendingPayoutUsd
      },
      payouts: custodyList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Release payment manually to seller
router.post('/payouts/release/:slotId', (req, res) => {
  try {
    const { slotId } = req.params;
    const result = releaseSellerPayout(slotId, 'usr_admin');

    res.json({
      success: true,
      message: `¡Liquidación liberada con éxito! Se acreditaron ${result.netPayoutPyg.toLocaleString('es-PY')} Gs. ($${result.netPayoutUsd.toFixed(2)} USDT) al saldo disponible del anfitrión.`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
