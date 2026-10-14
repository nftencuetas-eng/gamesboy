import express from 'express';
import database, { getDb, saveStorage } from '../config/database.js';
import postgresAdapter from '../db/postgresAdapter.js';
import requireAdminAuth from '../middleware/adminAuth.js';

const router = express.Router();

const defaultHeroBanners = [
  {
    id: 'banner_1',
    title: 'EA SPORTS FC 25',
    tagline: 'CLUBES, ULTIMATE TEAM & MODO CARRERA',
    badge: 'PS5 • XBOX • PC',
    imgHorizontal: '',
    imgVertical: '',
    ctaText: 'Ver Ediciones',
    ctaUrl: '#section-games',
    sortOrder: 0,
    isActive: true
  },
  {
    id: 'banner_2',
    title: 'Grand Theft Auto VI',
    tagline: 'BIENVENIDO A LEONIDA & VICE CITY',
    badge: 'PRE-VENTA VIP',
    imgHorizontal: '',
    imgVertical: '',
    ctaText: 'Reservar Ahora',
    ctaUrl: '#section-games',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'banner_3',
    title: 'Call of Duty: Black Ops 6',
    tagline: 'LA VERDAD MIENTE. VUELVE EL REY DEL SHOOTER',
    badge: 'CROSS-GEN BUNDLE',
    imgHorizontal: '',
    imgVertical: '',
    ctaText: 'Comprar Código',
    ctaUrl: '#section-games',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'banner_4',
    title: 'Marvel Spider-Man 2',
    tagline: 'BE GREATER. TOGETHER.',
    badge: 'PS5 EXCLUSIVE',
    imgHorizontal: '',
    imgVertical: '',
    ctaText: 'Ver Plataformas',
    ctaUrl: '#section-streaming',
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
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.json({ success: true, count: banners.length, banners: banners.length > 0 ? banners : all });
  } catch (err) {
    console.error('Error fetching hero banners:', err);
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({ success: true, banners: defaultHeroBanners });
  }
});

// GET /api/banners/admin - Fetch all hero banners for Admin Editor
router.get('/admin', requireAdminAuth, (req, res) => {
  try {
    const db = getDb();
    const all = ensureDefaultBanners(db);
    return res.json({ success: true, banners: all });
  } catch (err) {
    res.json({ success: true, banners: defaultHeroBanners });
  }
});

// POST /api/banners/admin - Admin update/save hero banners (up to 4 items)
router.post('/admin', requireAdminAuth, async (req, res) => {
  try {
    const { banners } = req.body;
    if (!Array.isArray(banners)) {
      return res.status(400).json({ error: 'Formato de banners inválido' });
    }

    const db = getDb();
    db.hero_banners = banners.map((b, idx) => ({
      id: b.id || `banner_${idx + 1}`,
      title: (b.title !== undefined && b.title !== null) ? b.title.trim() : '',
      tagline: (b.tagline !== undefined && b.tagline !== null) ? b.tagline.trim() : '',
      badge: (b.badge !== undefined && b.badge !== null) ? b.badge.trim() : '',
      imgHorizontal: b.imgHorizontal || '',
      imgVertical: b.imgVertical || '',
      ctaText: (b.ctaText !== undefined && b.ctaText !== null) ? b.ctaText.trim() : '',
      ctaUrl: (b.ctaUrl !== undefined && b.ctaUrl !== null) ? b.ctaUrl.trim() : '#section-games',
      sortOrder: idx,
      isActive: b.isActive !== false
    }));
    saveStorage();

    // If PostgreSQL is connected, sync to table
    if (postgresAdapter.isConnected()) {
      try {
        await postgresAdapter.query(`DELETE FROM gamesboy.gb_hero_banners WHERE tenant_id = 'tnt_gamesboy_main' OR tenant_id IS NULL`);
        for (const b of db.hero_banners) {
          await postgresAdapter.query(
            `INSERT INTO gamesboy.gb_hero_banners (id, tenant_id, title, tagline, badge, img_horizontal, img_vertical, cta_text, cta_url, sort_order, is_active)
             VALUES ($1, 'tnt_gamesboy_main', $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
