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
  const settings = db.platform_settings || {};
  const rate = settings.exchangeRatePyg || 7500;
  const rates = getExchangeRates();

  res.json({
    wallet,
    balancePyg: Math.round((wallet.balanceUsd || 0) * rate),
    exchangeRatePyg: rate,
    rates,
    transactions: userTransactions,
    paymentMethods: {
      paraguay: settings.paraguayBankDetails || {
        bank: 'Banco Familiar / Itaú Paraguay',
        accountHolder: 'GamesBoy Paraguay S.A.',
        rucOrCi: '80091234-5',
        accountNumber: '01-445566-7',
        aliasSipap: 'gamesboy.py'
      },
      binance: settings.binanceDetails || {
        payId: '849201934',
        walletAddress: '0x71C9414B3b27bA134a6C3f07a757657A82e4b92F',
        network: 'USDT (Binance Pay / BEP-20 / TRC-20)',
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x71C9414B3b27bA134a6C3f07a757657A82e4b92F'
      }
    }
  });
});

// Submit a deposit request (with receipt reference or base64 receipt)
router.post('/deposit', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const db = getDb();
    const user = db.users.find(u => u.id === userId) || { name: 'Cliente' };
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    const { amount, currency, method, reference, receiptData } = req.body;

    const parsedAmt = parseFloat(amount);
    if (!parsedAmt || parsedAmt <= 0) {
      return res.status(400).json({ error: 'Por favor ingresa un monto válido a recargar.' });
    }

    let amountUsd = parsedAmt;
    let localAmount = parsedAmt;

    if (currency === 'USDT' || currency === 'USD') {
      amountUsd = parsedAmt;
      localAmount = Math.round(parsedAmt * rate);
    } else { // Guaraníes (PYG / Gs.)
      localAmount = parsedAmt;
      amountUsd = parseFloat((parsedAmt / rate).toFixed(2));
    }

    const tx = createDepositRequest(
      userId,
      user.name || 'Cliente',
      amountUsd,
      currency === 'USDT' ? 'USDT' : 'PYG',
      localAmount,
      method || (currency === 'USDT' ? 'binance_usdt' : 'sipap_paraguay'),
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

    const formattedGs = localAmount.toLocaleString('es-PY');
    res.json({
      success: true,
      message: `¡Comprobante recibido con éxito! Una vez verificado por administración, se acreditarán ${formattedGs} Gs. en tu cuenta.`,
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
