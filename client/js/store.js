import { API, formatDualCurrency, setCurrency, getCurrency } from './api.js';

let allProducts = [];
let activeCategory = 'all';
let searchQuery = '';
let selectedProduct = null;
let selectedSlot = null;

document.addEventListener('DOMContentLoaded', async () => {
  initCurrencySwitcher();
  initFilters();
  initSearch();
  initModal();
  await loadCatalog();

  // Listen for global currency toggle
  window.addEventListener('currency-changed', () => {
    renderProducts();
    if (selectedProduct) updateModalPrice();
  });
});

// Currency Switcher setup
function initCurrencySwitcher() {
  const btnUSD = document.getElementById('btnCurUSD');
  const btnPYG = document.getElementById('btnCurPYG');
  const current = getCurrency();

  if (current === 'PYG') {
    btnPYG?.classList.add('active');
    btnUSD?.classList.remove('active');
  }

  btnUSD?.addEventListener('click', () => {
    btnUSD.classList.add('active');
    btnPYG.classList.remove('active');
    setCurrency('USD');
  });

  btnPYG?.addEventListener('click', () => {
    btnPYG.classList.add('active');
    btnUSD.classList.remove('active');
    setCurrency('PYG');
  });
}

// Category filter chips
function initFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.getAttribute('data-category');
      renderProducts();
    });
  });
}

// Search input
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderProducts();
  });
}

// Fetch Catalog
async function loadCatalog() {
  const countLabel = document.getElementById('productCountLabel');
  try {
    const res = await API.getProducts({ limit: 50 });
    allProducts = res.products || [];
    renderProducts();
  } catch (err) {
    if (countLabel) countLabel.textContent = 'Error al cargar productos';
  }
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const countLabel = document.getElementById('productCountLabel');
  if (!grid) return;

  const filtered = allProducts.filter(p => {
    const matchCategory = activeCategory === 'all' ||
      (activeCategory === 'ps5' && p.platform === 'PS5') ||
      (activeCategory === 'ps4' && p.platform === 'PS4') ||
      (activeCategory === 'xbox' && p.platform === 'Xbox') ||
      (activeCategory === 'streaming' && p.product_type === 'STREAMING') ||
      (activeCategory === 'giftcards' && p.product_type === 'GIFTCARD');

    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery) ||
      (p.description && p.description.toLowerCase().includes(searchQuery));

    return matchCategory && matchSearch;
  });

  if (countLabel) {
    countLabel.textContent = `${filtered.length} productos disponibles`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 0; text-align: center; color: var(--text-dim);">
        <div style="font-size: 32px; margin-bottom: 12px;">🎮</div>
        <p>No se encontraron productos para los filtros seleccionados.</p>
      </div>
    `;
    return;
  }

  const cur = getCurrency();

  grid.innerHTML = filtered.map(p => {
    const dual = formatDualCurrency(p.price_usd, p.price_pyg);
    const mainPrice = cur === 'PYG' ? dual.secondary : dual.primary;
    const subPrice = cur === 'PYG' ? dual.primary : dual.secondary;

    return `
      <div class="product-card">
        <div class="card-media-wrapper">
          <img src="${p.cover_url || '/assets/games/fc25.jpg'}" alt="${p.title}" class="card-cover" onerror="this.src='/assets/mascot_hero.jpg'">
          <div class="card-platform-badge">${p.platform || 'PS5'}</div>
        </div>

        <div class="card-body">
          <h3 class="card-title">${p.title}</h3>
          <p class="card-desc">${p.description || 'Cuenta garantizada de alta disponibilidad.'}</p>

          <div class="card-footer">
            <div class="price-container">
              <span class="price-main">${mainPrice}</span>
              <span class="price-secondary">${subPrice}</span>
            </div>

            <button class="btn btn-primary btn-sm btn-view-prod" data-id="${p.id}">
              <span>Ver Cuenta</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind click handlers
  document.querySelectorAll('.btn-view-prod').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = Number(btn.getAttribute('data-id'));
      const product = allProducts.find(p => p.id === prodId);
      if (product) openPurchaseModal(product);
    });
  });
}

// Modal handling
function initModal() {
  const modal = document.getElementById('modalPurchase');
  const btnClose = document.getElementById('btnClosePurchaseModal');

  btnClose?.addEventListener('click', () => {
    modal?.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.getElementById('btnConfirmPurchase')?.addEventListener('click', () => {
    if (!selectedProduct) return;
    alert(`🎉 ¡Compra confirmada para ${selectedProduct.title}! Se ha generado tu acceso inmediato.`);
    modal?.classList.remove('active');
  });
}

function openPurchaseModal(product) {
  selectedProduct = product;
  const modal = document.getElementById('modalPurchase');
  if (!modal) return;

  document.getElementById('modalProductTitle').textContent = product.title;
  document.getElementById('modalProductDesc').textContent = product.description;
  document.getElementById('modalProductPlatform').textContent = product.platform || 'PS5';
  document.getElementById('modalProductImg').src = product.cover_url || '/assets/mascot_hero.jpg';

  const slotList = document.getElementById('modalSlotList');
  const slots = product.slots || [
    { id: 1, slot_type: 'PRIMARY', slot_label: 'Cuenta Primaria (Juega en tu usuario)', price_usd: product.price_usd, price_pyg: product.price_pyg },
    { id: 2, slot_type: 'SECONDARY', slot_label: 'Cuenta Secundaria', price_usd: Math.round(product.price_usd * 0.65), price_pyg: Math.round(product.price_pyg * 0.65) }
  ];

  selectedSlot = slots[0];

  slotList.innerHTML = slots.map((s, idx) => `
    <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-normal); border-radius: var(--radius-md); cursor: pointer;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <input type="radio" name="slotSelection" value="${s.id}" ${idx === 0 ? 'checked' : ''}>
        <div>
          <div style="font-size: 13px; font-weight: 600;">${s.slot_label}</div>
          <div style="font-size: 11px; color: var(--text-dim);">${s.slot_type}</div>
        </div>
      </div>
      <div class="font-mono" style="font-weight: 700; font-size: 13px;">$${Number(s.price_usd).toFixed(2)}</div>
    </label>
  `).join('');

  slotList.querySelectorAll('input[type="radio"]').forEach((radio, idx) => {
    radio.addEventListener('change', () => {
      selectedSlot = slots[idx];
      updateModalPrice();
    });
  });

  updateModalPrice();
  modal.classList.add('active');
}

function updateModalPrice() {
  if (!selectedSlot) return;
  const dual = formatDualCurrency(selectedSlot.price_usd, selectedSlot.price_pyg);
  document.getElementById('modalPricePrimary').textContent = dual.primary;
  document.getElementById('modalPriceSecondary').textContent = dual.secondary;
}
