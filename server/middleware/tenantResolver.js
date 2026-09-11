// GamSplit SaaS Multi-Tenant Engine - Tenant Resolver Middleware
import { getDb } from '../config/database.js';

export const DEFAULT_TENANT_ID = 'tnt_gamesboy_main';

export const DEFAULT_TENANT = {
  id: 'tnt_gamesboy_main',
  slug: 'gamesboy',
  name: 'GamesBoy Store Oficial',
  customDomain: 'gamesboy.net',
  planId: 'plan_enterprise',
  status: 'active',
  branding: {
    brandName: 'GamesBoy',
    logoUrl: '/assets/branding/logo-white.png',
    iconUrl: '/assets/branding/icon.png',
    primaryColor: '#0284c7',
    accentColor: '#00c2ff',
    currency: 'PYG',
    exchangeRate: 7500,
    whatsappSupport: '+595981123456'
  },
  settings: {
    commissionPercent: 15.00,
    allowUserReselling: true,
    enabledModules: {
      streaming: true,
      games: true,
      giftcards: true,
      smm: true,
      p2pSharing: true
    },
    paraguayBankDetails: {
      bank: 'Banco Familiar / Itaú Paraguay',
      accountHolder: 'GamesBoy Paraguay S.A.',
      rucOrCi: '80091234-5',
      accountNumber: '01-445566-7',
      aliasSipap: 'gamesboy.py'
    },
    binanceDetails: {
      payId: '849201934',
      network: 'USDT (Binance Pay / BEP-20 / TRC-20)',
      walletAddress: '0x71C9414B3b27bA134a6C3f07a757657A82e4b92F',
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=0x71C9414B3b27bA134a6C3f07a757657A82e4b92F'
    }
  }
};

/**
 * Resolve tenant and routing context from headers, query parameters, hostname, or fallback
 */
export function tenantResolver(req, res, next) {
  try {
    const db = getDb();
    const tenants = db.tenants || [DEFAULT_TENANT];

    // Extract real host from proxy headers (Railway / Cloudflare) or standard host
    const rawForwarded = req.headers['x-forwarded-host'];
    const rawHost = (rawForwarded ? String(rawForwarded).split(',')[0].trim() : '') || req.headers.host || req.hostname || '';
    const host = rawHost.toLowerCase().split(':')[0].trim();

    req.isSaasMaster = false;
    req.isStoreRequest = false;

    // 1. Header resolution (API / Mobile / Frontends)
    const headerTenantId = req.headers['x-tenant-id'];
    const headerTenantSlug = req.headers['x-tenant-slug'];
    if (headerTenantId) {
      const match = tenants.find(t => t.id === headerTenantId);
      if (match) {
        req.tenant = match;
        req.isStoreRequest = true;
        return next();
      }
    }
    if (headerTenantSlug) {
      const match = tenants.find(t => t.slug === headerTenantSlug.toLowerCase());
      if (match) {
        req.tenant = match;
        req.isStoreRequest = true;
        return next();
      }
    }

    // 2. Query param resolution (?tenant=streamflow or ?t=streamflow or ?store=gamesboy)
    const queryTenant = req.query.tenant || req.query.t || req.query.store;
    if (queryTenant) {
      const qLower = String(queryTenant).toLowerCase();
      const match = tenants.find(t => t.slug === qLower || t.id === queryTenant);
      if (match) {
        req.tenant = match;
        req.isStoreRequest = true;
        return next();
      }
    }

    // 3. Explicit GamesBoy Official Store Domains (gamesboy.net, www.gamesboy.net, etc.)
    if (host.includes('gamesboy') || host === 'gamesboy.net' || host === 'www.gamesboy.net') {
      req.tenant = tenants.find(t => t.slug === 'gamesboy' || t.id === DEFAULT_TENANT_ID) || DEFAULT_TENANT;
      req.isStoreRequest = true;
      return next();
    }

    // 4. Explicit Master SaaS Domains (gamsplit.com, www.gamsplit.com, saas.gamsplit.com)
    if (host === 'gamsplit.com' || host === 'www.gamsplit.com' || host === 'saas.gamsplit.com' || host === 'app.gamsplit.com') {
      req.isSaasMaster = true;
      req.tenant = tenants.find(t => t.id === DEFAULT_TENANT_ID) || DEFAULT_TENANT;
      return next();
    }

    // 5. Hostname / Subdomain / Custom domain resolution for all other stores/tenants
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      // 5.1 Exact custom domain match (e.g. streamflow.net, mitienda.com)
      const customDomainMatch = tenants.find(t => t.customDomain && (
        t.customDomain.toLowerCase() === host ||
        `www.${t.customDomain.toLowerCase()}` === host
      ));
      if (customDomainMatch) {
        req.tenant = customDomainMatch;
        req.isStoreRequest = true;
        return next();
      }

      // 5.2 Subdomain match (e.g. streamflow.gamsplit.com or streamflow.localhost)
      const parts = host.split('.');
      if (parts.length >= 3 || (parts.length === 2 && (parts[1] === 'localhost' || parts[1] === 'gamsplit'))) {
        const sub = parts[0];
        if (sub !== 'www' && sub !== 'api' && sub !== 'app' && sub !== 'saas' && sub !== 'admin') {
          const subMatch = tenants.find(t => t.slug === sub);
          if (subMatch) {
            req.tenant = subMatch;
            req.isStoreRequest = true;
            return next();
          }
        }
      }
    }

    // 6. Default fallback (Localhost or direct server IP)
    const defaultTenant = tenants.find(t => t.id === DEFAULT_TENANT_ID) || DEFAULT_TENANT;
    req.tenant = defaultTenant;
    next();
  } catch (err) {
    console.error('Tenant resolution error:', err);
    req.tenant = DEFAULT_TENANT;
    next();
  }
}

export default tenantResolver;
