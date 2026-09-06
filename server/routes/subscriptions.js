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
  
  const decryptedSlots = userSlots.map(s => {
    const sub = db.subscriptions.find(sub => sub.id === s.subscriptionId);
    const expiresDate = new Date(s.expiresAt);
    const now = new Date();
    const diffMs = expiresDate - now;
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const eligibleForDiscount = daysRemaining <= 3;
    const basePrice = sub ? sub.pricePerSlotUsd : (s.pricePaidUsd || 4.99);
    const renewalPriceUsd = eligibleForDiscount ? parseFloat((basePrice * 0.95).toFixed(2)) : basePrice;

    return {
      id: s.id,
      subscriptionId: s.subscriptionId,
      serviceName: s.serviceName,
      slotNumber: s.slotNumber,
      assignedPin: s.assignedPin,
      credentials: cryptoService.decrypt(s.credentialsEncrypted),
      instructions: s.instructions,
      pricePaidUsd: s.pricePaidUsd,
      pricePaidPyg: convertFromUsd(s.pricePaidUsd, 'PYG'),
      expiresAt: s.expiresAt,
      daysRemaining,
      eligibleForDiscount,
      renewalPriceUsd,
      renewalPricePyg: convertFromUsd(renewalPriceUsd, 'PYG'),
      status: s.status,
      isOwner: sub ? sub.sellerId === userId : false,
      createdAt: s.createdAt
    };
  });

  res.json(decryptedSlots);
});

// Get detailed internal group view & chat messages for a shared streaming account
router.get('/:id/group', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const subId = req.params.id;
    const db = getDb();

    const sub = db.subscriptions.find(s => s.id === subId);
    if (!sub) {
      return res.status(404).json({ error: 'Grupo o suscripción no encontrada.' });
    }

    // Ensure group_chats storage exists
    if (!db.group_chats) db.group_chats = {};
    if (!db.group_chats[subId]) {
      // Seed welcome message from account admin
      db.group_chats[subId] = [
        {
          id: `msg_init_${subId}`,
          senderId: sub.sellerId,
          senderName: sub.sellerName,
          senderAvatar: sub.isOfficial ? '👑' : '💼',
          isOwnerAdmin: true,
          text: `¡Bienvenidos al grupo oficial de ${sub.serviceName}! Por favor respeten su perfil y PIN asignado. Dudas o consultas aquí.`,
          timestamp: sub.createdAt || new Date().toISOString()
        }
      ];
      saveStorage();
    }

    // Find all occupied slots/members for this account
    const slots = db.user_slots.filter(s => s.subscriptionId === subId);
    
    // STRICT PRIVACY: Map members displaying ONLY display name & avatar (NO EMAILS)
    const members = [
      {
        id: sub.sellerId,
        name: sub.sellerName,
        avatar: sub.isOfficial ? '👑' : '💼',
        role: 'Administrador de la Cuenta',
        isOwner: true,
        slotNumber: 0,
        status: 'online'
      }
    ];

    slots.forEach(slot => {
      const user = db.users.find(u => u.id === slot.buyerId) || { name: slot.buyerName || 'Miembro', avatar: '🎮' };
      members.push({
        id: slot.buyerId,
        name: user.name,
        avatar: user.avatar || '🎮',
        role: `Perfil #${slot.slotNumber}`,
        isOwner: false,
        slotNumber: slot.slotNumber,
        expiresAt: slot.expiresAt,
        status: 'active'
      });
    });

    // Check if requesting user is the owner or a slot holder
    const userSlot = slots.find(s => s.buyerId === userId);
    const isOwner = sub.sellerId === userId;

    let userSlotInfo = null;
    if (userSlot) {
      const expiresDate = new Date(userSlot.expiresAt);
      const diffMs = expiresDate - new Date();
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const eligibleForDiscount = daysRemaining <= 3;
      const discountedPriceUsd = parseFloat((sub.pricePerSlotUsd * 0.95).toFixed(2));

      userSlotInfo = {
        slotId: userSlot.id,
        slotNumber: userSlot.slotNumber,
        assignedPin: userSlot.assignedPin,
        expiresAt: userSlot.expiresAt,
        daysRemaining,
        eligibleForDiscount,
        normalPriceUsd: sub.pricePerSlotUsd,
        discountedPriceUsd,
        discountedPricePyg: convertFromUsd(discountedPriceUsd, 'PYG')
      };
    }

    res.json({
      success: true,
      group: {
        subscriptionId: sub.id,
        serviceName: sub.serviceName,
        planName: sub.planName,
        adminName: sub.sellerName,
        adminAvatar: sub.isOfficial ? '👑' : '💼',
        isOfficial: sub.isOfficial,
        totalSlots: sub.totalSlots,
        occupiedSlots: sub.totalSlots - sub.availableSlots,
        availableSlots: sub.availableSlots,
        credentials: isOwner || userSlot ? cryptoService.decrypt(sub.credentialsEncrypted) : null,
        instructions: sub.instructions,
        isOwner,
        userSlot: userSlotInfo,
        members,
        chatMessages: db.group_chats[subId] || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a message in the internal streaming group chat
router.post('/:id/group/chat', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const subId = req.params.id;
    const { text } = req.body;
    const db = getDb();

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const sub = db.subscriptions.find(s => s.id === subId);
    if (!sub) {
      return res.status(404).json({ error: 'Suscripción no encontrada.' });
    }

    const user = db.users.find(u => u.id === userId) || { name: 'Usuario', avatar: '🎮' };
    const isOwnerAdmin = (sub.sellerId === userId || user.role === 'admin');

    if (!db.group_chats) db.group_chats = {};
    if (!db.group_chats[subId]) db.group_chats[subId] = [];

    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderId: userId,
      senderName: user.name,
      senderAvatar: isOwnerAdmin ? '👑' : (user.avatar || '🎮'),
      isOwnerAdmin,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    db.group_chats[subId].push(newMsg);
    saveStorage();

    res.json({
      success: true,
      message: newMsg
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Early renewal with 5% discount (if daysRemaining <= 3) or regular renewal
router.post('/:id/renew', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const subId = req.params.id;
    const db = getDb();

    const sub = db.subscriptions.find(s => s.id === subId);
    if (!sub) {
      return res.status(404).json({ error: 'Suscripción no encontrada.' });
    }

    const userSlot = db.user_slots.find(s => s.subscriptionId === subId && s.buyerId === userId);
    if (!userSlot) {
      return res.status(404).json({ error: 'No tienes un cupo activo en esta cuenta para renovar.' });
    }

    const expiresDate = new Date(userSlot.expiresAt);
    const diffMs = expiresDate - new Date();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    
    // 5% discount if <= 3 days remaining
    const isEligibleDiscount = daysRemaining <= 3;
    const finalPriceUsd = isEligibleDiscount ? parseFloat((sub.pricePerSlotUsd * 0.95).toFixed(2)) : sub.pricePerSlotUsd;

    // Deduct balance from buyer wallet
    deductBalance(userId, finalPriceUsd, `Renovación ${isEligibleDiscount ? 'Anticipada (-5% OFF)' : ''} de ${sub.serviceName}`);

    // Extend expiration by 30 days
    const currentExp = new Date(userSlot.expiresAt).getTime();
    const newExp = new Date(Math.max(Date.now(), currentExp) + 30 * 24 * 60 * 60 * 1000).toISOString();
    userSlot.expiresAt = newExp;

    // Credit seller escrow
    const commissionPercent = db.platform_settings.commissionPercent || 15;
    creditSellerEscrow(sub.sellerId, finalPriceUsd, commissionPercent);

    // Add automated renewal notification in group chat
    if (!db.group_chats) db.group_chats = {};
    if (!db.group_chats[subId]) db.group_chats[subId] = [];

    const user = db.users.find(u => u.id === userId) || { name: userSlot.buyerName || 'Miembro' };
    db.group_chats[subId].push({
      id: `sys_renew_${Date.now()}`,
      senderId: 'system',
      senderName: '🤖 Sistema GamesBoy',
      senderAvatar: '⚡',
      isOwnerAdmin: false,
      isSystem: true,
      text: `🎉 ¡${user.name} (Perfil #${userSlot.slotNumber}) ha renovado su suscripción por 30 días más${isEligibleDiscount ? ' con 5% de descuento anticipado' : ''}!`,
      timestamp: new Date().toISOString()
    });

    saveStorage();

    res.json({
      success: true,
      message: `¡Renovación exitosa! Tu cupo en ${sub.serviceName} se ha extendido 30 días más.`,
      discountApplied: isEligibleDiscount,
      amountPaidUsd: finalPriceUsd,
      newExpiresAt: newExp
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Allow any logged-in user to publish a streaming account (Unified Client-Seller Role)
router.post('/publish', (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_client1';
    const db = getDb();
    const user = db.users.find(u => u.id === userId) || { name: 'Usuario GamesBoy', role: 'client' };

    const { serviceName, category, planName, totalSlots, pricePerSlotUsd, credentials, pins, instructions } = req.body;

    if (!serviceName || !totalSlots || !pricePerSlotUsd || !credentials) {
      return res.status(400).json({ error: 'Por favor completa todos los campos requeridos.' });
    }

    const newSub = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sellerId: userId,
      sellerName: user.name,
      isOfficial: user.role === 'admin',
      serviceName,
      category: 'streaming',
      planName: planName || 'Plan Compartido',
      totalSlots: parseInt(totalSlots, 10),
      availableSlots: parseInt(totalSlots, 10),
      pricePerSlotUsd: parseFloat(pricePerSlotUsd),
      credentialsEncrypted: cryptoService.encrypt(credentials),
      pinsEncrypted: cryptoService.encrypt(typeof pins === 'object' ? JSON.stringify(pins) : pins || '{}'),
      instructions: instructions || 'Usa exclusivamente tu perfil asignado y no modifiques la contraseña.',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    db.subscriptions.unshift(newSub);

    // Initialize group chat
    if (!db.group_chats) db.group_chats = {};
    db.group_chats[newSub.id] = [
      {
        id: `msg_init_${newSub.id}`,
        senderId: userId,
        senderName: user.name,
        senderAvatar: '👑',
        isOwnerAdmin: true,
        text: `¡Hola a todos! Soy el administrador de esta cuenta de ${serviceName}. Aquí compartiremos novedades e instrucciones del servicio.`,
        timestamp: new Date().toISOString()
      }
    ];

    saveStorage();

    res.json({
      success: true,
      message: '¡Tu cuenta de streaming ha sido publicada con éxito y ya está disponible en el catálogo!',
      subscription: newSub
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
