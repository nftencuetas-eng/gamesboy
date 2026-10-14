-- ==========================================================
-- GAMESBOY.NET - CLEAN UNIFIED RELATIONAL SCHEMA
-- Architecture: PostgreSQL 14+
-- Security: Encrypted credentials, immutable wallet ledger, RBAC
-- ==========================================================

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS gb_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'SELLER', 'ADMIN')),
    full_name VARCHAR(150),
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wallets (One-to-one with Users)
CREATE TABLE IF NOT EXISTS gb_wallets (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES gb_users(id) ON DELETE CASCADE,
    balance_usd NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (balance_usd >= 0),
    balance_pyg NUMERIC(14, 0) NOT NULL DEFAULT 0 CHECK (balance_pyg >= 0),
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Wallet Transactions (Immutable Ledger)
CREATE TABLE IF NOT EXISTS gb_wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INT NOT NULL REFERENCES gb_wallets(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('DEPOSIT', 'PURCHASE', 'PAYOUT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'REFUND', 'ADJUSTMENT')),
    amount_usd NUMERIC(14, 2) NOT NULL,
    amount_pyg NUMERIC(14, 0) NOT NULL,
    balance_after_usd NUMERIC(14, 2) NOT NULL,
    balance_after_pyg NUMERIC(14, 0) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REJECTED')),
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Categories
CREATE TABLE IF NOT EXISTS gb_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'gamepad',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products & Games
CREATE TABLE IF NOT EXISTS gb_products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES gb_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    product_type VARCHAR(50) NOT NULL DEFAULT 'GAME' CHECK (product_type IN ('GAME', 'STREAMING', 'GIFTCARD', 'SOFTWARE', 'SERVICE')),
    platform VARCHAR(50) DEFAULT 'PS5',
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_pyg NUMERIC(14, 0) NOT NULL DEFAULT 0,
    cover_url TEXT,
    banner_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product Slots & Encrypted Accounts
CREATE TABLE IF NOT EXISTS gb_product_slots (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES gb_products(id) ON DELETE CASCADE,
    slot_type VARCHAR(50) NOT NULL DEFAULT 'PRIMARY' CHECK (slot_type IN ('PRIMARY', 'SECONDARY', 'FULL_ACCOUNT', 'CODE', 'PROFILE')),
    slot_label VARCHAR(100) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_pyg NUMERIC(14, 0) NOT NULL DEFAULT 0,
    credentials_encrypted TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    occupied_by_user_id INT REFERENCES gb_users(id) ON DELETE SET NULL,
    occupied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders & Purchases
CREATE TABLE IF NOT EXISTS gb_orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(32) UNIQUE NOT NULL,
    user_id INT NOT NULL REFERENCES gb_users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES gb_products(id) ON DELETE CASCADE,
    slot_id INT REFERENCES gb_product_slots(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED')),
    total_usd NUMERIC(10, 2) NOT NULL,
    total_pyg NUMERIC(14, 0) NOT NULL,
    delivery_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payout Requests
CREATE TABLE IF NOT EXISTS gb_payout_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES gb_users(id) ON DELETE CASCADE,
    amount_usd NUMERIC(10, 2) NOT NULL,
    amount_pyg NUMERIC(14, 0) NOT NULL,
    method VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    account_details JSONB,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 9. Platform Settings
CREATE TABLE IF NOT EXISTS gb_platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for high performance
CREATE INDEX IF NOT EXISTS idx_gb_products_cat ON gb_products(category_id);
CREATE INDEX IF NOT EXISTS idx_gb_slots_product ON gb_product_slots(product_id);
CREATE INDEX IF NOT EXISTS idx_gb_orders_user ON gb_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_gb_tx_wallet ON gb_wallet_transactions(wallet_id);

-- Initial Core Platform Settings
INSERT INTO gb_platform_settings (key, value, description)
VALUES 
    ('exchange_rate_pyg', '7800', 'Tasa de cambio 1 USD a Guaraníes'),
    ('platform_commission_pct', '10', 'Comisión general de la plataforma %'),
    ('support_whatsapp', '+595981000000', 'Número oficial de soporte WhatsApp'),
    ('maintenance_mode', 'false', 'Modo mantenimiento')
ON CONFLICT (key) DO NOTHING;

-- Default Categories
INSERT INTO gb_categories (name, slug, icon, sort_order)
VALUES 
    ('PlayStation 5', 'ps5', 'gamepad', 1),
    ('PlayStation 4', 'ps4', 'gamepad', 2),
    ('Xbox Series / One', 'xbox', 'gamepad', 3),
    ('PC / Steam', 'pc', 'monitor', 4),
    ('Streaming & Música', 'streaming', 'tv', 5),
    ('Gift Cards & Saldo', 'giftcards', 'credit-card', 6),
    ('Servicios & Herramientas', 'servicios', 'wrench', 7)
ON CONFLICT (slug) DO NOTHING;
