import fs from 'fs';

let content = fs.readFileSync('server/routes/admin.js', 'utf8').replace(/\r\n/g, '\n');

// 1. Add pendingSmmCount to overview stats
content = content.replace(
  `pendingDepositsCount: pendingDeposits.length,\n      pendingPayoutsCount: pendingPayouts.length`,
  `pendingDepositsCount: pendingDeposits.length,\n      pendingPayoutsCount: pendingPayouts.length,\n      pendingSmmCount: (db.smm_orders || []).filter(o => o.status === 'in_progress' || o.status === 'pending').length,\n      totalSmmOrders: (db.smm_orders || []).length`
);

// 2. Replace old SMM API configuration routes with the new SMM operational orders management
const oldSmmSection = `// =======================================================
// 5. IMPULSO DIGITAL & REDES SOCIALES API CONFIG (SMM)
// =======================================================
router.get('/smm/config', (req, res) => {
  try {
    const db = getDb();
    const config = db.smm_config || {
      providerUrl: 'https://api.justanotherpanel.com/v2',
      apiKey: 'smm_key_masked_****_8921',
      markupPercent: 30,
      status: 'ready',
      lastBalanceUsd: 184.20,
      lastSyncAt: new Date().toISOString()
    };
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/smm/config', (req, res) => {
  try {
    const db = getDb();
    const { providerUrl, apiKey, markupPercent = 30 } = req.body;

    if (!providerUrl) return res.status(400).json({ error: 'URL del proveedor requerida' });

    db.smm_config = {
      providerUrl: providerUrl.trim(),
      apiKey: apiKey && apiKey.trim() ? apiKey.trim() : (db.smm_config?.apiKey || 'smm_key_secret'),
      markupPercent: parseFloat(markupPercent) || 30,
      status: 'connected',
      lastBalanceUsd: db.smm_config?.lastBalanceUsd || 184.20,
      lastSyncAt: new Date().toISOString()
    };
    saveStorage();

    res.json({
      success: true,
      message: '¡Configuración de API de Impulso Digital guardada con éxito!',
      config: db.smm_config
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/smm/test-connection', (req, res) => {
  try {
    const db = getDb();
    const config = db.smm_config || {};
    
    // Simulate real API ping & balance check
    const simulatedBalance = 245.80;
    config.lastBalanceUsd = simulatedBalance;
    config.status = 'connected';
    config.lastSyncAt = new Date().toISOString();
    db.smm_config = config;
    saveStorage();

    res.json({
      success: true,
      message: '🟢 Conexión con el proveedor API establecida con éxito.',
      providerBalanceUsd: simulatedBalance,
      status: 'connected'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

const newSmmSection = `// =======================================================
// 5. BANDEJA DE CRECIMIENTO EN REDES SOCIALES (SMM ORDERS)
// =======================================================

// Get all Social Media growth orders for Admin fulfillment
router.get('/smm/orders', (req, res) => {
  try {
    const db = getDb();
    const rate = db.platform_settings?.exchangeRatePyg || 7500;

    const orders = (db.smm_orders || []).map(o => {
      const user = (db.users || []).find(u => u.id === o.userId);
      return {
        ...o,
        userName: o.userName || user?.name || user?.email || 'Cliente',
        userEmail: user?.email || '',
        pricePaidPyg: o.pricePaidPyg || Math.round((o.pricePaidUsd || 0) * rate)
      };
    });

    const inProgressCount = orders.filter(o => o.status === 'in_progress' || o.status === 'pending').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    const totalVolumePyg = orders.reduce((sum, o) => sum + (o.pricePaidPyg || 0), 0);
    const totalVolumeUsd = parseFloat(orders.reduce((sum, o) => sum + (o.pricePaidUsd || 0), 0).toFixed(2));

    res.json({
      success: true,
      count: orders.length,
      stats: {
        totalOrders: orders.length,
        inProgressCount,
        completedCount,
        totalVolumePyg,
        totalVolumeUsd
      },
      orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark SMM order as completed (notifies customer)
router.post('/smm/orders/:id/complete', (req, res) => {
  try {
    const db = getDb();
    const order = (db.smm_orders || []).find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Orden de redes sociales no encontrada.' });
    }

    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    order.notes = 'Servicio cargado y verificado con éxito por el administrador.';
    saveStorage();

    // Broadcast WebSocket event
    const wss = req.app.get('wss');
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'SMM_ORDER_COMPLETED',
            payload: { order }
          }));
        }
      });
    }

    res.json({
      success: true,
      message: \`¡Orden "\${order.id}" de \${order.platform} marcada como COMPLETADA exitosamente!\`,
      order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

if (content.includes(oldSmmSection)) {
  content = content.replace(oldSmmSection, newSmmSection);
  console.log('✅ Replaced old SMM API config with new SMM orders management in admin.js!');
} else {
  console.error('❌ Could not match oldSmmSection in server/routes/admin.js');
}

fs.writeFileSync('server/routes/admin.js', content, 'utf8');
