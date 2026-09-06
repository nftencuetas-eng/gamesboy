import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cryptoService from '../services/cryptoService.js';
import postgresAdapter from '../db/postgresAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/marketplace_storage.json');

// Default initial database state with seed data
let db = {
  users: [
    { id: 'usr_admin', name: 'Admin GamesBoy', email: 'admin@gamesboy.net', role: 'admin', avatar: '👑' },
    { id: 'usr_seller1', name: 'Carlos_Streams', email: 'carlos@vendedor.com', role: 'seller', avatar: '💼' },
    { id: 'usr_client1', name: 'Lucas_Py', email: 'lucas@cliente.com', role: 'client', avatar: '🎮' }
  ],
  wallets: {
    'usr_admin': { balanceUsd: 1250.00, pendingEscrowUsd: 0 },
    'usr_seller1': { balanceUsd: 85.50, pendingEscrowUsd: 22.00 },
    'usr_client1': { balanceUsd: 25.00, pendingEscrowUsd: 0 }
  },
  wallet_transactions: [
    {
      id: 'tx_init_1',
      userId: 'usr_client1',
      userName: 'Lucas_Py',
      type: 'deposit',
      amountUsd: 25.00,
      currency: 'PYG',
      localAmount: 187500,
      method: 'sipap_paraguay',
      status: 'approved',
      reference: 'SIPAP-REF-892144',
      receiptUrl: '',
      notes: 'Recarga aprobada por administración',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  subscriptions: [
    {
      id: 'sub_netflix_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'Netflix Premium 4K',
      category: 'streaming',
      planName: 'Ultra HD 4 Pantallas',
      totalSlots: 4,
      availableSlots: 3,
      pricePerSlotUsd: 3.50,
      credentialsEncrypted: cryptoService.encrypt('netflix.vip@gamesboy.net:::StreamPass2026!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '1244', 2: '5821', 3: '9032', 4: '7110' })),
      instructions: 'Ingresa con el correo y contraseña provistos. Usa exclusivamente tu Perfil y PIN asignado. Prohibido cambiar credenciales.',
      status: 'active',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'sub_chatgpt_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'ChatGPT Plus (GPT-4o)',
      category: 'ai',
      planName: 'Plus Team Seat',
      totalSlots: 3,
      availableSlots: 2,
      pricePerSlotUsd: 6.00,
      credentialsEncrypted: cryptoService.encrypt('ai.plus@gamesboy.net:::OpenAiMaster99!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: 'UserA', 2: 'UserB', 3: 'UserC' })),
      instructions: 'Acceso directo a ChatGPT Plus con GPT-4o, generación de imágenes DALL-E y Canvas.',
      status: 'active',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'sub_spotify_seller1',
      sellerId: 'usr_seller1',
      sellerName: 'Carlos_Streams',
      isOfficial: false,
      serviceName: 'Spotify Premium Familiar',
      category: 'streaming',
      planName: 'Plan Familiar 6 Cuentas',
      totalSlots: 5,
      availableSlots: 4,
      pricePerSlotUsd: 1.80,
      credentialsEncrypted: cryptoService.encrypt('https://spotify.com/family/join/invite/xyz987token:::Invitar a tu cuenta propia'),
      pinsEncrypted: cryptoService.encrypt('{}'),
      instructions: 'Recibirás un enlace de invitación oficial para activar Spotify Premium en tu propia cuenta personal.',
      status: 'active',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'sub_disney_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'Disney+ Premium & Star+',
      category: 'streaming',
      planName: 'Plan Premium 4K HDR',
      totalSlots: 4,
      availableSlots: 3,
      pricePerSlotUsd: 2.80,
      credentialsEncrypted: cryptoService.encrypt('disney.master@gamesboy.net:::MagicKingdom2026!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '4091', 2: '8832', 3: '1944', 4: '6211' })),
      instructions: 'Acceso al catálogo completo de Disney, Marvel, Star Wars y deportes de ESPN.',
      status: 'active',
      createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'sub_canva_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'Canva Pro Diseñador',
      category: 'ai',
      planName: 'Equipo Pro Ilimitado',
      totalSlots: 5,
      availableSlots: 4,
      pricePerSlotUsd: 2.50,
      credentialsEncrypted: cryptoService.encrypt('https://canva.com/brand/join?token=canvaGamesboy2026:::Invitación a equipo Pro'),
      pinsEncrypted: cryptoService.encrypt('{}'),
      instructions: 'Te unes a nuestro equipo de Canva Pro con tu propio correo, manteniendo todos tus diseños privados.',
      status: 'active',
      createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'sub_youtube_seller1',
      sellerId: 'usr_seller1',
      sellerName: 'Carlos_Streams',
      isOfficial: false,
      serviceName: 'YouTube Premium & Music',
      category: 'streaming',
      planName: 'Familiar Sin Anuncios',
      totalSlots: 5,
      availableSlots: 3,
      pricePerSlotUsd: 2.00,
      credentialsEncrypted: cryptoService.encrypt('https://families.google.com/join/yt-gamesboy-py:::Invitación Grupo Familiar'),
      pinsEncrypted: cryptoService.encrypt('{}'),
      instructions: 'YouTube sin anuncios, descargas offline y YouTube Music en tu propia cuenta de Google.',
      status: 'active',
      createdAt: new Date(Date.now() - 21600000).toISOString()
    }
  ],
  user_slots: [
    {
      id: 'slot_active_1',
      subscriptionId: 'sub_netflix_official',
      serviceName: 'Netflix Premium 4K',
      buyerId: 'usr_client1',
      buyerName: 'Lucas_Py',
      slotNumber: 1,
      assignedPin: '1244',
      credentialsEncrypted: cryptoService.encrypt('netflix.vip@gamesboy.net:::StreamPass2026!'),
      pricePaidUsd: 3.50,
      expiresAt: new Date(Date.now() + 2592000000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  store_products: [
    {
      id: 'prod_steam_10',
      title: 'Steam Gift Card $10 USD',
      category: 'gift_card',
      platform: 'Steam',
      priceUsd: 10.00,
      badge: 'Entrega Inmediata',
      icon: '🎮',
      description: 'Tarjeta de regalo digital oficial para recargar tu billetera de Steam.',
      stockCount: 15,
      codes: ['STEAM-9821-KLA9-9921', 'STEAM-4412-ZZMA-7712', 'STEAM-1902-OPPA-5511']
    },
    {
      id: 'prod_psn_10',
      title: 'PlayStation Network Card $10 USD',
      category: 'gift_card',
      platform: 'PlayStation',
      priceUsd: 10.50,
      badge: 'Código Digital',
      icon: '🟦',
      description: 'Código digital de PlayStation Store para compras de juegos y suscripciones.',
      stockCount: 8,
      codes: ['PSN-9844-3312-8841', 'PSN-1123-5599-2244']
    },
    {
      id: 'prod_xbox_pass',
      title: 'Xbox Game Pass Ultimate (1 Mes)',
      category: 'gift_card',
      platform: 'Xbox',
      priceUsd: 8.50,
      badge: 'Mejor Precio',
      icon: '🟩',
      description: 'Acceso ilimitado a más de 100 juegos de consola y PC + EA Play.',
      stockCount: 12,
      codes: ['XBOX-GPU1-9988-2233-1122', 'XBOX-GPU1-5544-7766-3344']
    },
    {
      id: 'prod_google_play_10',
      title: 'Google Play Gift Card $10 USD',
      category: 'gift_card',
      platform: 'Google Play',
      priceUsd: 10.00,
      badge: 'Oficial',
      icon: '📱',
      description: 'Recarga saldo en tu cuenta de Google Play para apps, juegos y gemas.',
      stockCount: 20,
      codes: ['GPLAY-8899-2233-4455', 'GPLAY-1122-3344-5566']
    },
    {
      id: 'prod_roblox_10',
      title: 'Roblox 800 Robux Card ($10)',
      category: 'gift_card',
      platform: 'Roblox',
      priceUsd: 9.80,
      badge: 'Popular',
      icon: '🟥',
      description: 'Tarjeta de 800 Robux para avatares, skins y pases de juego en Roblox.',
      stockCount: 10,
      codes: ['ROBLOX-8833-2299-1144', 'ROBLOX-5566-7788-9900']
    }
  ],
  user_store_orders: [],
  payout_requests: [
    {
      id: 'payout_sample_1',
      sellerId: 'usr_seller1',
      sellerName: 'Carlos_Streams',
      amountUsd: 30.00,
      method: 'sipap_paraguay',
      status: 'pending',
      accountDetails: {
        bank: 'Banco Familiar',
        accountHolder: 'Carlos Vendedor',
        ci: '3.456.789',
        accountNumber: '03-998877-1',
        aliasSipap: 'carlos.stream.py'
      },
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  platform_settings: {
    commissionPercent: 15,
    exchangeRatePyg: 7500,
    paraguayBankDetails: {
      bank: 'Banco Familiar / Itaú Paraguay',
      accountHolder: 'GamesBoy Paraguay S.A.',
      rucOrCi: '80091234-5',
      accountNumber: '01-445566-7',
      aliasSipap: 'gamesboy.py'
    },
    binanceDetails: {
      payId: '849201934',
      walletAddress: '0x71C9414B3b27bA134a6C3f07a757657A82e4b92F',
      network: 'USDT (Binance Pay / BEP-20 / TRC-20)',
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x71C9414B3b27bA134a6C3f07a757657A82e4b92F'
    }
  }
};

// Persistence functions
function initStorage() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      db = { ...db, ...data };
    } catch (e) {
      console.warn('⚠️ Could not parse existing marketplace storage, writing defaults.');
      saveStorage();
    }
  } else {
    saveStorage();
  }
}

export function saveStorage() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error saving marketplace storage:', e);
  }
}

export async function initDatabase() {
  initStorage();
  const pgResult = await postgresAdapter.initPostgres();
  console.log(`✅ [Database: Marketplace Engine] Active with multi-currency wallet, credential vault & store. (PostgreSQL: ${pgResult.connected ? 'CONNECTED (Isolated Schema)' : 'LOCAL PERSISTENT STORE'})`);
  return { connected: true, driver: pgResult.connected ? 'postgresql-supabase-isolated' : 'gamesboy-marketplace-store' };
}

// Database query & mutation methods
export function getDb() {
  return db;
}

export default {
  initDatabase,
  getDb,
  saveStorage
};
