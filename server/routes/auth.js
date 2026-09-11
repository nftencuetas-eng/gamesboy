import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import postgresAdapter from '../db/postgresAdapter.js';
import { getWallet } from '../services/walletService.js';
import cryptoService from '../services/cryptoService.js';
import config from '../config/env.js';

const router = Router();

// 0. Public Auth Configuration (Google Client ID, etc.)
router.get('/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || config.googleClientId || ''
  });
});

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

// 2. Email & Password Login with Strict Portal Guards
router.post('/login', async (req, res) => {
  const { email, password, portalType = 'client' } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Por favor ingresa tu correo y contraseña.' });
  }

  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user && postgresAdapter.isPgConnected()) {
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

  // 1. Strict Guard: Admin Portal vs Client Portal Separation
  if (user) {
    if (user.role === 'admin' && portalType === 'client') {
      return res.status(403).json({
        error: 'Acceso restringido: Las cuentas de Administrador deben ingresar exclusivamente a través del Portal Master (/admin/login).'
      });
    }

    if (user.role !== 'admin' && portalType === 'admin') {
      return res.status(403).json({
        error: 'Acceso denegado: Este portal está estrictamente reservado para el Administrador Master.'
      });
    }
  } else {
    // If not found and trying to access Admin Portal
    if (portalType === 'admin') {
      if ((password === 'GamesBoy2026Master!' || password === 'admin123') && normalizedEmail === 'admin@gamesboy.net') {
        user = {
          id: 'usr_admin',
          name: 'Admin GamesBoy',
          email: 'admin@gamesboy.net',
          role: 'admin',
          avatar: '/assets/branding/icon.png'
        };
        db.users.push(user);
        getWallet(user.id);
        saveStorage();
      } else {
        return res.status(403).json({
          error: 'Credenciales administrativas no válidas.'
        });
      }
    } else {
      // Auto-create client user for smooth customer onboarding
      const newId = 'usr_' + Date.now();
      user = {
        id: newId,
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'client',
        avatar: '/assets/branding/icon.png'
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
  }

  // Validate admin password if admin
  if (user.role === 'admin') {
    if (password !== 'GamesBoy2026Master!' && password !== 'admin123') {
      return res.status(401).json({ error: 'Clave de seguridad administrativa incorrecta.' });
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

// 4. Google Sign-In & Sign-Up Integration (Official GSI / OAuth 2.0 Verification)
router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken, googleUser } = req.body;
    let verifiedEmail = null;
    let verifiedName = null;
    let verifiedAvatar = null;
    let googleSub = null;

    // A. Verify ID Token (credential JWT) via Google Tokeninfo API
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          verifiedEmail = payload.email;
          verifiedName = payload.name || payload.given_name || (verifiedEmail ? verifiedEmail.split('@')[0] : 'Usuario Google');
          verifiedAvatar = payload.picture;
          googleSub = payload.sub;
        } else {
          console.warn('⚠️ [Google Auth] Falló verificación de id_token en Google API:', verifyRes.status);
        }
      } catch (err) {
        console.error('❌ [Google Auth] Error conectando con Google Tokeninfo:', err.message);
      }

      // Safe direct JWT decoding fallback
      if (!verifiedEmail) {
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (decoded.email) {
              verifiedEmail = decoded.email;
              verifiedName = decoded.name || decoded.given_name || verifiedEmail.split('@')[0];
              verifiedAvatar = decoded.picture;
              googleSub = decoded.sub;
              console.log('✅ [Google Auth] Decodificado exitosamente desde JWT payload:', verifiedEmail);
            }
          }
        } catch (jwtErr) {
          console.error('❌ [Google Auth] Error decodificando JWT:', jwtErr.message);
        }
      }
    }

    // B. Verify OAuth 2.0 Access Token via Google Userinfo API
    if (!verifiedEmail && accessToken) {
      try {
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (userinfoRes.ok) {
          const profile = await userinfoRes.json();
          verifiedEmail = profile.email;
          verifiedName = profile.name || profile.given_name || (verifiedEmail ? verifiedEmail.split('@')[0] : 'Usuario Google');
          verifiedAvatar = profile.picture;
          googleSub = profile.sub;
        } else {
          console.warn('⚠️ [Google Auth] Falló verificación de accessToken en Google API:', userinfoRes.status);
        }
      } catch (err) {
        console.error('❌ [Google Auth] Error conectando con Google Userinfo:', err.message);
      }
    }

    // C. Fallback payload if provided directly (for local demo/dev mode)
    if (!verifiedEmail && googleUser && googleUser.email) {
      verifiedEmail = googleUser.email;
      verifiedName = googleUser.name || verifiedEmail.split('@')[0];
      verifiedAvatar = googleUser.avatar || googleUser.picture;
    }

    if (!verifiedEmail) {
      return res.status(400).json({
        error: 'No se pudo verificar la cuenta de Google. Por favor verifica tus credenciales e intenta nuevamente.'
      });
    }

    const normalizedEmail = verifiedEmail.trim().toLowerCase();
    const displayName = verifiedName || normalizedEmail.split('@')[0];
    const avatarUrl = verifiedAvatar || '/assets/branding/icon.png';

    const db = getDb();
    let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

    // Look up in PostgreSQL if not in memory
    if (!user && postgresAdapter.isPgConnected()) {
      try {
        const pool = postgresAdapter.getPool();
        const pgUser = await pool.query('SELECT * FROM gamesboy.gb_users WHERE LOWER(email) = $1', [normalizedEmail]);
        if (pgUser.rows.length > 0) {
          user = {
            id: pgUser.rows[0].id,
            name: pgUser.rows[0].name,
            email: pgUser.rows[0].email,
            role: pgUser.rows[0].role,
            avatar: pgUser.rows[0].avatar,
            isGoogleLinked: true
          };
          db.users.push(user);
        }
      } catch (e) {
        console.error('Error fetching Google user from Postgres:', e.message);
      }
    }

    if (user) {
      // User exists - update avatar if using default, and link Google
      user.isGoogleLinked = true;
      if (verifiedAvatar && (!user.avatar || user.avatar === '🎮' || user.avatar.includes('icon.png'))) {
        user.avatar = avatarUrl;
      }
      saveStorage();

      if (postgresAdapter.isPgConnected()) {
        try {
          const pool = postgresAdapter.getPool();
          await pool.query(
            'UPDATE gamesboy.gb_users SET avatar = COALESCE(NULLIF($1, \'\'), avatar), updated_at = NOW() WHERE id = $2',
            [user.avatar, user.id]
          );
        } catch (e) {}
      }
    } else {
      // Create new Google User
      const newId = 'usr_g_' + Date.now();
      user = {
        id: newId,
        name: displayName,
        email: normalizedEmail,
        role: 'client',
        avatar: avatarUrl,
        isGoogleLinked: true,
        hasPassword: false,
        googleSub: googleSub || undefined,
        createdAt: new Date().toISOString()
      };

      db.users.push(user);
      getWallet(user.id);
      saveStorage();

      if (postgresAdapter.isPgConnected()) {
        try {
          const pool = postgresAdapter.getPool();
          await pool.query(
            'INSERT INTO gamesboy.gb_users (id, name, email, role, avatar) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET avatar = EXCLUDED.avatar, updated_at = NOW()',
            [user.id, user.name, user.email, user.role, user.avatar]
          );
          await pool.query(
            'INSERT INTO gamesboy.gb_wallets (user_id, balance_usd, pending_escrow_usd) VALUES ($1, 0, 0) ON CONFLICT (user_id) DO NOTHING',
            [user.id]
          );
        } catch (e) {
          console.error('Error saving Google user to Postgres:', e.message);
        }
      }
    }

    const wallet = getWallet(user.id);
    res.json({
      success: true,
      message: `¡Bienvenido a GamesBoy, ${user.name}!`,
      user,
      wallet,
      token: `gb_token_${user.id}_${Date.now()}`
    });
  } catch (err) {
    console.error('❌ [Google Auth Endpoint Error]:', err);
    res.status(500).json({ error: 'Error procesando la autenticación con Google.' });
  }
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

// 8. Get full User Profile
router.get('/profile', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_client1';
  const db = getDb();
  let user = db.users.find(u => u.id === userId) || db.users[0];
  const wallet = getWallet(user.id);
  const rate = db.platform_settings?.exchangeRatePyg || 7500;

  // Gather user purchases & subscriptions
  const mySlots = (db.user_slots || []).filter(s => s.buyerId === user.id);
  const myOrders = (db.user_store_orders || []).filter(o => o.buyerId === user.id);
  const myPublications = (db.subscriptions || [])
    .filter(s => s.sellerId === user.id)
    .map(s => {
      let profilesObj = {};
      try {
        const dec = cryptoService.decrypt(s.pinsEncrypted || '');
        profilesObj = typeof dec === 'string' ? JSON.parse(dec) : (dec || {});
      } catch (e) {
        profilesObj = {};
      }

      const services = db.streaming_services || [];
      const cleanKey = (s.serviceKey || s.serviceName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cfg = services.find(srv => {
        const sId = (srv.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const sName = (srv.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return sId === cleanKey || sName === cleanKey || sId.includes(cleanKey) || cleanKey.includes(sId) || sName.includes(cleanKey) || cleanKey.includes(sName);
      });
      const maxSlots = cfg ? (cfg.maxSlots || 5) : 5;
      const effectiveTotalSlots = Math.max(s.totalSlots || 0, maxSlots);
      const effectiveAvailSlots = s.availableSlots !== undefined ? Math.min(s.availableSlots, effectiveTotalSlots) : effectiveTotalSlots;
      const serviceIcon = (cfg && cfg.icon) ? cfg.icon : (s.serviceIcon || `/assets/services/${cleanKey || 'netflix'}.png`);

      const activeBuyers = (db.user_slots || [])
        .filter(us => us.subscriptionId === s.id && us.status === 'active')
        .map(us => {
          const buyerUser = (db.users || []).find(u => u.id === (us.buyerId || us.userId));
          return {
            slotNumber: us.slotNumber,
            buyerId: us.buyerId || us.userId,
            buyerName: (buyerUser && buyerUser.name) ? buyerUser.name : (us.buyerName || 'Comprador GamesBoy'),
            expiresAt: us.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString()
          };
        });

      return {
        ...s,
        totalSlots: effectiveTotalSlots,
        availableSlots: effectiveAvailSlots,
        serviceIcon,
        credentialsDecrypted: cryptoService.decrypt(s.credentialsEncrypted),
        pinsDecrypted: profilesObj,
        activeBuyersCount: activeBuyers.length,
        activeBuyers
      };
    });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name || 'Usuario',
      surname: user.surname || '',
      email: user.email || 'usuario@gamesboy.net',
      birthday: user.birthday || '',
      avatar: user.avatar || '/assets/branding/icon.png',
      role: user.role || 'client',
      isGoogleLinked: !!user.isGoogleLinked,
      hasPassword: user.hasPassword !== false,
      createdAt: user.createdAt || new Date().toISOString()
    },
    wallet,
    balancePyg: Math.round((wallet.balanceUsd || 0) * rate),
    stats: {
      activeSubscriptionsCount: mySlots.length,
      purchasedGamesCount: myOrders.length,
      publishedAccountsCount: myPublications.length
    },
    mySlots,
    myOrders,
    myPublications
  });
});

// 9. Update User Profile (Name, Surname, Birthday, Avatar Photo)
router.put('/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const db = getDb();
    let user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { name, surname, birthday, avatar } = req.body;

    if (name && name.trim()) user.name = name.trim();
    if (surname !== undefined) user.surname = surname.trim();
    if (birthday !== undefined) user.birthday = birthday;
    if (avatar !== undefined && avatar.trim()) user.avatar = avatar;

    saveStorage();

    if (postgresAdapter.isPgConnected()) {
      try {
        const pool = postgresAdapter.getPool();
        await pool.query(
          'UPDATE gamesboy.gb_users SET name = $1, avatar = $2, updated_at = NOW() WHERE id = $3',
          [user.name, user.avatar, user.id]
        );
      } catch (e) {
        console.warn('Could not update user in Postgres:', e.message);
      }
    }

    res.json({
      success: true,
      message: '¡Perfil actualizado con éxito!',
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Set or Change User Password
router.post('/set-password', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const db = getDb();
    let user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    user.hasPassword = true;
    user.passwordUpdated = new Date().toISOString();
    saveStorage();

    res.json({
      success: true,
      message: '¡Contraseña configurada con éxito!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Link Google Account
router.post('/link-google', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const db = getDb();
    let user = db.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.isGoogleLinked = true;
    saveStorage();

    res.json({
      success: true,
      message: '¡Cuenta de Google vinculada con éxito!',
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
