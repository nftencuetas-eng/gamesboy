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
  tenants: [
    {
      id: 'tnt_gamesboy_main',
      slug: 'gamesboy',
      name: 'GamesBoy Store Oficial',
      customDomain: 'gamesboy.net',
      planId: 'plan_enterprise',
      status: 'active',
      branding: {
        brandName: 'GamesBoy',
        logoUrl: '/assets/branding/logo-white.png',
        iconUrl: '/assets/branding/icon.png',
        primaryColor: '#0284c7',
        accentColor: '#00c2ff',
        currency: 'PYG',
        exchangeRate: 7500,
        whatsappSupport: '+595981123456'
      },
      settings: {
        commissionPercent: 15.00,
        allowUserReselling: true,
        enabledModules: {
          streaming: true,
          games: true,
          giftcards: true,
          smm: true,
          p2pSharing: true
        },
        paraguayBankDetails: {
          bank: 'Banco Familiar / Itaú Paraguay',
          accountHolder: 'GamesBoy Paraguay S.A.',
          rucOrCi: '80091234-5',
          accountNumber: '01-445566-7',
          aliasSipap: 'gamesboy.py'
        },
        binanceDetails: {
          payId: '849201934',
          network: 'USDT (Binance Pay / BEP-20 / TRC-20)',
          walletAddress: '0x71C9414B3b27bA134a6C3f07a757657A82e4b92F',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x71C9414B3b27bA134a6C3f07a757657A82e4b92F'
        }
      }
    },
    {
      id: 'tnt_streamflow_demo',
      slug: 'streamflow',
      name: 'StreamFlow Paraguay',
      customDomain: 'streamflow.gamsplit.com',
      planId: 'plan_pro',
      status: 'active',
      branding: {
        brandName: 'StreamFlow',
        logoUrl: '/assets/branding/icon.png',
        iconUrl: '/assets/branding/icon.png',
        primaryColor: '#10b981',
        accentColor: '#34d399',
        currency: 'PYG',
        exchangeRate: 7500,
        whatsappSupport: '+595982000111'
      },
      settings: {
        commissionPercent: 12.00,
        allowUserReselling: true,
        enabledModules: {
          streaming: true,
          games: false,
          giftcards: false,
          smm: false,
          p2pSharing: true
        },
        paraguayBankDetails: {
          bank: 'Banco Continental',
          accountHolder: 'StreamFlow Digital',
          rucOrCi: '4455667-8',
          accountNumber: '15-998877-2',
          aliasSipap: 'streamflow.py'
        },
        binanceDetails: {
          payId: '992144551',
          network: 'USDT (BEP-20)',
          walletAddress: '0x33B10A98F722cE434a6C3f07a757657A82e4b88B',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x33B10A98F722cE434a6C3f07a757657A82e4b88F'
        }
      }
    },
    {
      id: 'tnt_playzone_demo',
      slug: 'playzone',
      name: 'PlayZone Digital Store',
      customDomain: 'playzone.gamsplit.com',
      planId: 'plan_starter',
      status: 'active',
      branding: {
        brandName: 'PlayZone',
        logoUrl: '/assets/branding/icon.png',
        iconUrl: '/assets/branding/icon.png',
        primaryColor: '#f59e0b',
        accentColor: '#fbbf24',
        currency: 'PYG',
        exchangeRate: 7500,
        whatsappSupport: '+595983445566'
      },
      settings: {
        commissionPercent: 10.00,
        allowUserReselling: false,
        enabledModules: {
          streaming: false,
          games: true,
          giftcards: true,
          smm: false,
          p2pSharing: false
        },
        paraguayBankDetails: {
          bank: 'Banco Itaú Paraguay',
          accountHolder: 'PlayZone Digital',
          rucOrCi: '5566778-1',
          accountNumber: '02-112233-4',
          aliasSipap: 'playzone.py'
        },
        binanceDetails: {
          payId: '778899112',
          network: 'USDT (BEP-20)',
          walletAddress: '0x55A10A98F722cE434a6C3f07a757657A82e4b11A',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x55A10A98F722cE434a6C3f07a757657A82e4b11A'
        }
      }
    },
    {
      id: 'tnt_cardshub_demo',
      slug: 'cardshub',
      name: 'CardsHub LatAm',
      customDomain: 'cardshub.gamsplit.com',
      planId: 'plan_starter',
      status: 'active',
      branding: {
        brandName: 'CardsHub',
        logoUrl: '/assets/branding/icon.png',
        iconUrl: '/assets/branding/icon.png',
        primaryColor: '#ec4899',
        accentColor: '#f472b6',
        currency: 'PYG',
        exchangeRate: 7500,
        whatsappSupport: '+595984778899'
      },
      settings: {
        commissionPercent: 8.00,
        allowUserReselling: false,
        enabledModules: {
          streaming: false,
          games: false,
          giftcards: true,
          smm: false,
          p2pSharing: false
        },
        paraguayBankDetails: {
          bank: 'Banco GNB Paraguay',
          accountHolder: 'CardsHub Prepago',
          rucOrCi: '6677889-2',
          accountNumber: '03-556677-8',
          aliasSipap: 'cardshub.py'
        },
        binanceDetails: {
          payId: '665544332',
          network: 'USDT (TRC-20)',
          walletAddress: 'TYs29x11284a6C3f07a757657A82e4b99',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=TYs29x11284a6C3f07a757657A82e4b99'
        }
      }
    },
    {
      id: 'tnt_nexustream_demo',
      slug: 'nexustream',
      name: 'Nexus Stream & AI',
      customDomain: 'nexustream.gamsplit.com',
      planId: 'plan_enterprise',
      status: 'active',
      branding: {
        brandName: 'Nexus Stream',
        logoUrl: '/assets/branding/icon.png',
        iconUrl: '/assets/branding/icon.png',
        primaryColor: '#8b5cf6',
        accentColor: '#a78bfa',
        currency: 'PYG',
        exchangeRate: 7500,
        whatsappSupport: '+595985112233'
      },
      settings: {
        commissionPercent: 12.00,
        allowUserReselling: true,
        enabledModules: {
          streaming: true,
          games: false,
          giftcards: false,
          smm: true,
          p2pSharing: true
        },
        paraguayBankDetails: {
          bank: 'Sudameris Bank',
          accountHolder: 'Nexus Media Group',
          rucOrCi: '7788990-3',
          accountNumber: '04-998811-2',
          aliasSipap: 'nexustream.py'
        },
        binanceDetails: {
          payId: '334455667',
          network: 'USDT (BEP-20)',
          walletAddress: '0x88F10A98F722cE434a6C3f07a757657A82e4b88F',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x88F10A98F722cE434a6C3f07a757657A82e4b88F'
        }
      }
    },
    {
      id: 'tnt_pixelstore_demo',
      slug: 'pixelstore',
      name: 'PixelStore Gamers',
      customDomain: 'pixelstore.gamsplit.com',
      planId: 'plan_pro',
      status: 'active',
      branding: {
        brandName: 'PixelStore',
        logoUrl: '/assets/branding/icon.png',
        iconUrl: '/assets/branding/icon.png',
        primaryColor: '#06b6d4',
        accentColor: '#22d3ee',
        currency: 'PYG',
        exchangeRate: 7500,
        whatsappSupport: '+595986990011'
      },
      settings: {
        commissionPercent: 10.00,
        allowUserReselling: false,
        enabledModules: {
          streaming: true,
          games: true,
          giftcards: true,
          smm: false,
          p2pSharing: false
        },
        paraguayBankDetails: {
          bank: 'Banco Atlas',
          accountHolder: 'PixelStore Gamers SRL',
          rucOrCi: '8899001-4',
          accountNumber: '05-334455-6',
          aliasSipap: 'pixelstore.py'
        },
        binanceDetails: {
          payId: '112233445',
          network: 'USDT (BEP-20)',
          walletAddress: '0x44C10A98F722cE434a6C3f07a757657A82e4b44C',
          qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x44C10A98F722cE434a6C3f07a757657A82e4b44C'
        }
      }
    }
  ],
  tenant_plans: [
    {
      id: 'plan_control',
      name: 'Plan Control (Gestión de Streaming)',
      priceMonthlyUsd: 9.99,
      priceMonthlyPyg: 75000,
      maxSlotsAllowed: 100,
      maxProductsAllowed: 0,
      storeEnabled: false,
      customDomainEnabled: false,
      p2pMarketplaceEnabled: false,
      platformFeePercent: 0,
      features: [
        'Panel de Control y Bóveda de Cuentas de Streaming',
        'Gestión de hasta 100 perfiles/slots con PIN individual',
        'Control de clientes y fechas de vencimiento/corte',
        'Plantillas de recordatorios de cobro por WhatsApp',
        'Registro financiero de pagos SIPAP y Binance Pay'
      ]
    },
    {
      id: 'plan_pro',
      name: 'Plan Pro (Tienda Digital Liberada)',
      priceMonthlyUsd: 19.99,
      priceMonthlyPyg: 150000,
      maxSlotsAllowed: 500,
      maxProductsAllowed: 200,
      storeEnabled: true,
      customDomainEnabled: true,
      p2pMarketplaceEnabled: true,
      platformFeePercent: 3.00,
      features: [
        'Todo lo del Plan Control incluido',
        'Tienda Online Pública Liberada (Subdominio propio)',
        'Bóveda de entrega automatizada con PIN para clientes',
        'Venta de Streaming, Videojuegos y Gift Cards',
        'Pasarelas SIPAP Paraguay y Binance Pay con comprobante',
        'Personalización total de marca (logo, colores, soporte)'
      ]
    }
  ],
  users: [
    { id: 'usr_admin', tenantId: 'tnt_gamesboy_main', name: 'Admin GamesBoy', email: 'admin@gamesboy.net', role: 'admin', avatar: '/assets/branding/icon.png' },
    { id: 'usr_seller1', tenantId: 'tnt_gamesboy_main', name: 'Carlos_Streams', email: 'carlos@vendedor.com', role: 'seller', avatar: '/assets/branding/icon.png' },
    { id: 'usr_client1', tenantId: 'tnt_gamesboy_main', name: 'Lucas_Py', email: 'lucas@cliente.com', role: 'client', avatar: '/assets/branding/icon.png' },
    { id: 'usr_client2', tenantId: 'tnt_gamesboy_main', name: 'María López', email: 'maria@cliente.com', role: 'client', avatar: '/assets/branding/icon.png' }
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
      imgHorizontal: '',
      imgVertical: '',
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
      imgHorizontal: '',
      imgVertical: '',
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
      imgHorizontal: '',
      imgVertical: '',
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
      imgHorizontal: '',
      imgVertical: '',
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
      planName: 'Ultra HD 4K (4 Pantallas)',
      totalSlots: 5,
      availableSlots: 4,
      pricePerSlotUsd: 4.99,
      credentialsEncrypted: cryptoService.encrypt('netflix.vip@gamesboy.net:::StreamPass2026!'),
      pinsEncrypted: cryptoService.encrypt(JSON.stringify({ 1: '1244', 2: '5821', 3: '9032', 4: '7110', 5: 'N/A' })),
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
    // --- VIDEOJUEGOS DIGITALES (PS4 / PS5 / PC) ---
    {
      id: 'prod_game_fc25',
      title: 'EA SPORTS FC 25',
      category: 'digital_game',
      platform: 'PS5 / PS4 / PC',
      genre: 'Deportes / Fútbol',
      primaryPricePyg: 295000,
      secondaryPricePyg: 185000,
      primaryPriceUsd: 39.33,
      secondaryPriceUsd: 24.67,
      pricePyg: 295000,
      priceUsd: 39.33,
      badge: 'MÁS VENDIDO',
      coverUrl: '',
      coverImage: '',
      screenshots: [
        '',
        ''
      ],
      description: 'EA SPORTS FC 25 te ofrece las mejores competiciones, clubes y futbolistas del mundo. Cuenta digital primaria y secundaria con entrega rápida.',
      isAvailable: true,
      stockCount: 15
    },
    {
      id: 'prod_game_spiderman2',
      title: 'Marvel\'s Spider-Man 2',
      category: 'digital_game',
      platform: 'PlayStation 5',
      genre: 'Acción / Aventura',
      primaryPricePyg: 260000,
      secondaryPricePyg: 165000,
      primaryPriceUsd: 34.67,
      secondaryPriceUsd: 22.00,
      pricePyg: 260000,
      priceUsd: 34.67,
      badge: 'EXCLUSIVO PS5',
      coverUrl: '',
      coverImage: '',
      screenshots: [
        '',
        ''
      ],
      description: 'Los Spider-Men Peter Parker y Miles Morales regresan para una aventura aclamada en PS5.',
      isAvailable: true,
      stockCount: 12
    },
    {
      id: 'prod_game_cod_bo6',
      title: 'Call of Duty: Black Ops 6',
      category: 'digital_game',
      platform: 'PS5 • Xbox • PC',
      genre: 'Shooter / Acción',
      primaryPricePyg: 340000,
      secondaryPricePyg: 215000,
      primaryPriceUsd: 45.33,
      secondaryPriceUsd: 28.67,
      pricePyg: 340000,
      priceUsd: 45.33,
      badge: 'NUEVO LANZAMIENTO',
      coverUrl: '',
      coverImage: '',
      screenshots: [
        '',
        ''
      ],
      description: 'La verdad miente. Una apasionante campaña de espionaje, la mejor experiencia multijugador y el regreso de Zombis por rondas.',
      isAvailable: true,
      stockCount: 20
    },
    {
      id: 'prod_game_gta6',
      title: 'Grand Theft Auto VI',
      category: 'digital_game',
      platform: 'PS5 • Xbox Series X',
      genre: 'Mundo Abierto',
      primaryPricePyg: 390000,
      secondaryPricePyg: 245000,
      primaryPriceUsd: 52.00,
      secondaryPriceUsd: 32.67,
      pricePyg: 390000,
      priceUsd: 52.00,
      badge: 'PRE-VENTA EXCLUSIVA',
      coverUrl: '',
      coverImage: '',
      screenshots: [
        '',
        ''
      ],
      description: 'Reserva ya tu clave o cuenta oficial para la mayor experiencia de la historia del videojuego en el estado de Leonida y Vice City.',
      isAvailable: true,
      stockCount: 50
    },
    {
      id: 'prod_game_wukong',
      title: 'Black Myth: Wukong',
      category: 'digital_game',
      platform: 'PS5 • PC Steam',
      genre: 'Action RPG / Souls',
      primaryPricePyg: 275000,
      secondaryPricePyg: 175000,
      primaryPriceUsd: 36.67,
      secondaryPriceUsd: 23.33,
      pricePyg: 275000,
      priceUsd: 36.67,
      badge: 'ÉXITO MUNDIAL',
      coverUrl: '',
      coverImage: '',
      screenshots: [
        '',
        ''
      ],
      description: 'Encarna al Predestinado en un viaje colosal por la mitología china, dominando las artes del bastón mágico y transformaciones legendarias.',
      isAvailable: true,
      stockCount: 18
    },
    {
      id: 'prod_game_gow_rag',
      title: 'God of War Ragnarök',
      category: 'digital_game',
      platform: 'PS5 • PS4 • PC',
      genre: 'Acción / Aventura',
      primaryPricePyg: 235000,
      secondaryPricePyg: 150000,
      primaryPriceUsd: 31.33,
      secondaryPriceUsd: 20.00,
      pricePyg: 235000,
      priceUsd: 31.33,
      badge: 'CALIDAD OFICIAL',
      coverUrl: '',
      coverImage: '',
      screenshots: [
        '',
        ''
      ],
      description: 'Únete a Kratos y Atreus en un viaje mítico a través de los Nueve Reinos antes del temido Ragnarök.',
      isAvailable: true,
      stockCount: 10
    },
    {
      id: 'prod_game_elden_ring',
      title: 'Elden Ring: Shadow of the Erdtree',
      category: 'digital_game',
      platform: 'PS5 • Xbox • PC',
      genre: 'Action RPG / Souls',
      primaryPricePyg: 280000,
      secondaryPricePyg: 175000,
      primaryPriceUsd: 37.33,
      secondaryPriceUsd: 23.33,
      pricePyg: 280000,
      priceUsd: 37.33,
      badge: 'OBRA MAESTRA',
      coverUrl: '',
      coverImage: '',
      screenshots: [
        ''
      ],
      description: 'Explora la Tierra Sombría en la aclamada expansión del GOTY Elden Ring con nuevos jefes y armas.',
      isAvailable: true,
      stockCount: 14
    },
    {
      id: 'prod_game_cyberpunk',
      title: 'Cyberpunk 2077: Phantom Liberty',
      category: 'digital_game',
      platform: 'PS5 • Xbox Series X • PC',
      genre: 'RPG / Cyberpunk',
      primaryPricePyg: 210000,
      secondaryPricePyg: 135000,
      primaryPriceUsd: 28.00,
      secondaryPriceUsd: 18.00,
      pricePyg: 210000,
      priceUsd: 28.00,
      badge: 'SIN STOCK',
      coverUrl: '',
      coverImage: '',
      screenshots: [
        ''
      ],
      description: 'Adéntrate en Dogtown en un thriller de espionaje de alta tecnología para salvar a la presidenta de los NUSA.',
      isAvailable: false,
      stockCount: 0
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
      logoUrl: '',
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
      logoUrl: '',
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
      logoUrl: '',
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
      logoUrl: '',
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
      logoUrl: '',
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
      logoUrl: '',
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
      logoUrl: '',
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
      logoUrl: '',
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
      iconUrl: '',
      thumbnailUrl: '',
      bannerHorizontal: '',
      bannerVertical: '',
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
        { id: 'rel_stranger_things_5', title: 'Stranger Things 5: El Final', type: 'Estreno 4K', releaseDate: 'Estreno 2025/2026', genre: 'Ciencia Ficción', posterUrl: '', synopsis: 'El desenlace decisivo de Hawkins.' },
        { id: 'rel_squid_game_2', title: 'Squid Game 2', type: 'Tendencia #1', releaseDate: 'Disponible', genre: 'Thriller', posterUrl: '', synopsis: 'Nuevos desafíos mortales.' }
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
      iconUrl: '',
      thumbnailUrl: '',
      bannerHorizontal: '',
      bannerVertical: '',
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
        { id: 'rel_sp_latam', title: 'Top 50 Global & Latinos', type: 'Billboard #1', releaseDate: 'Semanal', genre: 'Urbano / Pop', posterUrl: '', synopsis: 'Los hits más escuchados sin interrupciones.' }
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
      iconUrl: '',
      thumbnailUrl: '',
      bannerHorizontal: '',
      bannerVertical: '',
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
        { id: 'rel_dis_daredevil', title: 'Daredevil: Born Again', type: 'Marvel Studios', releaseDate: 'Estreno 2025', genre: 'Acción', posterUrl: '', synopsis: 'Matt Murdock regresa a Hell’s Kitchen.' }
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
      iconUrl: '',
      thumbnailUrl: '',
      bannerHorizontal: '',
      bannerVertical: '',
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
        { id: 'rel_max_tlou2', title: 'The Last of Us T2', type: 'HBO Original', releaseDate: 'Estreno 2025', genre: 'Drama', posterUrl: '', synopsis: 'Ellie busca justicia en Seattle.' }
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
      iconUrl: '',
      thumbnailUrl: '',
      bannerHorizontal: '',
      bannerVertical: '',
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
        { id: 'rel_yt_features', title: 'YouTube Music Premium', type: 'Google Oficial', releaseDate: 'Disponible 24/7', genre: 'Música', posterUrl: '', synopsis: 'Música sin anuncios y descargas inteligentes.' }
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
      iconUrl: '',
      thumbnailUrl: '',
      bannerHorizontal: '',
      bannerVertical: '',
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
        { id: 'rel_cr_demon_slayer', title: 'Demon Slayer: Castillo Infinito', type: 'Película', releaseDate: 'Estreno 2025', genre: 'Anime', posterUrl: '', synopsis: 'La batalla final contra Muzan Kibutsuji.' }
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
      iconUrl: '',
      thumbnailUrl: '',
      bannerHorizontal: '',
      bannerVertical: '',
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
        { id: 'rel_par_yellowstone', title: 'Yellowstone: Temporada Final', type: 'Paramount Original', releaseDate: 'Episodios Finales', genre: 'Drama', posterUrl: '', synopsis: 'El desenlace de la familia Dutton.' }
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
      iconUrl: '',
      thumbnailUrl: '',
      bannerHorizontal: '',
      bannerVertical: '',
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
        { id: 'rel_gpt_voice', title: 'Advanced Voice Mode & Canvas', type: 'OpenAI GPT-4o', releaseDate: 'Actualizado', genre: 'IA Generativa', posterUrl: '', synopsis: 'Conversaciones de voz avanzadas y edición visual.' }
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

export const saveDb = saveStorage;

export default {
  initDatabase,
  getDb,
  saveStorage,
  saveDb
};

