import fs from 'fs';

const dbPath = 'data/marketplace_storage.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Initialize AI WhatsApp Configuration
if (!db.ai_whatsapp_config) {
  db.ai_whatsapp_config = {
    systemPrompt: `Eres el Asistente Virtual Oficial de GamesBoy.net, la plataforma líder en Paraguay y Latinoamérica para videojuegos digitales, cuentas y perfiles de streaming, licencias y herramientas de trabajo/IA.
Tu objetivo es atender a los clientes con un trato súper amable, ágil, profesional y confiable (tono latino/paraguayo respetuoso).

PRODUCTOS Y PRECIOS REFERENCIALES:
- Cuentas de Streaming: Netflix 4K (25.000 Gs.), Spotify Familiar (18.000 Gs.), Disney+ (25.000 Gs.), Max 4K (22.000 Gs.), YouTube Premium (20.000 Gs.), Crunchyroll (18.000 Gs.), Paramount+ (18.000 Gs.).
- Herramientas de Trabajo & IA: ChatGPT Plus & GPT-4o (35.000 Gs.), Claude Pro (35.000 Gs.), Gemini Advanced (30.000 Gs.), Minea Dropshipping (45.000 Gs.), Canva Pro (20.000 Gs.), Midjourney (40.000 Gs.).
- Videojuegos Digitales: Claves originales para Steam, PlayStation, Xbox, Nintendo y PC con entrega inmediata.
- Tarjetas de Regalo (Gift Cards): PlayStation, Xbox, Steam, Google Play, Apple, Roblox, Free Fire.
- Crecimiento en Redes Sociales (SMM): Seguidores, likes, vistas y miembros para Instagram, TikTok, YouTube y Telegram (plazo de entrega 24 a 48 hs).
- Métodos de Pago: Transferencia Bancaria SIPAP (Itaú, Continental, Ueno, etc. sin comisión), Tarjetas de Débito/Crédito y Criptomonedas USDT (Binance Pay).

DIRECTRICES:
1. Responde de forma concisa, clara y orientada a ayudar al cliente a comprar o resolver sus dudas.
2. Si el cliente tiene una duda muy específica o solicita hablar con un asesor humano o pagar por WhatsApp, ofrécele contactar al departamento correspondiente.
3. Cada vez que detectes una sugerencia de producto, un lead con alta intención de compra, una duda de stock o un reclamo técnico, genera un resumen claro para las notas internas del Administrador.`,
    provider: 'builtin', // 'builtin', 'openai', 'groq', 'gemini'
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    phoneNumbers: {
      general: '+595981000000',
      games: '+595982000000',
      streaming: '+595983000000',
      tools: '+595984000000',
      payments: '+595985000000'
    }
  };
}

// 2. Initialize AI Support Notes
if (!db.ai_support_notes || db.ai_support_notes.length === 0) {
  db.ai_support_notes = [
    {
      id: 'note_179186001',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      clientName: 'Alejandro Benítez',
      clientPhone: '+595981445566',
      tag: 'lead_purchase',
      tagLabel: 'Lead de Compra',
      category: 'streaming',
      summary: 'Cliente interesado en comprar 2 perfiles de Netflix 4K y 1 de Spotify Familiar. Preguntó si se puede pagar vía SIPAP Banco Itaú.',
      status: 'pending', // 'pending' | 'reviewed' | 'contacted'
      channel: 'whatsapp_widget'
    },
    {
      id: 'note_179186002',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      clientName: 'Sofía Romero',
      clientPhone: '+595971223344',
      tag: 'suggestion',
      tagLabel: 'Sugerencia de Producto',
      category: 'work_tools',
      summary: 'Sugerencia para agregar cuentas compartidas de "Cursor AI Pro" y "ElevenLabs" para creación de contenido.',
      status: 'pending',
      channel: 'whatsapp_widget'
    },
    {
      id: 'note_179186003',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      clientName: 'Carlos Bogado',
      clientPhone: '+595991887766',
      tag: 'stock_inquiry',
      tagLabel: 'Consulta de Stock',
      category: 'games',
      summary: 'Consultó disponibilidad de claves de EA Sports FC 25 para PS5 y si la entrega es en menos de 10 minutos.',
      status: 'reviewed',
      channel: 'whatsapp_widget'
    }
  ];
}

// 3. Ensure Work Tools / AI Services in db.streaming_services
const defaultTools = [
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus & AI (GPT-4o)',
    category: 'work_tools',
    planName: 'Plus GPT-4o & Canvas',
    tagline: 'Acceso Premium con GPT-4o, DALL-E 3 y Modo Voz Avanzado',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#10a37f',
    maxSlots: 2,
    pricePerSlotPyg: 35000,
    pricePerSlotUsd: 4.67,
    description: 'Cuenta compartida oficial con acceso ilimitado a ChatGPT Plus, generación de imágenes con DALL-E y Canvas de código.',
    isActive: true
  },
  {
    id: 'claude',
    name: 'Claude Pro (Sonnet 3.5)',
    category: 'work_tools',
    planName: 'Claude Pro Anthropic',
    tagline: 'La IA más inteligente para programación, redacción y análisis profundo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#d97706',
    maxSlots: 2,
    pricePerSlotPyg: 35000,
    pricePerSlotUsd: 4.67,
    description: 'Acceso oficial a Claude 3.5 Sonnet con Projects, Artifacts y 5x más uso que la versión gratuita.',
    isActive: true
  },
  {
    id: 'gemini',
    name: 'Gemini Advanced Ultra',
    category: 'work_tools',
    planName: 'Google One AI Premium (2TB)',
    tagline: 'Modelo 1.5 Pro con ventana de contexto de 1 millón de tokens',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#3b82f6',
    maxSlots: 3,
    pricePerSlotPyg: 30000,
    pricePerSlotUsd: 4.00,
    description: 'Acceso a Gemini Advanced integrado con Google Workspace y almacenamiento en la nube.',
    isActive: true
  },
  {
    id: 'minea',
    name: 'Minea Dropshipping Spy Tool',
    category: 'work_tools',
    planName: 'Minea Starter / Premium',
    tagline: 'Espía los anuncios ganadores de TikTok, Facebook y Pinterest',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#8b5cf6',
    maxSlots: 3,
    pricePerSlotPyg: 45000,
    pricePerSlotUsd: 6.00,
    description: 'La herramienta #1 para encontrar productos ganadores de e-commerce y dropshipping en segundos.',
    isActive: true
  },
  {
    id: 'canva',
    name: 'Canva Pro Diseños & Brand',
    category: 'work_tools',
    planName: 'Canva Pro Equipo',
    tagline: 'Plantillas premium, kit de marcas y herramientas mágicas de IA',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#06b6d4',
    maxSlots: 5,
    pricePerSlotPyg: 20000,
    pricePerSlotUsd: 2.67,
    description: 'Diseño gráfico profesional ilimitado con exportaciones transparentes y redimensionado mágico.',
    isActive: true
  },
  {
    id: 'midjourney',
    name: 'Midjourney v6 AI Pro',
    category: 'work_tools',
    planName: 'Midjourney Fast Hours',
    tagline: 'Generación hiperrealista de arte, fotografía y mockups comerciales',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&auto=format&fit=crop&q=80',
    accentColor: '#ec4899',
    maxSlots: 2,
    pricePerSlotPyg: 40000,
    pricePerSlotUsd: 5.33,
    description: 'Generación de imágenes con el motor v6 más avanzado del mundo para renders y diseño.',
    isActive: true
  }
];

// Ensure category is explicitly tagged on existing streaming services
(db.streaming_services || []).forEach(s => {
  if (!s.category) s.category = 'streaming';
  if (s.id === 'chatgpt') s.category = 'work_tools';
});

// Append missing tools
defaultTools.forEach(tool => {
  const existingIdx = (db.streaming_services || []).findIndex(s => s.id === tool.id);
  if (existingIdx !== -1) {
    db.streaming_services[existingIdx] = { ...tool, ...db.streaming_services[existingIdx], category: 'work_tools' };
  } else {
    db.streaming_services.push(tool);
  }

  // Also in streaming_services_config
  if (!db.streaming_services_config) db.streaming_services_config = {};
  if (!db.streaming_services_config[tool.id]) {
    db.streaming_services_config[tool.id] = {
      key: tool.id,
      name: tool.name,
      planName: tool.planName,
      maxSlots: tool.maxSlots,
      pricePerSlotPyg: tool.pricePerSlotPyg,
      pricePerSlotUsd: tool.pricePerSlotUsd,
      commissionPercent: 10,
      netPayoutPyg: Math.round(tool.pricePerSlotPyg * 0.9),
      netPayoutUsd: parseFloat((tool.pricePerSlotUsd * 0.9).toFixed(2))
    };
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ marketplace_storage.json updated with AI config, notes, and Work Tools!');
