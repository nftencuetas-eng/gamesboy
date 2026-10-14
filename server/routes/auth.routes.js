import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Correo y contraseña requeridos.' });
    }
    const user = await registerUser({ email, password, fullName, phone });
    res.json({ success: true, message: 'Usuario registrado exitosamente.', user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Credenciales incompletas.' });
    }
    const { token, user } = await loginUser(email, password);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    if (!profile) return res.status(404).json({ success: false, error: 'Perfil no encontrado.' });
    res.json({ success: true, user: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
