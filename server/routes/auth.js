import { Router } from 'express';
import { getDb } from '../config/database.js';
import { getWallet } from '../services/walletService.js';

const router = Router();

// Current simulated user or switch persona
router.get('/me', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_client1';
  const db = getDb();
  let user = db.users.find(u => u.id === userId);
  
  if (!user) {
    user = db.users[0];
  }

  const wallet = getWallet(user.id);
  res.json({
    user,
    wallet,
    availableUsers: db.users
  });
});

// Switch persona / role for testing and demoing
router.post('/switch-role', (req, res) => {
  const { role } = req.body;
  const db = getDb();
  const target = db.users.find(u => u.role === role) || db.users[0];
  const wallet = getWallet(target.id);
  
  res.json({
    success: true,
    user: target,
    wallet
  });
});

export default router;
