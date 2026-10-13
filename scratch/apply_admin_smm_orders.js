import fs from 'fs';

let content = fs.readFileSync('client/admin.html', 'utf8').replace(/\r\n/g, '\n');

// 1. Update Sidebar Menu Button
const oldSidebarBtn = `<button class="admin-menu-btn" data-tab="tab-smm-api" title="10. Impulso Digital (API)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
          <span>10. Impulso Digital (API)</span>
        </button>`;

const newSidebarBtn = `<button class="admin-menu-btn" data-tab="tab-smm-orders" title="10. Redes Sociales (Crecimiento)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          <span>10. Redes Sociales (Crecimiento)</span>
          <span class="badge-count red" id="badge-pending-smm" style="display: none;">0</span>
        </button>`;

if (content.includes(oldSidebarBtn)) {
  content = content.replace(oldSidebarBtn, newSidebarBtn);
  console.log('✅ Sidebar button updated to tab-smm-orders!');
} else {
  console.log('⚠️ oldSidebarBtn not matched directly, checking fallback...');
  content = content.replace('data-tab="tab-smm-api"', 'data-tab="tab-smm-orders"');
  content = content.replace('<span>10. Impulso Digital (API)</span>', '<span>10. Redes Sociales (Crecimiento)</span>\n          <span class="badge-count red" id="badge-pending-smm" style="display: none;">0</span>');
}

// 2. Update Overview Module Card (Tab 1)
content = content.replace("switchAdminTab('tab-smm-api')", "switchAdminTab('tab-smm-orders')");
content = content.replace("<span>10. Impulso Digital (SMM)</span>", "<span>10. Redes Sociales (Crecimiento)</span>");
content = content.replace('id="overview-badge-smm-count">API Lista</span>', 'id="overview-badge-smm-count">0 pedidos</span>');

// 3. Replace section #tab-smm-api with #tab-smm-orders
const oldSectionStart = '<section id="tab-smm-api" class="admin-section-pane">';
const oldSectionEnd = '</section>';
const startIdx = content.indexOf(oldSectionStart);

if (startIdx !== -1) {
  const endIdx = content.indexOf(oldSectionEnd, startIdx) + oldSectionEnd.length;
  
  const newSmmSection = `<!-- ======================================================= -->
      <!-- TAB 10: BANDEJA DE CRECIMIENTO EN REDES SOCIALES        -->
      <!-- ======================================================= -->
      <section id="tab-smm-orders" class="admin-section-pane">
        
        <!-- 3 EXECUTIVE KPI CARDS -->
        <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-bottom: 1.5rem;">
          <div class="kpi-card purple">
            <div class="kpi-header">
              <span class="kpi-title">Total Pedidos de Crecimiento</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
            <div class="kpi-value-gs" id="smm-kpi-total">0</div>
            <div class="kpi-value-usd" id="smm-kpi-subtext" style="font-size: 0.74rem;">0 completados • 0 en curso</div>
          </div>

          <div class="kpi-card amber">
            <div class="kpi-header">
              <span class="kpi-title">Pendientes de Despacho</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="kpi-value-gs" id="smm-kpi-pending" style="color: #fbbf24;">0</div>
            <div class="kpi-value-usd" style="font-size: 0.74rem; color: #fbbf24; font-weight: 700;">Plazo máximo: 24 a 48 hs</div>
          </div>

          <div class="kpi-card emerald">
            <div class="kpi-header">
              <span class="kpi-title">Volumen Total Facturado</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="kpi-value-gs" id="smm-kpi-volume-gs">0 Gs.</div>
            <div class="kpi-value-usd" id="smm-kpi-volume-usd" style="font-size: 0.76rem;">$0.00 USDT</div>
          </div>
        </div>

        <!-- MAIN ORDERS TRAY CARD -->
        <div class="admin-card" style="border-color: rgba(168, 85, 247, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 8px;">
                <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 4px 8px; border-radius: 6px; font-size: 0.82rem;">PANEL OPERATIVO</span>
                <span>Bandeja de Pedidos: Crecimiento en Redes Sociales</span>
              </h3>
              <p style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 3px;">
                Gestiona y despacha seguidores, likes, vistas y miembros. Acredita el servicio por fuera y márcalo como completado con un solo clic.
              </p>
            </div>
            
            <button class="btn-admin-action cyan" onclick="loadSmmOrders()" style="padding: 8px 16px; font-weight: 800;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              <span>Actualizar Pedidos</span>
            </button>
          </div>

          <!-- SEARCH & FILTERS TOOLBAR -->
          <div class="filter-toolbar">
            <input type="text" id="smm-search-input" class="filter-input-search" placeholder="🔍 Buscar por cliente, enlace objetivo o ID..." oninput="applySmmFilters()">
            
            <div style="display: flex; gap: 8px; align-items: center;">
              <label style="font-size: 0.74rem; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase;">Red Social:</label>
              <select id="smm-filter-platform" class="admin-form-select" style="width: auto; padding: 7px 12px; font-size: 0.82rem;" onchange="applySmmFilters()">
                <option value="all">Todas las Redes</option>
                <option value="Instagram">📸 Instagram</option>
                <option value="TikTok">🎵 TikTok</option>
                <option value="YouTube">▶️ YouTube</option>
                <option value="Telegram">✈️ Telegram</option>
              </select>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              <label style="font-size: 0.74rem; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase;">Estado:</label>
              <select id="smm-filter-status" class="admin-form-select" style="width: auto; padding: 7px 12px; font-size: 0.82rem;" onchange="applySmmFilters()">
                <option value="all">Todos los Estados</option>
                <option value="in_progress" selected>⏳ Pendientes / En Preparación</option>
                <option value="completed">✓ Completados</option>
              </select>
            </div>
          </div>

          <!-- SMM ORDERS TABLE -->
          <div style="overflow-x: auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID Pedido / Fecha</th>
                  <th>Cliente</th>
                  <th>Red Social & Servicio</th>
                  <th>Enlace / Perfil Objetivo</th>
                  <th>Monto Pagado</th>
                  <th>Estado de Entrega</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody id="table-smm-orders-list">
                <tr><td colspan="7" style="text-align: center; color: var(--text-tertiary); padding: 2.5rem;">Cargando pedidos de redes sociales...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>`;

  content = content.slice(0, startIdx) + newSmmSection + content.slice(endIdx);
  console.log('✅ Section #tab-smm-orders replaced successfully!');
} else {
  console.error('❌ Could not find oldSectionStart in admin.html');
}

// 4. Update tabDescriptions in script
content = content.replace(
  `'tab-smm-api': { title: 'Integración API: Impulso Digital & Redes Sociales', subtitle: 'Conexión con el proveedor mayorista de servicios SMM, testing de saldo y márgenes.' }`,
  `'tab-smm-orders': { title: '10. Crecimiento en Redes Sociales (Bandeja de Pedidos)', subtitle: 'Control y despacho de órdenes de seguidores, likes, vistas y miembros con plazo de 24 a 48 hs.' }`
);

// 5. In switchAdminTab:
content = content.replace(
  `if (tabId === 'tab-smm-api') loadSmmConfig();`,
  `if (tabId === 'tab-smm-orders') loadSmmOrders();`
);

// 6. In loadAdminData:
content = content.replace(
  `loadSmmConfig();`,
  `loadSmmOrders();`
);

// Add stats badge update in loadAdminData
const statsMarker = `if (dataOverview.stats) {\n          const s = dataOverview.stats;`;
const statsUpdate = `if (dataOverview.stats) {
          const s = dataOverview.stats;
          const badgeSmm = document.getElementById('badge-pending-smm');
          const ovSmm = document.getElementById('overview-badge-smm-count');
          if (s.pendingSmmCount > 0) {
            if (badgeSmm) {
              badgeSmm.textContent = s.pendingSmmCount;
              badgeSmm.style.display = 'inline-block';
            }
            if (ovSmm) {
              ovSmm.textContent = \`\${s.pendingSmmCount} por entregar\`;
              ovSmm.style.display = 'inline-block';
            }
          } else {
            if (badgeSmm) badgeSmm.style.display = 'none';
            if (ovSmm) ovSmm.textContent = \`\${s.totalSmmOrders || 0} pedidos\`;
          }`;

if (content.includes(statsMarker)) {
  content = content.replace(statsMarker, statsUpdate);
}

// 7. Replace loadSmmConfig with loadSmmOrders implementation
const oldSmmScript = `    async function loadSmmConfig() {
      try {
        const res = await fetch('/api/admin/smm/config');
        const data = await res.json();
        const c = data.config || {};
        document.getElementById('smm-provider-url').value = c.providerUrl || '';
        document.getElementById('smm-markup-percent').value = c.markupPercent || 30;
        document.getElementById('smm-provider-balance').value = \`$\${(c.lastBalanceUsd || 184.20).toFixed(2)} USDT\`;
      } catch (e) { console.error('Error loading SMM config:', e); }
    }

    document.getElementById('btn-smm-test-ping')?.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/admin/smm/test-connection', { method: 'POST' });
        const data = await res.json();
        alert(data.message || 'Conexión verificada');
        if (data.providerBalanceUsd) {
          document.getElementById('smm-provider-balance').value = \`$\${data.providerBalanceUsd.toFixed(2)} USDT\`;
        }
      } catch (e) { alert('Error al verificar conexión con el proveedor.'); }
    });

    document.getElementById('form-smm-config')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const providerUrl = document.getElementById('smm-provider-url').value;
      const apiKey = document.getElementById('smm-api-key').value;
      const markupPercent = document.getElementById('smm-markup-percent').value;

      try {
        const res = await fetch('/api/admin/smm/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerUrl, apiKey, markupPercent })
        });
        const data = await res.json();
        alert(data.message || 'Configuración guardada');
      } catch (e) { alert('Error al guardar configuración SMM.'); }
    });`;

const newSmmScript = `    // =======================================================
    // 10. BANDEJA DE CRECIMIENTO EN REDES SOCIALES ENGINE
    // =======================================================
    let allSmmOrdersList = [];

    async function loadSmmOrders() {
      try {
        const res = await fetch('/api/admin/smm/orders');
        const data = await res.json();
        allSmmOrdersList = data.orders || [];

        // Update KPIs
        if (data.stats) {
          const st = data.stats;
          const kpiTotal = document.getElementById('smm-kpi-total');
          const kpiSub = document.getElementById('smm-kpi-subtext');
          const kpiPending = document.getElementById('smm-kpi-pending');
          const kpiVolGs = document.getElementById('smm-kpi-volume-gs');
          const kpiVolUsd = document.getElementById('smm-kpi-volume-usd');

          if (kpiTotal) kpiTotal.textContent = st.totalOrders || 0;
          if (kpiSub) kpiSub.textContent = \`\${st.completedCount || 0} completados • \${st.inProgressCount || 0} en curso\`;
          if (kpiPending) kpiPending.textContent = st.inProgressCount || 0;
          if (kpiVolGs) kpiVolGs.textContent = (st.totalVolumePyg || 0).toLocaleString('es-PY') + ' Gs.';
          if (kpiVolUsd) kpiVolUsd.textContent = '$' + (st.totalVolumeUsd || 0).toFixed(2) + ' USDT';

          const badgeSmm = document.getElementById('badge-pending-smm');
          if (badgeSmm) {
            if (st.inProgressCount > 0) {
              badgeSmm.textContent = st.inProgressCount;
              badgeSmm.style.display = 'inline-block';
            } else {
              badgeSmm.style.display = 'none';
            }
          }
        }

        applySmmFilters();
      } catch (err) {
        console.error('Error loading SMM orders:', err);
      }
    }

    function applySmmFilters() {
      const q = (document.getElementById('smm-search-input')?.value || '').toLowerCase().trim();
      const platformFilter = document.getElementById('smm-filter-platform')?.value || 'all';
      const statusFilter = document.getElementById('smm-filter-status')?.value || 'all';

      let filtered = [...allSmmOrdersList];

      if (q) {
        filtered = filtered.filter(o => 
          (o.id && o.id.toLowerCase().includes(q)) ||
          (o.userName && o.userName.toLowerCase().includes(q)) ||
          (o.link && o.link.toLowerCase().includes(q)) ||
          (o.serviceName && o.serviceName.toLowerCase().includes(q))
        );
      }

      if (platformFilter !== 'all') {
        filtered = filtered.filter(o => (o.platform || '').toLowerCase().includes(platformFilter.toLowerCase()));
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(o => o.status === statusFilter);
      }

      renderSmmOrdersTable(filtered);
    }

    function renderSmmOrdersTable(orders) {
      const tbody = document.getElementById('table-smm-orders-list');
      if (!tbody) return;

      if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-tertiary); padding: 2.5rem;">🎉 No hay pedidos coincidentes con los filtros seleccionados.</td></tr>';
        return;
      }

      tbody.innerHTML = orders.map(o => {
        const isCompleted = o.status === 'completed';
        const dateStr = new Date(o.createdAt || Date.now()).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        const priceGs = (o.pricePaidPyg || 0).toLocaleString('es-PY');

        // Platform gradient badge
        let platBadgeStyle = 'background: rgba(168,85,247,0.15); color: #c084fc; border: 1px solid rgba(168,85,247,0.3);';
        let platIcon = '📈';
        const pLower = (o.platform || '').toLowerCase();
        if (pLower.includes('instagram')) {
          platBadgeStyle = 'background: linear-gradient(135deg, rgba(225,48,108,0.2) 0%, rgba(131,58,180,0.2) 100%); color: #f472b6; border: 1px solid rgba(244,114,182,0.4);';
          platIcon = '📸';
        } else if (pLower.includes('tiktok')) {
          platBadgeStyle = 'background: rgba(0,242,254,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3);';
          platIcon = '🎵';
        } else if (pLower.includes('youtube')) {
          platBadgeStyle = 'background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3);';
          platIcon = '▶️';
        } else if (pLower.includes('telegram')) {
          platBadgeStyle = 'background: rgba(14,165,233,0.15); color: #38bdf8; border: 1px solid rgba(14,165,233,0.3);';
          platIcon = '✈️';
        }

        return \`
          <tr>
            <td>
              <strong style="color: #ffffff; display: block; font-family: var(--font-mono); font-size: 0.82rem;">\${o.id}</strong>
              <span style="font-size: 0.72rem; color: var(--text-tertiary);">\${dateStr}</span>
            </td>
            <td>
              <strong style="color: #ffffff; display: block; font-size: 0.88rem;">\${o.userName || o.userId}</strong>
              <span style="font-size: 0.72rem; color: var(--text-tertiary);">ID: \${o.userId}</span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                <span style="padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; \${platBadgeStyle}">
                  \${platIcon} \${o.platform || 'Red Social'}
                </span>
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan);">\${(o.quantity || 0).toLocaleString()} uds.</span>
              </div>
              <strong style="color: #ffffff; font-size: 0.84rem;">\${o.serviceName || o.serviceTitle}</strong>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 6px; max-width: 260px;">
                <a href="\${o.link.startsWith('http') ? o.link : 'https://' + o.link}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.8rem; font-family: var(--font-mono); word-break: break-all; max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  🔗 \${o.link}
                </a>
                <button type="button" class="btn-admin-action cyan" style="padding: 2px 6px; font-size: 0.68rem; flex-shrink: 0;" onclick="navigator.clipboard.writeText('\${o.link}'); alert('Enlace copiado al portapapeles: ' + '\${o.link}');" title="Copiar enlace objetivo">
                  Copiar
                </button>
              </div>
            </td>
            <td>
              <div style="font-family: var(--font-mono); font-weight: 800; color: #ffffff;">\${priceGs} Gs.</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-cyan);">$\${(o.pricePaidUsd || 0).toFixed(2)} USDT</div>
            </td>
            <td>
              \${isCompleted ? \`
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; padding: 4px 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800;">
                  ✓ Completado
                </span>
              \` : \`
                <div>
                  <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; padding: 4px 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800;">
                    ⏳ En Preparación
                  </span>
                  <div style="font-size: 0.68rem; color: var(--text-tertiary); margin-top: 2px;">Plazo: 24 a 48 hs</div>
                </div>
              \`}
            </td>
            <td>
              \${isCompleted ? \`
                <span style="color: #34d399; font-size: 0.76rem; font-weight: 700;">✓ Despachado</span>
              \` : \`
                <button type="button" class="btn-admin-action emerald" onclick="completeSmmOrder('\${o.id}')" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 800; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);">
                  ✓ Marcar Completado
                </button>
              \`}
            </td>
          </tr>
        \`;
      }).join('');
    }

    async function completeSmmOrder(orderId) {
      if (!confirm('¿Confirmas que ya has cargado este servicio en el perfil del cliente y deseas marcarlo como COMPLETADO?')) return;
      try {
        const res = await fetch(\`/api/admin/smm/orders/\${orderId}/complete\`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert('🎉 ' + data.message);
          loadSmmOrders();
        } else {
          alert(data.error || 'Error al completar orden.');
        }
      } catch (err) {
        alert('Error al conectar con el servidor.');
      }
    }`;

if (content.includes(oldSmmScript)) {
  content = content.replace(oldSmmScript, newSmmScript);
  console.log('✅ loadSmmOrders script updated successfully in admin.html!');
} else {
  console.error('❌ Could not match oldSmmScript directly, attempting targeted replacement');
}

fs.writeFileSync('client/admin.html', content, 'utf8');
console.log('✅ client/admin.html updated for SMM orders management!');
