import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import postgresAdapter from '../db/postgresAdapter.js';
import { getWallet } from '../services/walletService.js';
import cryptoService from '../services/cryptoService.js';

const router = Router();

// 1. Get current logged in user & wallet
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

// 2. Email & Password Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor ingresa tu correo y contraseña.' });
  }

  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    // Check in Postgres if connected
    if (postgresAdapter.isPgConnected()) {
      try {
        const pool = postgresAdapter.getPool();
        const pgUser = await pool.query('SELECT * FROM gamesboy.gb_users WHERE LOWER(email) = $1', [normalizedEmail]);
        if (pgUser.rows.length > 0) {
          user = {
            id: pgUser.rows[0].id,
            name: pgUser.rows[0].name,
            email: pgUser.rows[0].email,
            role: pgUser.rows[0].role,
            avatar: pgUser.rows[0].avatar
          };
          db.users.push(user);
        }
      } catch (e) {
        console.error('Error fetching user from Postgres:', e.message);
      }
    }
  }

  // If user doesn't exist yet, we create demo user or validate
  if (!user) {
    // Automatically create user for smooth onboard if standard customer
    const newId = 'usr_' + Date.now();
    user = {
      id: newId,
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: 'client',
      avatar: '🎮'
    };
    db.users.push(user);
    getWallet(user.id);
    saveStorage();

    if (postgresAdapter.isPgConnected()) {
      try {
        const pool = postgresAdapter.getPool();
        await pool.query(
          'INSERT INTO gamesboy.gb_users (id, name, email, role, avatar) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
          [user.id, user.name, user.email, user.role, user.avatar]
        );
        await pool.query(
          'INSERT INTO gamesboy.gb_wallets (user_id, balance_usd, pending_escrow_usd) VALUES ($1, 0, 0) ON CONFLICT (user_id) DO NOTHING',
          [user.id]
        );
      } catch (e) {
        console.error('Error saving new user in Postgres:', e.message);
      }
    }
  }

  const wallet = getWallet(user.id);
  res.json({
    success: true,
    message: `¡Bienvenido de nuevo, ${user.name}!`,
    user,
    wallet,
    token: `gb_token_${user.id}_${Date.now()}`
  });
});

// 3. User Registration
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'client' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos.' });
  }

  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  
  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ error: 'Ya existe una cuenta con este correo electrónico.' });
  }

  const newId = 'usr_' + Date.now();
  const user = {
    id: newId,
    name: name && name.trim() ? name.trim() : normalizedEmail.split('@')[0],
    email: normalizedEmail,
    role: ['seller', 'client'].includes(role) ? role : 'client',
    avatar: role === 'seller' ? '💼' : '🎮'
  };

  db.users.push(user);
  getWallet(user.id);
  saveStorage();

  if (postgresAdapter.isPgConnected()) {
    try {
      const pool = postgresAdapter.getPool();
      await pool.query(
        'INSERT INTO gamesboy.gb_users (id, name, email, role, avatar) VALUES ($1, $2, $3, $4, $5)',
        [user.id, user.name, user.email, user.role, user.avatar]
      );
      await pool.query(
        'INSERT INTO gamesboy.gb_wallets (user_id, balance_usd, pending_escrow_usd) VALUES ($1, 0, 0)',
        [user.id]
      );
    } catch (e) {
      console.error('Error registering user in Postgres:', e.message);
    }
  }

  const wallet = getWallet(user.id);
  res.json({
    success: true,
    message: '¡Cuenta creada con éxito!',
    user,
    wallet,
    token: `gb_token_${user.id}_${Date.now()}`
  });
});

// 4. Google Sign-In Integration
router.post('/google', async (req, res) => {
  const { googleUser } = req.body;
  const db = getDb();

  const email = (googleUser && googleUser.email) ? googleUser.email.toLowerCase() : `google.user_${Date.now()}@gmail.com`;
  const name = (googleUser && googleUser.name) ? googleUser.name : 'Usuario Google';
  
  let user = db.users.find(u => u.email.toLowerCase() === email);

  if (!user) {
    const newId = 'usr_g_' + Date.now();
    user = {
      id: newId,
      name,
      email,
      role: 'client',
      avatar: '🌐'
    };
    db.users.push(user);
    getWallet(user.id);
    saveStorage();

    if (postgresAdapter.isPgConnected()) {
      try {
        const pool = postgresAdapter.getPool();
        await pool.query(
          'INSERT INTO gamesboy.gb_users (id, name, email, role, avatar) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
          [user.id, user.name, user.email, user.role, user.avatar]
        );
        await pool.query(
          'INSERT INTO gamesboy.gb_wallets (user_id, balance_usd, pending_escrow_usd) VALUES ($1, 0, 0) ON CONFLICT (user_id) DO NOTHING',
          [user.id]
        );
      } catch (e) {}
    }
  }

  const wallet = getWallet(user.id);
  res.json({
    success: true,
    message: `Autenticado con Google como ${user.name}`,
    user,
    wallet,
    token: `gb_google_token_${user.id}`
  });
});

// 5. Password Recovery Request
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Ingresa tu correo para recuperar tu contraseña.' });
  }

  // Generate simulated recovery token
  const resetCode = Math.floor(100000 + Math.random() * 900000);
  console.log(`🔑 [Recuperación de Contraseña] Código enviado a ${email}: ${resetCode}`);

  res.json({
    success: true,
    message: `Hemos enviado un enlace y código de recuperación de 6 dígitos a ${email}.`,
    resetCodeHint: resetCode
  });
});

// 6. Execute Password Reset
router.post('/reset-password', (req, res) => {
  const { email, newPassword, code } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Datos incompletos.' });
  }

  res.json({
    success: true,
    message: '¡Tu contraseña ha sido actualizada con éxito! Ahora puedes iniciar sesión.'
  });
});

// 7. Switch persona / role for testing and demoing
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
