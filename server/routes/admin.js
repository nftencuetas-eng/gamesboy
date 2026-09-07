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

export default router;
