import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { deductBalance } from '../services/walletService.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

// Get digital store products
router.get('/products', (req, res) => {
  const db = getDb();
  const products = (db.store_products || []).map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    platform: p.platform,
    priceUsd: p.priceUsd,
    pricePyg: convertFromUsd(p.priceUsd, 'PYG'),
    badge: p.badge,
    icon: p.icon,
    coverUrl: p.coverUrl,
    brandTheme: p.brandTheme,
    description: p.description,
    stockCount: (p.codes || []).length
  }));

  res.json(products);
});

// Buy a digital gift card / key
router.post('/products/:id/buy', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const prodId = req.params.id;
    const db = getDb();

    const product = db.store_products.find(p => p.id === prodId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (!product.codes || product.codes.length === 0) {
      return res.status(400).json({ error: 'Sin stock disponible por el momento' });
    }

    // 1. Deduct balance from buyer
    deductBalance(userId, product.priceUsd, `Compra de ${product.title}`);

    // 2. Pop code from product stock
    const deliveredCode = product.codes.shift();

    // 3. Save order in user orders
    const order = {
      id: `order_${Date.now()}`,
      buyerId: userId,
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      pricePaidUsd: product.priceUsd,
      pricePaidPyg: convertFromUsd(product.priceUsd, 'PYG'),
      code: deliveredCode,
      createdAt: new Date().toISOString()
    };

    db.user_store_orders.unshift(order);
    saveStorage();

    res.json({
      success: true,
      message: `¡Compra exitosa! Tu código de ${product.title} ha sido entregado.`,
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
  const orders = db.user_store_orders.filter(o => o.buyerId === userId);
  res.json(orders);
});

export default router;
