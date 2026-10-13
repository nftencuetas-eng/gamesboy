// GamSplit SaaS Multi-Tenant - Subscription & Trial Guard Middleware
import { getDb, saveDb } from '../config/database.js';

/**
 * Calculates trial and subscription status for the given tenant
 */
export function getTenantSubscriptionStatus(tenant) {
  if (!tenant) {
    return { status: 'unknown', isLocked: true, daysLeft: 0, planId: 'plan_control' };
  }

  // Master tenant GamesBoy is always active
  if (tenant.id === 'tnt_gamesboy_main' || tenant.slug === 'gamesboy') {
    return {
      status: 'paid_active',
      isLocked: false,
      daysLeft: 9999,
      planId: 'plan_pro',
      isTrial: false
    };
  }

  const now = Date.now();
  const paidUntil = tenant.subscriptionPaidUntil ? new Date(tenant.subscriptionPaidUntil).getTime() : null;
  const trialEnds = tenant.trialEndsAt ? new Date(tenant.trialEndsAt).getTime() : (now + 7 * 24 * 60 * 60 * 1000);

  // 1. Paid active subscription check
  if (paidUntil && paidUntil > now) {
    const daysLeft = Math.max(0, Math.ceil((paidUntil - now) / (1000 * 60 * 60 * 24)));
    return {
      status: 'paid_active',
      isLocked: false,
      daysLeft,
      planId: tenant.planId || 'plan_control',
      isTrial: false,
      paidUntil: tenant.subscriptionPaidUntil
    };
  }

  // 2. Active 7-Day Trial check
  if (trialEnds > now) {
    const daysLeft = Math.max(1, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)));
    return {
      status: 'trial_active',
      isLocked: false,
      daysLeft,
      planId: tenant.planId || 'plan_control',
      isTrial: true,
      trialEndsAt: tenant.trialEndsAt
    };
  }

  // 3. Trial or Paid Subscription Expired -> Locked
  return {
    status: 'locked',
    isLocked: true,
    daysLeft: 0,
    planId: tenant.planId || 'plan_control',
    isTrial: false,
    reason: 'SUBSCRIPTION_EXPIRED'
  };
}

/**
 * Express Middleware: Attaches subscription status and optionally blocks locked tenants
 */
export function subscriptionGuard(req, res, next) {
  try {
    const tenant = req.tenant;
    if (!tenant) return next();

    const subStatus = getTenantSubscriptionStatus(tenant);
    req.subscription = subStatus;

    // Auto-update tenant status in database if expired
    if (subStatus.isLocked && tenant.status !== 'locked' && tenant.id !== 'tnt_gamesboy_main') {
      tenant.status = 'locked';
      saveDb();
    }

    next();
  } catch (err) {
    console.error('Subscription guard error:', err);
    next();
  }
}

/**
 * Strict Middleware: Blocks mutating operations if the tenant subscription is locked
 */
export function requireActiveSubscription(req, res, next) {
  const sub = req.subscription || (req.tenant ? getTenantSubscriptionStatus(req.tenant) : null);
  if (sub && sub.isLocked) {
    return res.status(402).json({
      error: 'Tu período de prueba o suscripción ha expirado. Por favor renueva tu plan para continuar usando el servicio.',
      isLocked: true,
      subscription: sub,
      renewalUrl: '/subscription-renewal'
    });
  }
  next();
}

export default {
  getTenantSubscriptionStatus,
  subscriptionGuard,
  requireActiveSubscription
};
