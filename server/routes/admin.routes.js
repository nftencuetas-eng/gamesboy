import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { query, isDbConnected } from '../config/db.js';
import { creditWallet } from '../services/wallet.service.js';

const router = express.Router();

// Require admin authentication for all admin routes
router.use(requireAuth, requireAdmin);

router.get('/metrics', async (req, res) => {
  try {
    if (isDbConnected()) {
      const usersCount = await query('SELECT COUNT(*) FROM gb_users');
      const productsCount = await query('SELECT COUNT(*) FROM gb_products WHERE is_active = TRUE');
      const ordersCount = await query('SELECT COUNT(*) FROM gb_orders');
      const volumeUsd = await query('SELECT COALESCE(SUM(total_usd), 0) as total FROM gb_orders WHERE status = \'COMPLETED\'');
      const pendingDeposits = await query('SELECT COUNT(*) FROM gb_wallet_transactions WHERE type = \'DEPOSIT\' AND status = \'PENDING\'');

      return res.json({
        success: true,
        metrics: {
          totalUsers: parseInt(usersCount.rows[0].count, 10),
          totalProducts: parseInt(productsCount.rows[0].count, 10),
          totalOrders: parseInt(ordersCount.rows[0].count, 10),
          totalVolumeUsd: parseFloat(volumeUsd.rows[0].total) || 0,
          pendingDeposits: parseInt(pendingDeposits.rows[0].count, 10),
          exchangeRatePyg: 7800
        }
      });
    }

    // Default standalone metrics
    res.json({
      success: true,
      metrics: {
        totalUsers: 142,
        totalProducts: 24,
        totalOrders: 389,
        totalVolumeUsd: 18450.00,
        pendingDeposits: 3,
        exchangeRatePyg: 7800
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await query(`
        SELECT u.id, u.email, u.role, u.full_name, u.is_active, u.created_at,
               COALESCE(w.balance_usd, 0) as balance_usd,
               COALESCE(w.balance_pyg, 0) as balance_pyg,
               COALESCE(w.is_frozen, FALSE) as is_frozen
        FROM gb_users u
        LEFT JOIN gb_wallets w ON w.user_id = u.id
        ORDER BY u.id DESC
      `);
      return res.json({ success: true, users: users.rows });
    }

    res.json({
      success: true,
      users: [
        { id: 1, email: 'admin@gamesboy.net', role: 'ADMIN', full_name: 'Master Admin', balance_usd: 1500.00, balance_pyg: 11700000, is_active: true, is_frozen: false },
        { id: 2, email: 'seller_pro@gamesboy.net', role: 'SELLER', full_name: 'Gaming Store Paraguay', balance_usd: 620.00, balance_pyg: 4836000, is_active: true, is_frozen: false },
        { id: 3, email: 'cliente_asuncion@gmail.com', role: 'CLIENT', full_name: 'Carlos Benítez', balance_usd: 45.00, balance_pyg: 351000, is_active: true, is_frozen: false }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/deposits/approve', async (req, res) => {
  try {
    const { userId, amountUsd, amountPyg, referenceId } = req.body;
    if (!userId || !amountUsd) {
      return res.status(400).json({ success: false, error: 'Datos de acreditación incompletos.' });
    }

    const result = await creditWallet({
      userId: Number(userId),
      amountUsd: Number(amountUsd),
      amountPyg: Number(amountPyg) || Number(amountUsd) * 7800,
      description: `Depósito aprobado por el Administrador (#${referenceId || 'MANUAL'})`,
      referenceId
    });

    res.json({ success: true, message: 'Depósito acreditado exitosamente.', data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM gb_platform_settings');
      const settings = {};
      rows.rows.forEach(r => { settings[r.key] = r.value; });
      return res.json({ success: true, settings });
    }

    res.json({
      success: true,
      settings: {
        exchange_rate_pyg: '7800',
        platform_commission_pct: '10',
        support_whatsapp: '+595981000000',
        maintenance_mode: 'false'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
