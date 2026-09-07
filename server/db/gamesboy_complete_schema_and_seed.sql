-- ============================================================================
-- GAMESBOY.NET - ESQUEMA COMPLETO Y SEED POSTGRESQL / SUPABASE
-- ============================================================================
-- Este script crea el esquema aislado 'gamesboy', sus tablas con prefijo 'gb_'
-- e inserta los usuarios reales, billeteras con saldos, banners y configuración.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gamesboy;
SET search_path TO gamesboy, public;

-- 1. TABLA DE USUARIOS DE GAMESBOY (100% aislada de auth.users)
CREATE TABLE IF NOT EXISTS gamesboy.gb_users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'client', -- 'admin', 'seller', 'client'
    avatar VARCHAR(255) DEFAULT '🎮',
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
    brand_theme VARCHAR(64) DEFAULT 'psn',
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

-- 10. BANNERS DINÁMICOS ESTILO ENEBA (ACORDEÓN EXPANDIBLE HERO)
CREATE TABLE IF NOT EXISTS gamesboy.gb_hero_banners (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    badge VARCHAR(64) DEFAULT 'PS5',
    img_horizontal TEXT NOT NULL,
    img_vertical TEXT NOT NULL,
    cta_text VARCHAR(64) DEFAULT 'Comprar ahora',
    cta_url TEXT DEFAULT '#',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA OFICIAL: USUARIOS, SALDOS REALES Y CONFIGURACIÓN INICIAL
-- ============================================================================

-- 1. Insertar Usuarios
INSERT INTO gamesboy.gb_users (id, name, email, role, avatar)
VALUES
    ('usr_admin', 'Admin GamesBoy', 'admin@gamesboy.net', 'admin', '👑'),
    ('usr_seller1', 'Carlos Streams', 'carlos@vendedor.com', 'seller', '💼'),
    ('usr_client1', 'Lucas González', 'lucas@cliente.com', 'client', '🎮'),
    ('usr_client2', 'María López', 'maria@cliente.com', 'client', '🌸')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    avatar = EXCLUDED.avatar;

-- 2. Insertar Billeteras con Saldos Reales en USD (Convertibles a Guaraníes)
INSERT INTO gamesboy.gb_wallets (user_id, balance_usd, pending_escrow_usd)
VALUES
    ('usr_admin', 1250.00, 0.00),     -- 9.375.000 Gs.
    ('usr_seller1', 85.50, 22.00),    -- 641.250 Gs. (+ 165.000 Gs. en Escrow)
    ('usr_client1', 25.00, 0.00),     -- 187.500 Gs.
    ('usr_client2', 50.00, 0.00)      -- 375.000 Gs.
ON CONFLICT (user_id) DO UPDATE SET
    balance_usd = EXCLUDED.balance_usd,
    pending_escrow_usd = EXCLUDED.pending_escrow_usd;

-- 3. Insertar Configuración Global de la Plataforma
INSERT INTO gamesboy.gb_platform_settings (id, commission_percent, exchange_rate_pyg, paraguay_bank_details, binance_details)
VALUES (
    'main_settings',
    15.00,
    7500.00,
    '{"bank": "Banco Familiar / Itaú Paraguay", "accountHolder": "GamesBoy Paraguay S.A.", "rucOrCi": "80091234-5", "accountNumber": "01-445566-7", "aliasSipap": "gamesboy.py"}'::jsonb,
    '{"payId": "849201934", "network": "USDT (Binance Pay / BEP-20 / TRC-20)", "walletAddress": "0x71C9414B3b27bA134a6C3f07a757657A82e4b92F", "qrUrl": "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x71C9414B3b27bA134a6C3f07a757657A82e4b92F"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    commission_percent = EXCLUDED.commission_percent,
    exchange_rate_pyg = EXCLUDED.exchange_rate_pyg,
    paraguay_bank_details = EXCLUDED.paraguay_bank_details,
    binance_details = EXCLUDED.binance_details;

-- 4. Insertar Portadas Hero Acordeón Estilo ENEBA
INSERT INTO gamesboy.gb_hero_banners (id, title, tagline, badge, img_horizontal, img_vertical, cta_text, cta_url, sort_order, is_active)
VALUES
    ('banner_fc25', 'EA SPORTS FC 25', 'CLUBES, ULTIMATE TEAM & MODO CARRERA', 'PS5 • XBOX • PC', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80', 'Ver Ediciones', '#section-games', 0, true),
    ('banner_spiderman2', 'Marvel Spider-Man 2', 'BE GREATER. TOGETHER.', 'PS5 EXCLUSIVE', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80', 'Comprar ahora', '#section-games', 1, true),
    ('banner_cod_bo6', 'Call of Duty: Black Ops 6', 'LA VERDAD MIENTE. VUELVE EL REY DEL SHOOTER', 'CROSS-GEN BUNDLE', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', 'Comprar Código', '#section-games', 2, true),
    ('banner_gta6', 'Grand Theft Auto VI', 'BIENVENIDO A LEONIDA & VICE CITY', 'NEXT-GEN PRE-ORDER', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80', 'Reservar Ahora', '#section-games', 3, true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    img_horizontal = EXCLUDED.img_horizontal,
    img_vertical = EXCLUDED.img_vertical,
    cta_text = EXCLUDED.cta_text,
    cta_url = EXCLUDED.cta_url,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- 5. Insertar Cuentas de Streaming Oficiales y de Vendedor
INSERT INTO gamesboy.gb_subscriptions (id, seller_id, seller_name, is_official, service_name, category, plan_name, total_slots, available_slots, price_per_slot_usd, credentials_encrypted, pins_encrypted, instructions, status)
VALUES
    ('sub_netflix_official', 'usr_admin', 'GamesBoy Oficial', true, 'Netflix Premium 4K', 'streaming', 'Ultra HD 4 Pantallas', 4, 3, 4.99, 'netflix.vip@gamesboy.net:::StreamPass2026!', '{"1": "1244", "2": "5821", "3": "9032", "4": "7110"}', 'Ingresa con el correo y contraseña provistos. Usa exclusivamente tu Perfil y PIN asignado.', 'active'),
    ('sub_spotify_official', 'usr_admin', 'GamesBoy Oficial', true, 'Spotify Premium Familiar', 'streaming', 'Plan Familiar 6 Cuentas', 5, 4, 3.99, 'https://spotify.com/family/join/invite/xyz987token:::Invitar a tu cuenta propia', '{}', 'Recibirás un enlace de invitación oficial para activar Spotify Premium en tu propia cuenta personal.', 'active'),
    ('sub_disney_official', 'usr_admin', 'GamesBoy Oficial', true, 'Disney+ Premium & Star+', 'streaming', 'Plan Premium 4K HDR', 4, 2, 4.99, 'disney.master@gamesboy.net:::MagicKingdom2026!', '{"1": "4091", "2": "8832", "3": "1944", "4": "6211"}', 'Acceso al catálogo completo de Disney, Marvel, Star Wars y deportes de ESPN.', 'active'),
    ('sub_max_official', 'usr_admin', 'GamesBoy Oficial', true, 'Max (HBO Max) 4K', 'streaming', 'Platino 4K Dolby Atmos', 3, 2, 4.99, 'max.vip@gamesboy.net:::HboMaxMaster2026!', '{"1": "3311", "2": "4422", "3": "5533"}', 'Disfruta de películas de Warner Bros, HBO Originales y Champions League.', 'active')
ON CONFLICT (id) DO UPDATE SET
    service_name = EXCLUDED.service_name,
    available_slots = EXCLUDED.available_slots,
    price_per_slot_usd = EXCLUDED.price_per_slot_usd;

-- 6. Insertar Productos de Tienda (Juegos Digitales y Gift Cards)
INSERT INTO gamesboy.gb_store_products (id, title, category, platform, price_usd, badge, icon, brand_theme, description, stock_count, codes)
VALUES
    ('prod_game_fc25', 'EA SPORTS FC 25', 'game_key', 'PlayStation 5', 59.99, 'PS5 / PS4', '⚽', 'psn', 'Clave digital original para PlayStation Store. Compatible con PS4 y PS5.', 15, '["FC25-PS5-9988-7744-1122", "FC25-PS5-3344-5566-7788"]'::jsonb),
    ('prod_game_codbo6', 'Call of Duty: Black Ops 6', 'game_key', 'PC / Steam', 69.99, 'STEAM / PC', '🎯', 'steam', 'Código digital para canjear en Steam o Battle.net.', 8, '["BO6-STM-4455-6677-8899"]'::jsonb),
    ('prod_game_rdr2', 'Red Dead Redemption 2', 'game_key', 'PC / Steam', 39.99, 'STEAM', '🤠', 'steam', 'Obra maestra de Rockstar Games para PC Steam.', 12, '["RDR2-STM-1122-3344-5566"]'::jsonb),
    ('prod_gc_psn_10', 'PlayStation Network $10 USD', 'gift_card', 'PlayStation', 10.00, 'USA / LATAM', '🎮', 'psn', 'Tarjeta de regalo digital de $10 USD para PlayStation Store USA.', 25, '["PSN-10-AABB-CCDD-EEFF", "PSN-10-1122-3344-5566"]'::jsonb),
    ('prod_gc_psn_20', 'PlayStation Network $20 USD', 'gift_card', 'PlayStation', 20.00, 'USA / LATAM', '🎮', 'psn', 'Tarjeta de regalo digital de $20 USD para PlayStation Store USA.', 18, '["PSN-20-9988-7766-5544"]'::jsonb),
    ('prod_gc_steam_10', 'Steam Wallet $10 USD', 'gift_card', 'Steam', 10.00, 'GLOBAL', '🕹️', 'steam', 'Código de recarga de $10 USD para la billetera de Steam.', 30, '["STM-10-ABCD-EFGH-IJKL"]'::jsonb),
    ('prod_gc_xbox_15', 'Xbox Game Pass Ultimate 1 Mes', 'gift_card', 'Xbox', 14.99, 'XBOX / PC', '💚', 'xbox', 'Suscripción de 1 mes a Xbox Game Pass Ultimate con más de 400 juegos.', 20, '["XGP-1M-5566-7788-9900"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price_usd = EXCLUDED.price_usd,
    stock_count = EXCLUDED.stock_count;
