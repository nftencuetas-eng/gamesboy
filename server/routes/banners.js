import express from 'express';
import database, { getDb, saveStorage } from '../config/database.js';
import postgresAdapter from '../db/postgresAdapter.js';

const router = express.Router();

// GET /api/banners - Fetch active hero banners (Instant in-memory / DB cached)
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const banners = (db.hero_banners && db.hero_banners.length > 0)
      ? db.hero_banners.filter(b => b.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      : [];
    return res.json({ success: true, banners });
  } catch (err) {
    console.error('Error fetching hero banners:', err);
    res.status(500).json({ error: 'No se pudieron obtener los banners' });
  }
});

// POST /api/banners/admin - Admin update/save hero banners (up to 4 items)
router.post('/admin', async (req, res) => {
  try {
    const { banners } = req.body;
    if (!Array.isArray(banners)) {
      return res.status(400).json({ error: 'Formato de banners inválido' });
    }

    const db = getDb();
    db.hero_banners = banners.map((b, idx) => ({
      id: b.id || `banner_${Date.now()}_${idx}`,
      title: b.title || 'GamesBoy Promo',
      tagline: b.tagline || '',
      badge: b.badge || 'DESTACADO',
      imgHorizontal: b.imgHorizontal || '',
      imgVertical: b.imgVertical || '',
      ctaText: b.ctaText || 'Comprar ahora',
      ctaUrl: b.ctaUrl || '#',
      sortOrder: idx,
      isActive: b.isActive !== false
    }));
    saveStorage();

    // If PostgreSQL is connected, sync to table
    if (postgresAdapter.isConnected()) {
      try {
        await postgresAdapter.query(`DELETE FROM gamesboy.gb_hero_banners`);
        for (const b of db.hero_banners) {
          await postgresAdapter.query(
            `INSERT INTO gamesboy.gb_hero_banners (id, title, tagline, badge, img_horizontal, img_vertical, cta_text, cta_url, sort_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [b.id, b.title, b.tagline, b.badge, b.imgHorizontal, b.imgVertical, b.ctaText, b.ctaUrl, b.sortOrder, b.isActive]
          );
        }
      } catch (pgErr) {
        console.warn('Could not sync banners to Postgres:', pgErr.message);
      }
    }

    return res.json({ success: true, message: 'Banners actualizados con éxito', banners: db.hero_banners });
  } catch (err) {
    console.error('Error updating hero banners:', err);
    res.status(500).json({ error: 'Error al guardar los banners' });
  }
});

export default router;
