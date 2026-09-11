// GamSplit SaaS Master Landing Engine (saas-landing.js)

let currentStep = 1;
let selectedPlan = 'plan_pro';
let checkSlugTimeout = null;

// --- 1. SHOWCASE TAB SWITCHER ---
window.switchShowcaseTab = function(tabIndex) {
  const tabs = document.querySelectorAll('.showcase-tab-btn');
  const slides = document.querySelectorAll('.showcase-slide');

  tabs.forEach((t, i) => {
    if (i === tabIndex) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  slides.forEach((s, i) => {
    if (i === tabIndex) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });
};

// --- 2. ONBOARDING WIZARD MODAL CONTROLS ---
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
  const stepSuccess = document.getElementById('step-success-content');
  const stepNum = document.getElementById('wizard-step-num');
  const title = document.getElementById('wizard-title');
  const sub = document.getElementById('wizard-sub');
  const btnPrev = document.getElementById('btn-wiz-prev');
  const btnNext = document.getElementById('btn-wiz-next');
  const footerRow = document.getElementById('wizard-buttons-row');

  if (step1) step1.style.display = currentStep === 1 ? 'block' : 'none';
  if (step2) step2.style.display = currentStep === 2 ? 'block' : 'none';
  if (stepSuccess) stepSuccess.style.display = currentStep === 3 ? 'block' : 'none';

  if (currentStep === 3) {
    if (footerRow) footerRow.style.display = 'none';
    return;
  }

  if (footerRow) footerRow.style.display = 'flex';
  if (stepNum) stepNum.textContent = currentStep;

  if (btnPrev) {
    btnPrev.style.display = currentStep > 1 ? 'inline-block' : 'none';
  }

  if (btnNext) {
    btnNext.textContent = currentStep === 2 ? '🚀 Lanzar mi Tienda Ahora' : 'Siguiente: Plan & Módulos ➔';
  }

  if (currentStep === 1) {
    if (title) title.textContent = '1. Identidad de tu Tienda';
    if (sub) sub.textContent = 'Elige el nombre de tu marca y tu subdominio.';
  } else if (currentStep === 2) {
    if (title) title.textContent = '2. Plan SaaS & Módulos a Vender';
    if (sub) sub.textContent = 'Selecciona tu nivel de plataforma y activa tu catálogo de servicios.';
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
      alert('Por favor ingresa el nombre de tu marca o tienda.');
      return;
    }
    if (!slug || slug.length < 3) {
      alert('El subdominio debe contener al menos 3 caracteres alfanuméricos.');
      return;
    }

    // Verify slug availability
    try {
      const res = await fetch(`/api/saas/check-slug/${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (!data.available) {
        alert(data.error || 'Este subdominio ya está en uso. Por favor elige otro.');
        return;
      }
    } catch (err) {
      console.warn('Could not verify slug:', err);
    }

    currentStep = 2;
    renderWizardStep();
  } else if (currentStep === 2) {
    await submitOnboarding();
  }
};

async function submitOnboarding() {
  const brandName = document.getElementById('wiz-brand-name')?.value?.trim();
  const slug = document.getElementById('wiz-slug')?.value?.trim();
  const primaryColor = document.getElementById('wiz-primary-color')?.value || '#0284c7';
  const plan = document.getElementById('wiz-plan')?.value || 'plan_pro';
  const whatsapp = document.getElementById('wiz-whatsapp')?.value?.trim() || '+595981000000';

  const modStreaming = document.getElementById('mod-streaming')?.checked ?? true;
  const modGames = document.getElementById('mod-games')?.checked ?? true;
  const modGiftcards = document.getElementById('mod-giftcards')?.checked ?? true;

  const btnNext = document.getElementById('btn-wiz-next');
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'Aprovisionando Tienda...';
  }

  try {
    const payload = {
      name: brandName,
      slug: slug,
      customDomain: null,
      planId: plan,
      branding: {
        brandName: brandName,
        primaryColor: primaryColor,
        accentColor: primaryColor === '#10b981' ? '#34d399' : (primaryColor === '#f59e0b' ? '#fbbf24' : '#00c2ff'),
        whatsappSupport: whatsapp,
        currency: 'PYG',
        exchangeRate: 7500
      },
      settings: {
        commissionPercent: plan === 'plan_enterprise' ? 1.5 : (plan === 'plan_pro' ? 3.0 : 5.0),
        allowUserReselling: plan !== 'plan_starter',
        paraguayBankDetails: {
          bank: 'Banco Familiar / Itaú Paraguay',
          accountHolder: brandName,
          accountNumber: '01-000000-1',
          aliasSipap: `${slug}.py`
        },
        binanceDetails: {
          payId: '849201934',
          network: 'USDT (Binance Pay / BEP-20 / TRC-20)'
        },
        enabledModules: {
          streaming: modStreaming,
          games: modGames,
          giftcards: modGiftcards,
          smm: false,
          p2pSharing: plan !== 'plan_starter'
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
      currentStep = 3;
      renderWizardStep();
      const msg = document.getElementById('wiz-success-message');
      if (msg) {
        msg.innerHTML = `Tu plataforma <strong>${data.tenant.name}</strong> ha sido creada exitosamente. Tu subdominio asignado es <code>${data.tenant.slug}.gamsplit.com</code>.`;
      }
      const link = document.getElementById('wiz-success-link');
      const btnGo = document.getElementById('wiz-btn-go-store');
      const storeUrl = `/store?tenant=${data.tenant.slug}`;
      if (link) {
        link.href = storeUrl;
        link.textContent = `https://${data.tenant.slug}.gamsplit.com`;
      }
      if (btnGo) {
        btnGo.href = storeUrl;
      }
    } else {
      alert(data.error || 'No se pudo crear la tienda.');
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.textContent = '🚀 Lanzar mi Tienda Ahora';
      }
    }
  } catch (err) {
    alert('Error al comunicar con el servidor.');
    if (btnNext) {
      btnNext.disabled = false;
      btnNext.textContent = '🚀 Lanzar mi Tienda Ahora';
    }
  }
}

// Helper auto slug generator
window.autoGenerateSlug = function(val) {
  const slugInput = document.getElementById('wiz-slug');
  if (slugInput && !slugInput.dataset.userEdited) {
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    slugInput.value = clean;
    handleSlugInput(clean);
  }
};

window.handleSlugInput = function(val) {
  const slugInput = document.getElementById('wiz-slug');
  if (slugInput) slugInput.dataset.userEdited = 'true';
  const clean = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (slugInput) slugInput.value = clean;

  const status = document.getElementById('wiz-slug-status');
  if (!status) return;

  if (checkSlugTimeout) clearTimeout(checkSlugTimeout);
  if (clean.length < 3) {
    status.innerHTML = `<span style="color: #94a3b8; font-size: 0.76rem;">Mínimo 3 caracteres alfanuméricos</span>`;
    return;
  }

  status.innerHTML = `<span style="color: #00c2ff; font-size: 0.76rem;">Comprobando disponibilidad...</span>`;
  checkSlugTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`/api/saas/check-slug/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.available) {
        status.innerHTML = `<span style="color: #10b981; font-size: 0.76rem; font-weight: 700;">✓ Subdominio ${clean}.gamsplit.com disponible</span>`;
      } else {
        status.innerHTML = `<span style="color: #ef4444; font-size: 0.76rem; font-weight: 700;">✕ ${data.error || 'Subdominio no disponible'}</span>`;
      }
    } catch (e) {
      status.innerHTML = '';
    }
  }, 300);
};

// Color Picker Hex Display sync
document.addEventListener('DOMContentLoaded', () => {
  const colorPicker = document.getElementById('wiz-primary-color');
  const colorHex = document.getElementById('wiz-color-hex');
  if (colorPicker && colorHex) {
    colorPicker.addEventListener('input', (e) => {
      colorHex.textContent = e.target.value.toUpperCase();
    });
  }

  // Background Interactive Particles Canvas
  initBackgroundCanvas();
});

function initBackgroundCanvas() {
  const canvas = document.getElementById('saas-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const dots = [];
  const count = Math.min(50, Math.floor(width / 35));
  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.8
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 194, 255, 0.25)';
    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = width;
      if (d.x > width) d.x = 0;
      if (d.y < 0) d.y = height;
      if (d.y > height) d.y = 0;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(render);
  }
  render();
}
