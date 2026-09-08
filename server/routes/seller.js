import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import cryptoService from '../services/cryptoService.js';
import { getWallet } from '../services/walletService.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

// Seed initial verified reviews if empty
function ensureSeedReviews(db) {
  if (!db.seller_reviews) {
    db.seller_reviews = [
      {
        id: 'rev_1',
        sellerId: 'usr_seller1',
        buyerId: 'usr_client1',
        buyerName: 'Lucas González',
        buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Excelente servicio con Netflix 4K. Mi perfil tiene su propio PIN y funciona perfecto en mi Smart TV sin caídas. Recomendado al 100% 🔥',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'rev_2',
        sellerId: 'usr_seller1',
        buyerId: 'usr_client2',
        buyerName: 'María López',
        buyerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Activación inmediata y muy buena atención en el chat del grupo. Renuevo mes a mes sin problemas.',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'rev_3',
        sellerId: 'usr_admin',
        buyerId: 'usr_client1',
        buyerName: 'Lucas González',
        buyerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Cuentas oficiales de GamesBoy con garantía total de 30 días. La mejor plataforma de Paraguay.',
        createdAt: new Date(Date.now() - 43200000).toISOString()
      }
    ];
    saveStorage();
  }
}

// 1. GET PUBLIC SELLER PROFILE WITH ACTIVE SERVICES & TWEET-STYLE REVIEWS
router.get('/public/:id', (req, res) => {
  try {
    const sellerId = req.params.id;
    const db = getDb();
    ensureSeedReviews(db);

    const user = db.users.find(u => u.id === sellerId);
    if (!user) {
      return res.status(404).json({ error: 'Vendedor no encontrado.' });
    }

    const isOfficial = user.role === 'admin' || sellerId === 'usr_admin';
    const listings = db.subscriptions.filter(s => s.sellerId === sellerId && s.status === 'active');
    
    // Calculate total sold slots
    let totalSoldSlots = 0;
    listings.forEach(l => {
      totalSoldSlots += (l.totalSlots - l.availableSlots);
    });

    // Reviews for this seller
    const reviews = db.seller_reviews.filter(r => r.sellerId === sellerId);
    const avgScore = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    // Map public listings
    const publicListings = listings.map(l => {
      const services = db.streaming_services || [];
      const cleanKey = (l.serviceName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cfg = services.find(s => {
        const sId = (s.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const sName = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return sId === cleanKey || sName === cleanKey || sId.includes(cleanKey) || cleanKey.includes(sId) || sName.includes(cleanKey) || cleanKey.includes(sName);
      });
      const maxSlots = cfg ? (cfg.maxSlots || 5) : 5;
      const effectiveTotalSlots = Math.max(l.totalSlots || 0, maxSlots);
      const effectiveAvailSlots = l.availableSlots !== undefined ? Math.min(l.availableSlots, effectiveTotalSlots) : effectiveTotalSlots;

      return {
        id: l.id,
        serviceName: l.serviceName,
        category: l.category || 'streaming',
        planName: l.planName || 'Plan Compartido',
        totalSlots: effectiveTotalSlots,
        availableSlots: effectiveAvailSlots,
        occupiedSlots: effectiveTotalSlots - effectiveAvailSlots,
        pricePerSlotUsd: l.pricePerSlotUsd,
        pricePerSlotPyg: convertFromUsd(l.pricePerSlotUsd, 'PYG'),
        instructions: l.instructions || 'Perfil privado exclusivo con PIN personal.',
        createdAt: l.createdAt
      };
    });

    res.json({
      success: true,
      seller: {
        id: user.id,
        name: user.name,
        avatar: user.avatar || '/assets/branding/icon.png',
        role: user.role,
        isOfficial,
        badge: isOfficial ? '🛡️ Tienda Oficial GamesBoy' : '⭐ Anfitrión Verificado',
        memberSince: 'Enero 2025',
        stats: {
          activeListings: listings.length,
          totalSoldSlots: isOfficial ? totalSoldSlots + 42 : totalSoldSlots + 8,
          rating: avgScore,
          totalReviews: reviews.length
        }
      },
      listings: publicListings,
      reviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for `/api/sellers/:id`
router.get('/:id', (req, res, next) => {
  if (req.params.id === 'dashboard') return next();
  req.url = `/public/${req.params.id}`;
  router.handle(req, res, next);
});

// 2. POST VERIFIED BUYER REVIEW (TWEET STYLE)
router.post('/public/:id/reviews', (req, res) => {
  try {
    const sellerId = req.params.id;
    const buyerId = req.headers['x-user-id'];
    const db = getDb();
    ensureSeedReviews(db);

    if (!buyerId) {
      return res.status(401).json({ error: 'Debes iniciar sesión para valorar a un anfitrión.' });
    }

    const buyer = db.users.find(u => u.id === buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Strict Buyer Verification: Must have purchased at least 1 slot from this seller
    const sellerSubIds = db.subscriptions.filter(s => s.sellerId === sellerId).map(s => s.id);
    const hasBoughtFromSeller = db.user_slots.some(slot => {
      if (slot.buyerId !== buyerId) return false;
      return sellerSubIds.includes(slot.subscriptionId) || (sellerId === 'usr_admin');
    });

    if (!hasBoughtFromSeller) {
      return res.status(403).json({
        error: '🔒 Solo compradores verificados que hayan adquirido un servicio de este vendedor pueden dejar una reseña.'
      });
    }

    const { rating, comment } = req.body;
    const numRating = parseInt(rating, 10);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Por favor selecciona una calificación de 1 a 5 estrellas.' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Por favor escribe un comentario o reseña.' });
    }

    const newReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sellerId,
      buyerId,
      buyerName: buyer.name,
      buyerAvatar: buyer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: numRating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    db.seller_reviews.unshift(newReview);
    saveStorage();

    res.json({
      success: true,
      message: '✨ ¡Tu reseña verificada ha sido publicada con éxito!',
      review: newReview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for `/api/sellers/:id/reviews`
router.post('/:id/reviews', (req, res, next) => {
  req.url = `/public/${req.params.id}/reviews`;
  router.handle(req, res, next);
});

// 3. SELLER DASHBOARD (Internal Host view)
router.get('/dashboard', (req, res) => {
  const sellerId = req.headers['x-user-id'] || 'usr_seller1';
  const db = getDb();
  const wallet = getWallet(sellerId);

  const listings = db.subscriptions.filter(s => s.sellerId === sellerId);
  
  // Calculate total sold slots
  let totalSoldSlots = 0;
  listings.forEach(l => {
    totalSoldSlots += (l.totalSlots - l.availableSlots);
  });

  const payouts = db.payout_requests.filter(p => p.sellerId === sellerId);

  res.json({
    wallet,
    balancePyg: convertFromUsd(wallet.balanceUsd, 'PYG'),
    stats: {
      activeListings: listings.length,
      totalSoldSlots,
      commissionPercent: db.platform_settings.commissionPercent || 15
    },
    listings: listings.map(l => ({
      ...l,
      credentialsDecrypted: cryptoService.decrypt(l.credentialsEncrypted),
      pricePyg: convertFromUsd(l.pricePerSlotUsd, 'PYG')
    })),
    payouts
  });
});

// 4. PUBLISH NEW STREAMING SUBSCRIPTION
router.post('/publish', (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'] || 'usr_seller1';
    const db = getDb();
    const seller = db.users.find(u => u.id === sellerId) || { name: 'Vendedor' };
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    const { serviceName, category, planName, totalSlots, availableSlots, pricePerSlotUsd, credentials, pins, profiles, instructions } = req.body;

    if (!serviceName || !credentials) {
      return res.status(400).json({ error: 'Por favor completa todos los campos requeridos.' });
    }

    const maxCap = parseInt(totalSlots, 10) || 5;
    let availCount = availableSlots !== undefined ? parseInt(availableSlots, 10) : maxCap;
    if (isNaN(availCount) || availCount <= 0) availCount = maxCap;
    if (availCount > maxCap) availCount = maxCap;

    const finalProfiles = profiles || pins || {};
    const isUserAdmin = seller.role === 'admin';
    const subStatus = isUserAdmin ? 'active' : 'pending_approval';

    const newSub = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sellerId,
      sellerName: seller.name,
      isOfficial: isUserAdmin,
      serviceName,
      category: category || 'streaming',
      planName: planName || 'Plan Compartido',
      totalSlots: maxCap,
      availableSlots: availCount,
      pricePerSlotUsd: parseFloat(pricePerSlotUsd) || 3.99,
      credentialsEncrypted: cryptoService.encrypt(credentials),
      pinsEncrypted: cryptoService.encrypt(typeof finalProfiles === 'object' ? JSON.stringify(finalProfiles) : finalProfiles || '{}'),
      instructions: instructions || 'Usa tu perfil asignado y no modifiques las contraseñas.',
      status: subStatus,
      createdAt: new Date().toISOString()
    };

    db.subscriptions.unshift(newSub);
    saveStorage();

    const returnMsg = isUserAdmin
      ? '¡Suscripción publicada con éxito en el catálogo oficial!'
      : '¡Suscripción enviada a moderación! Será revisada y aprobada por el administrador en breve.';

    res.json({
      success: true,
      message: returnMsg,
      subscription: newSub
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.1 TOGGLE INDIVIDUAL PROFILE SLOT STATUS (Occupied vs Available)
router.post('/subscription/:id/toggle-slot', (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'] || 'usr_seller1';
    const db = getDb();
    const sub = (db.subscriptions || []).find(s => s.id === req.params.id);

    if (!sub) {
      return res.status(404).json({ error: 'Suscripción no encontrada.' });
    }

    const user = (db.users || []).find(u => u.id === sellerId);
    if (sub.sellerId !== sellerId && user?.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para modificar esta cuenta.' });
    }

    const { slotNumber, status } = req.body;
    const slotIdx = String(slotNumber || '1');
    const targetStatus = status === 'occupied' ? 'occupied' : 'available';

    // Check if slot has an active paid subscriber
    const activeBuyer = (db.user_slots || []).find(us => us.subscriptionId === sub.id && String(us.slotNumber) === slotIdx && us.status === 'active');
    if (activeBuyer && targetStatus === 'available') {
      return res.status(400).json({
        error: `El cupo #${slotIdx} está asignado a un comprador activo (${activeBuyer.userId}). No puede liberarse mientras esté en uso.`
      });
    }

    // Decrypt and update profile dict
    let profilesDict = {};
    try {
      const dec = cryptoService.decrypt(sub.pinsEncrypted || '');
      profilesDict = typeof dec === 'string' ? JSON.parse(dec) : (dec || {});
    } catch (e) {
      profilesDict = {};
    }

    if (!profilesDict[slotIdx]) {
      profilesDict[slotIdx] = { name: `Perfil ${slotIdx}`, pin: '', status: targetStatus };
    } else if (typeof profilesDict[slotIdx] === 'object') {
      profilesDict[slotIdx].status = targetStatus;
    } else {
      profilesDict[slotIdx] = { name: `Perfil ${slotIdx}`, pin: String(profilesDict[slotIdx]), status: targetStatus };
    }

    // Recalculate available slots
    let availCount = 0;
    for (let i = 1; i <= sub.totalSlots; i++) {
      const p = profilesDict[String(i)];
      if (!p || (typeof p === 'object' && p.status !== 'occupied')) {
        availCount++;
      }
    }

    sub.availableSlots = Math.max(0, Math.min(availCount, sub.totalSlots));
    sub.pinsEncrypted = cryptoService.encrypt(JSON.stringify(profilesDict));
    saveStorage();

    res.json({
      success: true,
      message: `Cupo #${slotIdx} marcado como ${targetStatus === 'occupied' ? 'Ocupado' : 'Disponible'}.`,
      subscription: {
        ...sub,
        credentialsDecrypted: cryptoService.decrypt(sub.credentialsEncrypted),
        pinsDecrypted: profilesDict
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4.2 SAFE REMOVAL / WITHDRAWAL OF HOST SUBSCRIPTION
router.delete('/subscription/:id', (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'] || 'usr_seller1';
    const db = getDb();
    const idx = (db.subscriptions || []).findIndex(s => s.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Suscripción no encontrada.' });
    }

    const sub = db.subscriptions[idx];
    const user = (db.users || []).find(u => u.id === sellerId);
    if (sub.sellerId !== sellerId && user?.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para retirar esta cuenta.' });
    }

    // Verify if there are ANY active paid subscribers
    const activeBuyers = (db.user_slots || []).filter(us => us.subscriptionId === sub.id && us.status === 'active');
    const activeEscrows = (db.subscription_escrow || []).filter(e => e.subscriptionId === sub.id && e.status === 'active');
    const activeCount = Math.max(activeBuyers.length, activeEscrows.length);

    if (activeCount > 0) {
      return res.status(400).json({
        error: `⚠️ No puedes retirar esta cuenta porque tiene ${activeCount} suscriptor(es) activo(s) con membresía vigente. Debes esperar a que concluyan los 30 días de su ciclo o contactar con Soporte de Administración.`
      });
    }

    const removed = db.subscriptions.splice(idx, 1)[0];
    saveStorage();

    res.json({
      success: true,
      message: `La cuenta "${removed.serviceName}" ha sido retirada exitosamente.`,
      subscriptionId: sub.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. REQUEST PAYOUT / WITHDRAWAL
router.post('/payout-request', (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'] || 'usr_seller1';
    const db = getDb();
    const seller = db.users.find(u => u.id === sellerId) || { name: 'Vendedor' };
    const wallet = getWallet(sellerId);
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    const { amountPyg, amountUsd, method, accountDetails } = req.body;
    let finalAmountUsd = 0;
    let finalAmountPyg = 0;

    if (amountPyg) {
      finalAmountPyg = parseFloat(amountPyg);
      finalAmountUsd = parseFloat((finalAmountPyg / rate).toFixed(2));
    } else if (amountUsd) {
      finalAmountUsd = parseFloat(amountUsd);
      finalAmountPyg = Math.round(finalAmountUsd * rate);
    }

    if (!finalAmountUsd || finalAmountUsd <= 0 || finalAmountUsd > wallet.balanceUsd) {
      const maxPyg = Math.round(wallet.balanceUsd * rate).toLocaleString('es-PY');
      return res.status(400).json({
        error: `Monto de retiro inválido o excede tu saldo disponible (${maxPyg} Gs. / $${wallet.balanceUsd.toFixed(2)} USDT).`
      });
    }

    // Deduct available balance
    wallet.balanceUsd = parseFloat((wallet.balanceUsd - finalAmountUsd).toFixed(2));

    const payout = {
      id: `payout_${Date.now()}`,
      sellerId,
      sellerName: seller.name,
      amountUsd: finalAmountUsd,
      amountPyg: finalAmountPyg,
      method: method || 'sipap_paraguay',
      accountDetails: accountDetails || {},
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.payout_requests.unshift(payout);
    saveStorage();

    const formattedGs = finalAmountPyg.toLocaleString('es-PY');
    const msg = method === 'binance_usdt'
      ? `¡Solicitud de retiro de ${formattedGs} Gs. (~$${finalAmountUsd.toFixed(2)} USDT) enviada a Binance! Será procesada por administración.`
      : `¡Solicitud de retiro de ${formattedGs} Gs. enviada por SIPAP! Será procesada por administración.`;

    res.json({
      success: true,
      message: msg,
      payout,
      wallet
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

