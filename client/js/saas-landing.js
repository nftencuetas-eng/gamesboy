// GamSplit SaaS Master Landing Engine (saas-landing.js)

let currentStep = 1;
const totalSteps = 2;
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
    if (sub) sub.textContent = 'Elige el nombre de tu marca, subdominio y color representativo.';
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
      showToast('warning', 'Nombre Requerido', 'Por favor ingresa el nombre de tu marca o tienda.');
      return;
    }
    if (!slug || slug.length < 3) {
      showToast('warning', 'Subdominio Inválido', 'El subdominio debe contener al menos 3 caracteres alfanuméricos.');
      return;
    }

    // Verify slug availability
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
    await submitOnboarding();
  }
};

async function submitOnboarding() {
  const brandName = document.getElementById('wiz-brand-name')?.value?.trim();
  const slug = document.getElementById('wiz-slug')?.value?.trim();
  const selectedColor = document.querySelector('input[name="wiz-color"]:checked')?.value || '#0284c7';
  const plan = document.getElementById('wiz-plan')?.value || 'plan_pro';

  const modStreaming = document.getElementById('mod-streaming')?.checked ?? true;
  const modGames = document.getElementById('mod-games')?.checked ?? true;
  const modGiftcards = document.getElementById('mod-giftcards')?.checked ?? true;
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
      customDomain: null,
      planId: plan,
      branding: {
        brandName: brandName,
        primaryColor: selectedColor,
        accentColor: selectedColor === '#10b981' ? '#34d399' : (selectedColor === '#f59e0b' ? '#fbbf24' : '#00c2ff'),
        whatsappSupport: '+595981000000',
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
      currentStep = 3;
      renderWizardStep();
      const msg = document.getElementById('success-store-msg');
      if (msg) {
        msg.innerHTML = `Tu plataforma <strong>${data.tenant.name}</strong> ha sido creada exitosamente. Tu subdominio asignado es <code>https://${data.tenant.slug}.gamsplit.com</code>. Podrás configurar tus cuentas bancarias, logo y favicon en cualquier momento desde tu panel de ajustes.`;
      }
      const btnGoto = document.getElementById('btn-goto-store');
      if (btnGoto) {
        btnGoto.href = `/store?tenant=${data.tenant.slug}`;
      }
      showToast('success', '¡Plataforma Operativa!', 'Tu tienda digital ha sido aprovisionada con éxito.');
    } else {
      showToast('error', 'Error al Crear', data.error || 'No se pudo crear la tienda.');
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.textContent = '🚀 Lanzar mi Tienda Ahora';
      }
    }
  } catch (err) {
    showToast('error', 'Error de Conexión', 'No se pudo comunicar con el servidor.');
    if (btnNext) {
      btnNext.disabled = false;
      btnNext.textContent = '🚀 Lanzar mi Tienda Ahora';
    }
  }
}

// --- 3. COLOR PILL RADIO SELECTION SYNC ---
document.addEventListener('DOMContentLoaded', () => {
  const colorPills = document.querySelectorAll('.color-picker-pill');
  colorPills.forEach(pill => {
    pill.addEventListener('click', () => {
      colorPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // Slug auto-suggestion
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

  // Initialize Canvas Particle Background
  initParticleBackground();
});

// --- 4. INTERACTIVE BACKGROUND CANVAS (RICH PARTICLES & AMBIENT GLOW) ---
function initParticleBackground() {
  const canvas = document.getElementById('saas-bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 18000), 65);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.6 + 0.8;
      this.color = Math.random() > 0.6 ? 'rgba(0, 194, 255, ' : 'rgba(2, 132, 199, ';
      this.alpha = Math.random() * 0.4 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 194, 255, ${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

// --- 5. TOAST NOTIFICATIONS ---
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
      ${title ? `<div style="font-weight: 800; font-size: 0.85rem; color: #ffffff; margin-bottom: 2px;">${title}</div>` : ''}
      <div style="font-size: 0.78rem; color: #cbd5e1;">${message}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}
