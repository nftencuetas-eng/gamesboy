// GamesBoy.net Multi-Tenant SaaS - Dynamic White-Label & Complete Brand Customizer Engine
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

  function hexToRgb(hex) {
    if (!hex) return '2, 132, 199';
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return '2, 132, 199';
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }

  function applyTenantBranding(tenant) {
    if (!tenant) return;
    const branding = tenant.branding || {};
    const brandName = branding.brandName || tenant.name || 'GamesBoy';
    const isMasterTenant = (tenant.slug === 'gamesboy' || tenant.id === 'tnt_gamesboy_main');
    const primaryColor = branding.primaryColor || '#0284c7';
    const accentColor = branding.accentColor || '#00c2ff';
    const rgbPrimary = hexToRgb(primaryColor);
    const rgbAccent = hexToRgb(accentColor);

    // 1. Dynamic CSS Variables & Global Theme Injection
    let themeStyleEl = document.getElementById('gb-dynamic-theme-styles');
    if (!themeStyleEl) {
      themeStyleEl = document.createElement('style');
      themeStyleEl.id = 'gb-dynamic-theme-styles';
      document.head.appendChild(themeStyleEl);
    }

    themeStyleEl.textContent = `
      :root {
        --accent-primary: ${primaryColor} !important;
        --accent-cyan: ${accentColor} !important;
        --accent-cyan-light: ${accentColor} !important;
        --accent-cyan-dark: ${primaryColor} !important;
        --accent-blue: ${primaryColor} !important;
        --border-focus: ${accentColor} !important;
        --border-glow: rgba(${rgbAccent}, 0.45) !important;
        --shadow-cyan-glow: 0 8px 30px rgba(${rgbAccent}, 0.3) !important;
        --brand-primary: ${primaryColor} !important;
        --brand-cyan: ${accentColor} !important;
      }
      .text-gradient-cyan {
        background: linear-gradient(135deg, ${accentColor} 0%, ${primaryColor} 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
      .btn-primary-block,
      .btn-guarantee-cta,
      .btn-seller-compact-cta,
      .btn-smm-confirm-order,
      .btn-auth-action,
      .cat-pill.active,
      .sub-tab-btn.active,
      .btn-header-login-modern,
      .btn-whatsapp-compact-cta {
        background: linear-gradient(135deg, ${accentColor} 0%, ${primaryColor} 100%) !important;
        box-shadow: 0 4px 18px rgba(${rgbAccent}, 0.35) !important;
        border-color: ${accentColor} !important;
        color: #ffffff !important;
      }
      .btn-primary-block:hover,
      .btn-guarantee-cta:hover,
      .btn-seller-compact-cta:hover,
      .btn-smm-confirm-order:hover,
      .btn-auth-action:hover,
      .btn-whatsapp-compact-cta:hover {
        box-shadow: 0 6px 24px rgba(${rgbAccent}, 0.5) !important;
        filter: brightness(1.08);
      }
      .floating-support-btn {
        box-shadow: 0 8px 24px rgba(${rgbAccent}, 0.4) !important;
      }
      .community-live-badge svg {
        fill: ${accentColor} !important;
      }
      .badge-official,
      .comp-badge.good {
        background: rgba(${rgbAccent}, 0.12) !important;
        color: ${accentColor} !important;
        border: 1px solid rgba(${rgbAccent}, 0.35) !important;
      }
      .comparison-card.comp-good {
        border-color: rgba(${rgbAccent}, 0.4) !important;
        box-shadow: 0 8px 30px rgba(${rgbAccent}, 0.15) !important;
      }
      .sales-guarantee-banner {
        border-color: rgba(${rgbAccent}, 0.3) !important;
      }
      .guarantee-shield-icon svg {
        stroke: ${accentColor} !important;
      }
      .auth-feature-badge svg {
        stroke: ${accentColor} !important;
      }
    `;

    // 2. Update Document Title & Meta Description
    if (brandName) {
      if (isMasterTenant) {
        document.title = 'GamesBoy Store - Tu mundo digital en un solo lugar | Juegos, Streaming y Tarjetas';
      } else {
        document.title = `${brandName} Store - Tu mundo digital en un solo lugar | Desarrollado con GamSplit`;
      }
    }

    // 3. Smart Logo / Wordmark Rendering
    const brandLogos = document.querySelectorAll('#brand-logo, .brand, .footer-brand-col .brand, .auth-brand-header .brand, .header-left .brand');
    const hasCustomLogoImg = branding.logoUrl && (
      branding.logoUrl.startsWith('data:') ||
      (branding.logoUrl.includes('logo-white.png') && isMasterTenant) ||
      (!branding.logoUrl.includes('icon.png') && !branding.logoUrl.includes('logo.png'))
    );

    brandLogos.forEach(brandContainer => {
      brandContainer.setAttribute('title', `${brandName} Store - Inicio`);

      if (isMasterTenant || hasCustomLogoImg) {
        // Use Image Logo
        const finalLogoSrc = (isMasterTenant && (!branding.logoUrl || branding.logoUrl.includes('icon.png')))
          ? '/assets/branding/logo-white.png'
          : (branding.logoUrl || '/assets/branding/logo-white.png');

        brandContainer.innerHTML = `
          <img src="${finalLogoSrc}" alt="${brandName}.net" class="brand-logo-img" style="height: 44px; width: auto; object-fit: contain;">
        `;
        const imgEl = brandContainer.querySelector('img');
        if (imgEl) {
          imgEl.onerror = function() {
            this.onerror = null;
            this.src = '/assets/branding/logo-white.png';
          };
        }
      } else {
        // Custom SaaS Tenant Emblem + Typography Wordmark
        const brandInitial = brandName.charAt(0).toUpperCase();
        brandContainer.innerHTML = `
          <div class="tenant-custom-brand-badge" style="display: inline-flex; align-items: center; gap: 10px; text-decoration: none;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, ${primaryColor}, ${accentColor}); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(${rgbAccent}, 0.45); font-family: var(--font-heading); font-weight: 900; font-size: 1.2rem; color: #ffffff; flex-shrink: 0;">
              ${brandInitial}
            </div>
            <div style="display: flex; flex-direction: column; line-height: 1.1;">
              <span style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 900; letter-spacing: -0.5px; background: linear-gradient(135deg, #ffffff 40%, ${accentColor} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${brandName}</span>
              <span style="font-size: 0.65rem; font-weight: 800; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1px;">Store Oficial</span>
            </div>
          </div>
        `;
      }
    });

    // 4. Update Header brand image fallback classes if any exist
    document.querySelectorAll('.brand-logo-img, .header-brand-logo, #header-logo-img, .auth-brand-logo').forEach(el => {
      if (isMasterTenant || hasCustomLogoImg) {
        el.src = branding.logoUrl || '/assets/branding/logo-white.png';
        el.alt = `${brandName}.net`;
        el.onerror = function() {
          this.onerror = null;
          this.src = '/assets/branding/logo-white.png';
        };
      }
    });

    // 5. Recursive Text Node Brand Replacer
    if (!isMasterTenant && brandName) {
      function walkTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          let val = node.nodeValue;
          if (val && (val.includes('GamesBoy') || val.includes('Gamesboy') || val.includes('gamesboy'))) {
            val = val.replace(/GamesBoy\.net/gi, `${brandName}.net`)
                     .replace(/GamesBoy/gi, brandName)
                     .replace(/Gamesboy/gi, brandName);
            node.nodeValue = val;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toUpperCase();
          if (tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'TEXTAREA' && tag !== 'INPUT' && tag !== 'SELECT') {
            for (let child = node.firstChild; child; child = child.nextSibling) {
              walkTextNodes(child);
            }
          }
        }
      }

      // Execute on document body
      if (document.body) {
        walkTextNodes(document.body);
      } else {
        document.addEventListener('DOMContentLoaded', () => walkTextNodes(document.body));
      }
    }

    // 6. Explicit UI Sections Updates (Guarantee, Community, Comparison, Footer)
    if (!isMasterTenant && brandName) {
      // Comparison Title & Badges
      document.querySelectorAll('.comparison-section-title').forEach(el => {
        el.textContent = `¿Por qué miles de usuarios eligen ${brandName}?`;
      });
      document.querySelectorAll('.comparison-card.comp-good .comp-badge').forEach(el => {
        el.textContent = `🛡️ ${brandName} Marketplace`;
      });

      // Guarantee Banner
      document.querySelectorAll('.guarantee-title').forEach(el => {
        el.textContent = `Tu Compra está 100% Protegida con la Garantía ${brandName}`;
      });
      document.querySelectorAll('.sales-step-card .step-card-tag').forEach(el => {
        if (el.textContent.includes('GamesBoy') || el.textContent.includes('Garantía')) {
          el.textContent = `Garantía ${brandName} 100%`;
        }
      });

      // Community Card
      document.querySelectorAll('.community-card-title').forEach(el => {
        el.textContent = `Comunidad ${brandName}`;
      });

      // Admin & Group Modal indicators
      document.querySelectorAll('#group-modal-admin-name').forEach(el => {
        el.innerHTML = `Admin: <strong style="color: ${accentColor};">${brandName} Oficial</strong> • <span id="group-modal-slots-count">4 perfiles</span>`;
      });

      // Footer Copyright & Tagline
      document.querySelectorAll('.footer-bottom-bar div:first-child').forEach(el => {
        el.innerHTML = `© 2026 <strong>${brandName}</strong>. Todos los derechos reservados. • <a href="/admin-login.html" style="color: var(--text-tertiary); text-decoration: none; font-size: 0.75rem;">Acceso Administrativo</a>`;
      });
      document.querySelectorAll('.footer-tagline').forEach(el => {
        el.textContent = `Tu mundo digital con la garantía y seguridad de ${brandName}.`;
      });
    }

    // 7. WhatsApp Support Links
    const whatsappPhone = branding.whatsappSupport || '+595981123456';
    const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hola ${brandName}, necesito asistencia en la plataforma.`);
    document.querySelectorAll('.floating-support-btn, .whatsapp-support-btn, a[href*="wa.me"]').forEach(link => {
      link.href = `https://wa.me/${cleanPhone}?text=${waText}`;
      link.setAttribute('title', `Atención al Cliente WhatsApp Oficial 24/7 - ${brandName}`);
    });

    // 8. Dynamic Module Toggles (Selective feature disabling for SaaS tenants)
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

    // 9. P2P Account Sharing / Reventa Comunitaria (Función VIP / Pro)
    const isP2PEnabled = tenant.settings?.allowUserReselling !== false && modules.p2pSharing !== false;
    if (!isP2PEnabled) {
      document.querySelectorAll('#sticky-monetize-pill, #menu-item-publish, .btn-monetize-pill, a[href*="/monetizar"], a[href*="/seller"], #section-seller-info').forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  // Auto-propagate tenant query parameter across internal links
  document.addEventListener('DOMContentLoaded', () => {
    if (tenantSlugParam) {
      document.querySelectorAll('a[href]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          const sep = href.includes('?') ? '&' : '?';
          if (!href.includes('tenant=') && !href.includes('t=')) {
            anchor.setAttribute('href', `${href}${sep}tenant=${encodeURIComponent(tenantSlugParam)}`);
          }
        }
      });
    }
  });
})();
