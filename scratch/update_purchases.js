import fs from 'fs';

let content = fs.readFileSync('client/js/purchases.js', 'utf8').replace(/\r\n/g, '\n');

// 1. Update state
content = content.replace(
`const state = {
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  vaultSlots: [],
  storeOrders: [],
  activeChatSubId: null,
  chatPollInterval: null,
  exchangeRatePyg: 7500
};`,
`const state = {
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  vaultSlots: [],
  storeOrders: [],
  smmOrders: [],
  activeChatSubId: null,
  chatPollInterval: null,
  exchangeRatePyg: 7500
};`
);

// 2. Update initPurchasesPage and loadPurchasesVault
content = content.replace(
`async function initPurchasesPage() {
  initUserSession();

  if (!state.currentUser) {
    renderUnauthenticatedView();
    return;
  }

  setupEventListeners();
  await loadPurchasesVault();
}

// Load Purchases from API
async function loadPurchasesVault() {
  try {
    const headers = { 'x-user-id': state.currentUser.id };

    const [slotsRes, ordersRes] = await Promise.all([
      fetch('/api/subscriptions/my-vault', { headers }),
      fetch('/api/store/my-orders', { headers })
    ]);

    const slots = await slotsRes.json();
    const orders = await ordersRes.json();

    state.vaultSlots = Array.isArray(slots) ? slots : [];
    state.storeOrders = Array.isArray(orders) ? orders : [];

    renderPurchasesList();
  } catch (err) {
    console.error('Error fetching purchases vault:', err);
    showToast('error', 'Error de Conexión', 'No se pudo conectar con el servidor.');
  }
}`,
`async function initPurchasesPage() {
  initUserSession();

  if (!state.currentUser) {
    renderUnauthenticatedView();
    return;
  }

  setupEventListeners();
  initPurchasesWebSocket();
  await loadPurchasesVault();
}

// Load Purchases from API
async function loadPurchasesVault() {
  try {
    const headers = { 'x-user-id': state.currentUser.id };

    const [slotsRes, ordersRes, smmRes] = await Promise.all([
      fetch('/api/subscriptions/my-vault', { headers }),
      fetch('/api/store/my-orders', { headers }),
      fetch('/api/smm/my-orders', { headers })
    ]);

    const slots = await slotsRes.json();
    const orders = await ordersRes.json();
    const smmOrders = await smmRes.json();

    state.vaultSlots = Array.isArray(slots) ? slots : [];
    state.storeOrders = Array.isArray(orders) ? orders : [];
    state.smmOrders = Array.isArray(smmOrders) ? smmOrders : [];

    renderPurchasesList();
  } catch (err) {
    console.error('Error fetching purchases vault:', err);
    showToast('error', 'Error de Conexión', 'No se pudo conectar con el servidor.');
  }
}`
);

// 3. Update totalItems count
content = content.replace(
  'const totalItems = state.vaultSlots.length + state.storeOrders.length;',
  'const totalItems = state.vaultSlots.length + state.storeOrders.length + state.smmOrders.length;'
);

// 4. Add WebSocket listener at the end
content = content.replace(
`// DOM Load
document.addEventListener('DOMContentLoaded', initPurchasesPage);`,
`// WebSocket Real-time Listener for Purchases Vault
function initPurchasesWebSocket() {
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'SMM_ORDER_COMPLETED') {
          const order = msg.payload?.order;
          if (order && state.currentUser && order.userId === state.currentUser.id) {
            showToast('success', '¡Servicio Entregado!', \`Tu orden #\${order.id} (\${order.serviceName}) ha sido completada con éxito.\`);
            loadPurchasesVault();
          }
        }
      } catch (err) {}
    };

    socket.onclose = () => {
      setTimeout(initPurchasesWebSocket, 5000);
    };
  } catch (e) {}
}

// DOM Load
document.addEventListener('DOMContentLoaded', initPurchasesPage);`
);

fs.writeFileSync('client/js/purchases.js', content, 'utf8');
console.log('✅ client/js/purchases.js updated successfully!');
