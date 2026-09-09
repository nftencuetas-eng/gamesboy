import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { deductBalance } from '../services/walletService.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

// Get digital store products
router.get('/products', (req, res) => {
  const db = getDb();
  const rate = db.platform_settings?.exchangeRatePyg || 7500;
  const products = (db.store_products || [])
    .filter(p => p && p.isAvailable !== false && (p.category === 'game_key' || p.category === 'digital_game' || p.category === 'gift_card'))
    .map(p => {
      const primaryPyg = p.primaryPricePyg || (p.pricePyg ? p.pricePyg : (p.priceUsd ? Math.round(p.priceUsd * rate) : (p.primaryPriceUsd ? Math.round(p.primaryPriceUsd * rate) : 0)));
      const primaryUsd = p.primaryPriceUsd || (p.priceUsd ? parseFloat(p.priceUsd) : parseFloat((primaryPyg / rate).toFixed(2)));
      const secondaryPyg = p.secondaryPricePyg !== undefined ? p.secondaryPricePyg : (p.secondaryPriceUsd ? Math.round(p.secondaryPriceUsd * rate) : Math.round(primaryPyg * 0.65));
      const secondaryUsd = p.secondaryPriceUsd || parseFloat((secondaryPyg / rate).toFixed(2));

      return {
        id: p.id,
        title: p.title || p.name || 'Producto Digital',
        category: p.category || 'digital_game',
        platform: p.platform || 'PS5',
        genre: p.genre || 'Acción',
        priceUsd: primaryUsd,
        pricePyg: primaryPyg,
        primaryPriceUsd: primaryUsd,
        primaryPricePyg: primaryPyg,
        secondaryPriceUsd: secondaryUsd,
        secondaryPricePyg: secondaryPyg,
        badge: p.badge || 'DISPONIBLE',
        icon: p.icon,
        coverUrl: p.coverUrl || p.coverImage || p.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        coverImage: p.coverImage || p.coverUrl || p.imageUrl,
        screenshots: Array.isArray(p.screenshots) && p.screenshots.length > 0 ? p.screenshots : [
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
        ],
        brand: p.brand,
        brandTheme: p.brandTheme,
        description: p.description || '',
        isAvailable: p.isAvailable !== false,
        stockCount: Array.isArray(p.codes) ? p.codes.length : (p.stock || 0)
      };
    });

  res.json(products);
});

// Get gift card brands (public storefront)
router.get('/giftcards/brands', (req, res) => {
  const db = getDb();
  const brands = db.giftcard_brands || [];
  res.json({ success: true, count: brands.length, brands });
});

// Buy a digital game or gift card
router.post('/products/:id/buy', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const prodId = req.params.id;
    const { option = 'Cuenta Primaria', priceUsd: reqPriceUsd } = req.body;
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    const product = (db.store_products || []).find(p => p.id === prodId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Determine price
    let finalPriceUsd = parseFloat(reqPriceUsd) || product.priceUsd || 39.99;
    if (option === 'Cuenta Secundaria' && (product.secondaryPriceUsd || product.secondaryPricePyg)) {
      finalPriceUsd = product.secondaryPriceUsd || parseFloat((product.secondaryPricePyg / rate).toFixed(2));
    } else if (option === 'Cuenta Primaria' && (product.primaryPriceUsd || product.primaryPricePyg)) {
      finalPriceUsd = product.primaryPriceUsd || parseFloat((product.primaryPricePyg / rate).toFixed(2));
    }

    const finalPricePyg = Math.round(finalPriceUsd * rate);

    // 1. Deduct balance from buyer
    deductBalance(userId, finalPriceUsd, `Compra de ${product.title} (${option})`);

    // 2. Check if instant code exists or if manual delivery is needed
    let deliveredCode = '';
    let status = 'pending_delivery';

    if (product.codes && product.codes.length > 0) {
      deliveredCode = product.codes.shift();
      status = 'delivered';
    }

    // 3. Save order in user orders
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      buyerId: userId,
      productId: product.id,
      productTitle: product.title,
      type: product.category === 'gift_card' ? 'giftcard' : 'game',
      option: option || 'Cuenta Primaria',
      platform: product.platform || 'Digital',
      pricePaidUsd: finalPriceUsd,
      pricePaidPyg: finalPricePyg,
      status, // 'pending_delivery' or 'delivered'
      code: deliveredCode || 'En preparación (Entrega en minutos)',
      credentials: '',
      instructions: '',
      createdAt: new Date().toISOString(),
      deliveredAt: status === 'delivered' ? new Date().toISOString() : null
    };

    if (!db.user_store_orders) db.user_store_orders = [];
    db.user_store_orders.unshift(order);
    saveStorage();

    // Broadcast WebSocket notification to admin
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'NEW_ORDER_PENDING',
            payload: order
          }));
        }
      });
    }

    const msg = status === 'delivered'
      ? `¡Compra exitosa! Tu código de ${product.title} ha sido entregado.`
      : `¡Compra confirmada! Tu orden de "${product.title} (${option})" está en preparación y será entregada en minutos.`;

    res.json({
      success: true,
      message: msg,
      order
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user's purchased digital keys / gift cards
router.get('/my-orders', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_client1';
  const db = getDb();
  const orders = (db.user_store_orders || []).filter(o => o.buyerId === userId);
  res.json(orders);
});

export default router;
