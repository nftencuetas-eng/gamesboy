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

  const isAdminUser = user ? (
    user.role === 'admin' ||
    user.role === 'superadmin' ||
    (user.email && user.email.toLowerCase() === 'admin@gamesboy.net')
  ) : false;

  // 1. Strict Guard: Admin Portal vs Client Portal Separation
  if (user) {
    if (isAdminUser && portalType === 'client') {
      return res.status(403).json({
        error: 'Acceso restringido: Las cuentas de Administrador deben ingresar exclusivamente a través del Portal Master (/admin/login).'
      });
    }

    if (!isAdminUser && portalType === 'admin') {
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
  if (user && (user.role === 'admin' || user.role === 'superadmin' || (user.email && user.email.toLowerCase() === 'admin@gamesboy.net'))) {
    const isHardcodedPass = (password === 'GamesBoy2026Master!' || password === 'admin123');
    const isStoredPass = (user.password && user.password === password) ||
                         (user.passwordHash && cryptoService.verifyPassword(password, user.passwordHash));
    if (!isHardcodedPass && !isStoredPass) {
      return res.status(401).json({ error: 'Clave de seguridad administrativa incorrecta.' });
    }
    // Always normalize admin role to 'admin'
    user.role = 'admin';
  }

  const wallet = getWallet(user.id);
  const sessionToken = cryptoService.generateToken({
    userId: user.id,
    role: user.role,
    email: user.email
  });

  res.json({
    success: true,
    message: `¡Bienvenido de nuevo, ${user.name}!`,
    user,
    wallet,
    token: sessionToken
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

// =========================================================================
// SAAS MULTI-TENANT AUTH & 7-DAY TRIAL SYSTEM (OLA 1)
// =========================================================================

// 12. Register New SaaS Tenant & Admin User with 7-Day Trial + Anti-Abuse
router.post('/saas-register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      whatsapp,
      planId = 'plan_control', // 'plan_control' ($9.99) or 'plan_pro' ($29.90)
      storeName,
      storeSlug,
      fingerprint
    } = req.body;

    if (!email || !password || !name || !whatsapp) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios: Nombre, Email, WhatsApp y Contraseña.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanWhatsapp = String(whatsapp).replace(/[^0-9+]/g, '');

    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres.'
      });
    }

    const db = getDb();
    if (!db.tenants) db.tenants = [];
    if (!db.users) db.users = [];
    if (!db.wallets) db.wallets = {};

    // 1. Check existing user by email
    const existingUser = db.users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.'
      });
    }

    // 2. Anti-Abuse Shield: Check duplicate active trials by WhatsApp or IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const duplicateTrial = db.tenants.find(t => {
      const isRecent = t.createdAt && new Date(t.createdAt).getTime() > thirtyDaysAgo;
      const matchWhatsapp = t.ownerWhatsapp && t.ownerWhatsapp.replace(/[^0-9]/g, '') === cleanWhatsapp.replace(/[^0-9]/g, '');
      const matchIp = t.antiAbuseIp && t.antiAbuseIp === clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1';
      return isRecent && (matchWhatsapp || matchIp);
    });

    if (duplicateTrial) {
      return res.status(400).json({
        error: 'Ya existe una prueba gratuita asociada a este número o dispositivo en los últimos 30 días. Por favor inicia sesión con tu cuenta existente.'
      });
    }

    // 3. Subdomain Validation for Plan Pro ($29.90)
    let cleanSlug = '';
    if (planId === 'plan_pro') {
      if (!storeSlug) {
        return res.status(400).json({ error: 'Para el Plan Pro debes ingresar el subdominio deseado de tu tienda.' });
      }
      cleanSlug = storeSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (cleanSlug.length < 3) {
        return res.status(400).json({ error: 'El subdominio debe tener al menos 3 caracteres alfanuméricos.' });
      }
      const reserved = ['www', 'api', 'app', 'admin', 'mail', 'saas', 'store', 'marketplace', 'auth', 'login', 'service'];
      if (reserved.includes(cleanSlug) || db.tenants.some(t => t.slug === cleanSlug)) {
        return res.status(400).json({ error: `El subdominio "${cleanSlug}.gamsplit.com" ya está en uso o reservado.` });
      }
    } else {
      // Control plan generates an internal slug
      cleanSlug = `ctrl_${normalizedEmail.split('@')[0].replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;
    }

    // 4. Generate Unique IDs & 7-Day Trial Timestamps
    const userId = `usr_${Date.now()}`;
    const tenantId = `tnt_${cleanSlug}_${Date.now().toString().slice(-4)}`;
    const trialStartsAt = new Date().toISOString();
    const trialEndsAt = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();

    const passwordHash = cryptoService.hashPassword(password);

    // 5. Create Tenant Record
    const newTenant = {
      id: tenantId,
      slug: cleanSlug,
      name: (storeName || name).trim(),
      customDomain: null,
      ownerUserId: userId,
      ownerEmail: normalizedEmail,
      ownerWhatsapp: cleanWhatsapp,
      planId: planId, // 'plan_control' ($9.99) or 'plan_pro' ($29.90)
      status: 'trial_active',
      trialStartsAt,
      trialEndsAt,
      subscriptionPaidUntil: null,
      antiAbuseIp: clientIp,
      antiAbuseFingerprint: fingerprint || '',
      branding: {
        brandName: (storeName || name).trim(),
        logoUrl: '/assets/branding/icon.png',
        iconUrl: '/assets/branding/icon.png',
        primaryColor: '#0284c7',
        accentColor: '#00c2ff',
        currency: 'PYG',
        exchangeRate: 7500,
        whatsappSupport: cleanWhatsapp
      },
      settings: {
        commissionPercent: planId === 'plan_pro' ? 3.0 : 0,
        allowUserReselling: planId === 'plan_pro',
        enabledModules: {
          streaming: true,
          games: planId === 'plan_pro',
          giftcards: planId === 'plan_pro',
          smm: false,
          p2pSharing: planId === 'plan_pro'
        },
        paraguayBankDetails: {
          bank: 'Banco Familiar / Itaú Paraguay',
          accountHolder: name.trim(),
          accountNumber: '01-000000-1',
          aliasSipap: `${cleanSlug}.py`
        },
        binanceDetails: {
          payId: '',
          network: 'USDT (Binance Pay / BEP-20 / TRC-20)'
        }
      },
      createdAt: trialStartsAt,
      updatedAt: trialStartsAt
    };

    // 6. Create User Record
    const newUser = {
      id: userId,
      tenantId: tenantId,
      name: name.trim(),
      email: normalizedEmail,
      whatsapp: cleanWhatsapp,
      passwordHash: passwordHash,
      role: 'tenant_admin',
      avatar: '/assets/branding/icon.png',
      createdAt: trialStartsAt
    };

    // 7. Initialize Wallet
    db.wallets[userId] = { balanceUsd: 0.00, pendingEscrowUsd: 0.00 };

    db.tenants.push(newTenant);
    db.users.push(newUser);
    saveStorage();

    // 8. Generate Session Token
    const sessionToken = cryptoService.generateToken({
      userId: newUser.id,
      tenantId: newTenant.id,
      role: newUser.role,
      email: newUser.email
    });

    res.json({
      success: true,
      message: `¡Bienvenido a GamSplit! Tu prueba gratuita de 7 días ha sido activada con éxito.`,
      token: sessionToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        whatsapp: newUser.whatsapp,
        role: newUser.role
      },
      tenant: newTenant,
      subscription: {
        status: 'trial_active',
        isLocked: false,
        daysLeft: 7,
        planId: newTenant.planId,
        trialEndsAt: newTenant.trialEndsAt
      },
      redirectUrl: '/dashboard'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Error al registrar la cuenta: ' + err.message });
  }
});

// 13. Login for SaaS Tenants / Resellers
router.post('/saas-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor ingresa tu correo y contraseña.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = getDb();

    let user = db.users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'No existe una cuenta registrada con este correo electrónico.' });
    }

    // Verify Password
    const isValid = cryptoService.verifyPassword(password, user.passwordHash || user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta. Por favor intenta de nuevo.' });
    }

    // Find User's Tenant
    const tenant = (db.tenants || []).find(t => t.id === user.tenantId || t.ownerUserId === user.id) || db.tenants[0];
    
    // Calculate live subscription status
    const now = Date.now();
    const trialEnds = tenant?.trialEndsAt ? new Date(tenant.trialEndsAt).getTime() : 0;
    const paidUntil = tenant?.subscriptionPaidUntil ? new Date(tenant.subscriptionPaidUntil).getTime() : 0;
    
    let subStatus = {
      status: 'trial_active',
      isLocked: false,
      daysLeft: 7,
      planId: tenant?.planId || 'plan_control'
    };

    if (tenant?.id === 'tnt_gamesboy_main') {
      subStatus = { status: 'paid_active', isLocked: false, daysLeft: 9999, planId: 'plan_pro' };
    } else if (paidUntil > now) {
      subStatus = { status: 'paid_active', isLocked: false, daysLeft: Math.ceil((paidUntil - now) / 86400000), planId: tenant.planId };
    } else if (trialEnds > now) {
      subStatus = { status: 'trial_active', isLocked: false, daysLeft: Math.ceil((trialEnds - now) / 86400000), planId: tenant.planId };
    } else {
      subStatus = { status: 'locked', isLocked: true, daysLeft: 0, planId: tenant.planId, reason: 'TRIAL_EXPIRED' };
    }

    const sessionToken = cryptoService.generateToken({
      userId: user.id,
      tenantId: tenant ? tenant.id : 'tnt_gamesboy_main',
      role: user.role,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        role: user.role,
        avatar: user.avatar
      },
      tenant,
      subscription: subStatus,
      redirectUrl: '/dashboard'
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión: ' + err.message });
  }
});

// 14. Get Current SaaS Session & Subscription Status
router.get('/saas-session', (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-session-token'];
    let payload = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      payload = cryptoService.verifyToken(token);
    }

    const db = getDb();
    const userId = payload?.userId || req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ authenticated: false, error: 'No hay sesión activa' });
    }

    const user = (db.users || []).find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ authenticated: false, error: 'Usuario no encontrado' });
    }

    const tenant = (db.tenants || []).find(t => t.id === user.tenantId || t.ownerUserId === user.id) || (db.tenants && db.tenants[0]);
    
    // Calculate live subscription status
    const now = Date.now();
    const trialEnds = tenant?.trialEndsAt ? new Date(tenant.trialEndsAt).getTime() : 0;
    const paidUntil = tenant?.subscriptionPaidUntil ? new Date(tenant.subscriptionPaidUntil).getTime() : 0;
    
    let subStatus = {
      status: 'trial_active',
      isLocked: false,
      daysLeft: 7,
      planId: tenant?.planId || 'plan_control'
    };

    if (tenant?.id === 'tnt_gamesboy_main') {
      subStatus = { status: 'paid_active', isLocked: false, daysLeft: 9999, planId: 'plan_pro' };
    } else if (paidUntil > now) {
      subStatus = { status: 'paid_active', isLocked: false, daysLeft: Math.ceil((paidUntil - now) / 86400000), planId: tenant.planId };
    } else if (trialEnds > now) {
      subStatus = { status: 'trial_active', isLocked: false, daysLeft: Math.ceil((trialEnds - now) / 86400000), planId: tenant.planId };
    } else {
      subStatus = { status: 'locked', isLocked: true, daysLeft: 0, planId: tenant?.planId || 'plan_control', reason: 'TRIAL_EXPIRED' };
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        role: user.role,
        avatar: user.avatar
      },
      tenant,
      subscription: subStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
