import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import requireAdminAuth from '../middleware/adminAuth.js';

const router = Router();

// =======================================================
// 1. PUBLIC ENDPOINTS (WHATSAPP WIDGET)
// =======================================================

// GET public config (department numbers, avatar, brand)
router.get('/config', (req, res) => {
  const db = getDb();
  const cfg = db.ai_whatsapp_config || {};
  res.json({
    success: true,
    brandName: 'GamesBoy Oficial',
    avatarUrl: '/assets/branding/icon.png',
    verified: true,
    phoneNumbers: cfg.phoneNumbers || {
      general: '+595981000000',
      games: '+595982000000',
      streaming: '+595983000000',
      tools: '+595984000000',
      payments: '+595985000000'
    },
    quickSuggestions: [
      { label: '📺 Cuentas Streaming', text: '¿Qué cuentas y perfiles de streaming tienen disponibles y a qué precio?' },
      { label: '🤖 ChatGPT & Herramientas IA', text: 'Quiero información sobre ChatGPT Plus, Claude Pro y herramientas de trabajo.' },
      { label: '🎮 Videojuegos & Claves', text: '¿Cómo compro videojuegos digitales y qué catálogo tienen?' },
      { label: '💳 Métodos de Pago SIPAP', text: '¿Cuáles son las opciones de pago en guaraníes o criptomonedas?' },
      { label: '💬 Asesor Humano', text: 'Deseo hablar directamente con un agente humano por WhatsApp.' }
    ]
  });
});

// POST Chat message with AI Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], clientName = 'Cliente', clientPhone = '' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    const db = getDb();
    const cfg = db.ai_whatsapp_config || {};
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const phones = cfg.phoneNumbers || {
      general: '+595981000000',
      games: '+595982000000',
      streaming: '+595983000000',
      tools: '+595984000000',
      payments: '+595985000000'
    };

    // 1. Call External LLM if API Key is configured
    let aiResponse = null;
    let detectedIntent = 'general';

    if (cfg.apiKey && cfg.apiKey.trim().length > 10) {
      try {
        if (cfg.provider === 'openai' || cfg.provider === 'groq') {
          const endpoint = cfg.provider === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions';

          const messages = [
            { role: 'system', content: cfg.systemPrompt || 'Eres el Asistente Virtual Oficial de GamesBoy.net.' },
            ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
          ];

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cfg.apiKey}`
            },
            body: JSON.stringify({
              model: cfg.model || (cfg.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'),
              messages,
              temperature: cfg.temperature || 0.7,
              max_tokens: 350
            })
          });

          if (response.ok) {
            const data = await response.json();
            aiResponse = data.choices?.[0]?.message?.content?.trim();
          }
        }
      } catch (externalErr) {
        console.warn('External AI call error, falling back to local engine:', externalErr.message);
      }
    }

    // 2. Intelligent Built-in Local Engine (Zero External Dependencies Fallback)
    const lower = message.toLowerCase();
    let redirectDepartment = 'general';
    let suggestedPhone = phones.general || '+595981000000';
    let defaultWaText = encodeURIComponent(`Hola GamesBoy, vengo desde el chat web: ${message}`);

    if (lower.includes('juego') || lower.includes('steam') || lower.includes('playstation') || lower.includes('ps5') || lower.includes('xbox') || lower.includes('fifa') || lower.includes('fc 25') || lower.includes('nintendo') || lower.includes('clave')) {
      detectedIntent = 'games';
      redirectDepartment = 'videojuegos';
      suggestedPhone = phones.games || phones.general;
      defaultWaText = encodeURIComponent(`Hola GamesBoy, me interesa comprar videojuegos digitales: "${message}"`);
      if (!aiResponse) {
        aiResponse = `¡Hola! 🎮 En GamesBoy contamos con un catálogo completo de **videojuegos digitales y licencias originales** para Steam, PlayStation 4/5, Xbox y PC con activación inmediata y Garantía de Reembolso.

¿Buscas algún título en específico (por ejemplo FIFA/FC 25, GTA, Call of Duty) o deseas ver las ofertas de hoy? Si prefieres una atención personalizada directa, puedes contactar con nuestro especialista de Videojuegos vía WhatsApp.`;
      }
    } else if (lower.includes('chatgpt') || lower.includes('gpt') || lower.includes('claude') || lower.includes('gemini') || lower.includes('minea') || lower.includes('canva') || lower.includes('midjourney') || lower.includes('inteligencia') || lower.includes('ia') || lower.includes('herramienta')) {
      detectedIntent = 'work_tools';
      redirectDepartment = 'herramientas_ia';
      suggestedPhone = phones.tools || phones.general;
      defaultWaText = encodeURIComponent(`Hola GamesBoy, me interesa adquirir herramientas de trabajo e IA: "${message}"`);
      if (!aiResponse) {
        aiResponse = `¡Excelente elección! 🤖 En GamesBoy ofrecemos **acceso oficial a herramientas de trabajo e Inteligencia Artificial** a precios accesibles en guaraníes:

• **ChatGPT Plus & GPT-4o**: 35.000 Gs. / mes (acceso ilimitado y Canvas).
• **Claude Pro (Sonnet 3.5)**: 35.000 Gs. / mes (ideal para código y análisis).
• **Gemini Advanced**: 30.000 Gs. / mes (integrado con Google Workspace).
• **Minea Dropshipping**: 45.000 Gs. / mes (espía de anuncios de e-commerce).
• **Canva Pro**: 20.000 Gs. / mes (diseño sin límites).
• **Midjourney Pro**: 40.000 Gs. / mes (renders hiperrealistas).

Todas nuestras cuentas cuentan con soporte técnico y credenciales privadas seguras.`;
      }
    } else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('disney') || lower.includes('max') || lower.includes('hbo') || lower.includes('youtube') || lower.includes('crunchyroll') || lower.includes('paramount') || lower.includes('streaming') || lower.includes('pantalla') || lower.includes('perfil')) {
      detectedIntent = 'streaming';
      redirectDepartment = 'streaming';
      suggestedPhone = phones.streaming || phones.general;
      defaultWaText = encodeURIComponent(`Hola GamesBoy, deseo adquirir una cuenta o perfil de streaming: "${message}"`);
      if (!aiResponse) {
        aiResponse = `¡Con gusto! 📺 Disponemos de **perfiles individuales y cuentas completas oficiales** con entrega automática y PIN privado:

• **Netflix Premium 4K HDR**: 25.000 Gs. / mes
• **Spotify Premium Familiar**: 18.000 Gs. / mes
• **Disney+ & Star+ Premium**: 25.000 Gs. / mes
• **Max (HBO Max) Platino 4K**: 22.000 Gs. / mes
• **YouTube Premium & Music**: 20.000 Gs. / mes
• **Crunchyroll Mega Fan**: 18.000 Gs. / mes

Al adquirir tu cupo, recibes tus credenciales y PIN en tu Bóveda personal de GamesBoy al instante.`;
      }
    } else if (lower.includes('pago') || lower.includes('pagar') || lower.includes('transferencia') || lower.includes('sipap') || lower.includes('banco') || lower.includes('itau') || lower.includes('continental') || lower.includes('usdt') || lower.includes('binance') || lower.includes('saldo') || lower.includes('recarga')) {
      detectedIntent = 'payments';
      redirectDepartment = 'pagos';
      suggestedPhone = phones.payments || phones.general;
      defaultWaText = encodeURIComponent(`Hola GamesBoy, tengo dudas sobre cómo recargar saldo o pagar: "${message}"`);
      if (!aiResponse) {
        aiResponse = `¡Claro que sí! 💳 En GamesBoy puedes recargar tu billetera o pagar tus pedidos mediante:

1. **Transferencia Bancaria SIPAP (Paraguay)**: Directo a Banco Itaú o Continental (alias SIPAP sin comisión bancaria).
2. **Criptomonedas USDT**: Binance Pay (Pay ID) o red BEP-20 / TRC-20 con aprobación en minutos.
3. **Tarjetas de Débito/Crédito**: Visa y Mastercard.

Tasa de cambio actual: **1 USDT = ${rate.toLocaleString('es-PY')} Gs.**`;
      }
    } else if (lower.includes('humano') || lower.includes('persona') || lower.includes('asesor') || lower.includes('agente') || lower.includes('whatsapp') || lower.includes('contacto') || lower.includes('numero')) {
      detectedIntent = 'human_agent';
      redirectDepartment = 'asesor_humano';
      suggestedPhone = phones.general || '+595981000000';
      defaultWaText = encodeURIComponent(`Hola GamesBoy, solicito conversar con un asesor humano: "${message}"`);
      if (!aiResponse) {
        aiResponse = `¡Por supuesto! Puedes contactar de inmediato con nuestro equipo de atención humana por WhatsApp. Presiona el botón verde aquí abajo para abrir el chat directo con nuestro especialista.`;
      }
    } else {
      if (!aiResponse) {
        aiResponse = `¡Hola! 👋 Soy el asistente virtual oficial de **GamesBoy.net**. Estoy aquí para ayudarte a elegir y comprar:

• **Cuentas & Perfiles Streaming** (Netflix, Spotify, Disney+, Max, YouTube).
• **Herramientas de Trabajo & IA** (ChatGPT Plus, Claude Pro, Gemini, Minea).
• **Videojuegos Digitales & Códigos** (Steam, PS5, Xbox, Nintendo).
• **Tarjetas de Regalo & Licencias Oficiales**.

¿En qué te puedo asesorar hoy? También puedo transferirte a WhatsApp si deseas atención directa.`;
      }
    }

    // 3. Automatically Create or Update an Admin Note if intent is noteworthy
    const isNoteWorthy = lower.includes('comprar') || lower.includes('precio') || lower.includes('sugiero') || lower.includes('tienen') || lower.includes('disponible') || lower.includes('falla') || lower.includes('problema') || lower.includes('humano') || lower.includes('contacto') || detectedIntent !== 'general';

    if (isNoteWorthy) {
      if (!db.ai_support_notes) db.ai_support_notes = [];

      let tag = 'lead_purchase';
      let tagLabel = 'Lead de Compra';

      if (lower.includes('sugier') || lower.includes('podrian agregar') || lower.includes('falta')) {
        tag = 'suggestion';
        tagLabel = 'Sugerencia de Cliente';
      } else if (lower.includes('problema') || lower.includes('falla') || lower.includes('no funciona') || lower.includes('error')) {
        tag = 'technical_issue';
        tagLabel = 'Problema Técnico';
      } else if (lower.includes('hay') || lower.includes('disponible') || lower.includes('stock')) {
        tag = 'stock_inquiry';
        tagLabel = 'Consulta de Stock';
      }

      const noteEntry = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
        clientName: clientName || 'Visitante Web',
        clientPhone: clientPhone || suggestedPhone,
        tag,
        tagLabel,
        category: detectedIntent,
        summary: `Consulta de cliente: "${message.length > 120 ? message.substring(0, 117) + '...' : message}". Asistente respondió y ofreció canal: ${redirectDepartment}.`,
        status: 'pending',
        channel: 'whatsapp_widget'
      };

      // Keep up to 60 notes
      db.ai_support_notes.unshift(noteEntry);
      if (db.ai_support_notes.length > 60) {
        db.ai_support_notes = db.ai_support_notes.slice(0, 60);
      }
      saveStorage(db);
    }

    res.json({
      success: true,
      reply: aiResponse,
      detectedIntent,
      department: redirectDepartment,
      suggestedPhone,
      whatsappUrl: `https://wa.me/${suggestedPhone.replace(/[^0-9]/g, '')}?text=${defaultWaText}`
    });
  } catch (err) {
    console.error('Error in AI support chat:', err);
    res.status(500).json({ error: 'Error al procesar el mensaje.' });
  }
});

// =======================================================
// 2. ADMIN ENDPOINTS (AI WHATSAPP MANAGEMENT & NOTES)
// =======================================================
router.use('/admin', requireAdminAuth);

// GET AI Configuration for Admin
router.get('/admin/config', (req, res) => {
  const db = getDb();
  res.json({
    success: true,
    config: db.ai_whatsapp_config || {}
  });
});

// POST AI Configuration for Admin
router.post('/admin/config', (req, res) => {
  try {
    const { systemPrompt, provider, apiKey, model, temperature, phoneNumbers } = req.body;
    const db = getDb();

    if (!db.ai_whatsapp_config) db.ai_whatsapp_config = {};
    if (systemPrompt !== undefined) db.ai_whatsapp_config.systemPrompt = systemPrompt;
    if (provider !== undefined) db.ai_whatsapp_config.provider = provider;
    if (apiKey !== undefined) db.ai_whatsapp_config.apiKey = apiKey.trim();
    if (model !== undefined) db.ai_whatsapp_config.model = model;
    if (temperature !== undefined) db.ai_whatsapp_config.temperature = parseFloat(temperature) || 0.7;
    if (phoneNumbers !== undefined) db.ai_whatsapp_config.phoneNumbers = phoneNumbers;

    saveStorage(db);
    res.json({
      success: true,
      message: '¡Configuración del Agente WhatsApp IA guardada con éxito!',
      config: db.ai_whatsapp_config
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Notes Wall for Admin
router.get('/admin/notes', (req, res) => {
  const db = getDb();
  const notes = db.ai_support_notes || [];

  const stats = {
    totalNotes: notes.length,
    pendingNotes: notes.filter(n => n.status === 'pending').length,
    reviewedNotes: notes.filter(n => n.status === 'reviewed' || n.status === 'contacted').length,
    leadsCount: notes.filter(n => n.tag === 'lead_purchase').length,
    suggestionsCount: notes.filter(n => n.tag === 'suggestion').length
  };

  res.json({
    success: true,
    stats,
    notes
  });
});

// POST Resolve / Toggle Note Status
router.post('/admin/notes/:id/resolve', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const note = (db.ai_support_notes || []).find(n => n.id === id);

    if (!note) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    note.status = note.status === 'pending' ? 'reviewed' : 'pending';
    note.updatedAt = new Date().toISOString();
    saveStorage(db);

    res.json({
      success: true,
      message: `Nota marcada como ${note.status === 'reviewed' ? 'REVISADA' : 'PENDIENTE'}.`,
      note
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Note
router.delete('/admin/notes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const idx = (db.ai_support_notes || []).findIndex(n => n.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    db.ai_support_notes.splice(idx, 1);
    saveStorage(db);

    res.json({
      success: true,
      message: 'Nota eliminada del muro con éxito.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
