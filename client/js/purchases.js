// GamesBoy.net - Dedicated Purchases & Real Group Chat Engine (purchases.js)

const state = {
  currentUser: JSON.parse(localStorage.getItem('gb_user') || 'null'),
  vaultSlots: [],
  storeOrders: [],
  smmOrders: [],
  activeChatSubId: null,
  chatPollInterval: null,
  exchangeRatePyg: 7500
};

// Format currency
function formatPriceGs(amountUsd) {
  const rate = state.exchangeRatePyg || 7500;
  const pyg = Math.round((parseFloat(amountUsd) || 0) * rate);
  return `${pyg.toLocaleString('es-PY')} Gs.`;
}

// Format relative date
function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
}

// Initialize Page
async function initPurchasesPage() {
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
    state.smmOrders = Array.isArray(smmOrders) ? smmOrders : (smmOrders.orders || []);

    renderPurchasesList();
  } catch (err) {
    console.error('Error fetching purchases vault:', err);
    showToast('error', 'Error de Conexión', 'No se pudo conectar con el servidor.');
  }
}

// Render Unauthenticated View
function renderUnauthenticatedView() {
  const container = document.getElementById('purchases-vault-container');
  if (!container) return;

  container.innerHTML = `
    <div style="background: rgba(16, 20, 32, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 3rem 1.5rem; text-align: center; max-width: 600px; margin: 2rem auto;">
      <div style="font-size: 2.5rem; margin-bottom: 12px;">🔒</div>
      <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
        Inicia sesión para ver tus compras
      </h2>
      <p style="font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
        Accede a tu cuenta para consultar tus perfiles asignados, PINs, credenciales y conversar en el chat grupal con tu anfitrión.
      </p>
      <a href="/login" class="btn-confirm-escrow" style="display: inline-block; text-decoration: none; padding: 12px 28px;">
        Iniciar Sesión en GamesBoy ➔
      </a>
    </div>
  `;
}

// Render Purchases List
function renderPurchasesList() {
  const container = document.getElementById('purchases-vault-container');
  if (!container) return;

  const totalItems = state.vaultSlots.length + state.storeOrders.length + state.smmOrders.length;

  if (totalItems === 0) {
    container.innerHTML = `
      <div style="background: rgba(16, 20, 32, 0.7); border: 1px solid var(--border-medium); border-radius: 18px; padding: 3rem 1.5rem; text-align: center;">
        <div style="font-size: 2.2rem; margin-bottom: 10px;">📦</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
          No tienes suscripciones ni compras activas
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">
          Explora nuestro catálogo oficial de plataformas de streaming, cuentas compartidas y videojuegos digitales con Garantía de Reembolso.
        </p>
        <a href="/" class="btn-confirm-escrow" style="display: inline-block; text-decoration: none; padding: 10px 24px;">
          Explorar Catálogo ➔
        </a>
      </div>
    `;
    return;
  }

  let html = '';

  // 1. Digital Store Orders (Games & Gift Cards)
  if (state.storeOrders.length > 0) {
    html += `
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1rem;">
          <span style="font-size: 1.1rem;">🎮</span>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0;">
            Mis Videojuegos & Tarjetas de Regalo (${state.storeOrders.length})
          </h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
    `;

    html += state.storeOrders.map(order => {
      const isDelivered = order.status === 'delivered';
      const codeOrCreds = order.credentials || order.code || 'En preparación (Entrega en minutos)';
      
      return `
        <div class="purchase-card-modern" style="border-color: ${isDelivered ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="hub-badge-quality" style="background: rgba(0, 194, 255, 0.15); color: var(--accent-cyan); border: 1px solid rgba(0, 194, 255, 0.3);">
                  ${order.option || order.platform || 'Digital'}
                </span>
                <span style="font-size: 0.72rem; color: var(--text-tertiary); font-family: var(--font-mono);">ID: ${order.id}</span>
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: #ffffff; margin: 0;">
                ${order.productTitle || order.title}
              </h3>
            </div>
            
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; background: ${isDelivered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${isDelivered ? '#34d399' : '#fbbf24'}; border: 1px solid ${isDelivered ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'};">
                ${isDelivered ? '✓ Entregado' : '⏳ En Preparación'}
              </span>
              <div style="font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: #94a3b8; margin-top: 4px;">
                ${(order.pricePaidPyg || 0).toLocaleString('es-PY')} Gs.
              </div>
            </div>
          </div>

          <!-- Credential / Code Delivery Box -->
          <div class="vault-creds-box" style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;">
            <div style="font-size: 0.72rem; color: var(--text-tertiary); font-weight: 800; text-transform: uppercase; margin-bottom: 6px;">
              ${order.type === 'giftcard' ? 'Código Digital Canjeable:' : 'Credenciales / Acceso Asignado:'}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
              <code style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 800; color: ${isDelivered ? '#34d399' : '#fbbf24'}; word-break: break-all;">
                ${codeOrCreds}
              </code>
              ${isDelivered ? `
                <button type="button" class="btn-hub-monetize" style="width: auto; padding: 6px 14px; font-size: 0.75rem;" onclick="navigator.clipboard.writeText('${codeOrCreds}'); alert('¡Datos copiados al portapapeles!');">
                  Copiar Datos
                </button>
              ` : ''}
            </div>
          </div>

          ${order.instructions ? `
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 0 0;">
              💡 <strong>Instrucciones:</strong> ${order.instructions}
            </p>
          ` : ''}
        </div>
      `;
    }).join('');

    html += `
        </div>
      </div>
    `;
  }

  // 2. Streaming Subscriptions & Slots
  if (state.vaultSlots.length > 0) {
    html += `
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1rem;">
          <span style="font-size: 1.1rem;">📺</span>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0;">
            Mis Suscripciones de Streaming Activas (${state.vaultSlots.length})
          </h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
    `;

    html += state.vaultSlots.map(slot => {
      const rawCreds = slot.credentials || 'N/A';
      const credParts = rawCreds.split(':::');
      const userOrUrl = credParts[0] || rawCreds;
      const passOrNote = credParts[1] || '';
      const isUrl = userOrUrl.startsWith('http');

      const days = slot.daysRemaining !== undefined ? slot.daysRemaining : 30;
      const isDiscount = slot.eligibleForDiscount;

      return `
        <div class="purchase-card-modern">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="hub-badge-quality" style="background: rgba(0, 194, 255, 0.2); color: var(--accent-cyan); border: 1px solid rgba(0, 194, 255, 0.35);">
                  Perfil Asignado #${slot.slotNumber || 1}
                </span>
                <span class="hub-badge-refund">🛡️ Garantía de Reembolso Activa</span>
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 900; color: #ffffff; margin: 0;">
                ${slot.serviceName}
              </h3>
            </div>

            <div style="text-align: right;">
              <span style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase;">Estado del Servicio</span>
              <div style="font-family: var(--font-heading); font-size: 0.92rem; font-weight: 800; color: ${days <= 3 ? '#fbbf24' : '#34d399'};">
                ⏱️ ${days} días restantes
              </div>
            </div>
          </div>

          <!-- Credentials Vault Box -->
          <div class="vault-creds-box">
            <div style="flex: 1; min-width: 240px;">
              <div style="font-size: 0.72rem; color: var(--text-tertiary); font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">
                ${isUrl ? 'Enlace de Activación / Invitación' : 'Credenciales de Acceso Oficiales'}
              </div>
              
              ${isUrl ? `
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="text" readonly value="${userOrUrl}" class="chat-input-field" style="padding: 6px 10px; font-size: 0.8rem; background: rgba(0,0,0,0.5);" id="cred-input-${slot.id}">
                  <button type="button" class="btn-hub-monetize" style="width: auto; padding: 6px 12px; font-size: 0.75rem;" onclick="navigator.clipboard.writeText('${userOrUrl}'); alert('Enlace copiado');">
                    Copiar Link
                  </button>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="font-family: var(--font-mono); font-size: 0.82rem; color: #ffffff;">
                    <strong>Usuario / Email:</strong> <span style="color: var(--accent-cyan);">${userOrUrl}</span>
                  </div>
                  ${passOrNote ? `
                    <div style="font-family: var(--font-mono); font-size: 0.82rem; color: #ffffff;">
                      <strong>Contraseña:</strong> <span style="color: var(--accent-cyan);">${passOrNote}</span>
                    </div>
                  ` : ''}
                </div>
              `}
            </div>

            <div style="border-left: 1px solid rgba(255,255,255,0.1); padding-left: 14px; min-width: 140px;">
              <div style="font-size: 0.72rem; color: var(--text-tertiary); font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">
                Tu PIN de Perfil
              </div>
              <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 900; color: #34d399; letter-spacing: 0.05em;">
                ${slot.assignedPin || 'N/A'}
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 6px 0 14px 0; line-height: 1.4;">
            💡 <strong>Instrucciones:</strong> ${slot.instructions || 'Usa exclusivamente tu perfil asignado y no modifiques contraseñas.'}
          </p>

          <!-- Actions: Real Group Chat & Early Renewal -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 12px;">
            <button type="button" class="btn-open-real-chat" onclick="openRealGroupChat('${slot.subscriptionId}', '${slot.serviceName}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>Abrir Chat Grupal con Anfitrión</span>
            </button>

            <button type="button" class="btn-confirm-escrow" style="width: auto; padding: 8px 18px; font-size: 0.82rem;" onclick="handleRenewSlot('${slot.subscriptionId}')">
              ${isDiscount ? '🔥 Renovar Anticipado (-5% OFF)' : '🔄 Renovar 30 Días'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    html += `
        </div>
      </div>
    `;
  }

  // 3. Crecimiento en Redes Sociales (Seguidores, Likes, Vistas & Miembros)
  if (state.smmOrders.length > 0) {
    html += `
      <div style="margin-top: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.1rem;">📈</span>
            <h2 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0;">
              Crecimiento en Redes Sociales (${state.smmOrders.length})
            </h2>
          </div>
          <span style="font-size: 0.74rem; color: #c084fc; background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.3); padding: 3px 10px; border-radius: 9999px; font-weight: 700;">
            Entrega Garantizada 24 a 48 hs
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 14px;">
    `;

    html += state.smmOrders.map(order => {
      const isCompleted = order.status === 'completed';
      const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      const targetUrl = order.link ? (order.link.startsWith('http') ? order.link : 'https://' + order.link) : '#';

      // Platform badge style & icon
      let platBadge = 'background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3);';
      let platIcon = '📈';
      const pLower = (order.platform || '').toLowerCase();
      if (pLower.includes('instagram')) {
        platBadge = 'background: linear-gradient(135deg, rgba(225,48,108,0.2) 0%, rgba(131,58,180,0.2) 100%); color: #f472b6; border: 1px solid rgba(244,114,182,0.4);';
        platIcon = '📸';
      } else if (pLower.includes('tiktok')) {
        platBadge = 'background: rgba(0,242,254,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3);';
        platIcon = '🎵';
      } else if (pLower.includes('youtube')) {
        platBadge = 'background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3);';
        platIcon = '▶️';
      } else if (pLower.includes('telegram')) {
        platBadge = 'background: rgba(14,165,233,0.15); color: #38bdf8; border: 1px solid rgba(14,165,233,0.3);';
        platIcon = '✈️';
      }

      return `
        <div class="purchase-card-modern" style="border-color: ${isCompleted ? 'rgba(16, 185, 129, 0.35)' : 'rgba(168, 85, 247, 0.35)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="hub-badge-quality" style="${platBadge}">
                  ${platIcon} ${order.platform || 'Red Social'}
                </span>
                <span style="font-size: 0.72rem; color: var(--text-tertiary); font-family: var(--font-mono);">ID: ${order.id}</span>
                <span style="font-size: 0.72rem; color: var(--text-tertiary);">${dateStr}</span>
              </div>
              <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: #ffffff; margin: 0;">
                ${order.serviceName || order.serviceTitle}
              </h3>
            </div>

            <div style="text-align: right;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; background: ${isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${isCompleted ? '#34d399' : '#fbbf24'}; border: 1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'};">
                ${isCompleted ? '✓ Completado' : '⏳ En Preparación'}
              </span>
              <div style="font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: #94a3b8; margin-top: 4px;">
                ${(order.pricePaidPyg || 0).toLocaleString('es-PY')} Gs.
              </div>
              ${!isCompleted ? `
                <div style="font-size: 0.68rem; color: #fbbf24; font-weight: 700; margin-top: 2px;">
                  Plazo de entrega: 24 a 48 horas
                </div>
              ` : `
                <div style="font-size: 0.68rem; color: #34d399; font-weight: 700; margin-top: 2px;">
                  ✓ Acreditado en tu perfil
                </div>
              `}
            </div>
          </div>

          <!-- Target URL and details -->
          <div class="vault-creds-box" style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;">
            <div style="font-size: 0.72rem; color: var(--text-tertiary); font-weight: 800; text-transform: uppercase; margin-bottom: 6px;">
              Enlace / Perfil Destino:
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
              <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="font-family: var(--font-mono); font-size: 0.88rem; font-weight: 700; color: var(--accent-cyan); text-decoration: none; word-break: break-all;">
                🔗 ${order.link}
              </a>
              <button type="button" class="btn-hub-monetize" style="width: auto; padding: 6px 14px; font-size: 0.75rem;" onclick="navigator.clipboard.writeText('${order.link}'); alert('¡Enlace copiado al portapapeles!');">
                Copiar Enlace
              </button>
            </div>
          </div>

          <!-- Notice banner -->
          <div style="background: ${isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(168, 85, 247, 0.08)'}; border: 1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(168, 85, 247, 0.2)'}; border-radius: 8px; padding: 10px 12px;">
            <p style="font-size: 0.78rem; color: ${isCompleted ? '#a7f3d0' : '#e9d5ff'}; margin: 0; line-height: 1.4;">
              ${isCompleted 
                ? '🎉 <strong>¡Servicio Entregado!</strong> Los seguidores o interacciones han sido cargados con éxito. Gracias por confiar en GamesBoy.' 
                : '⏳ <strong>Servicio en Proceso:</strong> Tu pedido está siendo preparado y la carga progresiva se realizará en un <strong>plazo de 24 a 48 horas</strong>. Recuerda mantener tu perfil o publicación en modo público.'}
            </p>
          </div>
        </div>
      `;
    }).join('');

    html += `
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// --- REAL GROUP CHAT CONTROLLER ---
window.openRealGroupChat = async function(subId, serviceName = 'Suscripción') {
  state.activeChatSubId = subId;

  const modal = document.getElementById('modal-real-group-chat');
  const title = document.getElementById('chat-sub-title');
  const badge = document.getElementById('chat-sub-badge');

  if (title) title.textContent = `Chat del Grupo: ${serviceName}`;
  if (badge) badge.textContent = `Membresía Activa`;
  if (modal) modal.style.display = 'grid';

  await loadChatMessages(subId);

  // Start polling while chat is open
  if (state.chatPollInterval) clearInterval(state.chatPollInterval);
  state.chatPollInterval = setInterval(() => {
    if (state.activeChatSubId) {
      loadChatMessages(state.activeChatSubId, true);
    }
  }, 4000);
};

window.closeRealGroupChat = function() {
  const modal = document.getElementById('modal-real-group-chat');
  if (modal) modal.style.display = 'none';
  state.activeChatSubId = null;
  if (state.chatPollInterval) {
    clearInterval(state.chatPollInterval);
    state.chatPollInterval = null;
  }
};

async function loadChatMessages(subId, silent = false) {
  try {
    const res = await fetch(`/api/subscriptions/${subId}/group`, {
      headers: { 'x-user-id': state.currentUser?.id }
    });
    const data = await res.json();

    if (data.success && data.group) {
      renderChatMembers(data.group.members || []);
      renderChatMessages(data.group.chatMessages || [], silent);
    }
  } catch (err) {
    if (!silent) console.error('Error loading chat:', err);
  }
}

function renderChatMembers(members) {
  const container = document.getElementById('chat-members-list');
  if (!container) return;

  container.innerHTML = members.map(m => `
    <div class="chat-member-item ${m.isOwner ? 'owner' : ''}">
      <span style="font-size: 1.1rem;">${m.avatar || (m.isOwner ? '👑' : '🎮')}</span>
      <div style="flex: 1; min-width: 0;">
        <strong style="display: block; font-size: 0.78rem; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${m.name} ${m.id === state.currentUser?.id ? '(Tú)' : ''}
        </strong>
        <span style="font-size: 0.68rem; color: ${m.isOwner ? 'var(--accent-cyan)' : 'var(--text-tertiary)'};">
          ${m.role}
        </span>
      </div>
    </div>
  `).join('');
}

function renderChatMessages(messages, silent = false) {
  const container = document.getElementById('chat-messages-list');
  if (!container) return;

  const currentUserId = state.currentUser?.id;

  container.innerHTML = messages.map(msg => {
    if (msg.isSystem) {
      return `
        <div class="chat-msg-bubble system">
          ${msg.text}
        </div>
      `;
    }

    const isOutgoing = msg.senderId === currentUserId;

    return `
      <div class="chat-msg-bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
        <div style="display: flex; justify-content: space-between; gap: 8px; margin-bottom: 2px; font-size: 0.7rem; opacity: 0.8;">
          <strong>${isOutgoing ? 'Tú' : msg.senderName} ${msg.isOwnerAdmin ? '👑' : ''}</strong>
          <span>${formatRelativeTime(msg.timestamp)}</span>
        </div>
        <div>${escapeHtml(msg.text)}</div>
      </div>
    `;
  }).join('');

  if (!silent) {
    container.scrollTop = container.scrollHeight;
  }
}

// Send Message
window.handleSendChatMessage = async function(e) {
  e.preventDefault();
  const input = document.getElementById('input-chat-message');
  const text = input ? input.value.trim() : '';

  if (!text || !state.activeChatSubId || !state.currentUser) return;

  const btn = document.getElementById('btn-send-message');
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`/api/subscriptions/${state.activeChatSubId}/group/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': state.currentUser.id
      },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    if (data.success) {
      input.value = '';
      await loadChatMessages(state.activeChatSubId);
      const container = document.getElementById('chat-messages-list');
      if (container) container.scrollTop = container.scrollHeight;
    } else {
      showToast('error', 'Error al Enviar', data.error || 'No se pudo enviar el mensaje.');
    }
  } catch (err) {
    showToast('error', 'Error de Red', 'No se pudo enviar el mensaje.');
  } finally {
    if (btn) btn.disabled = false;
  }
};

// Handle Renewal
window.handleRenewSlot = async function(subId) {
  if (!state.currentUser) return;

  try {
    const res = await fetch(`/api/subscriptions/${subId}/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': state.currentUser.id
      }
    });

    const data = await res.json();
    if (data.success) {
      showToast('success', '¡Renovación Exitosa!', data.message || 'Tu membresía ha sido renovada por 30 días más.');
      await loadPurchasesVault();
    } else {
      showToast('error', 'No se pudo renovar', data.error || 'Saldo insuficiente o error.');
    }
  } catch (err) {
    showToast('error', 'Error', 'Ocurrió un error al procesar la renovación.');
  }
};

// Copy helper
window.copyToClipboard = function(text, successMsg = 'Copiado al portapapeles') {
  navigator.clipboard.writeText(text).then(() => {
    showToast('info', 'Portapapeles', successMsg);
  }).catch(() => {
    showToast('info', 'Portapapeles', text);
  });
};

// Event Listeners
function setupEventListeners() {
  const btnCloseChat = document.getElementById('btn-close-chat-modal');
  if (btnCloseChat) btnCloseChat.onclick = window.closeRealGroupChat;

  const btnOpenDeposit = document.getElementById('btn-open-deposit-modal');
  const modalDeposit = document.getElementById('modal-deposit');
  const btnCloseDeposit = document.getElementById('btn-close-deposit-modal');

  if (btnOpenDeposit && modalDeposit) {
    btnOpenDeposit.onclick = () => { modalDeposit.style.display = 'grid'; };
  }
  if (btnCloseDeposit && modalDeposit) {
    btnCloseDeposit.onclick = () => { modalDeposit.style.display = 'none'; };
  }
}

// User Session & Balance
function initUserSession() {
  const unloggedGroup = document.getElementById('auth-unlogged-group');
  const loggedGroup = document.getElementById('auth-logged-group');
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatarImg = document.getElementById('nav-user-avatar-img');
  const dropdownUserName = document.getElementById('dropdown-user-name');
  const dropdownUserEmail = document.getElementById('dropdown-user-email');
  const dropdownUserAvatarImg = document.getElementById('dropdown-user-avatar-img');

  const updateUserDisplay = (user) => {
    if (!user) return;
    if (navUserName) navUserName.textContent = user.name || 'Usuario';
    if (dropdownUserName) dropdownUserName.textContent = user.name || 'Usuario';
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || 'usuario@gamesboy.net';

    const avatarSrc = (user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/assets'))) 
      ? user.avatar 
      : '/assets/branding/icon.png';

    if (navUserAvatarImg) navUserAvatarImg.src = avatarSrc;
    if (dropdownUserAvatarImg) dropdownUserAvatarImg.src = avatarSrc;

    const roleBadge = document.querySelector('.user-role-badge');
    const adminMenu = document.getElementById('menu-item-admin-container');
    if (user.role === 'admin') {
      if (roleBadge) {
        roleBadge.textContent = 'Administrador Master';
        roleBadge.style.color = '#f59e0b';
      }
      if (adminMenu) adminMenu.style.display = 'block';
    } else if (user.role === 'seller') {
      if (roleBadge) {
        roleBadge.textContent = 'Vendedor Verificado';
        roleBadge.style.color = '#34d399';
      }
      if (adminMenu) adminMenu.style.display = 'none';
    } else {
      if (roleBadge) {
        roleBadge.textContent = 'Cliente Verificado';
        roleBadge.style.color = '#00c2ff';
      }
      if (adminMenu) adminMenu.style.display = 'none';
    }
  };

  if (state.currentUser && (state.currentUser.id || state.currentUser.name)) {
    if (unloggedGroup) {
      unloggedGroup.classList.add('is-hidden');
      unloggedGroup.style.display = 'none';
    }
    if (loggedGroup) {
      loggedGroup.classList.remove('is-hidden');
      loggedGroup.style.removeProperty('display');
      loggedGroup.style.display = 'inline-flex';
    }
    updateUserDisplay(state.currentUser);
    updateUserBalance();

    // Fetch latest profile to keep session fresh
    fetch('/api/auth/profile', { headers: { 'x-user-id': state.currentUser.id } })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          state.currentUser = { ...state.currentUser, ...data.user, balanceUsd: data.balanceUsd };
          localStorage.setItem('gb_user', JSON.stringify(state.currentUser));
          updateUserDisplay(state.currentUser);
          updateUserBalance();
        }
      })
      .catch(() => {});
  } else {
    if (unloggedGroup) {
      unloggedGroup.classList.remove('is-hidden');
      unloggedGroup.style.removeProperty('display');
      unloggedGroup.style.display = 'inline-flex';
    }
    if (loggedGroup) {
      loggedGroup.classList.add('is-hidden');
      loggedGroup.style.display = 'none';
    }
  }

  // Profile dropdown toggle
  const btnToggle = document.getElementById('btn-user-profile-toggle');
  const menu = document.getElementById('user-profile-dropdown-menu');
  const wrapper = document.getElementById('user-profile-wrapper');

  if (btnToggle && menu && wrapper) {
    btnToggle.onclick = (e) => {
      e.stopPropagation();
      const isOpen = menu.style.display === 'block';
      menu.style.display = isOpen ? 'none' : 'block';
      wrapper.classList.toggle('open', !isOpen);
    };

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        menu.style.display = 'none';
        wrapper.classList.remove('open');
      }
    });
  }

  const btnLogout = document.getElementById('btn-header-logout');
  if (btnLogout) {
    btnLogout.onclick = () => {
      localStorage.removeItem('gb_user');
      localStorage.removeItem('gb_token');
      window.location.href = '/';
    };
  }

  const btnOpenDeposit = document.getElementById('btn-open-deposit-modal');
  const modalDeposit = document.getElementById('modal-deposit');
  if (btnOpenDeposit && modalDeposit) {
    btnOpenDeposit.onclick = () => { modalDeposit.style.display = 'grid'; };
  }
}

async function updateUserBalance() {
  if (!state.currentUser) return;
  const balanceEl = document.getElementById('nav-user-balance-amount');

  try {
    const res = await fetch('/api/wallet/balance', {
      headers: { 'x-user-id': state.currentUser.id }
    });
    const data = await res.json();
    if (data.wallet && data.wallet.balanceUsd !== undefined) {
      if (state.currentUser) {
        state.currentUser.balanceUsd = data.wallet.balanceUsd;
        localStorage.setItem('gb_user', JSON.stringify(state.currentUser));
      }
    }
    if (data.exchangeRatePyg) state.exchangeRatePyg = data.exchangeRatePyg;
  } catch (e) {}

  const rate = state.exchangeRatePyg || 7500;
  const balUsd = state.currentUser?.balanceUsd || 0;
  const balPyg = Math.round(balUsd * rate);

  if (balanceEl) balanceEl.textContent = `${balPyg.toLocaleString('es-PY')} Gs.`;
}

// Helpers
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(type = 'info', title = '', message = '', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;

  const icons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div style="flex: 1; min-width: 0;">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-msg">${message}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Cerrar">✕</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  };

  closeBtn.onclick = removeToast;
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

// WebSocket Real-time Listener for Purchases Vault
function initPurchasesWebSocket() {
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'SMM_ORDER_COMPLETED') {
          const order = msg.payload?.order;
          if (order && state.currentUser && order.userId === state.currentUser.id) {
            showToast('success', '¡Servicio Entregado!', `Tu orden #${order.id} (${order.serviceName}) ha sido completada con éxito.`);
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
document.addEventListener('DOMContentLoaded', initPurchasesPage);
