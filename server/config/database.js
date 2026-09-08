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
    { id: 'usr_admin', name: 'Admin GamesBoy', email: 'admin@gamesboy.net', role: 'admin', avatar: '/assets/branding/icon.png' },
    { id: 'usr_seller1', name: 'Carlos_Streams', email: 'carlos@vendedor.com', role: 'seller', avatar: '/assets/branding/icon.png' },
    { id: 'usr_client1', name: 'Lucas_Py', email: 'lucas@cliente.com', role: 'client', avatar: '/assets/branding/icon.png' },
    { id: 'usr_client2', name: 'María López', email: 'maria@cliente.com', role: 'client', avatar: '/assets/branding/icon.png' }
  ],
  wallets: {
    'usr_admin': { balanceUsd: 1250.00, pendingEscrowUsd: 0 },
    'usr_seller1': { balanceUsd: 85.50, pendingEscrowUsd: 22.00 },
    'usr_client1': { balanceUsd: 25.00, pendingEscrowUsd: 0 },
    'usr_client2': { balanceUsd: 50.00, pendingEscrowUsd: 0 }
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
  hero_banners: [
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
      title: 'Marvel Spider-Man 2',
      tagline: 'BE GREATER. TOGETHER.',
      badge: 'PS5 EXCLUSIVE',
      imgHorizontal: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
      imgVertical: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      ctaText: 'Comprar ahora ➔',
      ctaUrl: '#section-games',
      sortOrder: 1,
      isActive: true
    },
    {
      id: 'banner_cod_bo6',
      title: 'Call of Duty: Black Ops 6',
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
      title: 'Grand Theft Auto VI',
      tagline: 'BIENVENIDO A LEONIDA & VICE CITY',
      badge: 'NEXT-GEN PRE-ORDER',
      imgHorizontal: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80',
      imgVertical: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
      ctaText: 'Reservar Ahora',
      ctaUrl: '#section-games',
      sortOrder: 3,
      isActive: true
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
      pricePerSlotUsd: 4.99,
      credentialsEncrypted: cryptoService.encrypt('netflix.vip@gamesboy.net:::StreamPass2026!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '1244', 2: '5821', 3: '9032', 4: '7110' })),
      instructions: 'Ingresa con el correo y contraseña provistos. Usa exclusivamente tu Perfil y PIN asignado. Prohibido cambiar credenciales.',
      status: 'active',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'sub_spotify_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'Spotify Premium Familiar',
      category: 'streaming',
      planName: 'Plan Familiar 6 Cuentas',
      totalSlots: 5,
      availableSlots: 4,
      pricePerSlotUsd: 3.99,
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
      availableSlots: 2,
      pricePerSlotUsd: 4.99,
      credentialsEncrypted: cryptoService.encrypt('disney.master@gamesboy.net:::MagicKingdom2026!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '4091', 2: '8832', 3: '1944', 4: '6211' })),
      instructions: 'Acceso al catálogo completo de Disney, Marvel, Star Wars y deportes de ESPN.',
      status: 'active',
      createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'sub_max_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'Max (HBO Max) 4K',
      category: 'streaming',
      planName: 'Platino 4K Dolby Atmos',
      totalSlots: 3,
      availableSlots: 2,
      pricePerSlotUsd: 4.99,
      credentialsEncrypted: cryptoService.encrypt('max.vip@gamesboy.net:::HboMaxMaster2026!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '3311', 2: '4422', 3: '5533' })),
      instructions: 'Disfruta de películas de Warner Bros, HBO Originales y Champions League.',
      status: 'active',
      createdAt: new Date(Date.now() - 36000000).toISOString()
    },
    {
      id: 'sub_youtube_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'YouTube Premium & Music',
      category: 'streaming',
      planName: 'Familiar Sin Anuncios',
      totalSlots: 5,
      availableSlots: 3,
      pricePerSlotUsd: 3.99,
      credentialsEncrypted: cryptoService.encrypt('https://families.google.com/join/yt-gamesboy-py:::Invitación Grupo Familiar'),
      pinsEncrypted: cryptoService.encrypt('{}'),
      instructions: 'YouTube sin anuncios, descargas offline y YouTube Music en tu propia cuenta de Google.',
      status: 'active',
      createdAt: new Date(Date.now() - 21600000).toISOString()
    },
    {
      id: 'sub_crunchyroll_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'Crunchyroll Mega Fan',
      category: 'streaming',
      planName: 'Mega Fan 4 Pantallas',
      totalSlots: 4,
      availableSlots: 3,
      pricePerSlotUsd: 3.99,
      credentialsEncrypted: cryptoService.encrypt('anime.vip@gamesboy.net:::CrunchyAnime99!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '7711', 2: '8822', 3: '9933', 4: '1100' })),
      instructions: 'Anime en simulcast desde Japón sin anuncios en calidad 1080p/4K.',
      status: 'active',
      createdAt: new Date(Date.now() - 18000000).toISOString()
    },
    {
      id: 'sub_appletv_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'Apple TV+ 4K',
      category: 'streaming',
      planName: 'Suscripción Compartida 4K',
      totalSlots: 3,
      availableSlots: 1,
      pricePerSlotUsd: 4.99,
      credentialsEncrypted: cryptoService.encrypt('appletv.latam@gamesboy.net:::AppleTvPlus2026!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '1122', 2: '3344', 3: '5566' })),
      instructions: 'Acceso a series galardonadas de Apple Original en todos tus dispositivos.',
      status: 'active',
      createdAt: new Date(Date.now() - 14000000).toISOString()
    },
    {
      id: 'sub_paramount_official',
      sellerId: 'usr_admin',
      sellerName: 'GamesBoy Oficial',
      isOfficial: true,
      serviceName: 'Paramount+ Premium',
      category: 'streaming',
      planName: 'Plan Estándar 3 Pantallas',
      totalSlots: 3,
      availableSlots: 2,
      pricePerSlotUsd: 3.99,
      credentialsEncrypted: cryptoService.encrypt('paramount.latam@gamesboy.net:::ParamountPlus2026!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '9090', 2: '8080', 3: '7070' })),
      instructions: 'Películas de estreno, deportes en vivo y series exclusivas de Paramount.',
      status: 'active',
      createdAt: new Date(Date.now() - 10000000).toISOString()
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
      pricePaidUsd: 4.99,
      expiresAt: new Date(Date.now() + 2592000000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  store_products: [
    // --- JUEGOS DIGITALES ---
    {
      id: 'game_fc25',
      title: 'EA SPORTS FC 25',
      category: 'game_key',
      platform: 'PS5',
      priceUsd: 59.99,
      badge: 'TOP VENTAS',
      icon: '⚽',
      coverUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
      description: 'Edición Estándar para PS5. Código digital oficial con entrega instantánea.',
      stockCount: 12,
      codes: ['FC25-PS5-9988-1122-3344', 'FC25-PS5-7766-5544-2211']
    },
    {
      id: 'game_cod_bo6',
      title: 'Call of Duty: Black Ops 6',
      category: 'game_key',
      platform: 'PS5',
      priceUsd: 69.99,
      badge: 'NUEVO LANZAMIENTO',
      icon: '🎯',
      coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      description: 'Lote Cross-Gen para PS4 y PS5. Campaña cinematográfica, Multijugador y Zombies.',
      stockCount: 15,
      codes: ['BO6-PS5-4433-2211-9988', 'BO6-PS5-1199-8877-6655']
    },
    {
      id: 'game_rdr2',
      title: 'Red Dead Redemption II',
      category: 'game_key',
      platform: 'PS5',
      priceUsd: 39.99,
      badge: 'OBRA MAESTRA',
      icon: '🤠',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      description: 'La aclamada aventura de Arthur Morgan y la banda de Van der Linde en el salvaje oeste.',
      stockCount: 8,
      codes: ['RDR2-PS5-8822-1144-7733']
    },
    {
      id: 'game_minecraft',
      title: 'Minecraft: Bedrock & Java',
      category: 'game_key',
      platform: 'PS5',
      priceUsd: 26.99,
      badge: 'FAMILIAR',
      icon: '🧱',
      coverUrl: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=600&q=80',
      description: 'Construye y explora mundos infinitos. Incluye 3500 Minecoins de regalo.',
      stockCount: 20,
      codes: ['MC-PS5-9911-3377-5522', 'MC-PS5-4488-2266-1133']
    },
    {
      id: 'game_eldenring',
      title: 'Elden Ring',
      category: 'game_key',
      platform: 'PS5',
      priceUsd: 39.99,
      badge: 'GOTY',
      icon: '⚔️',
      coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
      description: 'El galardonado RPG de acción de FromSoftware y George R. R. Martin.',
      stockCount: 10,
      codes: ['ELDEN-PS5-7711-9944-2288']
    },
    {
      id: 'game_gtav',
      title: 'Grand Theft Auto V: Premium',
      category: 'game_key',
      platform: 'PS5',
      priceUsd: 19.99,
      badge: 'POPULAR',
      icon: '🚗',
      coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
      description: 'Incluye Modo Historia completo, GTA Online y Criminal Enterprise Starter Pack.',
      stockCount: 18,
      codes: ['GTAV-PS5-5533-8811-4477', 'GTAV-PS5-2244-6688-9900']
    },
    {
      id: 'game_lastofus',
      title: 'The Last of Us Part I',
      category: 'game_key',
      platform: 'PS5',
      priceUsd: 49.99,
      badge: 'REMAKE PS5',
      icon: '🌿',
      coverUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80',
      description: 'Reconstruido desde cero para PS5 con gráficos de última generación y audio 3D.',
      stockCount: 7,
      codes: ['TLOU1-PS5-8833-2211-7744']
    },
    {
      id: 'game_spiderman2_game',
      title: 'Marvel Spider-Man 2',
      category: 'game_key',
      platform: 'PS5',
      priceUsd: 59.99,
      badge: 'DESTACADO',
      icon: '🕷️',
      coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      description: 'Juega como Peter Parker y Miles Morales enfrentando al temible Venom.',
      stockCount: 14,
      codes: ['SPIDY2-PS5-9922-1133-4488', 'SPIDY2-PS5-3377-5511-2299']
    },

    // --- TARJETAS DE REGALO (RETAIL HANG-TAB REALISTAS) ---
    {
      id: 'gc_psn_10',
      title: 'PlayStation Store Gift Card',
      category: 'gift_card',
      platform: 'PlayStation',
      priceUsd: 10.00,
      badge: 'OFICIAL PSN',
      icon: '🟦',
      brandTheme: 'psn',
      description: 'Tarjeta oficial de PlayStation Network con entrega digital de código PIN.',
      stockCount: 25,
      codes: ['PSN-10-8844-3312-8841', 'PSN-10-1123-5599-2244']
    },
    {
      id: 'gc_xbox_10',
      title: 'Xbox Gift Card',
      category: 'gift_card',
      platform: 'Xbox',
      priceUsd: 10.00,
      badge: 'OFICIAL XBOX',
      icon: '🟩',
      brandTheme: 'xbox',
      description: 'Saldo oficial para compras de juegos, pases y complementos en Microsoft Store y Xbox.',
      stockCount: 20,
      codes: ['XBOX-10-GPU1-9988-2233', 'XBOX-10-GPU1-5544-7766']
    },
    {
      id: 'gc_nintendo_20',
      title: 'Nintendo eShop Card',
      category: 'gift_card',
      platform: 'Nintendo',
      priceUsd: 20.00,
      badge: 'OFICIAL SWITCH',
      icon: '🔴',
      brandTheme: 'nintendo',
      description: 'Canjea juegos digitales y DLCs en la Nintendo eShop para Nintendo Switch.',
      stockCount: 15,
      codes: ['NIN-20-8899-2211-4433', 'NIN-20-5577-1133-9988']
    },
    {
      id: 'gc_steam_5',
      title: 'Steam Wallet Card',
      category: 'gift_card',
      platform: 'Steam',
      priceUsd: 5.00,
      badge: 'ENTREGA INMEDIATA',
      icon: '🎮',
      brandTheme: 'steam',
      description: 'Añade fondos a tu billetera de Steam para comprar juegos de PC y cosméticos.',
      stockCount: 30,
      codes: ['STEAM-5-9821-KLA9-9921', 'STEAM-5-4412-ZZMA-7712']
    },
    {
      id: 'gc_googleplay_10',
      title: 'Google Play Gift Card',
      category: 'gift_card',
      platform: 'Google Play',
      priceUsd: 10.00,
      badge: 'ANDROID & APPS',
      icon: '📱',
      brandTheme: 'googleplay',
      description: 'Saldo para juegos móviles, suscripciones y compras dentro de apps en Google Play.',
      stockCount: 25,
      codes: ['GPLAY-10-8899-2233-4455', 'GPLAY-10-1122-3344-5566']
    },
    {
      id: 'gc_apple_25',
      title: 'Apple Gift Card',
      category: 'gift_card',
      platform: 'Apple',
      priceUsd: 25.00,
      badge: 'APP STORE & ICLOUD',
      icon: '🍎',
      brandTheme: 'apple',
      description: 'Todo lo relacionado con Apple: apps, juegos, música, iCloud y suscripciones.',
      stockCount: 12,
      codes: ['APPLE-25-8833-2299-1144', 'APPLE-25-5566-7788-9900']
    },
    {
      id: 'gc_riot_10',
      title: 'Riot Games Prepaid Card',
      category: 'gift_card',
      platform: 'Riot Games',
      priceUsd: 10.00,
      badge: 'VALORANT & LOL',
      icon: '👊',
      brandTheme: 'riot',
      description: 'Canjea Valorant Points (VP) o Riot Points (RP) para skins y pases de batalla.',
      stockCount: 18,
      codes: ['RIOT-10-8811-3322-7744', 'RIOT-10-5599-1144-8833']
    },
    {
      id: 'gc_blizzard_20',
      title: 'Blizzard Battle.net Card',
      category: 'gift_card',
      platform: 'Blizzard',
      priceUsd: 20.00,
      badge: 'BATTLE.NET',
      icon: '❄️',
      brandTheme: 'blizzard',
      description: 'Saldo oficial para World of Warcraft, Overwatch 2, Diablo IV y Hearthstone.',
      stockCount: 14,
      codes: ['BLIZZ-20-9944-1133-7722', 'BLIZZ-20-4488-3311-6655']
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
  },
  giftcard_brands: [
    {
      id: 'brand_playstation',
      name: 'PlayStation Network',
      category: 'Gaming',
      logoUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
      description: 'Tarjetas oficiales de saldo y membresías PlayStation Plus.',
      variations: [
        { id: 'var_psn_10', name: 'PSN $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
        { id: 'var_psn_25', name: 'PSN $25 USD', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 },
        { id: 'var_psn_50', name: 'PSN $50 USD', denomination: '$50 USD', pricePyg: 410000, priceUsd: 50.00 },
        { id: 'var_psn_100', name: 'PSN $100 USD', denomination: '$100 USD', pricePyg: 810000, priceUsd: 100.00 },
        { id: 'var_psn_plus_1m', name: 'PS Plus Essential 1 Mes', denomination: '1 Mes', pricePyg: 90000, priceUsd: 11.99 },
        { id: 'var_psn_plus_12m', name: 'PS Plus Essential 12 Meses', denomination: '12 Meses', pricePyg: 620000, priceUsd: 79.99 }
      ]
    },
    {
      id: 'brand_steam',
      name: 'Steam Wallet',
      category: 'PC Gaming',
      logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
      description: 'Saldo para la tienda de Steam en PC y Steam Deck.',
      variations: [
        { id: 'var_steam_5', name: 'Steam $5 USD', denomination: '$5 USD', pricePyg: 42000, priceUsd: 5.00 },
        { id: 'var_steam_10', name: 'Steam $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
        { id: 'var_steam_20', name: 'Steam $20 USD', denomination: '$20 USD', pricePyg: 168000, priceUsd: 20.00 },
        { id: 'var_steam_50', name: 'Steam $50 USD', denomination: '$50 USD', pricePyg: 415000, priceUsd: 50.00 }
      ]
    },
    {
      id: 'brand_xbox',
      name: 'Xbox & Game Pass',
      category: 'Gaming',
      logoUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80',
      description: 'Tarjetas de regalo Xbox y suscripciones Game Pass Ultimate.',
      variations: [
        { id: 'var_xbox_10', name: 'Xbox $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
        { id: 'var_xbox_25', name: 'Xbox $25 USD', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 },
        { id: 'var_xbox_gpu_1m', name: 'Game Pass Ultimate 1 Mes', denomination: '1 Mes', pricePyg: 125000, priceUsd: 16.99 },
        { id: 'var_xbox_gpu_3m', name: 'Game Pass Ultimate 3 Meses', denomination: '3 Meses', pricePyg: 350000, priceUsd: 49.99 }
      ]
    },
    {
      id: 'brand_nintendo',
      name: 'Nintendo eShop',
      category: 'Gaming',
      logoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
      description: 'Saldo para comprar juegos en Nintendo Switch.',
      variations: [
        { id: 'var_nin_10', name: 'Nintendo $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
        { id: 'var_nin_20', name: 'Nintendo $20 USD', denomination: '$20 USD', pricePyg: 170000, priceUsd: 20.00 },
        { id: 'var_nin_35', name: 'Nintendo $35 USD', denomination: '$35 USD', pricePyg: 295000, priceUsd: 35.00 },
        { id: 'var_nin_50', name: 'Nintendo $50 USD', denomination: '$50 USD', pricePyg: 420000, priceUsd: 50.00 }
      ]
    },
    {
      id: 'brand_spotify',
      name: 'Spotify Premium',
      category: 'Música',
      logoUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=400&q=80',
      description: 'Música sin anuncios y descargas offline en Spotify.',
      variations: [
        { id: 'var_spot_1m', name: 'Spotify 1 Mes Individual', denomination: '1 Mes', pricePyg: 45000, priceUsd: 5.99 },
        { id: 'var_spot_3m', name: 'Spotify 3 Meses', denomination: '3 Meses', pricePyg: 125000, priceUsd: 16.50 },
        { id: 'var_spot_6m', name: 'Spotify 6 Meses', denomination: '6 Meses', pricePyg: 240000, priceUsd: 32.00 }
      ]
    },
    {
      id: 'brand_netflix',
      name: 'Netflix Gift Card',
      category: 'Streaming',
      logoUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=400&q=80',
      description: 'Saldo oficial de regalo para canjear en cuentas Netflix.',
      variations: [
        { id: 'var_net_15', name: 'Netflix $15 USD', denomination: '$15 USD', pricePyg: 125000, priceUsd: 15.00 },
        { id: 'var_net_25', name: 'Netflix $25 USD', denomination: '$25 USD', pricePyg: 205000, priceUsd: 25.00 },
        { id: 'var_net_50', name: 'Netflix $50 USD', denomination: '$50 USD', pricePyg: 405000, priceUsd: 50.00 }
      ]
    },
    {
      id: 'brand_googleplay',
      name: 'Google Play Store',
      category: 'Móvil',
      logoUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80',
      description: 'Saldo para apps, juegos y diamantes en Android.',
      variations: [
        { id: 'var_gp_10', name: 'Google Play $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
        { id: 'var_gp_25', name: 'Google Play $25 USD', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 },
        { id: 'var_gp_50', name: 'Google Play $50 USD', denomination: '$50 USD', pricePyg: 415000, priceUsd: 50.00 }
      ]
    },
    {
      id: 'brand_apple',
      name: 'Apple Gift Card & iTunes',
      category: 'Apple',
      logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
      description: 'Saldo para compras en App Store, Apple Arcade y suscripciones.',
      variations: [
        { id: 'var_apple_10', name: 'Apple $10 USD', denomination: '$10 USD', pricePyg: 85000, priceUsd: 10.00 },
        { id: 'var_apple_25', name: 'Apple $25 USD', denomination: '$25 USD', pricePyg: 210000, priceUsd: 25.00 },
        { id: 'var_apple_50', name: 'Apple $50 USD', denomination: '$50 USD', pricePyg: 415000, priceUsd: 50.00 }
      ]
    }
  ],
  streaming_services_config: {
    'netflix': { key: 'netflix', name: 'Netflix Premium 4K', planName: 'Ultra HD 4K (4 Pantallas)', maxSlots: 5, pricePerSlotPyg: 25000, pricePerSlotUsd: 3.33, commissionPercent: 10, netPayoutPyg: 22500, netPayoutUsd: 3.00 },
    'spotify': { key: 'spotify', name: 'Spotify Premium Familiar', planName: 'Plan Familiar (6 Cuentas)', maxSlots: 5, pricePerSlotPyg: 18000, pricePerSlotUsd: 2.40, commissionPercent: 10, netPayoutPyg: 16200, netPayoutUsd: 2.16 },
    'disney': { key: 'disney', name: 'Disney+ Premium & Star+', planName: 'Plan Premium 4K', maxSlots: 4, pricePerSlotPyg: 25000, pricePerSlotUsd: 3.33, commissionPercent: 10, netPayoutPyg: 22500, netPayoutUsd: 3.00 },
    'max': { key: 'max', name: 'Max (HBO Max) 4K', planName: 'Platino 4K Dolby Atmos', maxSlots: 3, pricePerSlotPyg: 22000, pricePerSlotUsd: 2.93, commissionPercent: 10, netPayoutPyg: 19800, netPayoutUsd: 2.64 },
    'youtube': { key: 'youtube', name: 'YouTube Premium & Music', planName: 'Familiar Sin Anuncios', maxSlots: 5, pricePerSlotPyg: 20000, pricePerSlotUsd: 2.67, commissionPercent: 10, netPayoutPyg: 18000, netPayoutUsd: 2.40 },
    'chatgpt': { key: 'chatgpt', name: 'ChatGPT Plus & AI', planName: 'Plus GPT-4o & Canvas', maxSlots: 2, pricePerSlotPyg: 35000, pricePerSlotUsd: 4.67, commissionPercent: 10, netPayoutPyg: 31500, netPayoutUsd: 4.20 },
    'crunchyroll': { key: 'crunchyroll', name: 'Crunchyroll Mega Fan', planName: 'Mega Fan 4 Pantallas', maxSlots: 4, pricePerSlotPyg: 18000, pricePerSlotUsd: 2.40, commissionPercent: 10, netPayoutPyg: 16200, netPayoutUsd: 2.16 },
    'paramount': { key: 'paramount', name: 'Paramount+ Premium', planName: 'Plan Estándar 3 Pantallas', maxSlots: 3, pricePerSlotPyg: 18000, pricePerSlotUsd: 2.40, commissionPercent: 10, netPayoutPyg: 16200, netPayoutUsd: 2.16 }
  },
  streaming_services: [
    {
      id: 'netflix',
      name: 'Netflix Premium 4K HDR',
      category: 'streaming',
      planName: 'Ultra HD 4K (4 Pantallas)',
      tagline: 'Películas, series y documentales ilimitados en Ultra HD',
      badgeText: 'ULTRA HD 4K • DOLBY ATMOS',
      description: 'Disfruta de Netflix con tu propio perfil privado y PIN personal. Comparte el costo de la cuenta de forma 100% segura con Bóveda Escrow.',
      iconUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=300&q=80',
      bannerHorizontal: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1600&q=80',
      bannerVertical: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      pricePerSlotPyg: 25000,
      pricePerSlotUsd: 3.33,
      maxSlots: 5,
      commissionPercent: 10,
      waitingCount: 14,
      waitingList: [],
      hasStock: true,
      isActive: true,
      metrics: { activeAccounts: 48, activeUsersMonth: 184, avgSavingsPercent: 75, rating: '4.95 / 5.0' },
      releases: [
        { id: 'rel_stranger_things_5', title: 'Stranger Things 5: El Final', type: 'Estreno 4K', releaseDate: 'Estreno 2025/2026', genre: 'Ciencia Ficción', posterUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80', synopsis: 'El desenlace decisivo de Hawkins.' },
        { id: 'rel_squid_game_2', title: 'Squid Game 2', type: 'Tendencia #1', releaseDate: 'Disponible', genre: 'Thriller', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80', synopsis: 'Nuevos desafíos mortales.' }
      ]
    },
    {
      id: 'spotify',
      name: 'Spotify Premium Familiar',
      category: 'streaming',
      planName: 'Plan Familiar (6 Cuentas)',
      tagline: 'Música y podcasts sin anuncios, descargas ilimitadas y audio Hi-Fi',
      badgeText: 'HI-FI AUDIO • MÚSICA SIN LÍMITES',
      description: 'Acceso a millones de canciones con tu propia cuenta individual conectada a un plan familiar protegido con Bóveda Escrow.',
      iconUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=300&q=80',
      bannerHorizontal: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1600&q=80',
      bannerVertical: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      pricePerSlotPyg: 18000,
      pricePerSlotUsd: 2.40,
      maxSlots: 5,
      commissionPercent: 10,
      waitingCount: 9,
      waitingList: [],
      hasStock: true,
      isActive: true,
      metrics: { activeAccounts: 35, activeUsersMonth: 142, avgSavingsPercent: 70, rating: '4.95 / 5.0' },
      releases: [
        { id: 'rel_sp_latam', title: 'Top 50 Global & Latinos', type: 'Billboard #1', releaseDate: 'Semanal', genre: 'Urbano / Pop', posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', synopsis: 'Los hits más escuchados sin interrupciones.' }
      ]
    },
    {
      id: 'disney',
      name: 'Disney+ & Star+ Premium',
      category: 'streaming',
      planName: 'Plan Premium 4K HDR',
      tagline: 'Marvel, Star Wars, Pixar, Disney y deportes en vivo de ESPN',
      badgeText: 'IMAX ENHANCED • ESPN EN VIVO',
      description: 'Todo el entretenimiento de Disney, Star Wars y Marvel con partidos en vivo de ESPN y perfiles privados.',
      iconUrl: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=300&q=80',
      bannerHorizontal: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=1600&q=80',
      bannerVertical: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      pricePerSlotPyg: 25000,
      pricePerSlotUsd: 3.33,
      maxSlots: 4,
      commissionPercent: 10,
      waitingCount: 11,
      waitingList: [],
      hasStock: true,
      isActive: true,
      metrics: { activeAccounts: 29, activeUsersMonth: 110, avgSavingsPercent: 78, rating: '4.88 / 5.0' },
      releases: [
        { id: 'rel_dis_daredevil', title: 'Daredevil: Born Again', type: 'Marvel Studios', releaseDate: 'Estreno 2025', genre: 'Acción', posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80', synopsis: 'Matt Murdock regresa a Hell’s Kitchen.' }
      ]
    },
    {
      id: 'max',
      name: 'Max (HBO Max) Platino 4K',
      category: 'streaming',
      planName: 'Platino 4K Dolby Atmos',
      tagline: 'El hogar de HBO, Warner Bros, DC Comics y Discovery en 4K',
      badgeText: 'PLATINO 4K • DOLBY VISION',
      description: 'Accede a producciones ganadoras de Emmys, estrenos de cine y clásicos universales con PIN exclusivo.',
      iconUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80',
      bannerHorizontal: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
      bannerVertical: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      pricePerSlotPyg: 22000,
      pricePerSlotUsd: 2.93,
      maxSlots: 3,
      commissionPercent: 10,
      waitingCount: 7,
      waitingList: [],
      hasStock: true,
      isActive: true,
      metrics: { activeAccounts: 22, activeUsersMonth: 95, avgSavingsPercent: 72, rating: '4.91 / 5.0' },
      releases: [
        { id: 'rel_max_tlou2', title: 'The Last of Us T2', type: 'HBO Original', releaseDate: 'Estreno 2025', genre: 'Drama', posterUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80', synopsis: 'Ellie busca justicia en Seattle.' }
      ]
    },
    {
      id: 'youtube',
      name: 'YouTube Premium & Music',
      category: 'streaming',
      planName: 'Familiar Sin Anuncios',
      tagline: 'Videos sin publicidad, reproducción en segundo plano y YouTube Music',
      badgeText: 'SIN ANUNCIOS • FONDO & DESCARGAS',
      description: 'Navega en YouTube en todos tus dispositivos sin anuncios con tu propia cuenta Google.',
      iconUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=300&q=80',
      bannerHorizontal: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80',
      bannerVertical: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      pricePerSlotPyg: 20000,
      pricePerSlotUsd: 2.67,
      maxSlots: 5,
      commissionPercent: 10,
      waitingCount: 16,
      waitingList: [],
      hasStock: true,
      isActive: true,
      metrics: { activeAccounts: 31, activeUsersMonth: 125, avgSavingsPercent: 74, rating: '4.93 / 5.0' },
      releases: [
        { id: 'rel_yt_features', title: 'YouTube Music Premium', type: 'Google Oficial', releaseDate: 'Disponible 24/7', genre: 'Música', posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80', synopsis: 'Música sin anuncios y descargas inteligentes.' }
      ]
    },
    {
      id: 'crunchyroll',
      name: 'Crunchyroll Mega Fan',
      category: 'streaming',
      planName: 'Mega Fan 4 Pantallas',
      tagline: 'El mayor catálogo de anime en simulcast directo desde Japón sin publicidad',
      badgeText: 'SIMULCAST • FULL HD SIN CENSURA',
      description: 'Episodios de anime 1 hora después de su emisión en Japón con doblajes y subtítulos oficiales.',
      iconUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
      bannerHorizontal: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
      bannerVertical: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      pricePerSlotPyg: 18000,
      pricePerSlotUsd: 2.40,
      maxSlots: 4,
      commissionPercent: 10,
      waitingCount: 8,
      waitingList: [],
      hasStock: true,
      isActive: true,
      metrics: { activeAccounts: 20, activeUsersMonth: 86, avgSavingsPercent: 70, rating: '4.89 / 5.0' },
      releases: [
        { id: 'rel_cr_demon_slayer', title: 'Demon Slayer: Castillo Infinito', type: 'Película', releaseDate: 'Estreno 2025', genre: 'Anime', posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80', synopsis: 'La batalla final contra Muzan Kibutsuji.' }
      ]
    },
    {
      id: 'paramount',
      name: 'Paramount+ Premium',
      category: 'streaming',
      planName: 'Plan Estándar 3 Pantallas',
      tagline: 'Películas de Paramount Pictures, Halo, Yellowstone y producciones exclusivas',
      badgeText: 'PREMIUM HD • SERIES ORIGINALES',
      description: 'Acceso a estrenos de cine, series exclusivas de Paramount y deportes en vivo.',
      iconUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
      bannerHorizontal: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
      bannerVertical: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      pricePerSlotPyg: 18000,
      pricePerSlotUsd: 2.40,
      maxSlots: 3,
      commissionPercent: 10,
      waitingCount: 5,
      waitingList: [],
      hasStock: true,
      isActive: true,
      metrics: { activeAccounts: 14, activeUsersMonth: 55, avgSavingsPercent: 73, rating: '4.85 / 5.0' },
      releases: [
        { id: 'rel_par_yellowstone', title: 'Yellowstone: Temporada Final', type: 'Paramount Original', releaseDate: 'Episodios Finales', genre: 'Drama', posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80', synopsis: 'El desenlace de la familia Dutton.' }
      ]
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT Plus & AI',
      category: 'streaming',
      planName: 'Plus GPT-4o & Canvas',
      tagline: 'Acceso prioritario a GPT-4o, Canvas, generación DALL-E 3 y modo de voz avanzado',
      badgeText: 'GPT-4o PRO • CANVAS & VOICE',
      description: 'Potencia tu productividad con la suscripción compartida a ChatGPT Plus.',
      iconUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80',
      bannerHorizontal: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
      bannerVertical: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      pricePerSlotPyg: 35000,
      pricePerSlotUsd: 4.67,
      maxSlots: 2,
      commissionPercent: 10,
      waitingCount: 19,
      waitingList: [],
      hasStock: true,
      isActive: true,
      metrics: { activeAccounts: 18, activeUsersMonth: 72, avgSavingsPercent: 80, rating: '4.98 / 5.0' },
      releases: [
        { id: 'rel_gpt_voice', title: 'Advanced Voice Mode & Canvas', type: 'OpenAI GPT-4o', releaseDate: 'Actualizado', genre: 'IA Generativa', posterUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80', synopsis: 'Conversaciones de voz avanzadas y edición visual.' }
      ]
    }
  ]
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
      if (!Array.isArray(db.streaming_services) || db.streaming_services.length === 0) {
        db.streaming_services = db.streaming_services || [];
      }
      if (!db.streaming_services_config || Object.keys(db.streaming_services_config).length === 0) {
        db.streaming_services_config = db.streaming_services_config || {};
      }
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
  // Atomically persist to Supabase PostgreSQL in background
  try {
    postgresAdapter.syncToPostgres(db);
  } catch (pgErr) {
    console.warn('Postgres async sync notice:', pgErr.message);
  }
}

export async function initDatabase() {
  initStorage();
  const pgResult = await postgresAdapter.initPostgres();
  if (pgResult.connected) {
    try {
      const cloudData = await postgresAdapter.loadFromPostgres();
      if (cloudData && Object.keys(cloudData).length > 0) {
        db = { ...db, ...cloudData };
        try {
          fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
        } catch (e) {}
        console.log('🔄 [Database] State hydrated directly from Supabase PostgreSQL cloud!');
      } else {
        // First time cloud initialization: push initial database state
        postgresAdapter.syncToPostgres(db);
      }
    } catch (hydrateErr) {
      console.warn('⚠️ Cloud hydration warning:', hydrateErr.message);
    }
  }
  console.log(`✅ [Database: Marketplace Engine] Active with multi-currency wallet, credential vault & store. (PostgreSQL: ${pgResult.connected ? 'CONNECTED (Supabase Cloud)' : 'LOCAL PERSISTENT STORE'})`);
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

