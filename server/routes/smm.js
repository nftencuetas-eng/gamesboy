import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { deductBalance, getWallet } from '../services/walletService.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

const DEFAULT_SMM_SERVICES = [
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

// 1. Get SMM Services Catalog with Markup Calculation
router.get('/services', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const markup = db.smm_config?.markupPercent || 30;

    const services = DEFAULT_SMM_SERVICES.map(s => {
      const finalPricePer1kUsd = parseFloat((s.basePricePer1kUsd * (1 + markup / 100)).toFixed(2));
      const finalPricePer1kPyg = Math.round(finalPricePer1kUsd * rate);
      return {
        ...s,
        pricePer1kUsd: finalPricePer1kUsd,
        pricePer1kPyg: finalPricePer1kPyg,
        ratePyg: rate
      };
    });

    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Place an SMM Order
router.post('/order', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const { serviceId, link, quantity } = req.body;

    if (!serviceId || !link || !quantity || parseInt(quantity) <= 0) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const service = DEFAULT_SMM_SERVICES.find(s => s.id === serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    const qty = parseInt(quantity);
    if (qty < service.minQuantity || qty > service.maxQuantity) {
      return res.status(400).json({
        error: `La cantidad debe estar entre ${service.minQuantity.toLocaleString()} y ${service.maxQuantity.toLocaleString()}.`
      });
    }

    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;
    const markup = db.smm_config?.markupPercent || 30;
    const pricePer1kUsd = parseFloat((service.basePricePer1kUsd * (1 + markup / 100)).toFixed(2));
    const totalUsd = parseFloat(((pricePer1kUsd * qty) / 1000).toFixed(2));
    const totalPyg = Math.round(totalUsd * rate);

    // 1. Deduct wallet balance
    deductBalance(userId, totalUsd, `Impulso Digital: ${service.name} (${qty.toLocaleString()} unidades)`);

    // 2. Create Order in database
    const order = {
      id: `smm_ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      serviceId: service.id,
      serviceName: service.name,
      platform: service.platform,
      link: link.trim(),
      quantity: qty,
      pricePaidUsd: totalUsd,
      pricePaidPyg: totalPyg,
      status: 'in_progress', // 'in_progress', 'completed'
      createdAt: new Date().toISOString()
    };

    if (!db.smm_orders) db.smm_orders = [];
    db.smm_orders.unshift(order);
    saveStorage();

    // 3. Broadcast WebSocket event
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'SMM_ORDER_CREATED',
            payload: { order, userWallet: getWallet(userId) }
          }));
        }
      });
    }

    res.json({
      success: true,
      message: `¡Orden de ${service.name} procesada con éxito! Se iniciará la entrega en breve hacia tu enlace.`,
      order,
      totalUsd,
      totalPyg
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Get User's SMM Orders
router.get('/my-orders', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const db = getDb();
    const myOrders = (db.smm_orders || []).filter(o => o.userId === userId);
    res.json({ success: true, count: myOrders.length, orders: myOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
