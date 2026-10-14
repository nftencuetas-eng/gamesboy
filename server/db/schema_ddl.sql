-- ============================================================================
-- GAMESBOY.NET — ESQUEMA DDL IDEMPOTENTE Y BLINDADO (schema_ddl.sql)
-- Responsabilidad: Estructura, Tablas, Columnas e Índices exclusivamente (DDL).
-- REGLA DE ORO: CERO sentencias INSERT, CERO UPDATE, CERO DELETE.
-- Puede ejecutarse de forma segura en cualquier momento sin alterar datos existentes.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gamesboy;
SET search_path TO gamesboy, public;

-- 1. TABLA DE PLANES SAAS
CREATE TABLE IF NOT EXISTS gamesboy.gb_tenant_plans (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    price_monthly_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_slots_allowed INT DEFAULT 100,
    max_products_allowed INT DEFAULT 50,
    custom_domain_enabled BOOLEAN DEFAULT false,
    platform_fee_percent NUMERIC(5, 2) DEFAULT 5.00,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA MAESTRA DE INQUILINOS / TIENDAS (TENANTS)
CREATE TABLE IF NOT EXISTS gamesboy.gb_tenants (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    owner_user_id VARCHAR(64),
    plan_id VARCHAR(32) REFERENCES gamesboy.gb_tenant_plans(id) DEFAULT 'plan_enterprise',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    branding JSONB NOT NULL DEFAULT '{}'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USUARIOS Y ROLES (ADMIN, SELLER, CLIENT)
CREATE TABLE IF NOT EXISTS gamesboy.gb_users (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'client',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BILLETERAS DE USUARIOS Y SALDOS REALES
CREATE TABLE IF NOT EXISTS gamesboy.gb_wallets (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    balance_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pending_escrow_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. HISTORIAL DE RECARGAS, COMPRAS Y MOVIMIENTOS (LEDGER INMUTABLE)
CREATE TABLE IF NOT EXISTS gamesboy.gb_wallet_transactions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    amount_usd NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(16) DEFAULT 'USD',
    local_amount NUMERIC(16, 2) DEFAULT 0,
    method VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    reference VARCHAR(255),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SUSCRIPCIONES STREAMING Y CUENTAS COMPARTIDAS
CREATE TABLE IF NOT EXISTS gamesboy.gb_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    seller_name VARCHAR(255) NOT NULL,
    is_official BOOLEAN DEFAULT false,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    total_slots INT NOT NULL DEFAULT 1,
    available_slots INT NOT NULL DEFAULT 1,
    price_per_slot_usd NUMERIC(10, 2) NOT NULL,
    credentials_encrypted TEXT NOT NULL,
    pins_encrypted TEXT NOT NULL,
    instructions TEXT,
    status VARCHAR(32) DEFAULT 'active',
    renew_discount_percent INT DEFAULT 5,
    group_chat_messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CUPOS ADQUIRIDOS POR CLIENTES (BÓVEDA DE CREDENCIALES)
CREATE TABLE IF NOT EXISTS gamesboy.gb_user_slots (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    subscription_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_subscriptions(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    buyer_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    buyer_name VARCHAR(255) NOT NULL,
    slot_number INT NOT NULL,
    assigned_pin VARCHAR(64),
    credentials_encrypted TEXT NOT NULL,
    price_paid_usd NUMERIC(10, 2) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PRODUCTOS DE TIENDA DIGITAL (VIDEOJUEGOS Y GIFT CARDS)
CREATE TABLE IF NOT EXISTS gamesboy.gb_store_products (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    platform VARCHAR(64) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    primary_price_pyg INT DEFAULT 0,
    secondary_price_pyg INT DEFAULT 0,
    primary_price_usd NUMERIC(10, 2) DEFAULT 0.00,
    secondary_price_usd NUMERIC(10, 2) DEFAULT 0.00,
    badge VARCHAR(64),
    icon VARCHAR(32),
    brand_theme VARCHAR(64) DEFAULT 'psn',
    description TEXT,
    cover_url TEXT,
    cover_image TEXT,
    screenshots JSONB DEFAULT '[]'::jsonb,
    genre VARCHAR(128) DEFAULT 'Acción',
    stock_count INT DEFAULT 0,
    codes JSONB DEFAULT '[]'::jsonb,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ÓRDENES DE TIENDA
CREATE TABLE IF NOT EXISTS gamesboy.gb_user_store_orders (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_store_products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. SOLICITUDES DE RETIRO (PAYOUTS)
CREATE TABLE IF NOT EXISTS gamesboy.gb_payout_requests (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    seller_name VARCHAR(255) NOT NULL,
    amount_usd NUMERIC(12, 2) NOT NULL,
    method VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',
    account_details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. CONFIGURACIÓN GLOBAL DE PLATAFORMA
CREATE TABLE IF NOT EXISTS gamesboy.gb_platform_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'main_settings',
    commission_percent NUMERIC(5, 2) DEFAULT 15.00,
    exchange_rate_pyg NUMERIC(10, 2) DEFAULT 7500.00,
    paraguay_bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    binance_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. BANNERS HERO ACORDEÓN
CREATE TABLE IF NOT EXISTS gamesboy.gb_hero_banners (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT '',
    tagline VARCHAR(255) DEFAULT '',
    badge VARCHAR(64) DEFAULT '',
    img_horizontal TEXT DEFAULT '',
    img_vertical TEXT DEFAULT '',
    cta_text VARCHAR(64) DEFAULT '',
    cta_url TEXT DEFAULT '#section-games',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. MARCAS Y VARIACIONES DE GIFT CARDS
CREATE TABLE IF NOT EXISTS gamesboy.gb_giftcard_brands (
    id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'tnt_gamesboy_main' REFERENCES gamesboy.gb_tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'Gaming',
    logo_url TEXT NOT NULL,
    description TEXT,
    variations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. SNAPSHOT MAESTRO GLOBAL (BACKUP ATÓMICO EN NUBE)
CREATE TABLE IF NOT EXISTS gamesboy.gb_platform_storage (
    key VARCHAR(64) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. MIGRACIONES NO DESTRUCTIVAS DE COLUMNAS EXISTENTES
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS primary_price_pyg INT DEFAULT 0;
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS secondary_price_pyg INT DEFAULT 0;
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS primary_price_usd NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS secondary_price_usd NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS screenshots JSONB DEFAULT '[]'::jsonb;
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS genre VARCHAR(128) DEFAULT 'Acción';
ALTER TABLE gamesboy.gb_store_products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- 16. ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_users_tenant ON gamesboy.gb_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subs_tenant ON gamesboy.gb_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_slots_tenant ON gamesboy.gb_user_slots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON gamesboy.gb_store_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON gamesboy.gb_user_store_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tx_tenant ON gamesboy.gb_wallet_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_banners_tenant ON gamesboy.gb_hero_banners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON gamesboy.gb_tenants(slug);
