import { Router } from 'express';
import config from '../config/env.js';
import { getDbStatus } from '../config/database.js';

const router = Router();

// Platform meta and status
router.get('/info', (req, res) => {
  res.json({
    name: config.appName,
    domain: config.appDomain,
    version: '1.0.0',
    description: 'GamesBoy.net Platform Core Engine',
    database: getDbStatus(),
    features: {
      webSockets: true,
      restApi: true,
      databaseIntegration: true,
      modularArchitecture: true
    }
  });
});

export default router;
