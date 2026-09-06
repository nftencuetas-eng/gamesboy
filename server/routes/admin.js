import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { approveDeposit, rejectDeposit, getWallet } from '../services/walletService.js';
import { setExchangeRate, convertFromUsd } from '../services/currencyService.js';

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
    res.json({
      success: true,
      message: `¡Recarga de $${result.tx.amountUsd.toFixed(2)} USDT (${convertFromUsd(result.tx.amountUsd, 'PYG').toLocaleString()} ₲) aprobada!`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reject a deposit receipt
router.post('/reject-deposit/:id', (req, res) => {
  try {
    const reason = req.body.reason || 'Comprobante no válido';
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

    res.json({
      success: true,
      message: `Retiro de $${payout.amountUsd} completado exitosamente.`,
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

    if (commissionPercent !== undefined) {
      db.platform_settings.commissionPercent = parseFloat(commissionPercent);
    }
    if (exchangeRatePyg !== undefined) {
      const rate = parseFloat(exchangeRatePyg);
      db.platform_settings.exchangeRatePyg = rate;
      setExchangeRate('PYG', rate);
    }
    if (paraguayBankDetails) {
      db.platform_settings.paraguayBankDetails = { ...db.platform_settings.paraguayBankDetails, ...paraguayBankDetails };
    }
    if (binanceDetails) {
      db.platform_settings.binanceDetails = { ...db.platform_settings.binanceDetails, ...binanceDetails };
    }

    saveStorage();

    res.json({
      success: true,
      message: 'Configuraciones de la plataforma actualizadas exitosamente.',
      settings: db.platform_settings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
