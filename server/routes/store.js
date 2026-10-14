import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import { deductBalance } from '../services/walletService.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

function getGameCover(id, title) {
  const cleanId = (id || '').toLowerCase();
  const cleanTitle = (title || '').toLowerCase();
  if (cleanId.includes('fc25') || cleanTitle.includes('fc 25')) return '/assets/games/cover_fc25.jpg';
  if (cleanId.includes('spiderman') || cleanTitle.includes('spider-man')) return '/assets/games/cover_spiderman2.jpg';
  if (cleanId.includes('cod') || cleanTitle.includes('black ops')) return '/assets/games/cover_cod_bo6.jpg';
  if (cleanId.includes('gta') || cleanTitle.includes('grand theft auto')) return '/assets/games/cover_gta6.jpg';
  if (cleanId.includes('wukong') || cleanTitle.includes('wukong')) return '/assets/games/cover_wukong.jpg';
  if (cleanId.includes('gow') || cleanTitle.includes('god of war')) return '/assets/games/cover_gow_rag.jpg';
  if (cleanId.includes('elden') || cleanTitle.includes('elden ring')) return '/assets/games/cover_elden_ring.jpg';
  if (cleanId.includes('cyberpunk') || cleanTitle.includes('cyberpunk')) return '/assets/games/cover_cyberpunk.jpg';
  return '/assets/branding/hero-showcase.png';
}

function getGiftcardLogo(id, name) {
  const clean = ((id || '') + ' ' + (name || '')).toLowerCase();
  if (clean.includes('psn') || clean.includes('playstation')) return '/assets/giftcards/playstation.svg';
  if (clean.includes('steam')) return '/assets/giftcards/steam.svg';
  if (clean.includes('xbox')) return '/assets/giftcards/xbox.svg';
  if (clean.includes('nin') || clean.includes('nintendo') || clean.includes('switch')) return '/assets/giftcards/nintendo.svg';
  if (clean.includes('spot') || clean.includes('spotify')) return '/assets/giftcards/spotify.svg';
  if (clean.includes('net') || clean.includes('netflix')) return '/assets/giftcards/netflix.svg';
  if (clean.includes('google') || clean.includes('play')) return '/assets/giftcards/googleplay.svg';
  if (clean.includes('apple') || clean.includes('itunes')) return '/assets/giftcards/apple.svg';
  if (clean.includes('riot') || clean.includes('valorant') || clean.includes('league')) return '/assets/giftcards/steam.svg';
  return '/assets/giftcards/playstation.svg';
}

// Get digital store products (digital games, gift cards, licenses)
router.get('/products', (req, res) => {
  const db = getDb();
  const rate = db.platform_settings?.exchangeRatePyg || 7500;
  const products = (db.store_products || [])
    .filter(p => p && (p.category === 'game_key' || p.category === 'digital_game' || p.category === 'gift_card' || !p.category || (p.category && p.category.includes('game'))))
    .map(p => {
      const primaryPyg = p.primaryPricePyg || (p.pricePyg ? p.pricePyg : (p.priceUsd ? Math.round(p.priceUsd * rate) : (p.primaryPriceUsd ? Math.round(p.primaryPriceUsd * rate) : 0)));
      const primaryUsd = p.primaryPriceUsd || (p.priceUsd ? parseFloat(p.priceUsd) : parseFloat((primaryPyg / rate).toFixed(2)));
      const secondaryPyg = p.secondaryPricePyg !== undefined ? p.secondaryPricePyg : (p.secondaryPriceUsd ? Math.round(p.secondaryPriceUsd * rate) : Math.round(primaryPyg * 0.65));
      const secondaryUsd = p.secondaryPriceUsd || parseFloat((secondaryPyg / rate).toFixed(2));
      const isAvail = p.isAvailable !== false;
      const isGiftCard = p.category === 'gift_card';
      const fallbackAsset = isGiftCard ? getGiftcardLogo(p.id, p.title) : getGameCover(p.id, p.title);
      const resolvedCover = p.coverUrl || p.coverImage || p.imageUrl || p.cover || p.image || fallbackAsset;

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
        badge: p.badge || (isAvail ? 'DISPONIBLE' : 'SIN STOCK'),
        icon: p.icon,
        coverUrl: resolvedCover,
        coverImage: resolvedCover,
        screenshots: Array.isArray(p.screenshots) && p.screenshots.length > 0 ? p.screenshots : [resolvedCover],
        brand: p.brand,
        brandTheme: p.brandTheme,
        description: p.description || '',
        isAvailable: isAvail,
        stockCount: Array.isArray(p.codes) ? p.codes.length : (p.stock || (isAvail ? 5 : 0))
      };
    });

  res.json(products);
});

// Get gift card brands (public storefront)
router.get('/giftcards/brands', (req, res) => {
  const db = getDb();
  const rawBrands = db.giftcard_brands || [];
  const brands = rawBrands.map(b => ({
    ...b,
    logoUrl: b.logoUrl || b.logoImage || b.coverUrl || b.image_url || getGiftcardLogo(b.id, b.name),
    coverUrl: b.coverUrl || b.logoUrl || b.logoImage || b.image_url || getGiftcardLogo(b.id, b.name)
  }));
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

    const buyerUser = (db.users || []).find(u => u.id === userId);

    // 3. Save order in user orders
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      buyerId: userId,
      buyerName: (buyerUser && buyerUser.name) ? `${buyerUser.name}${buyerUser.surname ? ' ' + buyerUser.surname : ''}` : 'Cliente GamesBoy',
      buyerEmail: (buyerUser && buyerUser.email) ? buyerUser.email : 'cliente@gamesboy.net',
      productId: product.id,
      title: product.title,
      productTitle: product.title,
      type: product.category === 'gift_card' ? 'giftcard' : 'game',
      option: option || 'Cuenta Primaria',
      platform: product.platform || 'Digital',
      pricePaidUsd: finalPriceUsd,
      pricePaidPyg: finalPricePyg,
      status, // 'pending_delivery' or 'delivered'
      code: deliveredCode || '',
      credentials: '',
      deliveredEmail: '',
      deliveredPassword: '',
      deliveredCode: deliveredCode || '',
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
