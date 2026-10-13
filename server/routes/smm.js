import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { deductBalance, getWallet } from '../services/walletService.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

export const DEFAULT_SMM_SERVICES = [
  {
    id: 'smm_ig_followers_hq',
    platform: 'Instagram',
    name: 'Seguidores HQ Reales (Garantizados 30 Días)',
    desc: 'Cuentas con fotos de perfil, publicaciones y actividad real. Entrega gradual y segura.',
    basePricePer1kUsd: 4.50,
    minQuantity: 100,
    maxQuantity: 25000,
    badge: 'MÁS POPULAR',
    icon: 'instagram'
  },
  {
    id: 'smm_ig_likes_fast',
    platform: 'Instagram',
    name: 'Likes / Me Gusta Instantáneos',
    desc: 'Aumenta el alcance en el algoritmo y sección Explorar de Instagram.',
    basePricePer1kUsd: 1.80,
    minQuantity: 50,
    maxQuantity: 50000,
    badge: 'ENTREGA RÁPIDA',
    icon: 'heart'
  },
  {
    id: 'smm_tiktok_views_viral',
    platform: 'TikTok',
    name: 'Visualizaciones Virales Para Ti (FYP)',
    desc: 'Potencia tus videos para entrar en las tendencias mundiales y locales de TikTok.',
    basePricePer1kUsd: 0.90,
    minQuantity: 500,
    maxQuantity: 100000,
    badge: 'ALTA RETENCIÓN',
    icon: 'video'
  },
  {
    id: 'smm_tiktok_followers',
    platform: 'TikTok',
    name: 'Seguidores Activos TikTok',
    desc: 'Habilita funciones de LIVE y monetización alcanzando los 1.000 o 10.000 seguidores.',
    basePricePer1kUsd: 6.50,
    minQuantity: 100,
    maxQuantity: 20000,
    badge: 'GARANTIZADO',
    icon: 'users'
  },
  {
    id: 'smm_yt_views_retention',
    platform: 'YouTube',
    name: 'Vistas de Alta Retención (Monetizables)',
    desc: 'Vistas de usuarios reales compatibles con el programa de socios de YouTube Adsense.',
    basePricePer1kUsd: 5.20,
    minQuantity: 500,
    maxQuantity: 50000,
    badge: '100% SEGURO',
    icon: 'youtube'
  },
  {
    id: 'smm_tg_members',
    platform: 'Telegram',
    name: 'Miembros para Canales & Grupos',
    desc: 'Incrementa la credibilidad y tamaño de tu comunidad o canal de Telegram.',
    basePricePer1kUsd: 3.80,
    minQuantity: 100,
    maxQuantity: 30000,
    badge: 'SIN CAÍDAS',
    icon: 'telegram'
  }
];

// 1. Get SMM Services Catalog
router.get('/services', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    const services = DEFAULT_SMM_SERVICES.map(s => {
      const priceUsd = s.basePricePer1kUsd;
      const pricePyg = Math.round(priceUsd * rate);
      return {
        ...s,
        pricePer1kUsd: priceUsd,
        pricePer1kPyg: pricePyg,
        ratePyg: rate
      };
    });

    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Place an SMM Order (Direct Digital Store Product with Manual Fulfillment)
router.post('/order', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const { serviceId, serviceTitle, link, quantity, pricePyg, priceUsd } = req.body;

    if (!link || !link.trim()) {
      return res.status(400).json({ error: 'Por favor ingresa el enlace o nombre de usuario de tu perfil o publicación.' });
    }

    const qty = parseInt(quantity, 10);
    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Por favor selecciona una cantidad válida.' });
    }

    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    // Detect platform and formatted title
    let sTitle = serviceTitle || '';
    let platform = 'Instagram';
    const sIdLower = (serviceId || '').toLowerCase();

    if (sIdLower.includes('tiktok')) platform = 'TikTok';
    else if (sIdLower.includes('youtube') || sIdLower.includes('yt')) platform = 'YouTube';
    else if (sIdLower.includes('telegram') || sIdLower.includes('tg')) platform = 'Telegram';
    else if (sIdLower.includes('x') || sIdLower.includes('twitter')) platform = 'X (Twitter)';
    else if (sIdLower.includes('facebook') || sIdLower.includes('fb')) platform = 'Facebook';
    else platform = 'Instagram';

    if (!sTitle) {
      const matched = DEFAULT_SMM_SERVICES.find(s => s.id === serviceId);
      sTitle = matched ? `${matched.platform} - ${matched.name}` : `${platform} - Crecimiento Digital`;
    }

    // Determine final prices in Gs. and USD
    let totalPyg = parseInt(pricePyg, 10);
    let totalUsd = parseFloat(priceUsd);

    if (!totalPyg || isNaN(totalPyg) || totalPyg <= 0) {
      if (totalUsd && !isNaN(totalUsd) && totalUsd > 0) {
        totalPyg = Math.round(totalUsd * rate);
      } else {
        totalPyg = 15000;
        totalUsd = parseFloat((totalPyg / rate).toFixed(2));
      }
    }
    if (!totalUsd || isNaN(totalUsd) || totalUsd <= 0) {
      totalUsd = parseFloat((totalPyg / rate).toFixed(2));
    }

    // Check user & wallet
    const user = (db.users || []).find(u => u.id === userId) || { name: 'Cliente GamesBoy' };

    // 1. Deduct balance from user wallet
    deductBalance(userId, totalUsd, `Crecimiento: ${sTitle} (${qty.toLocaleString()} unidades)`);

    // 2. Create Order in database
    const order = {
      id: `smm_ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      userName: user.name || user.email || 'Cliente',
      serviceId: serviceId || 'smm_custom',
      serviceName: sTitle,
      serviceTitle: sTitle,
      platform,
      link: link.trim(),
      quantity: qty,
      pricePaidUsd: totalUsd,
      pricePaidPyg: totalPyg,
      status: 'in_progress', // 'in_progress' (En preparación), 'completed' (Completado)
      estimatedDelivery: '24 a 48 horas',
      notes: 'Tu servicio está en preparación. El plazo de entrega es de 24 a 48 horas.',
      createdAt: new Date().toISOString()
    };

    if (!db.smm_orders) db.smm_orders = [];
    db.smm_orders.unshift(order);
    saveStorage();

    // 3. Broadcast WebSocket event to real-time Admin and Client listeners
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'NEW_SMM_ORDER',
            payload: { order, userWallet: getWallet(userId) }
          }));
        }
      });
    }

    res.json({
      success: true,
      message: `¡Orden procesada con éxito! Tu servicio está en preparación con un plazo de entrega de 24 a 48 horas.`,
      order,
      totalUsd,
      totalPyg
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Get User's SMM Orders (Purchases Vault)
router.get('/my-orders', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const db = getDb();
    const myOrders = (db.smm_orders || []).filter(o => o.userId === userId);
    res.json(myOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
