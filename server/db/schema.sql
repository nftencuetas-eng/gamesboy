-- ============================================================================
-- GAMESBOY.NET - ISOLATED POSTGRESQL SCHEMA (SUPABASE MULTI-TENANT READY)
-- ============================================================================
-- Este script crea un esquema aislado y tablas con prefijo 'gb_' para garantizar
-- que NO interfiera ni comparta usuarios/datos con ningún otro proyecto en la misma
-- base de datos de Supabase.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gamesboy;
SET search_path TO gamesboy, public;

-- 1. TABLA DE USUARIOS DE GAMESBOY (100% aislada de auth.users o usuarios de otros proyectos)
CREATE TABLE IF NOT EXISTS gamesboy.gb_users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'client', -- 'admin', 'seller', 'client'
    avatar VARCHAR(64) DEFAULT '🎮',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BILLETERAS DE USUARIO (Saldo USD + Fondos en Escrow)
CREATE TABLE IF NOT EXISTS gamesboy.gb_wallets (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    balance_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pending_escrow_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. HISTORIAL DE RECARGAS, COMPRAS Y MOVIMIENTOS
CREATE TABLE IF NOT EXISTS gamesboy.gb_wallet_transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL, -- 'deposit', 'subscription_purchase', 'store_purchase', 'escrow_release', 'payout'
    amount_usd NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(16) DEFAULT 'USD',
    local_amount NUMERIC(16, 2) DEFAULT 0,
    method VARCHAR(64), -- 'sipap_paraguay', 'binance_usdt', 'internal_wallet'
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reference VARCHAR(255),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SUSCRIPCIONES CO-STREAMING / CUENTAS COMPARTIDAS
CREATE TABLE IF NOT EXISTS gamesboy.gb_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    seller_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    seller_name VARCHAR(255) NOT NULL,
    is_official BOOLEAN DEFAULT false,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'streaming', 'ai', 'gaming', 'music'
    plan_name VARCHAR(255) NOT NULL,
    total_slots INT NOT NULL DEFAULT 1,
    available_slots INT NOT NULL DEFAULT 1,
    price_per_slot_usd NUMERIC(10, 2) NOT NULL,
    credentials_encrypted TEXT NOT NULL,
    pins_encrypted TEXT NOT NULL,
    instructions TEXT,
    status VARCHAR(32) DEFAULT 'active', -- 'active', 'paused', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CUPOS ADQUIRIDOS POR CLIENTES (Bóveda de Credenciales con PIN Asignado)
CREATE TABLE IF NOT EXISTS gamesboy.gb_user_slots (
    id VARCHAR(64) PRIMARY KEY,
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

-- 6. TIENDA DIGITAL / GIFT CARDS & KEYS
CREATE TABLE IF NOT EXISTS gamesboy.gb_store_products (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'gift_card', 'license', 'game_key'
    platform VARCHAR(64) NOT NULL, -- 'Steam', 'PlayStation', 'Xbox', etc.
    price_usd NUMERIC(10, 2) NOT NULL,
    badge VARCHAR(64),
    icon VARCHAR(32),
    description TEXT,
    stock_count INT DEFAULT 0,
    codes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ORDENES DE COMPRA DE TIENDA
CREATE TABLE IF NOT EXISTS gamesboy.gb_user_store_orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_store_products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SOLICITUDES DE RETIRO (PAYOUTS PARA VENDEDORES)
CREATE TABLE IF NOT EXISTS gamesboy.gb_payout_requests (
    id VARCHAR(64) PRIMARY KEY,
    seller_id VARCHAR(64) NOT NULL REFERENCES gamesboy.gb_users(id) ON DELETE CASCADE,
    seller_name VARCHAR(255) NOT NULL,
    amount_usd NUMERIC(12, 2) NOT NULL,
    method VARCHAR(64) NOT NULL, -- 'sipap_paraguay', 'binance_usdt'
    status VARCHAR(32) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    account_details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. CONFIGURACIÓN GENERAL DE LA PLATAFORMA (Comisiones, Cotización Guaraníes, Datos Bancarios)
CREATE TABLE IF NOT EXISTS gamesboy.gb_platform_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'main_settings',
    commission_percent NUMERIC(5, 2) DEFAULT 15.00,
    exchange_rate_pyg NUMERIC(10, 2) DEFAULT 7500.00,
    paraguay_bank_details JSONB NOT NULL,
    binance_details JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
