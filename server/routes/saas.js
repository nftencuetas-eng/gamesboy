// GamesBoy.net Multi-Tenant SaaS Engine (saas.js)
import { Router } from 'express';
import { getDb, saveDb } from '../config/database.js';
import { DEFAULT_TENANT, DEFAULT_TENANT_ID } from '../middleware/tenantResolver.js';

const router = Router();

// --- 1. GET CURRENT RESOLVED TENANT (PUBLIC INFO & BRANDING) ---
router.get('/current', (req, res) => {
  const tenant = req.tenant || DEFAULT_TENANT;
  
  res.json({
    success: true,
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      customDomain: tenant.customDomain,
      planId: tenant.planId || 'plan_enterprise',
      status: tenant.status || 'active',
      branding: tenant.branding || DEFAULT_TENANT.branding,
      settings: {
        commissionPercent: tenant.settings?.commissionPercent || 15.00,
        exchangeRate: tenant.branding?.exchangeRate || 7500,
        paraguayBankDetails: tenant.settings?.paraguayBankDetails || DEFAULT_TENANT.settings.paraguayBankDetails,
        binanceDetails: tenant.settings?.binanceDetails || DEFAULT_TENANT.settings.binanceDetails
      }
    }
  });
});

// Alias for /api/tenant/info
router.get('/info', (req, res) => {
  const tenant = req.tenant || DEFAULT_TENANT;
  res.json({
    success: true,
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      branding: tenant.branding,
      settings: tenant.settings
    }
  });
});

// --- 2. GET ALL SAAS PLANS ---
router.get('/plans', (req, res) => {
  const db = getDb();
  const plans = db.tenant_plans || [
    {
      id: 'plan_starter',
      name: 'Starter Reseller',
      priceMonthlyUsd: 19.99,
      maxSlotsAllowed: 50,
      maxProductsAllowed: 30,
      customDomainEnabled: false,
      platformFeePercent: 5.00,
      features: ['Catálogo Streaming', 'Soporte SIPAP', 'Subdominio']
    },
    {
      id: 'plan_pro',
      name: 'Pro Marketplace',
      priceMonthlyUsd: 49.99,
      maxSlotsAllowed: 250,
      maxProductsAllowed: 150,
      customDomainEnabled: true,
      platformFeePercent: 3.00,
      features: ['Catálogo Completo', 'Dominio Propio', 'Cero Glare UI', 'Binance Pay']
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise White-Label',
      priceMonthlyUsd: 99.99,
      maxSlotsAllowed: 1000,
      maxProductsAllowed: 500,
      customDomainEnabled: true,
      platformFeePercent: 1.50,
      features: ['White Label Total', 'Soporte VIP 24/7', 'API Exclusiva']
    }
  ];

  res.json({ success: true, plans });
});

// --- 3. LIST ALL TENANTS (SUPERADMIN / PLATFORM DASHBOARD) ---
router.get('/tenants', (req, res) => {
  const db = getDb();
  const tenants = db.tenants || [DEFAULT_TENANT];

  // Calculate live metrics for each tenant
  const enriched = tenants.map(t => {
    const productsCount = (db.store_products || []).filter(p => (p.tenantId || DEFAULT_TENANT_ID) === t.id).length;
    const subsCount = (db.subscriptions || []).filter(s => (s.tenantId || DEFAULT_TENANT_ID) === t.id).length;
    const txs = (db.wallet_transactions || []).filter(tx => (tx.tenantId || DEFAULT_TENANT_ID) === t.id);
    const totalVolumeUsd = txs.reduce((sum, tx) => sum + (parseFloat(tx.amountUsd) || 0), 0);

    return {
      ...t,
      metrics: {
        productsCount,
        subscriptionsCount: subsCount,
        totalTransactions: txs.length,
        totalVolumeUsd: parseFloat(totalVolumeUsd.toFixed(2))
      }
    };
  });

  res.json({ success: true, tenants: enriched });
});

// --- 4. CREATE A NEW TENANT / STORE ONBOARDING ---
router.post('/tenants', (req, res) => {
  try {
    const db = getDb();
    if (!db.tenants) db.tenants = [DEFAULT_TENANT];

    const { slug, name, customDomain, ownerEmail, planId, branding, settings } = req.body;

    if (!slug || !name) {
      return res.status(400).json({ error: 'El nombre de tienda y el identificador (slug) son requeridos.' });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (db.tenants.some(t => t.slug === cleanSlug)) {
      return res.status(400).json({ error: `El subdominio / slug "${cleanSlug}" ya está registrado por otra tienda.` });
    }

    const tenantId = `tnt_${cleanSlug}_${Date.now()}`;
    const newTenant = {
      id: tenantId,
      slug: cleanSlug,
      name: name.trim(),
      customDomain: customDomain ? customDomain.toLowerCase().trim() : `${cleanSlug}.gamesboy.net`,
      ownerUserId: null,
      planId: planId || 'plan_pro',
      status: 'active',
      branding: {
        brandName: name.trim(),
        logoUrl: branding?.logoUrl || '/assets/branding/logo.png',
        iconUrl: branding?.iconUrl || '/assets/branding/icon.png',
        primaryColor: branding?.primaryColor || '#0284c7',
        accentColor: branding?.accentColor || '#00c2ff',
        currency: branding?.currency || 'PYG',
        exchangeRate: parseFloat(branding?.exchangeRate) || 7500,
        whatsappSupport: branding?.whatsappSupport || '+595981000000'
      },
      settings: {
        commissionPercent: parseFloat(settings?.commissionPercent) || 15.00,
        paraguayBankDetails: settings?.paraguayBankDetails || DEFAULT_TENANT.settings.paraguayBankDetails,
        binanceDetails: settings?.binanceDetails || DEFAULT_TENANT.settings.binanceDetails
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.tenants.push(newTenant);
    saveDb();

    res.json({
      success: true,
      message: `¡Tienda "${newTenant.name}" creada con éxito en el ecosistema SaaS!`,
      tenant: newTenant
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. UPDATE TENANT SETTINGS & BRANDING ---
router.put('/tenants/:id', (req, res) => {
  try {
    const db = getDb();
    if (!db.tenants) db.tenants = [DEFAULT_TENANT];

    const tenant = db.tenants.find(t => t.id === req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Inquilino / Tienda no encontrada.' });
    }

    const { name, customDomain, planId, status, branding, settings } = req.body;

    if (name) tenant.name = name.trim();
    if (customDomain !== undefined) tenant.customDomain = customDomain ? customDomain.toLowerCase().trim() : null;
    if (planId) tenant.planId = planId;
    if (status) tenant.status = status;

    if (branding) {
      tenant.branding = {
        ...tenant.branding,
        ...branding
      };
    }

    if (settings) {
      tenant.settings = {
        ...tenant.settings,
        ...settings
      };
    }

    tenant.updatedAt = new Date().toISOString();
    saveDb();

    res.json({
      success: true,
      message: 'Configuración de la tienda actualizada correctamente.',
      tenant
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
