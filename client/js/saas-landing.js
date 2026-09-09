// GamesBoy.net SaaS Master Landing Engine (saas-landing.js)

let currentStep = 1;
const totalSteps = 3;
let selectedPlan = 'plan_pro';
let checkSlugTimeout = null;

window.openOnboardingModal = function(planId) {
  if (planId) {
    selectedPlan = planId;
    const planSelect = document.getElementById('wiz-plan');
    if (planSelect) planSelect.value = planId;
  }
  const modal = document.getElementById('modal-onboarding');
  if (modal) modal.style.display = 'grid';
  currentStep = 1;
  renderWizardStep();
};

window.closeOnboardingModal = function() {
  const modal = document.getElementById('modal-onboarding');
  if (modal) modal.style.display = 'none';
};

function renderWizardStep() {
  const step1 = document.getElementById('step-1-content');
  const step2 = document.getElementById('step-2-content');
  const step3 = document.getElementById('step-3-content');
  const stepSuccess = document.getElementById('step-success-content');
  const stepNum = document.getElementById('wizard-step-num');
  const title = document.getElementById('wizard-title');
  const sub = document.getElementById('wizard-sub');
  const btnPrev = document.getElementById('btn-wiz-prev');
  const btnNext = document.getElementById('btn-wiz-next');
  const footerRow = document.getElementById('wizard-buttons-row');

  if (step1) step1.style.display = currentStep === 1 ? 'block' : 'none';
  if (step2) step2.style.display = currentStep === 2 ? 'block' : 'none';
  if (step3) step3.style.display = currentStep === 3 ? 'block' : 'none';
  if (stepSuccess) stepSuccess.style.display = currentStep === 4 ? 'block' : 'none';

  if (currentStep === 4) {
    if (footerRow) footerRow.style.display = 'none';
    return;
  }

  if (footerRow) footerRow.style.display = 'flex';
  if (stepNum) stepNum.textContent = currentStep;

  if (btnPrev) {
    btnPrev.style.display = currentStep > 1 ? 'inline-block' : 'none';
  }

  if (btnNext) {
    btnNext.textContent = currentStep === 3 ? '🚀 Lanzar mi Tienda Ahora' : 'Siguiente ➔';
  }

  if (currentStep === 1) {
    if (title) title.textContent = '1. Identidad de tu Tienda';
    if (sub) sub.textContent = 'Ingresa el nombre de tu negocio y tu subdominio gratuito.';
  } else if (currentStep === 2) {
    if (title) title.textContent = '2. Módulos & Servicios a Vender';
    if (sub) sub.textContent = 'Selecciona qué productos deseas habilitar en tu catálogo.';
  } else if (currentStep === 3) {
    if (title) title.textContent = '3. Pasarelas de Pago & Plan';
    if (sub) sub.textContent = 'Configura tus métodos de cobro en Guaraníes (SIPAP) y Cripto (USDT).';
  }
}

window.handleWizardPrev = function() {
  if (currentStep > 1) {
    currentStep--;
    renderWizardStep();
  }
};

window.handleWizardNext = async function() {
  if (currentStep === 1) {
    const brandName = document.getElementById('wiz-brand-name')?.value?.trim();
    const slug = document.getElementById('wiz-slug')?.value?.trim();

    if (!brandName) {
      showToast('warning', 'Nombre Requerido', 'Por favor ingresa el nombre de tu tienda.');
      return;
    }
    if (!slug || slug.length < 3) {
      showToast('warning', 'Subdominio Inválido', 'El subdominio debe tener al menos 3 caracteres.');
      return;
    }

    // Check availability
    try {
      const res = await fetch(`/api/saas/check-slug/${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (!data.available) {
        showToast('error', 'Subdominio Ocupado', data.error || 'Este subdominio ya está en uso. Por favor elige otro.');
        return;
      }
    } catch (err) {
      console.warn('Could not verify slug:', err);
    }

    currentStep = 2;
    renderWizardStep();
  } else if (currentStep === 2) {
    currentStep = 3;
    renderWizardStep();
  } else if (currentStep === 3) {
    await submitOnboarding();
  }
};

async function submitOnboarding() {
  const brandName = document.getElementById('wiz-brand-name')?.value?.trim();
  const slug = document.getElementById('wiz-slug')?.value?.trim();
  const customDomain = document.getElementById('wiz-custom-domain')?.value?.trim();
  const plan = document.getElementById('wiz-plan')?.value || 'plan_pro';
  const alias = document.getElementById('wiz-alias')?.value?.trim();
  const binanceId = document.getElementById('wiz-binance-id')?.value?.trim();
  const whatsapp = document.getElementById('wiz-whatsapp')?.value?.trim();

  const modStreaming = document.getElementById('mod-streaming')?.checked ?? true;
  const modGames = document.getElementById('mod-games')?.checked ?? true;
  const modGiftcards = document.getElementById('mod-giftcards')?.checked ?? true;
  const modSmm = document.getElementById('mod-smm')?.checked ?? false;
  const modP2p = document.getElementById('mod-p2p')?.checked ?? (plan !== 'plan_starter');

  const btnNext = document.getElementById('btn-wiz-next');
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'Aprovisionando Tienda...';
  }

  try {
    const payload = {
      name: brandName,
      slug: slug,
      customDomain: customDomain || null,
      planId: plan,
      branding: {
        brandName: brandName,
        whatsappSupport: whatsapp || '+595981000000',
        currency: 'PYG',
        exchangeRate: 7500
      },
      settings: {
        commissionPercent: plan === 'plan_enterprise' ? 1.5 : (plan === 'plan_pro' ? 3.0 : 5.0),
        allowUserReselling: modP2p,
        paraguayBankDetails: {
          bank: 'Banco Familiar / Itaú Paraguay',
          accountHolder: brandName,
          accountNumber: '01-000000-1',
          aliasSipap: alias || `${slug}.py`
        },
        binanceDetails: {
          payId: binanceId || '849201934',
          network: 'USDT (Binance Pay / BEP-20 / TRC-20)'
        },
        enabledModules: {
          streaming: modStreaming,
          games: modGames,
          giftcards: modGiftcards,
          smm: modSmm,
          p2pSharing: modP2p
        }
      }
    };

    const res = await fetch('/api/saas/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success && data.tenant) {
      currentStep = 4;
      renderWizardStep();
      const msg = document.getElementById('success-store-msg');
      if (msg) {
        msg.innerHTML = `Tu plataforma <strong>${data.tenant.name}</strong> está lista en <code>https://${data.tenant.slug}.gamsplit.com</code>.`;
      }
      const btnGoto = document.getElementById('btn-goto-store');
      if (btnGoto) {
        btnGoto.href = `/store?tenant=${data.tenant.slug}`;
      }
      showToast('success', '¡Plataforma Creada!', 'Tu tienda digital ha sido lanzada con éxito.');
    } else {
      showToast('error', 'Error al Crear', data.error || 'No se pudo crear la tienda.');
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.textContent = '🚀 Lanzar mi Tienda Ahora';
      }
    }
  } catch (err) {
    showToast('error', 'Error de Conexión', 'No se pudo conectar con el servidor.');
    if (btnNext) {
      btnNext.disabled = false;
      btnNext.textContent = '🚀 Lanzar mi Tienda Ahora';
    }
  }
}

// Slug auto-suggestion from brand name & real-time validation
document.addEventListener('DOMContentLoaded', () => {
  const brandInput = document.getElementById('wiz-brand-name');
  const slugInput = document.getElementById('wiz-slug');
  const slugMsg = document.getElementById('slug-availability-msg');

  if (brandInput && slugInput) {
    brandInput.addEventListener('input', (e) => {
      if (!slugInput.dataset.manualEdit) {
        const autoSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
        slugInput.value = autoSlug;
        triggerSlugCheck(autoSlug);
      }
    });

    slugInput.addEventListener('input', (e) => {
      slugInput.dataset.manualEdit = 'true';
      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      slugInput.value = clean;
      triggerSlugCheck(clean);
    });
  }

  function triggerSlugCheck(slug) {
    if (!slugMsg) return;
    if (checkSlugTimeout) clearTimeout(checkSlugTimeout);

    if (!slug || slug.length < 3) {
      slugMsg.textContent = 'Mínimo 3 caracteres';
      slugMsg.className = 'slug-status-msg';
      return;
    }

    slugMsg.textContent = 'Verificando disponibilidad...';
    slugMsg.className = 'slug-status-msg';

    checkSlugTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/saas/check-slug/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.available) {
          slugMsg.textContent = `✓ ¡Disponible! ${data.subdomain}`;
          slugMsg.className = 'slug-status-msg avail';
        } else {
          slugMsg.textContent = `✗ ${data.error || 'No disponible'}`;
          slugMsg.className = 'slug-status-msg taken';
        }
      } catch (err) {
        slugMsg.textContent = '';
      }
    }, 300);
  }

  // Click outside to close modal
  const modal = document.getElementById('modal-onboarding');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeOnboardingModal();
      }
    });
  }
});

// Toast Helper
function showToast(type = 'info', title = '', message = '') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.innerHTML = `
    <div style="flex: 1; min-width: 0;">
      ${title ? `<div class="toast-title" style="font-weight: 800; font-size: 0.85rem; color: #ffffff;">${title}</div>` : ''}
      <div class="toast-msg" style="font-size: 0.78rem; color: #cbd5e1;">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}
