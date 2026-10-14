import { getPool, query, isDbConnected } from '../config/db.js';

// Fallback memory ledger
const memoryLedger = [];

export async function getWalletBalance(userId) {
  if (isDbConnected()) {
    const res = await query(
      `SELECT id, user_id, balance_usd, balance_pyg, is_frozen, updated_at
       FROM gb_wallets WHERE user_id = $1`,
      [userId]
    );
    if (res.rows.length === 0) {
      // Auto-create wallet if missing
      const ins = await query(
        `INSERT INTO gb_wallets (user_id, balance_usd, balance_pyg)
         VALUES ($1, 0, 0) RETURNING *`,
        [userId]
      );
      return ins.rows[0];
    }
    return res.rows[0];
  }

  return {
    id: userId,
    user_id: userId,
    balance_usd: 1500.00,
    balance_pyg: 11700000,
    is_frozen: false
  };
}

export async function getWalletTransactions(userId, limit = 50) {
  if (isDbConnected()) {
    const res = await query(
      `SELECT t.*
       FROM gb_wallet_transactions t
       JOIN gb_wallets w ON w.id = t.wallet_id
       WHERE w.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }

  return memoryLedger.filter(tx => tx.userId === userId);
}

// Atomic deposit credit
export async function creditWallet({ userId, amountUsd, amountPyg, description, referenceId }) {
  if (amountUsd <= 0 && amountPyg <= 0) {
    throw new Error('El monto a acreditar debe ser mayor a cero.');
  }

  if (isDbConnected()) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock wallet row for update
      const walletRes = await client.query(
        'SELECT * FROM gb_wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      if (walletRes.rows.length === 0) {
        throw new Error('Billetera no encontrada para el usuario.');
      }

      const wallet = walletRes.rows[0];
      if (wallet.is_frozen) {
        throw new Error('La billetera se encuentra congelada. Operación rechazada.');
      }

      const newBalUsd = Number(wallet.balance_usd) + Number(amountUsd);
      const newBalPyg = Number(wallet.balance_pyg) + Number(amountPyg);

      await client.query(
        `UPDATE gb_wallets
         SET balance_usd = $1, balance_pyg = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newBalUsd, newBalPyg, wallet.id]
      );

      const txRes = await client.query(
        `INSERT INTO gb_wallet_transactions
         (wallet_id, type, amount_usd, amount_pyg, balance_after_usd, balance_after_pyg, status, description, reference_id)
         VALUES ($1, 'DEPOSIT', $2, $3, $4, $5, 'COMPLETED', $6, $7)
         RETURNING *`,
        [wallet.id, amountUsd, amountPyg, newBalUsd, newBalPyg, description || 'Depósito acreditado', referenceId || null]
      );

      await client.query('COMMIT');
      return { wallet: { balance_usd: newBalUsd, balance_pyg: newBalPyg }, transaction: txRes.rows[0] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Memory fallback
  const tx = {
    id: memoryLedger.length + 1,
    userId,
    type: 'DEPOSIT',
    amount_usd: amountUsd,
    amount_pyg: amountPyg,
    status: 'COMPLETED',
    description: description || 'Depósito simulado',
    created_at: new Date()
  };
  memoryLedger.unshift(tx);
  return { wallet: { balance_usd: 1500 + amountUsd, balance_pyg: 11700000 + amountPyg }, transaction: tx };
}

// Atomic purchase debit
export async function debitWallet({ userId, amountUsd, amountPyg, description, referenceId }) {
  if (amountUsd <= 0 && amountPyg <= 0) {
    throw new Error('Monto de compra inválido.');
  }

  if (isDbConnected()) {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const walletRes = await client.query(
        'SELECT * FROM gb_wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      if (walletRes.rows.length === 0) {
        throw new Error('Billetera de usuario no encontrada.');
      }

      const wallet = walletRes.rows[0];
      if (wallet.is_frozen) {
        throw new Error('Billetera congelada. No se permiten consumos.');
      }

      if (Number(wallet.balance_usd) < Number(amountUsd)) {
        throw new Error(`Saldo insuficiente en USD. Saldo actual: $${wallet.balance_usd}`);
      }

      const newBalUsd = Number(wallet.balance_usd) - Number(amountUsd);
      const newBalPyg = Math.max(0, Number(wallet.balance_pyg) - Number(amountPyg));

      await client.query(
        `UPDATE gb_wallets
         SET balance_usd = $1, balance_pyg = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newBalUsd, newBalPyg, wallet.id]
      );

      const txRes = await client.query(
        `INSERT INTO gb_wallet_transactions
         (wallet_id, type, amount_usd, amount_pyg, balance_after_usd, balance_after_pyg, status, description, reference_id)
         VALUES ($1, 'PURCHASE', $2, $3, $4, $5, 'COMPLETED', $6, $7)
         RETURNING *`,
        [wallet.id, -amountUsd, -amountPyg, newBalUsd, newBalPyg, description || 'Compra de juego / servicio', referenceId || null]
      );

      await client.query('COMMIT');
      return { wallet: { balance_usd: newBalUsd, balance_pyg: newBalPyg }, transaction: txRes.rows[0] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  return { wallet: { balance_usd: 1450.00, balance_pyg: 11310000 } };
}
