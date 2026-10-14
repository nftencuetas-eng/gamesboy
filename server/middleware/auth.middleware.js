import { verifyToken, getUserProfile } from '../services/auth.service.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Acceso no autorizado. Inicie sesión.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Sesión expirada o token inválido.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Error de autenticación.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acceso restringido. Se requiere rol: ${roles.join(' o ')}.`
      });
    }
    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requireSeller = requireRole('SELLER', 'ADMIN');
