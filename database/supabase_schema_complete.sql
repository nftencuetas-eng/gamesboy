-- =====================================================================
-- GAMESBOY.NET - ESQUEMA COMPLETO Y MIGRACIÓN SUPABASE POSTGRESQL 17
-- =====================================================================
-- Instrucciones: Abre el SQL Editor en tu panel de Supabase y ejecuta
-- este script completo para crear las tablas, índices, datos semilla y usuarios.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS gamesboy;
SET search_path TO gamesboy, public;

-- 1. TABLA DE USUARIOS Y ROLES (ADMIN, SELLER, CLIENT)
CREATE TABLE IF NOT EXISTS gamesboy.gb_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'seller', 'client')),
    branch TEXT DEFAULT 'PY', -- 'PY' (Paraguay), 'PA' (Panamá), 'GLOBAL'
    avatar TEXT DEFAULT '🎮',
    is_verified BOOLEAN DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE BILLETERAS Y SALDOS (DISPONIBLE Y EN GARANTÍA ESCROW)
CREATE TABLE IF NOT EXISTS gamesboy.gb_wallets (
    user_id TEXT PRIMARY KEY REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    balance_usd NUMERIC(12, 2) DEFAULT 0.00 CHECK (balance_usd >= 0),
    pending_escrow_usd NUMERIC(12, 2) DEFAULT 0.00 CHECK (pending_escrow_usd >= 0),
    currency TEXT DEFAULT 'USD',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE SUSCRIPCIONES Y CUENTAS COMPARTIDAS
CREATE TABLE IF NOT EXISTS gamesboy.gb_subscriptions (
    id TEXT PRIMARY KEY,
    seller_id TEXT REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    is_official BOOLEAN DEFAULT false,
    service_name TEXT NOT NULL,
    category TEXT DEFAULT 'streaming',
    plan_name TEXT NOT NULL,
    total_slots INT NOT NULL CHECK (total_slots > 0),
    available_slots INT NOT NULL CHECK (available_slots >= 0),
    price_per_slot_usd NUMERIC(10, 2) NOT NULL,
    payout_to_seller_usd NUMERIC(10, 2) NOT NULL,
    credentials_encrypted TEXT NOT NULL,
    pins_encrypted TEXT DEFAULT '{}',
    instructions TEXT NOT NULL,
    status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'sold_out', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

-- 4. TABLA DE PRODUCTOS DE LA TIENDA (JUEGOS DIGITALES & TARJETAS DE REGALO)
CREATE TABLE IF NOT EXISTS gamesboy.gb_store_products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('game_key', 'gift_card', 'software')),
    platform TEXT, -- 'PS5', 'PS4', 'PC', 'XBOX', 'NINTENDO'
    brand_theme TEXT, -- 'psn', 'xbox', 'steam', 'netflix', 'spotify', 'roblox'
    icon TEXT,
    price_usd NUMERIC(10, 2) NOT NULL,
    cover_url TEXT,
    stock_keys JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE BANNERS HERO ACCORDION (PORTADAS ENEBA)
CREATE TABLE IF NOT EXISTS gamesboy.gb_hero_banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tagline TEXT,
    badge TEXT,
    img_horizontal TEXT NOT NULL,
    img_vertical TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Comprar ahora',
    cta_url TEXT DEFAULT '#section-games',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE COMPRAS DE SLOTS / CUPOS (ENTREGA A BÓVEDA DEL CLIENTE)
CREATE TABLE IF NOT EXISTS gamesboy.gb_user_slots (
    id TEXT PRIMARY KEY,
    subscription_id TEXT REFERENCES gamesboy.gb_subscriptions(id) ON DELETE SET NULL,
    user_id TEXT REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    slot_number INT NOT NULL,
    assigned_pin TEXT,
    price_paid_usd NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'refunded', 'reported_issue')),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 7. TABLA DE TRANSACCIONES Y RECARGAS (SIPAP / BINANCE)
CREATE TABLE IF NOT EXISTS gamesboy.gb_wallet_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase', 'payout', 'refund', 'commission')),
    amount_usd NUMERIC(10, 2) NOT NULL,
    amount_local NUMERIC(14, 2),
    currency TEXT DEFAULT 'PYG',
    payment_method TEXT, -- 'sipap_paraguay', 'binance_usdt', 'internal_wallet'
    reference TEXT,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by TEXT REFERENCES gamesboy.gb_users(id)
);

-- 8. TABLA DE SOLICITUDES DE RETIRO DE VENDEDORES
CREATE TABLE IF NOT EXISTS gamesboy.gb_payout_requests (
    id TEXT PRIMARY KEY,
    seller_id TEXT REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    amount_usd NUMERIC(10, 2) NOT NULL,
    method TEXT NOT NULL,
    account_details TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 9. TABLA DE CONFIGURACIONES GLOBALES Y SUCURSALES
CREATE TABLE IF NOT EXISTS gamesboy.gb_platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    commission_percent NUMERIC(5, 2) DEFAULT 15.00,
    exchange_rate_pyg NUMERIC(10, 2) DEFAULT 7500.00,
    paraguay_bank_details JSONB DEFAULT '{
        "bank": "Banco Familiar / Itaú Paraguay",
        "holder": "GamesBoy Paraguay S.A.",
        "ruc": "80091234-5",
        "account": "01-445566-7",
        "aliasSipap": "gamesboy.py"
    }'::jsonb,
    binance_details JSONB DEFAULT '{
        "binanceId": "849201934",
        "wallet": "0x71C9414B3b27bA134a6C3f07a757657A82e4b92F",
        "network": "USDT (BEP-20 / TRC-20)"
    }'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- SEED DATA: USUARIOS DE EJEMPLO Y CREDENCIALES
-- =====================================================================

-- 1. Administrador Master
INSERT INTO gamesboy.gb_users (id, email, password_hash, name, role, branch, avatar, is_verified)
VALUES (
    'usr_admin_master',
    'admin@gamesboy.net',
    'GamesBoy2026Master!',
    'Administrador Master GamesBoy',
    'admin',
    'PY',
    '⚙️',
    true
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = 'admin';

-- 2. Cliente Comprador Demo
INSERT INTO gamesboy.gb_users (id, email, password_hash, name, role, branch, avatar, is_verified)
VALUES (
    'usr_client_demo',
    'cliente@gamesboy.net',
    'ClientePass123!',
    'Lucas González (Cliente)',
    'client',
    'PY',
    '🎮',
    true
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 3. Vendedor Proveedor Demo
INSERT INTO gamesboy.gb_users (id, email, password_hash, name, role, branch, avatar, is_verified)
VALUES (
    'usr_seller_demo',
    'vendedor@gamesboy.net',
    'VendedorPass123!',
    'Carlos_PY (Vendedor Verificado ⭐)',
    'seller',
    'PY',
    '💼',
    true
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Billeteras Iniciales
INSERT INTO gamesboy.gb_wallets (user_id, balance_usd, pending_escrow_usd)
VALUES 
    ('usr_admin_master', 500.00, 45.00),
    ('usr_client_demo', 25.00, 0.00),
    ('usr_seller_demo', 120.00, 22.00)
ON CONFLICT (user_id) DO NOTHING;

-- Configuración Global Inicial
INSERT INTO gamesboy.gb_platform_settings (id, commission_percent, exchange_rate_pyg)
VALUES ('global_config', 15.00, 7500.00)
ON CONFLICT (id) DO NOTHING;

-- Portadas Banners Hero ENEBA
INSERT INTO gamesboy.gb_hero_banners (id, title, tagline, badge, img_horizontal, img_vertical, cta_text, cta_url, sort_order, is_active)
VALUES
    ('banner_fc25', 'EA SPORTS FC 25', 'CLUBES, ULTIMATE TEAM & MODO CARRERA', 'PS5 • XBOX • PC', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80', 'Ver Ediciones', '#section-games', 0, true),
    ('banner_spiderman2', 'Marvel Spider-Man 2', 'BE GREATER. TOGETHER.', 'PS5 EXCLUSIVE', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80', 'Comprar ahora', '#section-games', 1, true),
    ('banner_cod_bo6', 'Call of Duty: Black Ops 6', 'LA VERDAD MIENTE. VUELVE EL REY DEL SHOOTER', 'CROSS-GEN BUNDLE', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', 'Comprar Código', '#section-games', 2, true),
    ('banner_gta6', 'Grand Theft Auto VI', 'BIENVENIDO A LEONIDA & VICE CITY', 'NEXT-GEN PRE-ORDER', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80', 'Reservar Ahora', '#section-games', 3, true)
ON CONFLICT (id) DO NOTHING;
