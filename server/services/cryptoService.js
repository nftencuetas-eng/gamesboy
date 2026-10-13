import crypto from 'crypto';

const ENCRYPTION_KEY = (process.env.ENCRYPTION_SECRET || 'gamesboy-super-secure-key-32chars!!').padEnd(32, '!').slice(0, 32);
const IV_LENGTH = 16;
const JWT_SECRET = process.env.JWT_SECRET || 'gamsplit_master_jwt_secret_2026';

/**
 * Encrypt sensitive text (passwords, PINs, license keys) with AES-256-CBC
 */
export function encrypt(text) {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err);
    return text;
  }
}

/**
 * Decrypt ciphertext back to plain text
 */
export function decrypt(ciphertext) {
  if (!ciphertext) return '';
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 2) return ciphertext;
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return ciphertext;
  }
}

/**
 * Secure PBKDF2 Password Hashing with Salt
 */
export function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify Plain Password against Stored PBKDF2 Salted Hash
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  if (!storedHash.includes(':')) {
    // Fallback for legacy plain text passwords in testing
    return password === storedHash;
  }
  try {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  } catch (e) {
    return false;
  }
}

/**
 * Generate Secure Session Token
 */
export function generateToken(payload) {
  const data = JSON.stringify({ ...payload, timestamp: Date.now() });
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  const base64Data = Buffer.from(data).toString('base64');
  return `${base64Data}.${hmac}`;
}

/**
 * Verify Session Token
 */
export function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  try {
    const [base64Data, hmac] = token.split('.');
    const data = Buffer.from(base64Data, 'base64').toString('utf8');
    const expectedHmac = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (hmac !== expectedHmac) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export default {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};

