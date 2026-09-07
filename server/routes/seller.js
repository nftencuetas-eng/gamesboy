import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import cryptoService from '../services/cryptoService.js';
import { getWallet } from '../services/walletService.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

// Get seller stats & listings
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

// Publish a new shared subscription
router.post('/publish', (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'] || 'usr_seller1';
    const db = getDb();
    const seller = db.users.find(u => u.id === sellerId) || { name: 'Vendedor' };

    const { serviceName, category, planName, totalSlots, pricePerSlotUsd, credentials, pins, instructions } = req.body;

    if (!serviceName || !totalSlots || !pricePerSlotUsd || !credentials) {
      return res.status(400).json({ error: 'Por favor completa todos los campos requeridos.' });
    }

    const newSub = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sellerId,
      sellerName: seller.name,
      isOfficial: seller.role === 'admin',
      serviceName,
      category: category || 'streaming',
      planName: planName || 'Plan Compartido',
      totalSlots: parseInt(totalSlots, 10),
      availableSlots: parseInt(totalSlots, 10),
      pricePerSlotUsd: parseFloat(pricePerSlotUsd),
      credentialsEncrypted: cryptoService.encrypt(credentials),
      pinsEncrypted: cryptoService.encrypt(typeof pins === 'object' ? JSON.stringify(pins) : pins || '{}'),
      instructions: instructions || 'Usa tu perfil asignado y no modifiques las contraseñas.',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    db.subscriptions.unshift(newSub);
    saveStorage();

    res.json({
      success: true,
      message: '¡Suscripción publicada con éxito en el catálogo de GamesBoy.net!',
      subscription: newSub
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request payout / withdrawal
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
