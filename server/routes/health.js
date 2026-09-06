import { Router } from 'express';
import { getDb } from '../config/database.js';
import postgresAdapter from '../db/postgresAdapter.js';
import config from '../config/env.js';

const router = Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  const db = getDb();
  const pgActive = postgresAdapter.isPgConnected();

  res.json({
    status: 'ok',
    app: config.appName,
    domain: config.appDomain,
    environment: config.nodeEnv,
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
      activeSubscriptions: db.subscriptions.length,
      storeProducts: db.store_products.length,
      usersCount: db.users.length,
      commissionPercent: db.platform_settings.commissionPercent,
      exchangeRatePyg: db.platform_settings.exchangeRatePyg
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    }
  });
});

export default router;
