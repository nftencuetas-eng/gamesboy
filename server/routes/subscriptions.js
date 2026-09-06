import { Router } from 'express';
import { getDb, saveStorage } from '../config/database.js';
import cryptoService from '../services/cryptoService.js';
import { deductBalance, creditSellerEscrow } from '../services/walletService.js';
import { convertFromUsd } from '../services/currencyService.js';

const router = Router();

// Get public catalog of subscriptions with available slots
router.get('/', (req, res) => {
  const db = getDb();
  const { category, officialOnly } = req.query;

  let list = db.subscriptions.filter(s => s.status === 'active');
  if (category && category !== 'all') {
    list = list.filter(s => s.category === category);
  }
  if (officialOnly === 'true') {
    list = list.filter(s => s.isOfficial);
  }

  // Map public view without exposing raw credentials
  const sanitized = list.map(s => ({
    id: s.id,
    sellerId: s.sellerId,
    sellerName: s.sellerName,
    isOfficial: s.isOfficial,
    serviceName: s.serviceName,
    category: s.category,
    planName: s.planName,
    totalSlots: s.totalSlots,
    availableSlots: s.availableSlots,
    pricePerSlotUsd: s.pricePerSlotUsd,
    pricePerSlotPyg: convertFromUsd(s.pricePerSlotUsd, 'PYG'),
    instructions: s.instructions,
    createdAt: s.createdAt
  }));

  res.json(sanitized);
});

// Buy a slot in a subscription
router.post('/:id/buy', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const subId = req.params.id;
    const db = getDb();

    const sub = db.subscriptions.find(s => s.id === subId && s.status === 'active');
    if (!sub) {
      return res.status(404).json({ error: 'Suscripción no encontrada o no disponible' });
    }

    if (sub.availableSlots <= 0) {
      return res.status(400).json({ error: 'No quedan perfiles/slots disponibles en esta suscripción' });
    }

    // 1. Deduct balance from buyer
    const user = db.users.find(u => u.id === userId) || { name: 'Cliente' };
    deductBalance(userId, sub.pricePerSlotUsd, `Suscripción a ${sub.serviceName}`);

    // 2. Assign slot number & PIN
    const assignedSlotNumber = (sub.totalSlots - sub.availableSlots) + 1;
    let assignedPin = 'N/A';
    try {
      const pinsObj = JSON.parse(cryptoService.decrypt(sub.pinsEncrypted) || '{}');
      if (pinsObj[assignedSlotNumber]) {
        assignedPin = pinsObj[assignedSlotNumber];
      }
    } catch (e) {}

    // 3. Decrement available slots
    sub.availableSlots = Math.max(0, sub.availableSlots - 1);

    // 4. Save user slot entry
    const userSlot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      subscriptionId: sub.id,
      serviceName: sub.serviceName,
      buyerId: userId,
      buyerName: user.name,
      slotNumber: assignedSlotNumber,
      assignedPin,
      credentialsEncrypted: sub.credentialsEncrypted,
      pricePaidUsd: sub.pricePerSlotUsd,
      instructions: sub.instructions,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    db.user_slots.unshift(userSlot);

    // 5. Credit seller (minus commission)
    const commissionPercent = db.platform_settings.commissionPercent || 15;
    creditSellerEscrow(sub.sellerId, sub.pricePerSlotUsd, commissionPercent);

    saveStorage();

    // Decrypt credentials for immediate client response
    const rawCreds = cryptoService.decrypt(userSlot.credentialsEncrypted);

    res.json({
      success: true,
      message: `¡Felicitaciones! Has activado tu perfil de ${sub.serviceName}`,
      slot: {
        id: userSlot.id,
        serviceName: userSlot.serviceName,
        slotNumber: userSlot.slotNumber,
        assignedPin: userSlot.assignedPin,
        credentials: rawCreds,
        instructions: userSlot.instructions,
        expiresAt: userSlot.expiresAt
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user's purchased active slots (Credentials Vault)
router.get('/my-vault', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_client1';
  const db = getDb();

  const userSlots = db.user_slots.filter(s => s.buyerId === userId);
  
  const decryptedSlots = userSlots.map(s => ({
    id: s.id,
    serviceName: s.serviceName,
    slotNumber: s.slotNumber,
    assignedPin: s.assignedPin,
    credentials: cryptoService.decrypt(s.credentialsEncrypted),
    instructions: s.instructions,
    pricePaidUsd: s.pricePaidUsd,
    pricePaidPyg: convertFromUsd(s.pricePaidUsd, 'PYG'),
    expiresAt: s.expiresAt,
    status: s.status,
    createdAt: s.createdAt
  }));

  res.json(decryptedSlots);
});

export default router;
