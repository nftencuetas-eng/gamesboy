import { getDb, saveStorage } from '../config/database.js';
import postgresAdapter from '../db/postgresAdapter.js';

export function getWallet(userId) {
  const db = getDb();
  if (!db.wallets[userId]) {
    db.wallets[userId] = { balanceUsd: 0.0, pendingEscrowUsd: 0.0 };
    saveStorage();

    if (postgresAdapter.isPgConnected()) {
      const pool = postgresAdapter.getPool();
      pool.query('SELECT * FROM gamesboy.gb_wallets WHERE user_id = $1', [userId])
        .then(res => {
          if (res.rows.length > 0) {
            db.wallets[userId] = {
              balanceUsd: parseFloat(res.rows[0].balance_usd),
              pendingEscrowUsd: parseFloat(res.rows[0].pending_escrow_usd)
            };
          }
        })
        .catch(err => console.error('Error reading wallet from Postgres:', err.message));
    }
  }
  return db.wallets[userId];
}

export function createDepositRequest(userId, userName, amountUsd, currency, localAmount, method, reference, receiptData = '') {
  const db = getDb();
  const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  
  const transaction = {
    id: txId,
    userId,
    userName,
    type: 'deposit',
    amountUsd: parseFloat(amountUsd),
    currency,
    localAmount: parseFloat(localAmount),
    method,
    status: 'pending',
    reference: reference || 'N/A',
    receiptData,
    notes: 'Recarga pendiente de verificación por el administrador',
    createdAt: new Date().toISOString()
  };

  db.wallet_transactions.unshift(transaction);
  saveStorage();

  if (postgresAdapter.isPgConnected()) {
    const pool = postgresAdapter.getPool();
    pool.query(
      `INSERT INTO gamesboy.gb_wallet_transactions (id, user_id, user_name, type, amount_usd, currency, local_amount, method, status, reference, receipt_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [txId, userId, userName, 'deposit', amountUsd, currency, localAmount, method, 'pending', reference, receiptData ? 'receipt_uploaded' : '', 'Recarga pendiente']
    ).catch(err => console.error('Error saving transaction in Postgres:', err.message));
  }

  return transaction;
}

export function approveDeposit(transactionId, adminId) {
  const db = getDb();
  const tx = db.wallet_transactions.find(t => t.id === transactionId);
  if (!tx || tx.status !== 'pending') {
    throw new Error('Transacción no encontrada o ya procesada');
  }

  tx.status = 'approved';
  tx.approvedBy = adminId;
  tx.approvedAt = new Date().toISOString();
  tx.notes = 'Recarga aprobada y saldo acreditado con éxito';

  // Credit user wallet
  const wallet = getWallet(tx.userId);
  wallet.balanceUsd = parseFloat((wallet.balanceUsd + tx.amountUsd).toFixed(2));

  saveStorage();

  if (postgresAdapter.isPgConnected()) {
    const pool = postgresAdapter.getPool();
    pool.query('UPDATE gamesboy.gb_wallets SET balance_usd = $1, updated_at = NOW() WHERE user_id = $2', [wallet.balanceUsd, tx.userId])
      .catch(err => console.error('Error updating wallet in Postgres:', err.message));
    pool.query('UPDATE gamesboy.gb_wallet_transactions SET status = $1, notes = $2 WHERE id = $3', ['approved', 'Recarga aprobada', transactionId])
      .catch(err => console.error('Error updating transaction in Postgres:', err.message));
  }

  return { tx, wallet };
}

export function rejectDeposit(transactionId, adminId, reason = 'Comprobante inválido') {
  const db = getDb();
  const tx = db.wallet_transactions.find(t => t.id === transactionId);
  if (!tx || tx.status !== 'pending') {
    throw new Error('Transacción no encontrada o ya procesada');
  }

  tx.status = 'rejected';
  tx.rejectedBy = adminId;
  tx.rejectedAt = new Date().toISOString();
  tx.notes = reason;

  saveStorage();
  return tx;
}

export function deductBalance(userId, amountUsd, description = '') {
  const wallet = getWallet(userId);
  if (wallet.balanceUsd < amountUsd) {
    throw new Error(`Saldo insuficiente. Tienes $${wallet.balanceUsd.toFixed(2)} USDT y requieres $${amountUsd.toFixed(2)} USDT.`);
  }

  wallet.balanceUsd = parseFloat((wallet.balanceUsd - amountUsd).toFixed(2));
  
  const db = getDb();
  const tx = {
    id: `tx_buy_${Date.now()}`,
    userId,
    userName: (db.users.find(u => u.id === userId) || {}).name || 'Usuario',
    type: 'purchase',
    amountUsd,
    currency: 'USDT',
    localAmount: amountUsd,
    method: 'wallet_balance',
    status: 'approved',
    reference: 'COMPRA',
    notes: description,
    createdAt: new Date().toISOString()
  };

  db.wallet_transactions.unshift(tx);
  saveStorage();
  return { wallet, tx };
}

export function creditSellerEscrow(sellerId, amountUsd, commissionPercent = 15) {
  const db = getDb();
  const commission = parseFloat((amountUsd * (commissionPercent / 100)).toFixed(2));
  const sellerNet = parseFloat((amountUsd - commission).toFixed(2));

  const sellerWallet = getWallet(sellerId);
  // Credit seller wallet balance directly or into escrow
  sellerWallet.balanceUsd = parseFloat((sellerWallet.balanceUsd + sellerNet).toFixed(2));

  const adminWallet = getWallet('usr_admin');
  adminWallet.balanceUsd = parseFloat((adminWallet.balanceUsd + commission).toFixed(2));

  saveStorage();
  return { sellerNet, commission };
}

export default {
  getWallet,
  createDepositRequest,
  approveDeposit,
  rejectDeposit,
  deductBalance,
  creditSellerEscrow
};
