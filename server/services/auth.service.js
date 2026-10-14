import crypto from 'crypto';
import { getPool, query, isDbConnected } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gamesboy_default_secret_key_2026';
const AES_SECRET = crypto.createHash('sha256').update(JWT_SECRET).digest();

// Fallback in-memory storage when database is not connected
const memoryUsers = new Map();
const memoryWallets = new Map();

// Helper: Hash password with PBKDF2
export function hashPassword(password, salt = null) {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, userSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: userSalt };
}

// Helper: Encrypt AES-256
export function encryptCredentials(plainText) {
  if (!plainText) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', AES_SECRET, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return JSON.stringify({ iv: iv.toString('hex'), authTag, content: encrypted });
}

// Helper: Decrypt AES-256
export function decryptCredentials(encryptedData) {
  if (!encryptedData) return null;
  try {
    const { iv, authTag, content } = typeof encryptedData === 'string' ? JSON.parse(encryptedData) : encryptedData;
    const decipher = crypto.createDecipheriv('aes-256-gcm', AES_SECRET, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '[Error de descifrado o formato inválido]';
  }
}

// Simple signed token generator
export function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 3600 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Token verification
export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Seed default admin in memory or DB
export async function ensureDefaultAdmin() {
  const defaultAdminEmail = 'admin@gamesboy.net';
  const defaultAdminPass = 'GamesBoy2026!';

  if (isDbConnected()) {
    try {
      const res = await query('SELECT id FROM gb_users WHERE email = $1', [defaultAdminEmail]);
      if (res.rows.length === 0) {
        const { hash, salt } = hashPassword(defaultAdminPass);
        const userRes = await query(
          `INSERT INTO gb_users (email, password_hash, password_salt, role, full_name)
           VALUES ($1, $2, $3, 'ADMIN', 'Master Admin') RETURNING id`,
          [defaultAdminEmail, hash, salt]
        );
        const userId = userRes.rows[0].id;
        await query(`INSERT INTO gb_wallets (user_id, balance_usd, balance_pyg) VALUES ($1, 0, 0)`, [userId]);
        console.log('👑 [Auth] Default admin account seeded in PostgreSQL (admin@gamesboy.net)');
      }
    } catch (e) {
      console.warn('⚠️ [Auth] Seed admin warning:', e.message);
    }
  } else {
    // Memory fallback
    if (!memoryUsers.has(defaultAdminEmail)) {
      const { hash, salt } = hashPassword(defaultAdminPass);
      const user = {
        id: 1,
        email: defaultAdminEmail,
        password_hash: hash,
        password_salt: salt,
        role: 'ADMIN',
        full_name: 'Master Admin',
        created_at: new Date()
      };
      memoryUsers.set(defaultAdminEmail, user);
      memoryWallets.set(1, { balance_usd: 1500.00, balance_pyg: 11700000 });
      console.log('👑 [Auth] Default admin account seeded in memory (admin@gamesboy.net)');
    }
  }
}

// Register user
export async function registerUser({ email, password, fullName, phone, role = 'CLIENT' }) {
  const normalizedEmail = email.toLowerCase().trim();
  const { hash, salt } = hashPassword(password);

  if (isDbConnected()) {
    const existing = await query('SELECT id FROM gb_users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      throw new Error('El correo electrónico ya está registrado.');
    }
    const res = await query(
      `INSERT INTO gb_users (email, password_hash, password_salt, role, full_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, full_name`,
      [normalizedEmail, hash, salt, role, fullName, phone]
    );
    const user = res.rows[0];
    await query('INSERT INTO gb_wallets (user_id, balance_usd, balance_pyg) VALUES ($1, 0, 0)', [user.id]);
    return user;
  } else {
    if (memoryUsers.has(normalizedEmail)) {
      throw new Error('El correo electrónico ya está registrado.');
    }
    const id = memoryUsers.size + 1;
    const user = {
      id,
      email: normalizedEmail,
      password_hash: hash,
      password_salt: salt,
      role,
      full_name: fullName,
      phone,
      created_at: new Date()
    };
    memoryUsers.set(normalizedEmail, user);
    memoryWallets.set(id, { balance_usd: 0, balance_pyg: 0 });
    return { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
  }
}

// Authenticate user
export async function loginUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();

  let user = null;
  if (isDbConnected()) {
    const res = await query('SELECT * FROM gb_users WHERE email = $1', [normalizedEmail]);
    if (res.rows.length === 0) throw new Error('Credenciales inválidas.');
    user = res.rows[0];
  } else {
    user = memoryUsers.get(normalizedEmail);
    if (!user) throw new Error('Credenciales inválidas.');
  }

  const { hash } = hashPassword(password, user.password_salt);
  if (hash !== user.password_hash) {
    throw new Error('Credenciales inválidas.');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.full_name
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name
    }
  };
}

// Get user profile with wallet
export async function getUserProfile(userId) {
  if (isDbConnected()) {
    const res = await query(
      `SELECT u.id, u.email, u.role, u.full_name, u.phone, u.avatar_url,
              w.balance_usd, w.balance_pyg, w.is_frozen
       FROM gb_users u
       LEFT JOIN gb_wallets w ON w.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  } else {
    for (const u of memoryUsers.values()) {
      if (u.id === userId) {
        const wallet = memoryWallets.get(userId) || { balance_usd: 0, balance_pyg: 0, is_frozen: false };
        return {
          id: u.id,
          email: u.email,
          role: u.role,
          full_name: u.full_name,
          phone: u.phone,
          avatar_url: u.avatar_url,
          balance_usd: wallet.balance_usd,
          balance_pyg: wallet.balance_pyg,
          is_frozen: wallet.is_frozen
        };
      }
    }
    return null;
  }
}
