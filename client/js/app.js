// GamesBoy.net - Master Client Platform Application

const state = {
  activeView: 'client', // 'client' | 'seller' | 'admin'
  currency: localStorage.getItem('gb_currency') || 'USD',
  currentUser: { id: 'usr_client1', name: 'Lucas_Py', role: 'client', avatar: '🎮' },
  wallet: { balanceUsd: 0.0, pendingEscrowUsd: 0.0 },
  exchangeRates: { PYG: 7500 },
  subscriptions: [],
  storeProducts: [],
  myVault: [],
  activeCategory: 'all',
  depositMethod: 'sipap', // 'sipap' | 'binance'
  
  // Interactive Calculator State
  calculatorServices: [
    { id: 'calc_netflix', name: 'Netflix 4K', official: 15.00, gamesboy: 3.50, icon: '🍿', selected: true },
    { id: 'calc_spotify', name: 'Spotify Familiar', official: 11.00, gamesboy: 1.80, icon: '🎧', selected: true },
    { id: 'calc_chatgpt', name: 'ChatGPT Plus', official: 20.00, gamesboy: 6.00, icon: '🤖', selected: true },
    { id: 'calc_disney', name: 'Disney+ / Star+', official: 11.00, gamesboy: 2.80, icon: '🏰', selected: false },
    { id: 'calc_youtube', name: 'YouTube Premium', official: 14.00, gamesboy: 2.00, icon: '▶️', selected: false },
    { id: 'calc_canva', name: 'Canva Pro', official: 13.00, gamesboy: 2.50, icon: '🎨', selected: false }
  ]
};

// DOM Elements
const brandLogo = document.getElementById('brand-logo');
const tabClient = document.getElementById('tab-client');
const tabSeller = document.getElementById('tab-seller');
const tabAdmin = document.getElementById('tab-admin');
const viewClient = document.getElementById('view-client');
const viewSeller = document.getElementById('view-seller');
const viewAdmin = document.getElementById('view-admin');

const currencySelector = document.getElementById('currency-selector');
const navWalletBalance = document.getElementById('nav-wallet-balance');
const navUserAvatar = document.getElementById('nav-user-avatar');
const navUserName = document.getElementById('nav-user-name');
const btnPersonaToggle = document.getElementById('btn-persona-toggle');

const subscriptionsGrid = document.getElementById('subscriptions-grid');
const storeProductsGrid = document.getElementById('store-products-grid');
const vaultListContainer = document.getElementById('vault-list-container');

// Calculator Elements
const calcServicesContainer = document.getElementById('calc-services-container');
const calcSavingsTotal = document.getElementById('calc-savings-total');
const calcSavingsPyg = document.getElementById('calc-savings-pyg');
const calcOfficialPrice = document.getElementById('calc-official-price');
const calcGamesboyPrice = document.getElementById('calc-gamesboy-price');

// Deposit Modal Elements
const btnOpenDepositModal = document.getElementById('btn-open-deposit-modal');
const btnCloseDepositModal = document.getElementById('btn-close-deposit-modal');
const modalDeposit = document.getElementById('modal-deposit');
const tabPaySipap = document.getElementById('tab-pay-sipap');
const tabPayBinance = document.getElementById('tab-pay-binance');
const boxPaySipap = document.getElementById('box-pay-sipap');
const boxPayBinance = document.getElementById('box-pay-binance');
const depositAmountInput = document.getElementById('deposit-amount-input');
const labelDepositAmount = document.getElementById('label-deposit-amount');
const depositConvertedPreview = document.getElementById('deposit-converted-preview');
const depositReferenceInput = document.getElementById('deposit-reference-input');
const depositReceiptFile = document.getElementById('deposit-receipt-file');
const formSubmitDeposit = document.getElementById('form-submit-deposit');

// Seller Portal Elements
const sellerStatBalance = document.getElementById('seller-stat-balance');
const sellerStatBalancePyg = document.getElementById('seller-stat-balance-pyg');
const sellerStatEscrow = document.getElementById('seller-stat-escrow');
const sellerStatSlots = document.getElementById('seller-stat-slots');
const sellerStatCommission = document.getElementById('seller-stat-commission');
const formPublishSubscription = document.getElementById('form-publish-subscription');
const sellerListingsTableBody = document.getElementById('seller-listings-table-body');
const btnOpenPayoutModal = document.getElementById('btn-open-payout-modal');
const btnClosePayoutModal = document.getElementById('btn-close-payout-modal');
const modalPayout = document.getElementById('modal-payout');
const formSubmitPayout = document.getElementById('form-submit-payout');
const payoutAmountUsd = document.getElementById('payout-amount-usd');
const payoutAmountPygPreview = document.getElementById('payout-amount-pyg-preview');

// Admin Portal Elements
const adminStatPendingDeposits = document.getElementById('admin-stat-pending-deposits');
const adminStatPendingPayouts = document.getElementById('admin-stat-pending-payouts');
const adminStatSalesVolume = document.getElementById('admin-stat-sales-volume');
const adminStatBalance = document.getElementById('admin-stat-balance');
const adminPendingDepositsBody = document.getElementById('admin-pending-deposits-body');
const adminPendingPayoutsBody = document.getElementById('admin-pending-payouts-body');
const formAdminSettings = document.getElementById('form-admin-settings');
const setCommissionPercent = document.getElementById('set-commission-percent');
const setExchangeRate = document.getElementById('set-exchange-rate');
const setBankHolder = document.getElementById('set-bank-holder');
const setBankAccount = document.getElementById('set-bank-account');
const setBinanceId = document.getElementById('set-binance-id');
const setBinanceWallet = document.getElementById('set-binance-wallet');

// CTA Buttons
const btnHeroShareCta = document.getElementById('btn-hero-share-cta');
const btnHalfPublish = document.getElementById('btn-half-publish');

// ============================================================
// 1. INITIALIZATION & STATE
// ============================================================
async function init() {
  currencySelector.value = state.currency;
  setupEventListeners();
  initCalculator();
  await loadUserData();
  await loadCatalog();
  await loadStoreProducts();
  await loadMyVault();
  connectWebSocket();
}

async function loadUserData() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'x-user-id': state.currentUser.id }
    });
    if (res.ok) {
      const data = await res.json();
      state.currentUser = data.user;
      state.wallet = data.wallet;
      updateHeaderDisplay();
    }
  } catch (err) {
    console.error('Error loading user data:', err);
  }
}

function updateHeaderDisplay() {
  navUserAvatar.textContent = state.currentUser.avatar;
  navUserName.textContent = `${state.currentUser.name} (${state.currentUser.role.toUpperCase()})`;

  if (state.currency === 'PYG') {
    const pyg = Math.round(state.wallet.balanceUsd * (state.exchangeRates.PYG || 7500));
    navWalletBalance.textContent = `₲ ${pyg.toLocaleString('es-PY')}`;
  } else {
    navWalletBalance.textContent = `$ ${state.wallet.balanceUsd.toFixed(2)} USDT`;
  }
}

// ============================================================
// 2. SAVINGS CALCULATOR LOGIC
// ============================================================
function initCalculator() {
  if (!calcServicesContainer) return;
  calcServicesContainer.innerHTML = '';

  state.calculatorServices.forEach(item => {
    const btn = document.createElement('div');
    btn.className = `calc-service-item ${item.selected ? 'selected' : ''}`;
    btn.innerHTML = `
      <span style="font-size: 1.25rem;">${item.icon}</span>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${item.name}</div>
        <div style="font-size: 0.72rem; color: var(--text-tertiary);">Oficial: $${item.official}</div>
      </div>
      <span style="color: ${item.selected ? 'var(--accent-orange)' : 'var(--text-tertiary)'}; font-size: 1rem;">
        ${item.selected ? '✔' : '○'}
      </span>
    `;

    btn.addEventListener('click', () => {
      item.selected = !item.selected;
      initCalculator();
      updateCalculatorResults();
    });

    calcServicesContainer.appendChild(btn);
  });

  updateCalculatorResults();
}

function updateCalculatorResults() {
  let totalOfficial = 0;
  let totalGamesBoy = 0;

  state.calculatorServices.forEach(s => {
    if (s.selected) {
      totalOfficial += s.official;
      totalGamesBoy += s.gamesboy;
    }
  });

  const monthlySavings = Math.max(0, totalOfficial - totalGamesBoy);
  const annualSavingsUsd = monthlySavings * 12;
  const rate = state.exchangeRates.PYG || 7500;
  const annualSavingsPyg = Math.round(annualSavingsUsd * rate);

  calcSavingsTotal.textContent = `$ ${annualSavingsUsd.toFixed(2)} USD`;
  calcSavingsPyg.textContent = `Aprox. ₲ ${annualSavingsPyg.toLocaleString('es-PY')} Guaraníes / año`;
  calcOfficialPrice.textContent = `$ ${totalOfficial.toFixed(2)}/m`;
  calcGamesboyPrice.textContent = `$ ${totalGamesBoy.toFixed(2)}/m`;
}

// ============================================================
// 3. CURRENCY & FORMATTING HELPERS
// ============================================================
function formatPrice(amountUsd) {
  const rate = state.exchangeRates.PYG || 7500;
  if (state.currency === 'PYG') {
    const pyg = Math.round(amountUsd * rate);
    return {
      main: `₲ ${pyg.toLocaleString('es-PY')}`,
      secondary: `$ ${amountUsd.toFixed(2)} USDT`
    };
  } else {
    const pyg = Math.round(amountUsd * rate);
    return {
      main: `$ ${amountUsd.toFixed(2)} USDT`,
      secondary: `₲ ${pyg.toLocaleString('es-PY')}`
    };
  }
}

currencySelector.addEventListener('change', (e) => {
  state.currency = e.target.value;
  localStorage.setItem('gb_currency', state.currency);
  updateHeaderDisplay();
  renderSubscriptions();
  renderStoreProducts();
  renderVault();
  updateCalculatorResults();
  if (state.activeView === 'seller') loadSellerDashboard();
});

// ============================================================
// 4. CATALOG & SUBSCRIPTIONS
// ============================================================
async function loadCatalog() {
  try {
    const res = await fetch('/api/subscriptions');
    if (res.ok) {
      state.subscriptions = await res.json();
      renderSubscriptions();
    }
  } catch (err) {
    console.error('Error loading subscriptions:', err);
  }
}

function renderSubscriptions() {
  if (!subscriptionsGrid) return;
  subscriptionsGrid.innerHTML = '';

  const filtered = state.subscriptions.filter(s => {
    if (state.activeCategory === 'all') return true;
    if (state.activeCategory === 'streaming') return s.category === 'streaming';
    if (state.activeCategory === 'ai') return s.category === 'ai';
    if (state.activeCategory === 'store') return false;
    return true;
  });

  if (filtered.length === 0) {
    subscriptionsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-tertiary);">No hay suscripciones en esta categoría por el momento.</div>`;
    return;
  }

  filtered.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subscription-card';

    const price = formatPrice(sub.pricePerSlotUsd);
    const occupiedSlots = sub.totalSlots - sub.availableSlots;
    const progressPercent = Math.round((occupiedSlots / sub.totalSlots) * 100);

    const isOfficial = sub.isOfficial;
    const badgeHtml = isOfficial
      ? `<span class="badge-official">🛡️ Oficial GamesBoy</span>`
      : `<span class="badge-community">👤 Vendedor: ${sub.sellerName}</span>`;

    card.innerHTML = `
      <div class="card-top">
        <div class="service-icon">
          ${getServiceIcon(sub.serviceName)}
        </div>
        ${badgeHtml}
      </div>
      <h3 class="card-title">${sub.serviceName}</h3>
      <p class="card-plan">${sub.planName}</p>

      <div class="slots-bar-wrapper">
        <div class="slots-label">
          <span>Cupos Disponibles</span>
          <strong>${sub.availableSlots} de ${sub.totalSlots} libres</strong>
        </div>
        <div class="slots-progress">
          <div class="slots-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <div class="card-footer">
        <div class="price-box">
          <span class="price-main">${price.main} <span style="font-size: 0.75rem; color: var(--text-tertiary);">/mes</span></span>
          <span class="price-converted">${price.secondary}</span>
        </div>
        <button class="btn-buy-slot" data-id="${sub.id}">
          Adquirir Perfil
        </button>
      </div>
    `;

    card.querySelector('.btn-buy-slot').addEventListener('click', () => buySubscriptionSlot(sub));
    subscriptionsGrid.appendChild(card);
  });
}

function getServiceIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('netflix')) return '🍿';
  if (n.includes('spotify')) return '🎧';
  if (n.includes('chatgpt') || n.includes('gpt')) return '🤖';
  if (n.includes('canva')) return '🎨';
  if (n.includes('disney')) return '🏰';
  if (n.includes('youtube')) return '▶️';
  if (n.includes('max') || n.includes('hbo')) return '🎬';
  return '⚡';
}

async function buySubscriptionSlot(sub) {
  if (state.wallet.balanceUsd < sub.pricePerSlotUsd) {
    const needed = sub.pricePerSlotUsd - state.wallet.balanceUsd;
    alert(`Saldo insuficiente en tu billetera. Necesitas $${needed.toFixed(2)} USDT adicionales. Abre la recarga de saldo para acreditar tu cuenta.`);
    openDepositModal();
    return;
  }

  const confirmBuy = confirm(`¿Confirmas la compra de 1 perfil en ${sub.serviceName} por $${sub.pricePerSlotUsd.toFixed(2)} USDT?`);
  if (!confirmBuy) return;

  try {
    const res = await fetch(`/api/subscriptions/${sub.id}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': state.currentUser.id
      }
    });

    const data = await res.json();
    if (res.ok) {
      alert(`🎉 ¡Compra exitosa!\n\nServicio: ${data.slot.serviceName}\nPerfil Asignado: Perfil #${data.slot.slotNumber}\nPIN: ${data.slot.assignedPin}\nCredenciales: ${data.slot.credentials}\n\nLas credenciales han sido guardadas en tu Bóveda.`);
      await loadUserData();
      await loadCatalog();
      await loadMyVault();
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    alert(`Error al procesar la compra: ${err.message}`);
  }
}

// ============================================================
// 5. MY VAULT (CREDENTIALS VAULT)
// ============================================================
async function loadMyVault() {
  try {
    const res = await fetch('/api/subscriptions/my-vault', {
      headers: { 'x-user-id': state.currentUser.id }
    });
    if (res.ok) {
      state.myVault = await res.json();
      renderVault();
    }
  } catch (err) {
    console.error('Error loading vault:', err);
  }
}

function renderVault() {
  if (!vaultListContainer) return;
  vaultListContainer.innerHTML = '';

  if (state.myVault.length === 0) {
    vaultListContainer.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">Aún no tienes suscripciones activas. Explora el catálogo abajo para adquirir tu primer perfil.</div>`;
    return;
  }

  state.myVault.forEach(item => {
    const el = document.createElement('div');
    el.className = 'vault-item';

    const parts = (item.credentials || '').split(':::');
    const userOrUrl = parts[0] || item.credentials;
    const passOrNote = parts[1] || '';

    el.innerHTML = `
      <div class="vault-info">
        <h4>${item.serviceName} • <span style="color: var(--accent-orange);">Perfil #${item.slotNumber} (PIN: ${item.assignedPin})</span></h4>
        <div class="vault-meta">Vence: ${new Date(item.expiresAt).toLocaleDateString()} • ${item.instructions}</div>
      </div>
      <div class="vault-credentials-box">
        <span>Acceso: <strong>${userOrUrl}</strong></span>
        ${passOrNote ? `<span style="margin-left: 8px;">Clave: <strong>${passOrNote}</strong></span>` : ''}
        <button class="btn-copy" title="Copiar credenciales">📋</button>
      </div>
    `;

    el.querySelector('.btn-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(`${userOrUrl} ${passOrNote ? '| ' + passOrNote : ''}`);
      alert('¡Credenciales copiadas al portapapeles!');
    });

    vaultListContainer.appendChild(el);
  });
}

// ============================================================
// 6. DIGITAL STORE (GIFT CARDS)
// ============================================================
async function loadStoreProducts() {
  try {
    const res = await fetch('/api/store/products');
    if (res.ok) {
      state.storeProducts = await res.json();
      renderStoreProducts();
    }
  } catch (err) {
    console.error('Error loading store products:', err);
  }
}

function renderStoreProducts() {
  if (!storeProductsGrid) return;
  storeProductsGrid.innerHTML = '';

  state.storeProducts.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'store-card';
    const price = formatPrice(prod.priceUsd);

    card.innerHTML = `
      <div class="card-top">
        <span style="font-size: 2rem;">${prod.icon}</span>
        <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--accent-emerald); background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px;">${prod.stockCount} en stock</span>
      </div>
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">${prod.title}</h3>
      <p style="font-size: 0.82rem; color: var(--text-tertiary); margin-bottom: 1.2rem;">${prod.description}</p>
      
      <div class="card-footer">
        <div class="price-box">
          <span class="price-main">${price.main}</span>
          <span class="price-converted">${price.secondary}</span>
        </div>
        <button class="btn-buy-slot" data-id="${prod.id}">
          Comprar
        </button>
      </div>
    `;

    card.querySelector('.btn-buy-slot').addEventListener('click', () => buyStoreProduct(prod));
    storeProductsGrid.appendChild(card);
  });
}

async function buyStoreProduct(prod) {
  if (state.wallet.balanceUsd < prod.priceUsd) {
    alert('Saldo insuficiente. Recarga saldo para comprar este producto digital.');
    openDepositModal();
    return;
  }

  const confirmBuy = confirm(`¿Confirmas la compra de ${prod.title} por $${prod.priceUsd.toFixed(2)} USDT?`);
  if (!confirmBuy) return;

  try {
    const res = await fetch(`/api/store/products/${prod.id}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': state.currentUser.id
      }
    });

    const data = await res.json();
    if (res.ok) {
      alert(`🎁 ¡Código de ${data.order.productTitle} Entregado!\n\nTu Código: ${data.order.code}\n\nPuedes canjearlo directamente en ${data.order.platform}.`);
      await loadUserData();
      await loadStoreProducts();
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    alert(`Error en la compra: ${err.message}`);
  }
}

// ============================================================
// 7. DEPOSIT MODAL & PAYMENTS
// ============================================================
function openDepositModal() {
  modalDeposit.classList.add('active');
  updateDepositPreview();
}
function closeDepositModal() {
  modalDeposit.classList.remove('active');
}

tabPaySipap.addEventListener('click', () => {
  state.depositMethod = 'sipap';
  tabPaySipap.classList.add('active');
  tabPayBinance.classList.remove('active');
  boxPaySipap.style.display = 'block';
  boxPayBinance.style.display = 'none';
  labelDepositAmount.textContent = 'Monto a Transferir en Guaraníes (₲ PYG):';
  depositAmountInput.placeholder = 'ej: 100000';
  depositAmountInput.min = '10000';
  depositAmountInput.step = '5000';
  updateDepositPreview();
});

tabPayBinance.addEventListener('click', () => {
  state.depositMethod = 'binance';
  tabPayBinance.classList.add('active');
  tabPaySipap.classList.remove('active');
  boxPaySipap.style.display = 'none';
  boxPayBinance.style.display = 'block';
  labelDepositAmount.textContent = 'Monto a Transferir en USD / USDT:';
  depositAmountInput.placeholder = 'ej: 15.00';
  depositAmountInput.min = '5';
  depositAmountInput.step = '1';
  updateDepositPreview();
});

depositAmountInput.addEventListener('input', updateDepositPreview);

function updateDepositPreview() {
  const val = parseFloat(depositAmountInput.value) || 0;
  const rate = state.exchangeRates.PYG || 7500;

  if (state.depositMethod === 'sipap') {
    const usd = val > 0 ? (val / rate).toFixed(2) : '0.00';
    depositConvertedPreview.innerHTML = `Recibirás aprox: <strong>$ ${usd} USDT</strong> (Tasa: 1 USD = ${rate.toLocaleString()} ₲)`;
  } else {
    const pyg = Math.round(val * rate);
    depositConvertedPreview.innerHTML = `Equivalente: <strong>₲ ${pyg.toLocaleString('es-PY')}</strong>`;
  }
}

formSubmitDeposit.addEventListener('submit', async (e) => {
  e.preventDefault();
  const val = parseFloat(depositAmountInput.value) || 0;
  const ref = depositReferenceInput.value.trim();

  if (val <= 0) {
    alert('Ingresa un monto válido para recargar');
    return;
  }

  let receiptBase64 = '';
  if (depositReceiptFile.files && depositReceiptFile.files[0]) {
    const reader = new FileReader();
    receiptBase64 = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(depositReceiptFile.files[0]);
    });
  }

  try {
    const body = {
      amount: val,
      currency: state.depositMethod === 'sipap' ? 'PYG' : 'USD',
      method: state.depositMethod === 'sipap' ? 'sipap_paraguay' : 'binance_usdt',
      reference: ref,
      receiptData: receiptBase64 || 'comprobante_captura.png'
    };

    const submitRes = await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': state.currentUser.id
      },
      body: JSON.stringify(body)
    });

    const data = await submitRes.json();
    if (submitRes.ok) {
      alert('✅ ' + data.message);
      closeDepositModal();
      depositAmountInput.value = '';
      depositReferenceInput.value = '';
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Error al enviar recarga: ' + err.message);
  }
});

// ============================================================
// 8. SELLER PORTAL
// ============================================================
async function loadSellerDashboard() {
  try {
    const res = await fetch('/api/seller/dashboard', {
      headers: { 'x-user-id': state.currentUser.id }
    });
    if (res.ok) {
      const data = await res.json();
      sellerStatBalance.textContent = `$ ${data.wallet.balanceUsd.toFixed(2)} USDT`;
      sellerStatBalancePyg.textContent = `₲ ${data.balancePyg.toLocaleString('es-PY')}`;
      sellerStatEscrow.textContent = `$ ${data.wallet.pendingEscrowUsd.toFixed(2)} USDT`;
      sellerStatSlots.textContent = data.stats.totalSoldSlots;
      sellerStatCommission.textContent = `${data.stats.commissionPercent}%`;

      renderSellerListings(data.listings);
    }
  } catch (err) {
    console.error('Error loading seller dashboard:', err);
  }
}

function renderSellerListings(listings) {
  if (!sellerListingsTableBody) return;
  sellerListingsTableBody.innerHTML = '';

  if (listings.length === 0) {
    sellerListingsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary);">Aún no has publicado ninguna suscripción compartida.</td></tr>`;
    return;
  }

  listings.forEach(l => {
    const row = document.createElement('tr');
    const occupied = l.totalSlots - l.availableSlots;
    row.innerHTML = `
      <td><strong>${l.serviceName}</strong><br><span style="font-size: 0.75rem; color: var(--text-tertiary);">${l.planName}</span></td>
      <td><strong>${l.availableSlots} libres</strong> (${occupied} vendidos)</td>
      <td><strong>$ ${l.pricePerSlotUsd.toFixed(2)}</strong> (${l.pricePyg.toLocaleString('es-PY')} ₲)</td>
      <td><span class="badge-official">Activo</span></td>
      <td><code style="font-size: 0.75rem; color: var(--accent-orange);">${l.credentialsDecrypted.slice(0, 30)}...</code></td>
    `;
    sellerListingsTableBody.appendChild(row);
  });
}

formPublishSubscription.addEventListener('submit', async (e) => {
  e.preventDefault();
  const serviceName = document.getElementById('pub-service-name').value;
  const category = document.getElementById('pub-category').value;
  const totalSlots = document.getElementById('pub-slots').value;
  const pricePerSlotUsd = document.getElementById('pub-price').value;
  const credentials = document.getElementById('pub-credentials').value;
  const pins = document.getElementById('pub-pins').value;
  const instructions = document.getElementById('pub-instructions').value;

  try {
    const res = await fetch('/api/seller/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': state.currentUser.id
      },
      body: JSON.stringify({
        serviceName,
        category,
        totalSlots,
        pricePerSlotUsd,
        credentials,
        pins,
        instructions
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ ' + data.message);
      formPublishSubscription.reset();
      loadSellerDashboard();
      loadCatalog();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Error al publicar: ' + err.message);
  }
});

btnOpenPayoutModal.addEventListener('click', () => {
  modalPayout.classList.add('active');
  payoutAmountUsd.max = state.wallet.balanceUsd;
  updatePayoutPreview();
});
btnClosePayoutModal.addEventListener('click', () => modalPayout.classList.remove('active'));

payoutAmountUsd.addEventListener('input', updatePayoutPreview);

function updatePayoutPreview() {
  const val = parseFloat(payoutAmountUsd.value) || 0;
  const rate = state.exchangeRates.PYG || 7500;
  const pyg = Math.round(val * rate);
  payoutAmountPygPreview.textContent = `₲ ${pyg.toLocaleString('es-PY')}`;
}

formSubmitPayout.addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = parseFloat(payoutAmountUsd.value) || 0;
  const method = document.getElementById('payout-method').value;
  const details = document.getElementById('payout-bank-details').value;

  try {
    const res = await fetch('/api/seller/payout-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': state.currentUser.id
      },
      body: JSON.stringify({
        amountUsd: amount,
        method,
        accountDetails: { details }
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ ' + data.message);
      modalPayout.classList.remove('active');
      loadSellerDashboard();
      loadUserData();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// ============================================================
// 9. ADMIN PORTAL
// ============================================================
async function loadAdminOverview() {
  try {
    const res = await fetch('/api/admin/overview');
    if (res.ok) {
      const data = await res.json();
      adminStatPendingDeposits.textContent = data.stats.pendingDepositsCount;
      adminStatPendingPayouts.textContent = data.stats.pendingPayoutsCount;
      adminStatSalesVolume.textContent = `$ ${data.stats.totalSalesVolumeUsd.toFixed(2)}`;
      adminStatBalance.textContent = `$ ${data.adminWallet.balanceUsd.toFixed(2)}`;

      setCommissionPercent.value = data.settings.commissionPercent;
      setExchangeRate.value = data.settings.exchangeRatePyg;
      setBankHolder.value = data.settings.paraguayBankDetails.accountHolder;
      setBankAccount.value = `${data.settings.paraguayBankDetails.aliasSipap} / ${data.settings.paraguayBankDetails.accountNumber}`;
      setBinanceId.value = data.settings.binanceDetails.payId;
      setBinanceWallet.value = data.settings.binanceDetails.walletAddress;

      renderAdminPendingDeposits(data.pendingDeposits);
      renderAdminPendingPayouts(data.pendingPayouts);
    }
  } catch (err) {
    console.error('Error loading admin overview:', err);
  }
}

function renderAdminPendingDeposits(deposits) {
  if (!adminPendingDepositsBody) return;
  adminPendingDepositsBody.innerHTML = '';

  if (deposits.length === 0) {
    adminPendingDepositsBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">No hay comprobantes de recarga pendientes de revisión.</td></tr>`;
    return;
  }

  deposits.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${d.userName}</strong></td>
      <td><strong style="color: var(--accent-emerald);">$ ${d.amountUsd.toFixed(2)} USDT</strong></td>
      <td>₲ ${d.localAmount.toLocaleString('es-PY')}</td>
      <td><span class="badge-community">${d.method === 'sipap_paraguay' ? '🇵🇾 SIPAP' : '🌐 Binance'}</span></td>
      <td><code>${d.reference}</code></td>
      <td>
        <button class="btn-action-sm btn-approve" data-id="${d.id}">Aprobar</button>
        <button class="btn-action-sm btn-reject" data-id="${d.id}" style="margin-left: 4px;">Rechazar</button>
      </td>
    `;

    row.querySelector('.btn-approve').addEventListener('click', () => approveDeposit(d.id));
    row.querySelector('.btn-reject').addEventListener('click', () => rejectDeposit(d.id));
    adminPendingDepositsBody.appendChild(row);
  });
}

async function approveDeposit(id) {
  try {
    const res = await fetch(`/api/admin/approve-deposit/${id}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      alert('✅ ' + data.message);
      loadAdminOverview();
      loadUserData();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function rejectDeposit(id) {
  const reason = prompt('Motivo del rechazo:', 'Comprobante no coincide con la cuenta bancaria');
  if (!reason) return;

  try {
    const res = await fetch(`/api/admin/reject-deposit/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (res.ok) {
      alert('✅ ' + data.message);
      loadAdminOverview();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function renderAdminPendingPayouts(payouts) {
  if (!adminPendingPayoutsBody) return;
  adminPendingPayoutsBody.innerHTML = '';

  if (payouts.length === 0) {
    adminPendingPayoutsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">No hay solicitudes de retiro pendientes.</td></tr>`;
    return;
  }

  payouts.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${p.sellerName}</strong></td>
      <td><strong style="color: var(--accent-amber);">$ ${p.amountUsd.toFixed(2)} USDT</strong> (₲ ${p.amountPyg.toLocaleString('es-PY')})</td>
      <td>${p.method === 'sipap_paraguay' ? '🇵🇾 SIPAP' : '🌐 Binance USDT'}</td>
      <td><small>${JSON.stringify(p.accountDetails)}</small></td>
      <td>
        <button class="btn-action-sm btn-approve" data-id="${p.id}">Marcar como Pagado</button>
      </td>
    `;
    row.querySelector('.btn-approve').addEventListener('click', async () => {
      const res = await fetch(`/api/admin/approve-payout/${p.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('✅ ' + data.message);
        loadAdminOverview();
      }
    });
    adminPendingPayoutsBody.appendChild(row);
  });
}

formAdminSettings.addEventListener('submit', async (e) => {
  e.preventDefault();
  const comm = setCommissionPercent.value;
  const rate = setExchangeRate.value;

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commissionPercent: comm,
        exchangeRatePyg: rate
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ ' + data.message);
      state.exchangeRates.PYG = parseFloat(rate);
      loadCatalog();
      loadStoreProducts();
      updateHeaderDisplay();
      updateCalculatorResults();
    }
  } catch (err) {
    alert('Error al guardar configuración: ' + err.message);
  }
});

// ============================================================
// 10. NAVIGATION & EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  if (tabClient) tabClient.addEventListener('click', () => switchView('client'));
  if (tabSeller) tabSeller.addEventListener('click', () => switchView('seller'));
  if (tabAdmin) tabAdmin.addEventListener('click', () => switchView('admin'));

  const navLinkVender = document.getElementById('nav-link-vender');
  if (navLinkVender) {
    navLinkVender.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('seller');
    });
  }

  if (btnHeroShareCta) btnHeroShareCta.addEventListener('click', () => switchView('seller'));
  if (btnHalfPublish) btnHalfPublish.addEventListener('click', () => switchView('seller'));

  if (btnOpenDepositModal) btnOpenDepositModal.addEventListener('click', openDepositModal);
  if (btnCloseDepositModal) btnCloseDepositModal.addEventListener('click', closeDepositModal);

  // Auth Modal Setup
  const modalAuth = document.getElementById('modal-auth');
  const btnOpenLoginModal = document.getElementById('btn-open-login-modal');
  const btnOpenRegisterModal = document.getElementById('btn-open-register-modal');
  const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabRegister = document.getElementById('auth-tab-register');
  const authNameGroup = document.getElementById('auth-name-group');
  const authRoleGroup = document.getElementById('auth-role-group');
  const authModalTitle = document.getElementById('auth-modal-title');
  const btnAuthSubmit = document.getElementById('btn-auth-submit');
  const formAuth = document.getElementById('form-auth');

  let authMode = 'login'; // 'login' | 'register'

  function openAuthModal(mode = 'login') {
    authMode = mode;
    if (modalAuth) modalAuth.classList.add('active');
    updateAuthModalState();
  }

  function closeAuthModal() {
    if (modalAuth) modalAuth.classList.remove('active');
  }

  function updateAuthModalState() {
    if (authMode === 'login') {
      if (authTabLogin) authTabLogin.classList.add('active');
      if (authTabRegister) authTabRegister.classList.remove('active');
      if (authNameGroup) authNameGroup.style.display = 'none';
      if (authRoleGroup) authRoleGroup.style.display = 'none';
      if (authModalTitle) authModalTitle.textContent = 'Iniciar Sesión';
      if (btnAuthSubmit) btnAuthSubmit.textContent = 'Ingresar a GamesBoy';
    } else {
      if (authTabLogin) authTabLogin.classList.remove('active');
      if (authTabRegister) authTabRegister.classList.add('active');
      if (authNameGroup) authNameGroup.style.display = 'block';
      if (authRoleGroup) authRoleGroup.style.display = 'block';
      if (authModalTitle) authModalTitle.textContent = 'Crear Cuenta';
      if (btnAuthSubmit) btnAuthSubmit.textContent = 'Crear Cuenta en GamesBoy';
    }
  }

  if (btnOpenLoginModal) btnOpenLoginModal.addEventListener('click', () => openAuthModal('login'));
  if (btnOpenRegisterModal) btnOpenRegisterModal.addEventListener('click', () => openAuthModal('register'));
  if (btnCloseAuthModal) btnCloseAuthModal.addEventListener('click', closeAuthModal);
  if (authTabLogin) authTabLogin.addEventListener('click', () => { authMode = 'login'; updateAuthModalState(); });
  if (authTabRegister) authTabRegister.addEventListener('click', () => { authMode = 'register'; updateAuthModalState(); });

  if (formAuth) {
    formAuth.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email-input').value;
      const role = authMode === 'register' ? document.getElementById('auth-role-select').value : 'client';
      const name = authMode === 'register' ? (document.getElementById('auth-name-input').value || email.split('@')[0]) : email.split('@')[0];

      state.currentUser = {
        id: 'usr_' + Date.now(),
        name,
        email,
        role,
        avatar: role === 'seller' ? '💼' : (role === 'admin' ? '👑' : '🎮')
      };
      
      updateHeaderDisplay();
      closeAuthModal();
      alert(`🎉 ¡Bienvenido a GamesBoy.net, ${state.currentUser.name}!`);
      if (role === 'seller') switchView('seller');
    });
  }

  // Search Button
  const btnNavSearch = document.getElementById('btn-nav-search');
  if (btnNavSearch) {
    btnNavSearch.addEventListener('click', () => {
      const catalog = document.getElementById('section-catalog');
      if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
    });
  }

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.getAttribute('data-category');
      
      const storeSection = document.getElementById('section-store');
      const catalogSection = document.getElementById('section-catalog');
      
      if (state.activeCategory === 'store') {
        catalogSection.style.display = 'none';
        storeSection.style.display = 'block';
      } else if (state.activeCategory === 'all') {
        catalogSection.style.display = 'block';
        storeSection.style.display = 'block';
        renderSubscriptions();
      } else {
        catalogSection.style.display = 'block';
        storeSection.style.display = 'none';
        renderSubscriptions();
      }
    });
  });

  if (btnPersonaToggle) {
    btnPersonaToggle.addEventListener('click', async () => {
      const roles = ['client', 'seller', 'admin'];
      const nextRole = roles[(roles.indexOf(state.currentUser.role) + 1) % roles.length];
      
      try {
        const res = await fetch('/api/auth/switch-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: nextRole })
        });
        if (res.ok) {
          const data = await res.json();
          state.currentUser = data.user;
          state.wallet = data.wallet;
          updateHeaderDisplay();
          switchView(nextRole);
          await loadMyVault();
          if (nextRole === 'seller') loadSellerDashboard();
          if (nextRole === 'admin') loadAdminOverview();
        }
      } catch (e) {}
    });
  }
}

function switchView(viewName) {
  state.activeView = viewName;

  tabClient.classList.toggle('active', viewName === 'client');
  tabSeller.classList.toggle('active', viewName === 'seller');
  tabAdmin.classList.toggle('active', viewName === 'admin');

  viewClient.style.display = viewName === 'client' ? 'block' : 'none';
  viewSeller.style.display = viewName === 'seller' ? 'block' : 'none';
  viewAdmin.style.display = viewName === 'admin' ? 'block' : 'none';

  if (viewName === 'seller') loadSellerDashboard();
  if (viewName === 'admin') loadAdminOverview();
}

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_DEPOSIT_REQUEST' && state.activeView === 'admin') {
        loadAdminOverview();
      }
    } catch (e) {}
  };

  ws.onclose = () => {
    setTimeout(connectWebSocket, 5000);
  };
}

document.addEventListener('DOMContentLoaded', init);
