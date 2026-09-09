// GamesBoy.net Multi-Tenant SaaS - Dynamic White-Label & Branding Engine
(function() {
  'use strict';

  // Extract tenant query param or hostname
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlugParam = urlParams.get('tenant') || urlParams.get('t') || urlParams.get('store');

  const headers = {};
  if (tenantSlugParam) {
    headers['x-tenant-slug'] = tenantSlugParam;
  }

  // Fetch current tenant configuration
  fetch('/api/tenant/current', { headers })
    .then(res => res.json())
    .then(data => {
      if (data && data.success && data.tenant) {
        window.GB_TENANT = data.tenant;
        applyTenantBranding(data.tenant);
      }
    })
    .catch(err => {
      console.warn('⚠️ [SaaS] Tenant branding fallback:', err);
    });

  function applyTenantBranding(tenant) {
    if (!tenant) return;
    const branding = tenant.branding || {};

    // 1. Update document title
    if (branding.brandName && !document.title.includes(branding.brandName)) {
      document.title = document.title.replace(/GamesBoy(\.net)?/gi, branding.brandName);
    }

    // 2. Update brand logos and icons
    if (branding.logoUrl) {
      document.querySelectorAll('.brand-logo-img, .header-brand-logo, #header-logo-img').forEach(el => {
        el.src = branding.logoUrl;
      });
    }

    // 3. Update brand text
    if (branding.brandName) {
      document.querySelectorAll('.brand-name-text, .header-brand-text, .brand-title').forEach(el => {
        el.textContent = branding.brandName;
      });
    }

    // 4. Update CSS custom properties (White-label theme)
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--accent-primary', branding.primaryColor);
    }
    if (branding.accentColor) {
      document.documentElement.style.setProperty('--accent-cyan', branding.accentColor);
      document.documentElement.style.setProperty('--brand-cyan', branding.accentColor);
    }

    // 5. Update WhatsApp support link
    if (branding.whatsappSupport) {
      const cleanPhone = branding.whatsappSupport.replace(/[^0-9]/g, '');
      document.querySelectorAll('.whatsapp-support-btn, a[href*="wa.me"]').forEach(link => {
        link.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola, necesito asistencia en ' + (branding.brandName || 'la plataforma'))}`;
      });
    }

    // 6. Dynamic Module Toggles (Selective feature disabling for SaaS tenants)
    const modules = tenant.settings?.enabledModules || {};
    if (modules.streaming === false) {
      document.querySelectorAll('#section-streaming, a[href="#section-streaming"]').forEach(el => {
        el.style.display = 'none';
      });
    }
    if (modules.games === false) {
      document.querySelectorAll('#section-games, a[href="#section-games"]').forEach(el => {
        el.style.display = 'none';
      });
    }
    if (modules.giftcards === false) {
      document.querySelectorAll('#section-giftcards, a[href="#section-giftcards"]').forEach(el => {
        el.style.display = 'none';
      });
    }
    if (modules.smm === false) {
      document.querySelectorAll('#section-social, a[href="#section-social"]').forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  // Auto-propagate tenant query parameter across internal links
  document.addEventListener('DOMContentLoaded', () => {
    if (tenantSlugParam) {
      document.querySelectorAll('a[href]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('javascript:')) {
          const sep = href.includes('?') ? '&' : '?';
          if (!href.includes('tenant=') && !href.includes('t=')) {
            anchor.setAttribute('href', `${href}${sep}tenant=${encodeURIComponent(tenantSlugParam)}`);
          }
        }
      });
    }
  });
})();
