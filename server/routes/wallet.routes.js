import express from 'express';
import { getWalletBalance, getWalletTransactions, creditWallet, debitWallet } from '../services/wallet.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/balance', requireAuth, async (req, res) => {
  try {
    const wallet = await getWalletBalance(req.user.id);
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const transactions = await getWalletTransactions(req.user.id, limit);
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User initiates a deposit request (e.g. via Bancard / Transferencia / USDT)
router.post('/deposit-request', requireAuth, async (req, res) => {
  try {
    const { amountUsd, amountPyg, paymentMethod, comprobanteRef } = req.body;
    if (!amountUsd || amountUsd <= 0) {
      return res.status(400).json({ success: false, error: 'Monto de depósito inválido.' });
    }
    // In production, this records a PENDING deposit awaiting admin approval
    res.json({
      success: true,
      message: 'Solicitud de depósito recibida. En verificación por el administrador.',
      deposit: {
        userId: req.user.id,
        amountUsd,
        amountPyg,
        paymentMethod,
        comprobanteRef,
        status: 'PENDING',
        createdAt: new Date()
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
