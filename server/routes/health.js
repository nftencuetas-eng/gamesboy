import { Router } from 'express';
import { getDb } from '../config/database.js';
import postgresAdapter from '../db/postgresAdapter.js';
import config from '../config/env.js';

const router = Router();
const startTime = Date.now();

router.get(['/', '/health'], (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  let db = {};
  try {
    db = getDb() || {};
  } catch (e) {}
  const pgActive = postgresAdapter.isPgConnected();

  res.status(200).json({
    status: 'ok',
    app: config.appName || 'GamesBoy',
    domain: config.appDomain || 'gamesboy.net',
    environment: config.nodeEnv || 'production',
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    database: {
      type: pgActive ? 'postgresql_supabase' : 'local_json_resilient',
      connected: true,
      isolatedSchema: 'gamesboy',
      tablePrefix: 'gb_',
      sharedClusterSafe: true
    },
    marketplace: {
      activeSubscriptions: db.subscriptions?.length || 0,
      storeProducts: db.store_products?.length || 0,
      usersCount: db.users?.length || 0,
      commissionPercent: db.platform_settings?.commissionPercent || 15,
      exchangeRatePyg: db.platform_settings?.exchangeRatePyg || 7500
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    }
  });
});

export default router;

