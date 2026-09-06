import { Router } from 'express';
import { getDb } from '../config/database.js';
import { getWallet, createDepositRequest } from '../services/walletService.js';
import { convertToUsd, convertFromUsd, getExchangeRates } from '../services/currencyService.js';

const router = Router();

// Get user balance and transactions
router.get('/balance', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_client1';
  const wallet = getWallet(userId);
  const db = getDb();
  
  const userTransactions = db.wallet_transactions.filter(t => t.userId === userId);
  const settings = db.platform_settings;
  const rates = getExchangeRates();

  res.json({
    wallet,
    balancePyg: convertFromUsd(wallet.balanceUsd, 'PYG'),
    rates,
    transactions: userTransactions,
    paymentMethods: {
      paraguay: settings.paraguayBankDetails,
      binance: settings.binanceDetails
    }
  });
});

// Submit a deposit request (with receipt reference or base64 receipt)
router.post('/deposit', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const db = getDb();
    const user = db.users.find(u => u.id === userId) || { name: 'Cliente' };

    const { amount, currency, method, reference, receiptData } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    let amountUsd = parseFloat(amount);
    let localAmount = parseFloat(amount);

    if (currency === 'PYG') {
      amountUsd = convertToUsd(localAmount, 'PYG');
    } else {
      localAmount = convertFromUsd(amountUsd, 'PYG');
    }

    const tx = createDepositRequest(
      userId,
      user.name,
      amountUsd,
      currency || 'PYG',
      localAmount,
      method || 'sipap_paraguay',
      reference || 'Comprobante subido',
      receiptData || ''
    );

    // Notify connected admins via WebSocket if available
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'NEW_DEPOSIT_REQUEST',
            payload: tx
          }));
        }
      });
    }

    res.json({
      success: true,
      message: 'Comprobante de recarga recibido. Acreditaremos tu saldo una vez verificado.',
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
