// GamesBoy.net - Monetization Page Interactive Engine

let servicesConfig = {
  'netflix': { name: 'Netflix Premium 4K', planName: 'Ultra HD 4K (4 Pantallas)', maxSlots: 5, pricePerSlotPyg: 25000, commissionPercent: 10, netPayoutPyg: 22500 },
  'spotify': { name: 'Spotify Premium Familiar', planName: 'Plan Familiar (6 Cuentas)', maxSlots: 5, pricePerSlotPyg: 18000, commissionPercent: 10, netPayoutPyg: 16200 },
  'disney': { name: 'Disney+ Premium & Star+', planName: 'Plan Premium 4K', maxSlots: 4, pricePerSlotPyg: 25000, commissionPercent: 10, netPayoutPyg: 22500 },
  'max': { name: 'Max (HBO Max) 4K', planName: 'Platino 4K Dolby Atmos', maxSlots: 3, pricePerSlotPyg: 22000, commissionPercent: 10, netPayoutPyg: 19800 },
  'youtube': { name: 'YouTube Premium & Music', planName: 'Familiar Sin Anuncios', maxSlots: 5, pricePerSlotPyg: 20000, commissionPercent: 10, netPayoutPyg: 18000 },
  'chatgpt': { name: 'ChatGPT Plus & AI', planName: 'Plus GPT-4o & Canvas', maxSlots: 2, pricePerSlotPyg: 35000, commissionPercent: 10, netPayoutPyg: 31500 },
  'crunchyroll': { name: 'Crunchyroll Mega Fan', planName: 'Mega Fan 4 Pantallas', maxSlots: 4, pricePerSlotPyg: 18000, commissionPercent: 10, netPayoutPyg: 16200 },
  'paramount': { name: 'Paramount+ Premium', planName: 'Plan Estándar 3 Pantallas', maxSlots: 3, pricePerSlotPyg: 18000, commissionPercent: 10, netPayoutPyg: 16200 }
};

let selectedServiceKey = 'netflix';
let selectedSlotsCount = 3;
let exchangeRatePyg = 7500;

async function loadDynamicServices() {
  try {
    const res = await fetch('/api/streaming-hubs');
    const data = await res.json();
    if (data.success && Array.isArray(data.services) && data.services.length > 0) {
      const newConfig = {};
      const selectCalc = document.getElementById('calc-service-select');
      const selectPub = document.getElementById('user-pub-service');

      if (selectCalc) selectCalc.innerHTML = '';
      if (selectPub) selectPub.innerHTML = '';

      data.services.forEach(s => {
        const price = s.pricePerSlotPyg || 25000;
        const comm = s.commissionPercent !== undefined ? s.commissionPercent : 10;
        const net = Math.round(price * (1 - comm / 100));

        newConfig[s.id] = {
          name: s.name,
          planName: s.planName || `Plan ${s.maxSlots || 5} Pantallas`,
          maxSlots: s.maxSlots || 5,
          pricePerSlotPyg: price,
          commissionPercent: comm,
          netPayoutPyg: net
        };

        if (selectCalc) {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = `${s.name} (${price.toLocaleString('es-PY')} Gs./cupo)`;
          selectCalc.appendChild(opt);
        }

        if (selectPub) {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = `${s.name} (${price.toLocaleString('es-PY')} Gs.)`;
          selectPub.appendChild(opt);
        }
      });

      servicesConfig = newConfig;
      const firstKey = Object.keys(servicesConfig)[0] || 'netflix';
      selectedServiceKey = firstKey;
      if (selectCalc) selectCalc.value = firstKey;
      if (selectPub) selectPub.value = firstKey;
      initCalculator();
    }
  } catch (err) {
    console.warn('Could not load dynamic services, using defaults:', err);
  }
}

// --- CALCULATOR CONTROLLER ---
function initCalculator() {
  const serviceSelect = document.getElementById('calc-service-select');
  const slotsPillGroup = document.getElementById('calc-slots-pill-group');
  const slotsDisplay = document.getElementById('calc-slots-display');
  const netPerSlotEl = document.getElementById('calc-net-per-slot');
  const commissionEl = document.getElementById('calc-commission-rate');
  const monthlyTotalEl = document.getElementById('calc-monthly-total');
  const monthlyUsdEl = document.getElementById('calc-monthly-usd');
  const annualTotalEl = document.getElementById('calc-annual-total');

  const updateCalculations = () => {
    const cfg = servicesConfig[selectedServiceKey] || servicesConfig['netflix'];
    const maxSlots = cfg.maxSlots || 5;

    // Update slots pill buttons visibility/active state
    const slotButtons = slotsPillGroup ? slotsPillGroup.querySelectorAll('.calc-slot-btn') : [];
    slotButtons.forEach(btn => {
      const slots = parseInt(btn.dataset.slots, 10);
      if (slots > maxSlots) {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'inline-flex';
      }
      if (slots === selectedSlotsCount) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (selectedSlotsCount > maxSlots) {
      selectedSlotsCount = maxSlots;
    }

    if (slotsDisplay) {
      slotsDisplay.textContent = `${selectedSlotsCount} ${selectedSlotsCount === 1 ? 'Cupo' : 'Cupos'}`;
    }

    const netPerSlot = cfg.netPayoutPyg || Math.round(cfg.pricePerSlotPyg * 0.9);
    const commPct = cfg.commissionPercent || 10;
    const monthlyTotal = netPerSlot * selectedSlotsCount;
    const monthlyUsd = (monthlyTotal / exchangeRatePyg).toFixed(2);
    const annualTotal = monthlyTotal * 12;

    if (netPerSlotEl) netPerSlotEl.textContent = `${netPerSlot.toLocaleString('es-PY')} Gs.`;
    if (commissionEl) commissionEl.textContent = `${commPct}% (Cobro y soporte garantizado)`;
    if (monthlyTotalEl) monthlyTotalEl.textContent = `${monthlyTotal.toLocaleString('es-PY')} Gs.`;
    if (monthlyUsdEl) monthlyUsdEl.textContent = `~$${monthlyUsd} USD`;
    if (annualTotalEl) annualTotalEl.textContent = `${annualTotal.toLocaleString('es-PY')} Gs.`;
  };

  if (serviceSelect) {
    serviceSelect.addEventListener('change', (e) => {
      selectedServiceKey = e.target.value;
      updateCalculations();
    });
  }

  if (slotsPillGroup) {
    slotsPillGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-slot-btn');
      if (!btn) return;
      selectedSlotsCount = parseInt(btn.dataset.slots, 10) || 1;
      updateCalculations();
    });
  }

  updateCalculations();
}

// --- FAQ ACCORDION ---
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

function renderPublishProfilesList(totalCapacity, initialAvailableCount) {
  const container = document.getElementById('user-pub-profiles-container');
  if (!container) return;

  const capacity = Math.max(1, Math.min(20, parseInt(totalCapacity, 10) || 5));
  const availCount = Math.max(1, Math.min(capacity, parseInt(initialAvailableCount, 10) || capacity));
  
  const existingData = {};
  container.querySelectorAll('.pub-profile-slot-item').forEach(card => {
    const idx = card.dataset.slot;
    const name = card.querySelector('.pub-profile-name-input')?.value;
    const pin = card.querySelector('.pub-profile-pin-input')?.value;
    const isOccupied = card.getAttribute('data-occupied') === 'true';
    if (idx) existingData[idx] = { name, pin, isOccupied };
  });

  let html = '';
  for (let i = 1; i <= capacity; i++) {
    const isOcc = existingData[i] ? existingData[i].isOccupied : (i > availCount);
    const defaultName = existingData[i]?.name || (isOcc ? `Mi Perfil` : `Perfil ${i}`);
    const defaultPin = existingData[i]?.pin || '';

    html += `
      <div class="pub-profile-slot-item ${isOcc ? 'is-occupied' : ''}" data-slot="${i}" data-occupied="${isOcc}">
        <div class="pub-profile-slot-top-row">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="pub-profile-slot-num">#${i}</span>
            <span style="font-size: 0.76rem; font-weight: 800; color: #fff;">Asiento ${i}</span>
          </div>
          <button type="button" class="pub-slot-toggle-btn ${isOcc ? 'occupied' : ''}" onclick="toggleMonetizarSlotState(${i})">
            ${isOcc ? '🔴 Ocupado / Personal' : '🟢 Disponible'}
          </button>
        </div>
        
        <div class="pub-profile-slot-header">
          <input type="text" class="pub-profile-name-input" data-slot="${i}" value="${defaultName}" placeholder="Nombre (ej: Papá, Mi Perfil)">
        </div>

        <div class="pub-profile-pin-wrap">
          <span class="pub-profile-pin-label">PIN:</span>
          <input type="text" class="pub-profile-pin-input" data-slot="${i}" value="${isOcc ? '' : defaultPin}" ${isOcc ? 'disabled' : ''} placeholder="${isOcc ? 'No requiere PIN (Personal)' : 'Opcional (ej: 1234)'}" maxlength="8">
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

window.toggleMonetizarSlotState = function(slotNum) {
  const card = document.querySelector(`#user-pub-profiles-container .pub-profile-slot-item[data-slot="${slotNum}"]`);
  if (!card) return;

  const currentOccupied = card.getAttribute('data-occupied') === 'true';
  const nextOccupied = !currentOccupied;

  card.setAttribute('data-occupied', nextOccupied ? 'true' : 'false');
  card.classList.toggle('is-occupied', nextOccupied);

  const toggleBtn = card.querySelector('.pub-slot-toggle-btn');
  if (toggleBtn) {
    toggleBtn.className = `pub-slot-toggle-btn ${nextOccupied ? 'occupied' : ''}`;
    toggleBtn.innerHTML = nextOccupied ? '🔴 Ocupado / Personal' : '🟢 Disponible';
  }

  const pinInput = card.querySelector('.pub-profile-pin-input');
  if (pinInput) {
    pinInput.disabled = nextOccupied;
    if (nextOccupied) {
      pinInput.dataset.prevPin = pinInput.value;
      pinInput.value = '';
      pinInput.placeholder = 'No requiere PIN (Personal)';
    } else {
      pinInput.value = pinInput.dataset.prevPin || '';
      pinInput.placeholder = 'Opcional (ej: 1234)';
    }
  }

  const totalAvail = document.querySelectorAll('#user-pub-profiles-container .pub-profile-slot-item[data-occupied="false"]').length;
  const slotsInput = document.getElementById('user-pub-slots');
  if (slotsInput) {
    slotsInput.value = totalAvail;
  }

  if (typeof window.updateMonetizarModalPricing === 'function') {
    window.updateMonetizarModalPricing();
  }
};

// --- PUBLISH MODAL CONTROLLER ---
function initPublishModal() {
  const modalPublish = document.getElementById('modal-publish-stream');
  const btnClosePublish = document.getElementById('btn-close-publish-modal');
  const btnCalcOpen = document.getElementById('btn-calc-open-publish');
  const btnFinalOpen = document.getElementById('btn-final-open-publish');

  const serviceSelect = document.getElementById('user-pub-service');
  const planInput = document.getElementById('user-pub-plan');
  const slotsInput = document.getElementById('user-pub-slots');
  const priceDisplay = document.getElementById('user-pub-fixed-price-preview');
  const commissionDisplay = document.getElementById('user-pub-commission-preview');
  const netEarningsTotal = document.getElementById('user-pub-net-total');

  window.updateMonetizarModalPricing = () => {
    if (!serviceSelect) return;
    const selectedKey = serviceSelect.value;
    const cfg = servicesConfig[selectedKey] || servicesConfig['netflix'];

    const maxCapacity = cfg ? (cfg.maxSlots || 5) : 5;

    if (planInput && cfg) planInput.value = cfg.planName || 'Plan Compartido';
    if (slotsInput) {
      slotsInput.max = maxCapacity;
    }

    const pricePyg = cfg ? cfg.pricePerSlotPyg : 25000;
    const commPct = cfg ? (cfg.commissionPercent !== undefined ? cfg.commissionPercent : 10) : 10;
    const netPerSlot = cfg ? cfg.netPayoutPyg : Math.round(pricePyg * (1 - commPct / 100));
    
    const availCount = parseInt(slotsInput?.value, 10) || 1;
    const totalNet = netPerSlot * availCount;

    if (priceDisplay) priceDisplay.textContent = `${pricePyg.toLocaleString('es-PY')} Gs.`;
    if (commissionDisplay) commissionDisplay.textContent = `${commPct}%`;
    if (netEarningsTotal) netEarningsTotal.textContent = `${totalNet.toLocaleString('es-PY')} Gs.`;
  };

  const handleServiceOrSlotsChange = (rebuildProfiles = true) => {
    const selectedKey = serviceSelect.value;
    const cfg = servicesConfig[selectedKey] || servicesConfig['netflix'];
    const maxCapacity = cfg ? (cfg.maxSlots || 5) : 5;

    if (slotsInput) {
      slotsInput.max = maxCapacity;
      if (parseInt(slotsInput.value, 10) > maxCapacity) {
        slotsInput.value = maxCapacity;
      }
    }

    window.updateMonetizarModalPricing();

    if (rebuildProfiles) {
      const avail = parseInt(slotsInput?.value, 10) || maxCapacity;
      renderPublishProfilesList(maxCapacity, avail);
    }
  };

  const openPublishModal = () => {
    if (!modalPublish) return;
    if (serviceSelect) serviceSelect.value = selectedServiceKey;
    if (slotsInput) slotsInput.value = selectedSlotsCount;
    handleServiceOrSlotsChange(true);
    modalPublish.style.display = 'grid';
  };

  if (btnCalcOpen) btnCalcOpen.onclick = openPublishModal;
  if (btnFinalOpen) btnFinalOpen.onclick = openPublishModal;

  if (btnClosePublish && modalPublish) {
    btnClosePublish.onclick = () => { modalPublish.style.display = 'none'; };
  }

  if (serviceSelect) serviceSelect.onchange = () => handleServiceOrSlotsChange(true);
  if (slotsInput) slotsInput.oninput = () => handleServiceOrSlotsChange(true);

  const publishForm = document.getElementById('form-user-publish-stream');
  if (publishForm) {
    publishForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = JSON.parse(localStorage.getItem('gb_user') || 'null');
      const userId = user ? user.id : 'usr_client1';
      const serviceKey = document.getElementById('user-pub-service').value;
      const email = document.getElementById('user-pub-email')?.value.trim() || '';
      const password = document.getElementById('user-pub-password')?.value.trim() || '';
      const instructions = document.getElementById('user-pub-instructions')?.value.trim() || 'Usa exclusivamente tu perfil asignado y no modifiques las credenciales.';

      if (!email || !password) {
        alert('Por favor ingresa el correo y la contraseña de la cuenta.');
        return;
      }

      // Collect all profile slots, occupancy, and pins
      const profiles = {};
      const pins = {};
      let availableCount = 0;
      let totalCount = 0;

      document.querySelectorAll('#user-pub-profiles-container .pub-profile-slot-item').forEach(card => {
        totalCount++;
        const slotNum = card.dataset.slot;
        const isOccupied = card.getAttribute('data-occupied') === 'true';
        const nameVal = card.querySelector('.pub-profile-name-input')?.value.trim() || `Perfil ${slotNum}`;
        const pinVal = card.querySelector('.pub-profile-pin-input')?.value.trim() || '';

        if (!isOccupied) availableCount++;

        profiles[slotNum] = {
          slotNumber: parseInt(slotNum, 10),
          name: nameVal,
          pin: isOccupied ? 'N/A' : (pinVal || 'N/A'),
          isOccupied: isOccupied,
          isAvailable: !isOccupied
        };

        if (!isOccupied && pinVal) {
          pins[slotNum] = pinVal;
        }
      });

      if (availableCount < 1) {
        alert('Debes marcar al menos 1 cupo como Disponible para compartir en la plataforma.');
        return;
      }

      const payload = {
        serviceKey,
        serviceName: document.getElementById('user-pub-service').selectedOptions[0]?.text || serviceKey,
        planName: document.getElementById('user-pub-plan')?.value,
        totalSlots: totalCount || document.getElementById('user-pub-slots').value,
        availableSlots: availableCount,
        email,
        password,
        credentials: `${email} | ${password}`,
        profiles,
        pins,
        instructions
      };

      try {
        const res = await fetch('/api/subscriptions/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          const isPending = data.subscription?.status === 'pending_approval';
          alert(
            isPending
              ? `⏳ Solicitud Enviada para Moderación\n\nTu cuenta ha sido enviada al Administrador para verificar los accesos. Una vez aprobada, se publicará automáticamente en el catálogo.`
              : `🎉 ¡Cuenta Publicada con Éxito!\n\n${data.message || 'Tu cuenta ya está activa en el catálogo oficial.'}`
          );
          if (modalPublish) modalPublish.style.display = 'none';
          publishForm.reset();
          window.location.href = '/purchases.html';
        } else {
          alert(`Aviso: ${data.error || 'No se pudo publicar la cuenta.'}`);
        }
      } catch (err) {
        alert('Error al publicar cuenta de streaming.');
      }
    });
  }
}

// --- USER SESSION & HEADER SYNC ---
function initSession() {
  const user = JSON.parse(localStorage.getItem('gb_user') || 'null');
  const unlogged = document.getElementById('auth-unlogged-group');
  const logged = document.getElementById('auth-logged-group');
  const navName = document.getElementById('nav-user-name');
  const dropName = document.getElementById('dropdown-user-name');
  const dropEmail = document.getElementById('dropdown-user-email');

  if (user) {
    if (unlogged) unlogged.style.display = 'none';
    if (logged) logged.style.display = 'flex';
    if (navName) navName.textContent = user.name || 'Usuario';
    if (dropName) dropName.textContent = user.name || 'Usuario';
    if (dropEmail) dropEmail.textContent = user.email || 'usuario@gamesboy.net';

    const balEl = document.getElementById('nav-user-balance-amount');
    const balUsd = user.balanceUsd || 0;
    if (balEl) balEl.textContent = `${Math.round(balUsd * 7500).toLocaleString('es-PY')} Gs.`;
  } else {
    if (unlogged) unlogged.style.display = 'flex';
    if (logged) logged.style.display = 'none';
  }

  // Profile toggle
  const profileWrapper = document.getElementById('user-profile-wrapper');
  const btnProfileToggle = document.getElementById('btn-user-profile-toggle');
  const dropdownMenu = document.getElementById('user-profile-dropdown-menu');

  if (btnProfileToggle && dropdownMenu && profileWrapper) {
    btnProfileToggle.onclick = (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.style.display === 'block';
      dropdownMenu.style.display = isOpen ? 'none' : 'block';
      profileWrapper.classList.toggle('open', !isOpen);
    };

    document.addEventListener('click', (e) => {
      if (!profileWrapper.contains(e.target)) {
        dropdownMenu.style.display = 'none';
        profileWrapper.classList.remove('open');
      }
    });
  }

  const btnLogout = document.getElementById('btn-header-logout');
  if (btnLogout) {
    btnLogout.onclick = () => {
      localStorage.removeItem('gb_user');
      localStorage.removeItem('gb_admin_session');
      localStorage.removeItem('gb_token');
      window.location.href = '/';
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSession();
  loadDynamicServices();
  initCalculator();
  initFaqAccordion();
  initPublishModal();
});
