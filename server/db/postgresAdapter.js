import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let isConnected = false;

export async function initPostgres() {
  const dbUrl = config.db?.url || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('ℹ️ [PostgreSQL] No DATABASE_URL provided. Using resilient local JSON store.');
    return { connected: false, reason: 'NO_DATABASE_URL' };
  }

  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    });


    pool.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Pool] Idle client connection drop caught (auto-handled):', err.message);
    });

    // Test connection
    const client = await pool.connect();
    client.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Client] Handled client connection reset:', err.message);
    });
    console.log('🔌 [PostgreSQL / Supabase] Connected successfully to isolated GamesBoy cluster.');

    // Execute schema migration
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(sql);
      console.log('🛡️ [PostgreSQL] Isolated schema "gamesboy" and "gb_*" tables verified & ready.');
    }

    client.release();
    isConnected = true;
    return { connected: true, pool };
  } catch (error) {
    console.error('❌ [PostgreSQL / Supabase] Connection error:', error.message);
    console.warn('⚠️ Falling back to local storage engine.');
    isConnected = false;
    return { connected: false, error: error.message };
  }
}

export function getPool() {
  return pool;
}

export function isPgConnected() {
  return isConnected && pool !== null;
}

export function isConnectedFunc() {
  return isConnected && pool !== null;
}

export async function query(text, params) {
  if (!isConnected || !pool) {
    throw new Error('PostgreSQL is not connected');
  }
  return pool.query(text, params);
}

export async function loadFromPostgres() {

  if (!isConnected || !pool) return null;
  try {
    // 1. Try to load master snapshot from gb_platform_storage
    const snapshotRes = await pool.query(
      `SELECT data FROM gamesboy.gb_platform_storage WHERE key = 'marketplace_master_state'`
    );

    if (snapshotRes.rows.length > 0 && snapshotRes.rows[0].data) {
      console.log('⚡ [PostgreSQL / Supabase] Master state successfully loaded from Supabase Cloud.');
      return snapshotRes.rows[0].data;
    }

    // 2. If no snapshot yet, load from relational tables
    const state = {};

    const [usersRes, walletsRes, txsRes, subsRes, slotsRes, prodsRes, ordersRes, payoutsRes, settingsRes, bannersRes, brandsRes, tenantsRes, plansRes] = await Promise.allSettled([
      pool.query(`SELECT * FROM gamesboy.gb_users`),
      pool.query(`SELECT * FROM gamesboy.gb_wallets`),
      pool.query(`SELECT * FROM gamesboy.gb_wallet_transactions ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM gamesboy.gb_subscriptions`),
      pool.query(`SELECT * FROM gamesboy.gb_user_slots`),
      pool.query(`SELECT * FROM gamesboy.gb_store_products`),
      pool.query(`SELECT * FROM gamesboy.gb_user_store_orders ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM gamesboy.gb_payout_requests ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM gamesboy.gb_platform_settings LIMIT 1`),
      pool.query(`SELECT * FROM gamesboy.gb_hero_banners ORDER BY sort_order ASC`),
      pool.query(`SELECT * FROM gamesboy.gb_giftcard_brands`),
      pool.query(`SELECT * FROM gamesboy.gb_tenants`),
      pool.query(`SELECT * FROM gamesboy.gb_tenant_plans`)
    ]);

    if (tenantsRes.status === 'fulfilled' && tenantsRes.value.rows.length > 0) {
      state.tenants = tenantsRes.value.rows.map(r => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        customDomain: r.custom_domain,
        ownerUserId: r.owner_user_id,
        planId: r.plan_id,
        status: r.status,
        branding: r.branding || {},
        settings: r.settings || {},
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
    }

    if (plansRes.status === 'fulfilled' && plansRes.value.rows.length > 0) {
      state.tenant_plans = plansRes.value.rows.map(r => ({
        id: r.id,
        name: r.name,
        priceMonthlyUsd: parseFloat(r.price_monthly_usd || 0),
        maxSlotsAllowed: r.max_slots_allowed,
        maxProductsAllowed: r.max_products_allowed,
        customDomainEnabled: r.custom_domain_enabled,
        platformFeePercent: parseFloat(r.platform_fee_percent || 0),
        features: Array.isArray(r.features) ? r.features : []
      }));
    }

    if (usersRes.status === 'fulfilled' && usersRes.value.rows.length > 0) {
      state.users = usersRes.value.rows.map(r => ({ id: r.id, tenantId: r.tenant_id || 'tnt_gamesboy_main', name: r.name, email: r.email, role: r.role, avatar: r.avatar }));
    }

    if (walletsRes.status === 'fulfilled' && walletsRes.value.rows.length > 0) {
      state.wallets = {};
      walletsRes.value.rows.forEach(r => {
        state.wallets[r.user_id] = { balanceUsd: parseFloat(r.balance_usd), pendingEscrowUsd: parseFloat(r.pending_escrow_usd || 0) };
      });
    }

    if (bannersRes.status === 'fulfilled' && bannersRes.value.rows.length > 0) {
      state.hero_banners = bannersRes.value.rows.map(r => ({
        id: r.id,
        title: r.title,
        tagline: r.tagline,
        badge: r.badge,
        imgHorizontal: r.img_horizontal,
        imgVertical: r.img_vertical,
        ctaText: r.cta_text,
        ctaUrl: r.cta_url,
        sortOrder: r.sort_order,
        isActive: r.is_active
      }));
    }

    if (prodsRes.status === 'fulfilled' && prodsRes.value.rows.length > 0) {
      state.store_products = prodsRes.value.rows.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        platform: r.platform,
        priceUsd: parseFloat(r.price_usd || 0),
        primaryPricePyg: r.primary_price_pyg || undefined,
        secondaryPricePyg: r.secondary_price_pyg || undefined,
        primaryPriceUsd: r.primary_price_usd ? parseFloat(r.primary_price_usd) : undefined,
        secondaryPriceUsd: r.secondary_price_usd ? parseFloat(r.secondary_price_usd) : undefined,
        badge: r.badge,
        icon: r.icon,
        brandTheme: r.brand_theme,
        description: r.description,
        coverUrl: r.cover_url,
        coverImage: r.cover_image || r.cover_url,
        screenshots: Array.isArray(r.screenshots) ? r.screenshots : [],
        genre: r.genre || 'Acción',
        isAvailable: r.is_available !== false,
        stockCount: r.stock_count,
        codes: Array.isArray(r.codes) ? r.codes : []
      }));
    }

    if (brandsRes.status === 'fulfilled' && brandsRes.value.rows.length > 0) {
      state.giftcard_brands = brandsRes.value.rows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        logoUrl: r.logo_url,
        description: r.description,
        variations: Array.isArray(r.variations) ? r.variations : []
      }));
    }

    return Object.keys(state).length > 0 ? state : null;
  } catch (err) {
    console.warn('⚠️ [PostgreSQL] Could not load from cloud:', err.message);
    return null;
  }
}

let syncTimeout = null;
export function syncToPostgres(db) {
  if (!isConnected || !pool) return;

  // Debounce to batch multiple rapid saves into 1 async DB query
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(async () => {
    try {
      const serialized = JSON.stringify(db);
      await pool.query(
        `INSERT INTO gamesboy.gb_platform_storage (key, data, updated_at)
         VALUES ('marketplace_master_state', $1::jsonb, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
        [serialized]
      );
      console.log('☁️ [PostgreSQL / Supabase] State persisted atomically to Supabase cloud storage.');
    } catch (err) {
      console.warn('⚠️ [PostgreSQL Sync Warning]:', err.message);
    }
  }, 100);
}

export default {
  initPostgres,
  getPool,
  isPgConnected,
  isConnected: isConnectedFunc,
  loadFromPostgres,
  syncToPostgres,
  query
};


