import express from 'express';
import database, { getDb, saveStorage } from '../config/database.js';
import postgresAdapter from '../db/postgresAdapter.js';

const router = express.Router();

const defaultHeroBanners = [
  {
    id: 'banner_fc25',
    title: 'EA SPORTS FC 25',
    tagline: 'CLUBES, ULTIMATE TEAM & MODO CARRERA',
    badge: 'PS5 • XBOX • PC',
    imgHorizontal: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80',
    imgVertical: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Ver Ediciones',
    ctaUrl: '#section-games',
    sortOrder: 0,
    isActive: true
  },
  {
    id: 'banner_spiderman2',
    title: 'MARVEL SPIDER-MAN 2',
    tagline: 'BE GREATER. TOGETHER.',
    badge: 'PS5 EXCLUSIVE',
    imgHorizontal: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    imgVertical: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Comprar ahora',
    ctaUrl: '#section-games',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'banner_cod_bo6',
    title: 'CALL OF DUTY: BLACK OPS 6',
    tagline: 'LA VERDAD MIENTE. VUELVE EL REY DEL SHOOTER',
    badge: 'CROSS-GEN BUNDLE',
    imgHorizontal: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
    imgVertical: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Comprar Código',
    ctaUrl: '#section-games',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'banner_gta6',
    title: 'GRAND THEFT AUTO VI',
    tagline: 'BIENVENIDO A LEONIDA & VICE CITY',
    badge: 'NEXT-GEN PRE-ORDER',
    imgHorizontal: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
    imgVertical: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Reservar Ahora',
    ctaUrl: '#section-games',
    sortOrder: 3,
    isActive: true
  }
];

function ensureDefaultBanners(db) {
  if (!db.hero_banners || !Array.isArray(db.hero_banners) || db.hero_banners.length === 0) {
    db.hero_banners = JSON.parse(JSON.stringify(defaultHeroBanners));
    saveStorage();
    return db.hero_banners;
  }
  if (db.hero_banners.length < 4) {
    for (let i = db.hero_banners.length; i < defaultHeroBanners.length; i++) {
      db.hero_banners.push(JSON.parse(JSON.stringify(defaultHeroBanners[i])));
    }
    saveStorage();
  }
  return db.hero_banners;
}

// GET /api/banners - Fetch active hero banners (Instant in-memory / DB cached)
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const all = ensureDefaultBanners(db);
    const banners = all.filter(b => b.isActive !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return res.json({ success: true, banners: banners.length >= 4 ? banners : defaultHeroBanners });
  } catch (err) {
    console.error('Error fetching hero banners:', err);
    res.json({ success: true, banners: defaultHeroBanners });
  }
});

// GET /api/banners/admin - Fetch all hero banners for Admin Editor
router.get('/admin', (req, res) => {
  try {
    const db = getDb();
    const all = ensureDefaultBanners(db);
    return res.json({ success: true, banners: all });
  } catch (err) {
    res.json({ success: true, banners: defaultHeroBanners });
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
