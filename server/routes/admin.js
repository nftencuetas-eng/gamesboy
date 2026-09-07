import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { approveDeposit, rejectDeposit, getWallet } from '../services/walletService.js';
import { setExchangeRate, convertFromUsd } from '../services/currencyService.js';
import cryptoService from '../services/cryptoService.js';

const router = Router();

// Get Admin Overview & Pending Items
router.get('/overview', (req, res) => {
  const db = getDb();
  const adminWallet = getWallet('usr_admin');

  const pendingDeposits = db.wallet_transactions.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingPayouts = db.payout_requests.filter(p => p.status === 'pending');

  let totalSalesVolume = 0;
  db.user_slots.forEach(s => { totalSalesVolume += s.pricePaidUsd; });
  db.user_store_orders.forEach(o => { totalSalesVolume += o.pricePaidUsd; });

  res.json({
    adminWallet,
    stats: {
      totalUsers: db.users.length,
      activeSubscriptionsCount: db.subscriptions.length,
      totalSlotsSold: db.user_slots.length,
      totalStoreOrders: db.user_store_orders.length,
      totalSalesVolumeUsd: parseFloat(totalSalesVolume.toFixed(2)),
      pendingDepositsCount: pendingDeposits.length,
      pendingPayoutsCount: pendingPayouts.length
    },
    pendingDeposits,
    pendingPayouts,
    settings: db.platform_settings
  });
});

// Approve a deposit receipt
router.post('/approve-deposit/:id', (req, res) => {
  try {
    const result = approveDeposit(req.params.id, 'usr_admin');
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const creditedGs = Math.round(result.tx.amountUsd * rate).toLocaleString('es-PY');

    // Notify connected clients via WebSocket
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'DEPOSIT_APPROVED',
            payload: {
              transactionId: req.params.id,
              userId: result.tx.userId,
              creditedGs,
              wallet: result.wallet
            }
          }));
        }
      });
    }

    res.json({
      success: true,
      message: `¡Recarga aprobada! Se acreditaron ${creditedGs} Gs. ($${result.tx.amountUsd.toFixed(2)} USDT) al saldo del usuario.`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reject a deposit receipt
router.post('/reject-deposit/:id', (req, res) => {
  try {
    const reason = req.body.reason || 'Comprobante no válido o pago no recibido';
    const tx = rejectDeposit(req.params.id, 'usr_admin', reason);

    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'DEPOSIT_REJECTED',
            payload: { transactionId: req.params.id, userId: tx.userId, reason }
          }));
        }
      });
    }

    res.json({
      success: true,
      message: 'Recarga rechazada.',
      transaction: tx
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Approve a seller payout
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

// Update platform settings (commission %, exchange rate, bank/binance details)
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

    // Broadcast settings update via WebSocket
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'PLATFORM_SETTINGS_UPDATED',
            payload: db.platform_settings
          }));
        }
      });
    }

    res.json({
      success: true,
      message: '¡Configuración de cobros, bancos y billetera guardada con éxito!',
      settings: db.platform_settings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending subscriptions submitted by sellers for admin review & testing
router.get('/pending-subscriptions', (req, res) => {
  try {
    const db = getDb();
    const pending = db.subscriptions
      .filter(s => s.status === 'pending_approval' || s.status === 'pending')
      .map(s => ({
        ...s,
        credentialsDecrypted: cryptoService.decrypt(s.credentialsEncrypted),
        pinsDecrypted: cryptoService.decrypt(s.pinsEncrypted || '')
      }));

    res.json({
      success: true,
      pendingCount: pending.length,
      subscriptions: pending
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a seller subscription after testing
router.post('/approve-subscription/:id', (req, res) => {
  try {
    const db = getDb();
    const sub = db.subscriptions.find(s => s.id === req.params.id);
    if (!sub) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }

    sub.status = 'active';
    sub.approvedAt = new Date().toISOString();
    saveStorage();

    res.json({
      success: true,
      message: `¡Suscripción "${sub.serviceName}" aprobada y publicada en la tienda!`,
      subscription: sub
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject a seller subscription
router.post('/reject-subscription/:id', (req, res) => {
  try {
    const db = getDb();
    const subIndex = db.subscriptions.findIndex(s => s.id === req.params.id);
    if (subIndex === -1) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }

    const removed = db.subscriptions.splice(subIndex, 1)[0];
    saveStorage();

    res.json({
      success: true,
      message: `Suscripción rechazada y eliminada.`,
      subscription: removed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN PRODUCT MANAGEMENT (DIGITAL GAMES & GIFT CARDS) ---

// 1. Get all store products for admin management
router.get('/products', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const products = (db.store_products || []).map(p => ({
      ...p,
      pricePyg: Math.round(p.priceUsd * rate),
      stockCount: (p.codes || []).length
    }));
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create new Product (Game or Gift Card)
router.post('/products', (req, res) => {
  try {
    const db = getDb();
    const { title, category, platform, pricePyg, priceUsd, badge, icon, coverUrl, brandTheme, description, codes } = req.body;

    if (!title || (!pricePyg && !priceUsd)) {
      return res.status(400).json({ error: 'Título y precio son obligatorios.' });
    }

    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const finalPriceUsd = priceUsd ? parseFloat(priceUsd) : parseFloat((parseFloat(pricePyg) / rate).toFixed(2));
    const codeList = Array.isArray(codes) ? codes : (typeof codes === 'string' ? codes.split('\n').map(c => c.trim()).filter(Boolean) : []);

    const newProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      category: category || 'game_key', // 'game_key' or 'gift_card'
      platform: platform || 'PS5',
      priceUsd: finalPriceUsd,
      badge: badge || 'OFICIAL',
      icon: icon || (category === 'gift_card' ? '🎁' : '🎮'),
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      brandTheme: brandTheme || '',
      description: description || 'Entrega digital inmediata de código de activación.',
      stockCount: codeList.length,
      codes: codeList,
      createdAt: new Date().toISOString()
    };

    db.store_products.unshift(newProduct);
    saveStorage();

    res.json({
      success: true,
      message: `¡Producto "${newProduct.title}" agregado al catálogo con éxito!`,
      product: newProduct
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update existing Product
router.put('/products/:id', (req, res) => {
  try {
    const db = getDb();
    const prod = db.store_products.find(p => p.id === req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { title, category, platform, pricePyg, priceUsd, badge, icon, coverUrl, brandTheme, description, codes } = req.body;
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    if (title) prod.title = title.trim();
    if (category) prod.category = category;
    if (platform) prod.platform = platform;
    if (priceUsd !== undefined) prod.priceUsd = parseFloat(priceUsd);
    else if (pricePyg !== undefined) prod.priceUsd = parseFloat((parseFloat(pricePyg) / rate).toFixed(2));
    if (badge !== undefined) prod.badge = badge;
    if (icon !== undefined) prod.icon = icon;
    if (coverUrl !== undefined) prod.coverUrl = coverUrl;
    if (brandTheme !== undefined) prod.brandTheme = brandTheme;
    if (description !== undefined) prod.description = description;
    if (codes !== undefined) {
      prod.codes = Array.isArray(codes) ? codes : codes.split('\n').map(c => c.trim()).filter(Boolean);
    }

    saveStorage();

    res.json({
      success: true,
      message: `Producto "${prod.title}" actualizado con éxito.`,
      product: prod
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete a Product
router.delete('/products/:id', (req, res) => {
  try {
    const db = getDb();
    const idx = db.store_products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const removed = db.store_products.splice(idx, 1)[0];
    saveStorage();

    res.json({
      success: true,
      message: `Producto "${removed.title}" eliminado del catálogo.`,
      product: removed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ESCROW GUARANTEE ACTIONS (RELEASE & REFUND) ---

// 5. Release Escrow payment to Seller
router.post('/release-escrow/:id', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const sub = db.subscriptions.find(s => s.id === req.params.id) || db.subscriptions[0];
    
    // Credit seller
    const sellerWallet = getWallet(sub.sellerId || 'usr_seller1');
    const netUsd = sub.pricePerSlotUsd * (1 - (db.platform_settings.commissionPercent || 15) / 100);
    sellerWallet.balanceUsd = parseFloat((sellerWallet.balanceUsd + netUsd).toFixed(2));
    saveStorage();

    const netGs = Math.round(netUsd * rate).toLocaleString('es-PY');
    res.json({
      success: true,
      message: `¡Garantía Escrow liberada! Se acreditaron ${netGs} Gs. a la billetera de ${sub.sellerName || 'Vendedor'}.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER MANAGEMENT & WALLET ADJUSTMENTS ---

// 7. Get All Users with Live Balances and Stats
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    
    const usersList = (db.users || []).map(u => {
      const wallet = getWallet(u.id);
      const ordersCount = (db.user_slots || []).filter(s => s.buyerId === u.id).length + 
                          (db.user_store_orders || []).filter(o => o.userId === u.id).length;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'client',
        avatar: u.avatar || '🎮',
        balanceUsd: wallet.balanceUsd || 0,
        balancePyg: Math.round((wallet.balanceUsd || 0) * rate),
        pendingEscrowUsd: wallet.pendingEscrowUsd || 0,
        ordersCount,
        hasPassword: !!u.hasPassword,
        createdAt: u.createdAt || new Date().toISOString()
      };
    });

    res.json({ success: true, count: usersList.length, users: usersList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Adjust User Wallet Balance (Credit / Debit by Admin)
router.post('/users/:id/adjust-balance', (req, res) => {
  try {
    const { amountPyg, amountUsd, action = 'credit', reason = 'Ajuste manual de administración' } = req.body;
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const wallet = getWallet(user.id);
    const parsedAmountUsd = amountUsd !== undefined ? parseFloat(amountUsd) : (parseFloat(amountPyg) / rate);

    if (isNaN(parsedAmountUsd) || parsedAmountUsd <= 0) {
      return res.status(400).json({ error: 'Por favor ingresa un monto válido a ajustar.' });
    }

    if (action === 'credit') {
      wallet.balanceUsd = parseFloat((wallet.balanceUsd + parsedAmountUsd).toFixed(2));
    } else {
      if (wallet.balanceUsd < parsedAmountUsd) {
        return res.status(400).json({ error: `Saldo insuficiente para debitar. El usuario tiene $${wallet.balanceUsd.toFixed(2)} USD.` });
      }
      wallet.balanceUsd = parseFloat((wallet.balanceUsd - parsedAmountUsd).toFixed(2));
    }

    const tx = {
      id: `tx_admin_adj_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: action === 'credit' ? 'deposit' : 'debit',
      amountUsd: parsedAmountUsd,
      currency: 'PYG',
      localAmount: Math.round(parsedAmountUsd * rate),
      method: 'admin_manual_adjustment',
      status: 'approved',
      reference: `ADMIN-${action.toUpperCase()}`,
      notes: reason,
      createdAt: new Date().toISOString()
    };

    db.wallet_transactions.unshift(tx);
    saveStorage();

    const formattedGs = Math.round(parsedAmountUsd * rate).toLocaleString('es-PY');
    const newBalGs = Math.round(wallet.balanceUsd * rate).toLocaleString('es-PY');

    res.json({
      success: true,
      message: `¡Saldo ${action === 'credit' ? 'acreditado' : 'debitado'} con éxito! Nuevo saldo de ${user.name}: ${newBalGs} Gs. ($${wallet.balanceUsd.toFixed(2)} USD)`,
      wallet,
      newBalGs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Update User Role (Client / Seller / Admin)
router.post('/users/:id/toggle-role', (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'seller', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Rol no válido.' });
    }

    const db = getDb();
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.role = role;
    saveStorage();

    res.json({
      success: true,
      message: `Rol de "${user.name}" actualizado a: ${role.toUpperCase()}`,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
