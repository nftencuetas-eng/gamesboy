// GamSplit SaaS Master Landing Engine (saas-landing.js)

let selectedPlan = 'plan_control';
let checkSlugTimeout = null;

// --- 1. SHOWCASE TAB SWITCHER (CONTROL VS TIENDA) ---
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

// --- 2. ONBOARDING & REGISTRATION MODAL ---
window.openOnboardingModal = function(planId) {
  if (planId) {
    selectedPlan = planId;
    const planSelect = document.getElementById('wiz-plan');
    if (planSelect) {
      planSelect.value = planId;
      handlePlanChange(planId);
    }
  }
  const modal = document.getElementById('modal-onboarding');
  if (modal) modal.style.display = 'grid';

  const step1 = document.getElementById('step-1-content');
  const stepSuccess = document.getElementById('step-success-content');
  const footerRow = document.getElementById('wizard-buttons-row');

  if (step1) step1.style.display = 'block';
  if (stepSuccess) stepSuccess.style.display = 'none';
  if (footerRow) footerRow.style.display = 'flex';
};

window.closeOnboardingModal = function() {
  const modal = document.getElementById('modal-onboarding');
  if (modal) modal.style.display = 'none';
};

window.handlePlanChange = function(planId) {
  selectedPlan = planId;
  const wrapSub = document.getElementById('wrap-subdomain-field');
  const btnNext = document.getElementById('btn-wiz-next');

  if (planId === 'plan_control') {
    if (wrapSub) wrapSub.style.display = 'none';
    if (btnNext) btnNext.innerHTML = `<span>Activar Plan Control ($9.99 / ₲ 75.000) ➔</span>`;
  } else {
    if (wrapSub) wrapSub.style.display = 'block';
    if (btnNext) btnNext.innerHTML = `<span>Lanzar Plan Pro con Tienda ($19.99) ➔</span>`;
  }
};

window.submitRegistration = async function() {
  const plan = document.getElementById('wiz-plan')?.value || 'plan_control';
  const brandName = document.getElementById('wiz-brand-name')?.value?.trim();
  const slug = document.getElementById('wiz-slug')?.value?.trim();
  const whatsapp = document.getElementById('wiz-whatsapp')?.value?.trim() || '+595981000000';

  if (!brandName) {
    alert('Por favor ingresa tu nombre o nombre de negocio.');
    return;
  }

  if (plan === 'plan_pro') {
    if (!slug || slug.length < 3) {
      alert('Por favor define el subdominio de tu tienda (mínimo 3 caracteres).');
      return;
    }

    try {
      const checkRes = await fetch(`/api/saas/check-slug/${encodeURIComponent(slug)}`);
      const checkData = await checkRes.json();
      if (!checkData.available) {
        alert(checkData.error || 'Este subdominio ya está en uso. Por favor elige otro.');
        return;
      }
    } catch (e) {}
  }

  const cleanSlug = plan === 'plan_pro' ? slug : `ctrl_${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;

  const btnNext = document.getElementById('btn-wiz-next');
  if (btnNext) {
    btnNext.disabled = true;
    btnNext.textContent = 'Activando tu cuenta...';
  }

  try {
    const payload = {
      name: brandName,
      slug: cleanSlug,
      customDomain: null,
      planId: plan,
      branding: {
        brandName: brandName,
        primaryColor: '#0284c7',
        accentColor: '#00c2ff',
        whatsappSupport: whatsapp,
        currency: 'PYG',
        exchangeRate: 7500
      },
      settings: {
        commissionPercent: plan === 'plan_pro' ? 3.0 : 0,
        allowUserReselling: plan === 'plan_pro',
        paraguayBankDetails: {
          bank: 'Banco Familiar / Itaú Paraguay',
          accountHolder: brandName,
          accountNumber: '01-000000-1',
          aliasSipap: `${cleanSlug}.py`
        },
        binanceDetails: {
          payId: '849201934',
          network: 'USDT (Binance Pay / BEP-20 / TRC-20)'
        },
        enabledModules: {
          streaming: true,
          games: plan === 'plan_pro',
          giftcards: plan === 'plan_pro',
          smm: false,
          p2pSharing: plan === 'plan_pro'
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
      const step1 = document.getElementById('step-1-content');
      const stepSuccess = document.getElementById('step-success-content');
      const footerRow = document.getElementById('wizard-buttons-row');

      if (step1) step1.style.display = 'none';
      if (stepSuccess) stepSuccess.style.display = 'block';
      if (footerRow) footerRow.style.display = 'none';

      const title = document.getElementById('wiz-success-title');
      const msg = document.getElementById('wiz-success-message');
      const urlBox = document.getElementById('wiz-store-url-box');
      const link = document.getElementById('wiz-success-link');
      const btnGo = document.getElementById('wiz-btn-go-store');
      const btnLabel = document.getElementById('wiz-btn-label');

      if (plan === 'plan_control') {
        if (title) title.textContent = '¡Plan Control Activado con Éxito!';
        if (msg) msg.innerHTML = `Tu panel de gestión privada para <strong>${data.tenant.name}</strong> está listo. Ya puedes ingresar a registrar tus cuentas de streaming, PINs y clientes.`;
        if (urlBox) urlBox.style.display = 'none';
        if (btnGo) btnGo.href = '/seller';
        if (btnLabel) btnLabel.textContent = '📋 Ingresar a mi Panel de Control';
      } else {
        if (title) title.textContent = '¡Tu Tienda Digital ha sido Creada!';
        if (msg) msg.innerHTML = `Tu plataforma <strong>${data.tenant.name}</strong> está en vivo. Tu subdominio asignado es <code>${data.tenant.slug}.gamsplit.com</code>.`;
        if (urlBox) urlBox.style.display = 'block';
        if (link) {
          link.href = `/store?tenant=${data.tenant.slug}`;
          link.textContent = `https://${data.tenant.slug}.gamsplit.com`;
        }
        if (btnGo) btnGo.href = `/store?tenant=${data.tenant.slug}`;
        if (btnLabel) btnLabel.textContent = '🚀 Abrir mi Tienda en Vivo';
      }
    } else {
      alert(data.error || 'No se pudo activar la cuenta.');
      if (btnNext) {
        btnNext.disabled = false;
        btnNext.textContent = 'Activar mi Cuenta Ahora ➔';
      }
    }
  } catch (err) {
    alert('Error al comunicar con el servidor.');
    if (btnNext) {
      btnNext.disabled = false;
      btnNext.textContent = 'Activar mi Cuenta Ahora ➔';
    }
  }
};

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

// Initialize Background Particles
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  handlePlanChange('plan_control');
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
