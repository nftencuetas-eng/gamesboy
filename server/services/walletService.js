import { getDb, saveStorage } from '../config/database.js';

export function getWallet(userId) {
  const db = getDb();
  if (!db.wallets[userId]) {
    db.wallets[userId] = { balanceUsd: 0.0, pendingEscrowUsd: 0.0 };
    saveStorage();
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
