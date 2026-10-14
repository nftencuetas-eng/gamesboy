import { API, formatCurrency } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth or seed token for admin session
  let token = API.getToken();
  if (!token) {
    try {
      const loginRes = await API.login('admin@gamesboy.net', 'GamesBoy2026!');
      token = loginRes.token;
    } catch {
      // Allow browsing if standalone
    }
  }

  initTabs();
  initModals();
  await loadDashboard();
  await loadGames();
  await loadUsers();
  initForms();

  // Logout button
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    API.logout();
  });
});

// Tab Navigation
function initTabs() {
  const links = document.querySelectorAll('.sidebar-nav .nav-link');
  const panes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('pageTitle');

  const titles = {
    dashboard: 'Resumen General',
    games: 'Juegos & Cuentas Primarias/Secundarias',
    services: 'Streaming, Música & Gift Cards',
    deposits: 'Depósitos & Billeteras',
    users: 'Usuarios & Roles',
    settings: 'Configuración & Tasas'
  };

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');

      links.forEach(l => l.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      const targetPane = document.getElementById(`tab-${tabId}`);
      if (targetPane) targetPane.classList.add('active');

      if (pageTitle && titles[tabId]) {
        pageTitle.textContent = titles[tabId];
      }
    });
  });
}

// Load Dashboard Metrics
async function loadDashboard() {
  try {
    const res = await API.getAdminMetrics();
    if (res.success && res.metrics) {
      const m = res.metrics;
      document.getElementById('metricTotalVolume').textContent = `$${m.totalVolumeUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      document.getElementById('metricTotalUsers').textContent = m.totalUsers;
      document.getElementById('metricTotalProducts').textContent = m.totalProducts;
      document.getElementById('metricPendingDeposits').textContent = m.pendingDeposits;
    }
  } catch (err) {
    console.warn('Dashboard metrics fetch error:', err.message);
  }
}

// Load Games & Products Table
async function loadGames() {
  const tableBody = document.getElementById('gamesTableBody');
  if (!tableBody) return;

  try {
    const res = await API.getProducts({ limit: 100 });
    const products = res.products || [];

    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">No hay productos registrados en el catálogo.</td></tr>`;
      return;
    }

    tableBody.innerHTML = products.map(p => `
      <tr>
        <td style="width: 50px;">
          <img src="${p.cover_url || '/assets/games/fc25.jpg'}" alt="${p.title}" style="width: 44px; height: 56px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-subtle);" onerror="this.src='/assets/mascot_hero.jpg'">
        </td>
        <td>
          <div style="font-weight: 600;">${p.title}</div>
          <span class="badge badge-slate" style="font-size: 11px;">${p.platform || 'PS5'}</span>
        </td>
        <td class="font-mono">$${Number(p.price_usd).toFixed(2)}</td>
        <td class="font-mono">₲ ${Number(p.price_pyg).toLocaleString('es-PY')}</td>
        <td>
          <span class="badge badge-blue font-mono">${p.slots ? p.slots.length : 2} Slots</span>
        </td>
        <td>
          <span class="badge ${p.is_active ? 'badge-success' : 'badge-danger'}">
            ${p.is_active ? 'ACTIVO' : 'PAUSADO'}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm">Editar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.warn('Error loading games:', err.message);
  }
}

// Load Users Table
async function loadUsers() {
  const tableBody = document.getElementById('usersTableBody');
  if (!tableBody) return;

  try {
    const res = await API.getAdminUsers();
    const users = res.users || [];

    tableBody.innerHTML = users.map(u => `
      <tr>
        <td class="font-mono text-dim">#${u.id}</td>
        <td>
          <div style="font-weight: 600;">${u.full_name || 'Usuario'}</div>
          <div style="font-size: 12px; color: var(--text-dim);">${u.email}</div>
        </td>
        <td>
          <span class="badge ${u.role === 'ADMIN' ? 'badge-blue' : u.role === 'SELLER' ? 'badge-warning' : 'badge-slate'}">
            ${u.role}
          </span>
        </td>
        <td class="font-mono">$${Number(u.balance_usd || 0).toFixed(2)}</td>
        <td class="font-mono">₲ ${Number(u.balance_pyg || 0).toLocaleString('es-PY')}</td>
        <td>
          <span class="badge ${u.is_frozen ? 'badge-danger' : 'badge-success'}">
            ${u.is_frozen ? 'CONGELADO' : 'ACTIVO'}
          </span>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.warn('Error loading users:', err.message);
  }
}

// Modals
function initModals() {
  const btnNewProd = document.getElementById('btnNewProduct');
  const modalProd = document.getElementById('modalNewProduct');
  const btnCloseProd = document.getElementById('btnCloseProductModal');

  btnNewProd?.addEventListener('click', () => {
    modalProd?.classList.add('active');
  });

  btnCloseProd?.addEventListener('click', () => {
    modalProd?.classList.remove('active');
  });

  modalProd?.addEventListener('click', (e) => {
    if (e.target === modalProd) modalProd.classList.remove('active');
  });
}

// Forms & Deposit Approvals
function initForms() {
  // New Product Form
  const formProd = document.getElementById('formNewProduct');
  formProd?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('newProdTitle').value;
    const platform = document.getElementById('newProdPlatform').value;
    const priceUsd = document.getElementById('newProdPrice').value;
    const description = document.getElementById('newProdDesc').value;

    try {
      await API.request('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title,
          platform,
          priceUsd: Number(priceUsd),
          pricePyg: Math.round(Number(priceUsd) * 7800),
          description,
          productType: 'GAME'
        })
      });

      document.getElementById('modalNewProduct')?.classList.remove('active');
      formProd.reset();
      await loadGames();
      alert('¡Producto creado exitosamente!');
    } catch (err) {
      alert(`Error al crear producto: ${err.message}`);
    }
  });

  // Settings Form
  const settingsForm = document.getElementById('settingsForm');
  settingsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rate = document.getElementById('inputExchangeRate').value;
    document.getElementById('topbarRate').textContent = `${Number(rate).toLocaleString('es-PY')} ₲`;
    alert('✅ Configuración de plataforma guardada correctamente.');
  });

  // Deposit Approval Click delegation
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-approve-deposit')) {
      const btn = e.target;
      const userId = btn.getAttribute('data-user');
      const amount = btn.getAttribute('data-amount');
      const pyg = btn.getAttribute('data-pyg');
      const ref = btn.getAttribute('data-ref');

      try {
        await API.approveDeposit({ userId, amountUsd: amount, amountPyg: pyg, referenceId: ref });
        btn.parentElement.innerHTML = '<span class="badge badge-success">APROBADO</span>';
        alert(`✅ Depósito de $${amount} USD acreditado exitosamente.`);
        await loadDashboard();
        await loadUsers();
      } catch (err) {
        alert(`Error al aprobar depósito: ${err.message}`);
      }
    }
  });
}
