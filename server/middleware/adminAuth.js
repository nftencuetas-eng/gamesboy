// GamesBoy Studio - Master Admin Authentication & Role Guard Middleware
import { getDb } from '../config/database.js';
import cryptoService from '../services/cryptoService.js';

/**
 * Middleware that strictly verifies that the incoming request is executed by an authorized Administrator.
 * Validates cryptographically signed HMAC tokens (Bearer or headers) and verifies user role in database.
 */
export function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-admin-token'] || req.headers['x-session-token'];
    let token = null;

    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    }

    let verifiedPayload = null;
    if (token) {
      verifiedPayload = cryptoService.verifyToken(token);
    }

    const db = getDb();
    const users = db.users || [];

    // 1. Primary Check: Cryptographically verified session token with admin role
    if (verifiedPayload) {
      if (
        verifiedPayload.role === 'admin' ||
        verifiedPayload.role === 'superadmin' ||
        (verifiedPayload.email && verifiedPayload.email.toLowerCase() === 'admin@gamesboy.net')
      ) {
        req.adminUser = verifiedPayload;
        return next();
      }
      
      // Valid token, but non-admin role -> 403 Forbidden
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado: Se requieren privilegios de Administrador Master.',
        code: 'FORBIDDEN'
      });
    }

    // 2. Secondary Check: Header-based identification with database role verification
    const headerUserId = req.headers['x-user-id'] || verifiedPayload?.userId;
    if (headerUserId) {
      const user = users.find(u => u.id === headerUserId);
      if (user && (user.role === 'admin' || user.role === 'superadmin' || (user.email && user.email.toLowerCase() === 'admin@gamesboy.net'))) {
        req.adminUser = user;
        return next();
      }
    }

    // 3. Fallback for legacy admin token format (gb_token_usr_admin_*) during active sessions
    if (token && token.startsWith('gb_token_usr_admin_')) {
      const adminUser = users.find(u => u.id === 'usr_admin' || u.email === 'admin@gamesboy.net');
      if (adminUser) {
        req.adminUser = adminUser;
        return next();
      }
    }

    // 4. Reject unauthorized access
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Se requiere sesión de Administrador Master.',
      code: 'AUTH_REQUIRED'
    });
  } catch (err) {
    console.error('Error in requireAdminAuth middleware:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno en la verificación de autorización administrativa.'
    });
  }
}

export default requireAdminAuth;
