import { query, isDbConnected } from '../config/db.js';
import { encryptCredentials } from './auth.service.js';

// Memory fallback store with rich initial games
const memoryCategories = [
  { id: 1, name: 'PlayStation 5', slug: 'ps5', icon: 'gamepad', sort_order: 1 },
  { id: 2, name: 'PlayStation 4', slug: 'ps4', icon: 'gamepad', sort_order: 2 },
  { id: 3, name: 'Xbox Series / One', slug: 'xbox', icon: 'gamepad', sort_order: 3 },
  { id: 4, name: 'PC / Steam', slug: 'pc', icon: 'monitor', sort_order: 4 },
  { id: 5, name: 'Streaming & Música', slug: 'streaming', icon: 'tv', sort_order: 5 },
  { id: 6, name: 'Gift Cards', slug: 'giftcards', icon: 'credit-card', sort_order: 6 }
];

const memoryProducts = [
  {
    id: 1,
    category_id: 1,
    title: 'EA SPORTS FC 25',
    slug: 'ea-sports-fc-25',
    description: 'Experimenta más formas de ganar para el club con el nuevo modo 5v5 Rush y el control táctico de FC IQ.',
    product_type: 'GAME',
    platform: 'PS5',
    price_usd: 44.99,
    price_pyg: 350900,
    cover_url: '/assets/games/fc25.jpg',
    banner_url: '/assets/banners/fc25_hero.jpg',
    is_featured: true,
    is_active: true,
    slots: [
      { id: 101, slot_type: 'PRIMARY', slot_label: 'Cuenta Primaria (Juega en tu usuario)', price_usd: 44.99, price_pyg: 350900, is_available: true },
      { id: 102, slot_type: 'SECONDARY', slot_label: 'Cuenta Secundaria (Juega en el usuario entregado)', price_usd: 28.00, price_pyg: 218400, is_available: true }
    ]
  },
  {
    id: 2,
    category_id: 1,
    title: 'Grand Theft Auto VI',
    slug: 'grand-theft-auto-vi',
    description: 'La próxima evolución de la saga de mundo abierto en el estado de Leonida, hogar de las calles bañadas en neón de Vice City.',
    product_type: 'GAME',
    platform: 'PS5',
    price_usd: 69.99,
    price_pyg: 545900,
    cover_url: '/assets/games/gta6.jpg',
    banner_url: '/assets/banners/gta6_hero.jpg',
    is_featured: true,
    is_active: true,
    slots: [
      { id: 201, slot_type: 'PRIMARY', slot_label: 'Pre-orden Primaria Oficial', price_usd: 69.99, price_pyg: 545900, is_available: true }
    ]
  },
  {
    id: 3,
    category_id: 1,
    title: 'Black Myth: Wukong',
    slug: 'black-myth-wukong',
    description: 'Un RPG de acción arraigado en la mitología china. Viaja como el Predestinado hacia una tierra fascinante.',
    product_type: 'GAME',
    platform: 'PS5',
    price_usd: 49.00,
    price_pyg: 382200,
    cover_url: '/assets/games/wukong.jpg',
    banner_url: '/assets/banners/wukong_hero.jpg',
    is_featured: true,
    is_active: true,
    slots: [
      { id: 301, slot_type: 'PRIMARY', slot_label: 'Primaria Garantizada', price_usd: 49.00, price_pyg: 382200, is_available: true },
      { id: 302, slot_type: 'SECONDARY', slot_label: 'Secundaria', price_usd: 30.00, price_pyg: 234000, is_available: true }
    ]
  },
  {
    id: 4,
    category_id: 1,
    title: "Marvel's Spider-Man 2",
    slug: 'marvels-spider-man-2',
    description: 'Peter Parker y Miles Morales regresan para una emocionante nueva aventura en la aclamada franquicia de Marvel.',
    product_type: 'GAME',
    platform: 'PS5',
    price_usd: 38.00,
    price_pyg: 296400,
    cover_url: '/assets/games/spiderman2.jpg',
    banner_url: '',
    is_featured: false,
    is_active: true,
    slots: [
      { id: 401, slot_type: 'PRIMARY', slot_label: 'Cuenta Primaria PS5', price_usd: 38.00, price_pyg: 296400, is_available: true }
    ]
  },
  {
    id: 5,
    category_id: 5,
    title: 'Netflix Premium 4K UHD (30 Días)',
    slug: 'netflix-premium-4k',
    description: 'Perfil privado con PIN personal en ultra alta definición 4K. Garantía de reposición inmediata 30 días.',
    product_type: 'STREAMING',
    platform: 'ALL',
    price_usd: 4.50,
    price_pyg: 35100,
    cover_url: '/assets/services/netflix.jpg',
    banner_url: '',
    is_featured: true,
    is_active: true,
    slots: [
      { id: 501, slot_type: 'PROFILE', slot_label: 'Perfil Privado con PIN', price_usd: 4.50, price_pyg: 35100, is_available: true }
    ]
  },
  {
    id: 6,
    category_id: 6,
    title: 'PlayStation Network Gift Card $50 USD',
    slug: 'psn-card-50-usd',
    description: 'Código digital oficial de 12 dígitos para recargar billetera en cuentas PSN de Estados Unidos.',
    product_type: 'GIFTCARD',
    platform: 'PSN',
    price_usd: 50.00,
    price_pyg: 390000,
    cover_url: '/assets/giftcards/psn50.jpg',
    banner_url: '',
    is_featured: false,
    is_active: true,
    slots: [
      { id: 601, slot_type: 'CODE', slot_label: 'Código Digital Inmediato', price_usd: 50.00, price_pyg: 390000, is_available: true }
    ]
  }
];

export async function getCategories() {
  if (isDbConnected()) {
    try {
      const res = await query('SELECT * FROM gb_categories WHERE is_active = TRUE ORDER BY sort_order ASC');
      return res.rows;
    } catch (e) {
      console.warn('⚠️ Fallback to memory categories:', e.message);
    }
  }
  return memoryCategories;
}

export async function getProducts({ category, platform, search, featured, limit = 50 }) {
  if (isDbConnected()) {
    try {
      let sql = `
        SELECT p.*, c.name as category_name, c.slug as category_slug,
               (SELECT COUNT(*) FROM gb_product_slots s WHERE s.product_id = p.id AND s.is_available = TRUE) as available_slots
        FROM gb_products p
        LEFT JOIN gb_categories c ON c.id = p.category_id
        WHERE p.is_active = TRUE
      `;
      const params = [];

      if (category) {
        params.push(category);
        sql += ` AND (c.slug = $${params.length} OR p.category_id::text = $${params.length})`;
      }
      if (platform) {
        params.push(platform);
        sql += ` AND p.platform = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
      }
      if (featured === true || featured === 'true') {
        sql += ` AND p.is_featured = TRUE`;
      }

      sql += ` ORDER BY p.is_featured DESC, p.created_at DESC LIMIT ${parseInt(limit, 10) || 50}`;
      const res = await query(sql, params);
      return res.rows;
    } catch (e) {
      console.warn('⚠️ Fallback to memory products:', e.message);
    }
  }

  // In-memory filtering
  return memoryProducts.filter(p => {
    if (!p.is_active) return false;
    if (category && p.category_id !== Number(category) && p.category_slug !== category) return false;
    if (platform && p.platform.toLowerCase() !== platform.toLowerCase()) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if ((featured === true || featured === 'true') && !p.is_featured) return false;
    return true;
  });
}

export async function getProductBySlugOrId(identifier) {
  if (isDbConnected()) {
    try {
      const isNumeric = !isNaN(Number(identifier));
      const whereClause = isNumeric ? 'p.id = $1' : 'p.slug = $1';
      const res = await query(
        `SELECT p.*, c.name as category_name
         FROM gb_products p
         LEFT JOIN gb_categories c ON c.id = p.category_id
         WHERE ${whereClause} LIMIT 1`,
        [identifier]
      );
      if (res.rows.length === 0) return null;
      const product = res.rows[0];

      // Fetch slots
      const slotsRes = await query(
        `SELECT id, slot_type, slot_label, price_usd, price_pyg, is_available
         FROM gb_product_slots
         WHERE product_id = $1 AND is_active = TRUE
         ORDER BY id ASC`,
        [product.id]
      );
      product.slots = slotsRes.rows;
      return product;
    } catch (e) {
      console.warn('⚠️ Fallback getProduct:', e.message);
    }
  }

  const p = memoryProducts.find(item => item.id === Number(identifier) || item.slug === identifier);
  return p || null;
}

export async function createProduct({ title, slug, categoryId, description, productType, platform, priceUsd, pricePyg, coverUrl, bannerUrl, isFeatured }) {
  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  if (isDbConnected()) {
    const res = await query(
      `INSERT INTO gb_products (category_id, title, slug, description, product_type, platform, price_usd, price_pyg, cover_url, banner_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [categoryId, title, finalSlug, description, productType || 'GAME', platform || 'PS5', priceUsd, pricePyg, coverUrl, bannerUrl, !!isFeatured]
    );
    return res.rows[0];
  } else {
    const newProd = {
      id: memoryProducts.length + 1,
      category_id: categoryId,
      title,
      slug: finalSlug,
      description,
      product_type: productType || 'GAME',
      platform: platform || 'PS5',
      price_usd: Number(priceUsd) || 0,
      price_pyg: Number(pricePyg) || 0,
      cover_url: coverUrl || '',
      banner_url: bannerUrl || '',
      is_featured: !!isFeatured,
      is_active: true,
      slots: []
    };
    memoryProducts.unshift(newProd);
    return newProd;
  }
}
