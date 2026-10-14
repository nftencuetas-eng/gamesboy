
    // --- ADMIN TRANSPARENT AUTH FETCH INTERCEPTOR ---
    (function() {
      const originalFetch = window.fetch;
      window.fetch = async function(resource, init = {}) {
        init = init || {};
        const urlStr = typeof resource === 'string' ? resource : (resource?.url || '');
        
        // Attach admin credentials for API calls
        if (urlStr.startsWith('/api/') || urlStr.includes('/api/')) {
          const headers = new Headers(init.headers || {});
          const token = localStorage.getItem('gb_token');
          const adminSessionRaw = localStorage.getItem('gb_admin_session');
          let adminUserId = 'usr_admin';
          if (adminSessionRaw) {
            try {
              const parsed = JSON.parse(adminSessionRaw);
              if (parsed && parsed.id) adminUserId = parsed.id;
            } catch (e) {}
          }

          if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
            headers.set('x-admin-token', token);
          }
          if (!headers.has('x-user-id')) {
            headers.set('x-user-id', adminUserId);
          }
          init.headers = headers;
        }

        const response = await originalFetch(resource, init);
        if (response.status === 401 && (urlStr.includes('/api/admin') || urlStr.includes('/admin'))) {
          console.warn('⚠️ [AdminAuth] Solicitud administrativa rechazada (401 Unauthorized):', urlStr);
        }
        return response;
      };
    })();

    // Global State
    let adminExchangeRate = 7500;
    let allGamesList = [];
    let currentFilteredGames = [];
    let gamesCurrentPage = 1;
    let gamesPageSize = 10;
    let currentUploadedScreenshots = [];
    let allGiftCardBrands = [];
    let allHeroBannersList = [];
    let allUsersList = [];
    let currentFilteredUsers = [];
    let usersCurrentPage = 1;
    let usersPageSize = 10;

    // --- CANVAS COMPRESSION HELPER (PRESERVES TRANSPARENT PNG ALPHA) ---
    function compressImage(file, maxDimension = 900, quality = 0.85) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
          return reject(new Error('El archivo no es una imagen válida.'));
        }
        const isPng = file.type === 'image/png' || (file.name && file.name.toLowerCase().endsWith('.png')) || file.type === 'image/webp';
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            
            // For PNGs with transparency, if within bounds and file size reasonable, preserve original clean data URL
            if (isPng && width <= maxDimension && height <= maxDimension && file.size < 2000000) {
              return resolve(e.target.result);
            }

            if (width > height) {
              if (width > maxDimension) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { alpha: true });
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          };
          img.onerror = () => reject(new Error('Error al cargar la imagen.'));
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      });
    }


    // --- SIDEBAR COLLAPSE & EXPAND ENGINE ---
    window.toggleAdminSidebar = function(forceState) {
      const container = document.getElementById('admin-layout-container');
      const icon = document.getElementById('icon-toggle-sidebar');
      if (!container) return;

      let willBeCollapsed;
      if (typeof forceState === 'boolean') {
        willBeCollapsed = forceState;
        if (willBeCollapsed) {
          container.classList.add('collapsed');
        } else {
          container.classList.remove('collapsed');
        }
      } else {
        willBeCollapsed = container.classList.toggle('collapsed');
      }

      localStorage.setItem('gamesboy_admin_sidebar_collapsed', willBeCollapsed ? '1' : '0');

      if (icon) {
        if (willBeCollapsed) {
          icon.innerHTML = '<polyline points="9 18 15 12 9 6"></polyline>';
        } else {
          icon.innerHTML = '<polyline points="15 18 9 12 15 6"></polyline>';
        }
      }
    };

    window.initAdminSidebar = function() {
      const savedState = localStorage.getItem('gamesboy_admin_sidebar_collapsed');
      if (savedState === '1') {
        window.toggleAdminSidebar(true);
      } else if (savedState === '0') {
        window.toggleAdminSidebar(false);
      }
    };

    // --- TAB SWITCHER ---
    const menuButtons = document.querySelectorAll('.admin-menu-btn');
    const sectionPanes = document.querySelectorAll('.admin-section-pane');
    const headingEl = document.getElementById('admin-view-heading');
    const subtitleEl = document.getElementById('admin-view-subtitle');

    const tabDescriptions = {
      'tab-overview': { title: '01. Dashboard Ejecutivo & Métricas en Vivo', subtitle: 'Auditoría en tiempo real, volumen transaccionado, saldos y operaciones en Paraguay.' },
      'tab-orders-delivery': { title: '02. Bandeja de Despacho de Pedidos', subtitle: 'Despacho manual y seguro de credenciales de videojuegos y códigos de gift cards.' },
      'tab-smm-orders': { title: '03. Crecimiento en Redes Sociales (Bandeja SMM)', subtitle: 'Control y despacho de órdenes de seguidores, likes, vistas y miembros con plazo de 24 a 48 hs.' },
      'tab-custody-payouts': { title: '04. Liquidación a Vendedores (Escrow)', subtitle: 'Fondos en custodia con ciclo de garantía y liberación manual de pagos a anfitriones.' },
      'tab-games-management': { title: '05. Gestión de Videojuegos Digitales', subtitle: 'Catálogo por consolas, precios en Guaraníes, stock de claves y subida de capturas.' },
      'tab-giftcards-management': { title: '06. Tarjetas de Regalo & Licencias', subtitle: 'Marcas oficiales (PlayStation, Xbox, Steam, Google Play) y administración de variaciones de saldo.' },
      'tab-streaming-moderation': { title: '07. Cuentas Streaming & Asientos Oficiales', subtitle: 'Catálogo de servicios de entretenimiento (Netflix, Spotify, Disney+, Max) y moderación de cuentas.' },
      'tab-work-tools': { title: '08. Apps Pro & Cuentas IA', subtitle: 'Catálogo de software pro, membresías de productividad y modelos de IA (ChatGPT Plus, Claude Pro, Canva, Minea, Midjourney).' },
      'tab-ai-whatsapp': { title: '09. Agente WhatsApp IA & Muro de Notas', subtitle: 'Entrenamiento del asistente virtual oficial, enrutamiento telefónico y notas de leads de clientes.' },
      'tab-users': { title: '10. Directorio de Usuarios & Billeteras', subtitle: 'Auditoría de clientes, vendedores, saldos reales en Gs./USDT y fondos en garantía.' },
      'tab-hero-banners': { title: '11. Banners de Inicio (Hero Accordion)', subtitle: 'Personalización de los 4 banners interactivos de la portada, imágenes panorámicas y móviles.' },
      'tab-finance': { title: '12. Finanzas, Recargas SIPAP & Cuentas Bancarias', subtitle: 'Aprobación de comprobantes SIPAP/USDT, cuentas bancarias de Paraguay y Binance Pay.' },
      'tab-tenant-settings': { title: '13. Personalización de Marca Blanca & Ajustes SaaS', subtitle: 'Configuración de marca, dominios, comisiones y pasarelas de pago de tu plataforma.' }
    };

    window.switchStreamingSubtab = function(subpaneId) {
      document.querySelectorAll('.stream-subtab-pill').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255, 255, 255, 0.04)';
        b.style.color = '#94a3b8';
        b.style.boxShadow = 'none';
      });
      document.querySelectorAll('.stream-subpane').forEach(p => p.style.display = 'none');

      const activeBtn = document.getElementById('btn-' + subpaneId.replace('subpane-', 'subtab-'));
      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'linear-gradient(135deg, #00c2ff 0%, #0070f3 100%)';
        activeBtn.style.color = '#ffffff';
        activeBtn.style.boxShadow = '0 4px 14px rgba(0, 194, 255, 0.35)';
      }

      const pane = document.getElementById(subpaneId);
      if (pane) pane.style.display = 'block';

      if (subpaneId === 'subpane-services-crud') {
        loadServicesConfig();
      } else if (subpaneId === 'subpane-accounts-moderation') {
        loadStreamingData();
      }
    };

    window.switchAiToolsSubtab = function(subpaneId) {
      document.querySelectorAll('.ai-tools-subpane').forEach(p => p.style.display = 'none');
      document.querySelectorAll('#tab-work-tools .stream-subtab-pill').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255, 255, 255, 0.04)';
        b.style.color = '#94a3b8';
        b.style.boxShadow = 'none';
      });

      const pane = document.getElementById(subpaneId);
      if (pane) pane.style.display = 'block';

      const btn = document.getElementById('btn-' + subpaneId.replace('subpane-ai-', 'subtab-ai-'));
      if (btn) {
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg, #a855f7 0%, #0070f3 100%)';
        btn.style.color = '#ffffff';
        btn.style.boxShadow = '0 4px 14px rgba(168, 85, 247, 0.35)';
      }

      loadWorkToolsData();
    };

    window.switchAdminTab = function(tabId) {
      document.querySelectorAll('.admin-menu-btn').forEach(b => {
        if (b.getAttribute('data-tab') === tabId) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      document.querySelectorAll('.admin-section-pane').forEach(p => {
        if (p.id === tabId) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      // Update breadcrumb
      const breadActive = document.getElementById('admin-bread-active');
      if (breadActive && tabDescriptions[tabId]) {
        breadActive.textContent = tabDescriptions[tabId].title.split('.')[1] || tabDescriptions[tabId].title;
      }

      if (tabId === 'tab-work-tools') loadWorkToolsData();
      if (tabId === 'tab-ai-whatsapp') loadAiWhatsappTab();

      const contentEl = document.querySelector('.admin-content');
      if (contentEl) {
        contentEl.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (tabDescriptions[tabId]) {
        headingEl.textContent = tabDescriptions[tabId].title;
        subtitleEl.textContent = tabDescriptions[tabId].subtitle;
      }

      if (tabId === 'tab-overview') loadAdminData();
      if (tabId === 'tab-orders-delivery') loadPendingOrders();
      if (tabId === 'tab-finance') loadAdminData();
      if (tabId === 'tab-custody-payouts') loadCustodyPayouts();
      if (tabId === 'tab-games-management') loadGames();
      if (tabId === 'tab-giftcards-management') loadGiftCardBrands();
      if (tabId === 'tab-streaming-moderation') {
        switchStreamingSubtab('subpane-services-crud');
        loadStreamingData();
      }
      if (tabId === 'tab-hero-banners') loadHeroBannersAdmin();
      if (tabId === 'tab-users') loadUsers();
      if (tabId === 'tab-smm-orders') loadSmmOrders();
      if (tabId === 'tab-tenant-settings') loadTenantSettings();
    };

    menuButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        if (tabId) window.switchAdminTab(tabId);
      });
    });

    // --- MASTER DATA LOADERS ---
    async function loadAdminData() {
      try {
        const resOverview = await fetch('/api/admin/overview');
        const dataOverview = await resOverview.json();
        
        if (dataOverview.settings && dataOverview.settings.exchangeRatePyg) {
          adminExchangeRate = dataOverview.settings.exchangeRatePyg;
          document.getElementById('header-rate-display').textContent = `1 USDT = ${adminExchangeRate.toLocaleString('es-PY')} Gs.`;
        }

        if (dataOverview.stats) {
          const s = dataOverview.stats;
          const badgeSmm = document.getElementById('badge-pending-smm');
          const ovSmm = document.getElementById('overview-badge-smm-count');
          if (s.pendingSmmCount > 0) {
            if (badgeSmm) {
              badgeSmm.textContent = s.pendingSmmCount;
              badgeSmm.style.display = 'inline-block';
            }
            if (ovSmm) {
              ovSmm.textContent = `${s.pendingSmmCount} por entregar`;
              ovSmm.style.display = 'inline-block';
            }
          } else {
            if (badgeSmm) badgeSmm.style.display = 'none';
            if (ovSmm) ovSmm.textContent = `${s.totalSmmOrders || 0} pedidos`;
          }
          document.getElementById('kpi-admin-balance-gs').textContent = (s.totalDepositsVolumePyg || 0).toLocaleString('es-PY') + ' Gs.';
          document.getElementById('kpi-admin-balance-usd').textContent = '$' + (dataOverview.adminWallet?.balanceUsd || 1250).toFixed(2) + ' USDT';
          document.getElementById('kpi-volume-gs').textContent = (s.totalVolumePyg || 0).toLocaleString('es-PY') + ' Gs.';
          document.getElementById('kpi-volume-usd').textContent = '$' + (s.totalVolumeUsd || 0).toFixed(2) + ' USDT';
          document.getElementById('kpi-escrow-gs').textContent = (s.totalEscrowPyg || 0).toLocaleString('es-PY') + ' Gs.';
          document.getElementById('kpi-escrow-usd').textContent = '$' + (s.totalEscrowUsd || 0).toFixed(2) + ' USDT';
          document.getElementById('kpi-commissions-gs').textContent = (s.totalCommissionsPyg || 0).toLocaleString('es-PY') + ' Gs.';
          document.getElementById('kpi-commissions-usd').textContent = '$' + (s.totalCommissionsUsd || 0).toFixed(2) + ' USDT';

          const badgeGames = document.getElementById('badge-games-count');
          if (badgeGames) badgeGames.textContent = s.totalGames || 0;
          const ovGames = document.getElementById('overview-badge-games-count');
          if (ovGames) ovGames.textContent = `${s.totalGames || 0} juegos`;

          const bDep = document.getElementById('badge-pending-deposits');
          const ovDep = document.getElementById('overview-badge-pending-deposits');
          if (s.pendingDepositsCount > 0) {
            if (bDep) {
              bDep.textContent = s.pendingDepositsCount;
              bDep.style.display = 'inline-block';
            }
            if (ovDep) {
              ovDep.textContent = `${s.pendingDepositsCount} por auditar`;
              ovDep.style.display = 'inline-block';
            }
          } else {
            if (bDep) bDep.style.display = 'none';
            if (ovDep) ovDep.style.display = 'none';
          }
        }

        renderRecentTransactions(dataOverview.recentTransactions || []);
        renderPendingDeposits(dataOverview.pendingDeposits || []);

        // Populate active Paraguay Bank Details into the Admin form
        if (dataOverview.settings && dataOverview.settings.paraguayBankDetails) {
          const pb = dataOverview.settings.paraguayBankDetails;
          if (document.getElementById('settings-bank-name')) document.getElementById('settings-bank-name').value = pb.bank || pb.bankName || '';
          if (document.getElementById('settings-bank-holder')) document.getElementById('settings-bank-holder').value = pb.accountHolder || pb.holderName || '';
          if (document.getElementById('settings-bank-doc')) document.getElementById('settings-bank-doc').value = pb.rucOrCi || pb.docNumber || '';
          if (document.getElementById('settings-bank-acc')) document.getElementById('settings-bank-acc').value = pb.accountNumber || '';
          if (document.getElementById('settings-bank-alias')) document.getElementById('settings-bank-alias').value = pb.aliasSipap || '';
        }
        if (dataOverview.settings && dataOverview.settings.binanceDetails) {
          const bd = dataOverview.settings.binanceDetails;
          if (document.getElementById('settings-binance-id')) document.getElementById('settings-binance-id').value = bd.payId || bd.binancePayId || '';
          if (document.getElementById('settings-binance-wallet')) document.getElementById('settings-binance-wallet').value = bd.walletAddress || '';
        }

        // Load modules
        loadGames();
        loadGiftCardBrands();
        loadPendingOrders();
        loadStreamingData();
        loadHeroBannersAdmin();
        loadUsers();
        loadSmmOrders();
        loadWorkToolsData();
        loadAiNotesWall();

      } catch (err) {
        console.error('Error fetching admin data:', err);
      }
    }

    // =======================================================
    // VIDEOJUEGOS ENGINE: PAGINATION, SEARCH, FILTER, CRUD
    // =======================================================
    async function loadGames() {
      try {
        const res = await fetch('/api/admin/games');
        const data = await res.json();
        allGamesList = data.games || [];
        document.getElementById('badge-games-count').textContent = allGamesList.length;
        applyGamesFilterAndPaginate();
      } catch (e) {
        console.error('Error loading games:', e);
      }
    }

    function applyGamesFilterAndPaginate() {
      const searchTerm = (document.getElementById('games-search-input')?.value || '').toLowerCase().trim();
      const platformFilter = document.getElementById('games-filter-platform')?.value || 'all';
      gamesPageSize = parseInt(document.getElementById('games-page-size')?.value || '10', 10);

      currentFilteredGames = allGamesList.filter(g => {
        const matchSearch = !searchTerm || 
          g.title.toLowerCase().includes(searchTerm) || 
          (g.genre && g.genre.toLowerCase().includes(searchTerm));
        
        let matchPlatform = true;
        if (platformFilter !== 'all') {
          matchPlatform = (g.platform || '').toLowerCase().includes(platformFilter.toLowerCase());
        }

        return matchSearch && matchPlatform;
      });

      const totalItems = currentFilteredGames.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / gamesPageSize));

      if (gamesCurrentPage > totalPages) gamesCurrentPage = totalPages;
      if (gamesCurrentPage < 1) gamesCurrentPage = 1;

      const startIndex = (gamesCurrentPage - 1) * gamesPageSize;
      const endIndex = Math.min(startIndex + gamesPageSize, totalItems);
      const pageGames = currentFilteredGames.slice(startIndex, endIndex);

      renderGamesTable(pageGames);
      renderGamesPagination(totalItems, totalPages, startIndex, endIndex);
    }

    function renderGamesTable(games) {
      const tbody = document.getElementById('table-games-list');
      if (!tbody) return;

      if (games.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No se encontraron videojuegos coincidentes.</td></tr>';
        return;
      }

      tbody.innerHTML = games.map(g => {
        const primaryPyg = g.primaryPricePyg || Math.round((g.primaryPriceUsd || 39.99) * adminExchangeRate);
        const secondaryPyg = g.secondaryPricePyg || Math.round((g.secondaryPriceUsd || (g.primaryPriceUsd * 0.65)) * adminExchangeRate);
        const shotsCount = Array.isArray(g.screenshots) ? g.screenshots.length : 0;

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${g.coverUrl || g.coverImage || '/assets/branding/icon.png'}" style="width: 42px; height: 56px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
                <div>
                  <strong style="color: #ffffff; display: block; font-size: 0.88rem;">${g.title}</strong>
                  <span style="font-size: 0.72rem; color: var(--text-tertiary);">${g.genre || 'Acción / Aventura'}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="btn-admin-action cyan" style="padding: 2px 8px; font-size: 0.72rem; font-weight: 800;">
                ${g.platform || 'PS5'}
              </span>
            </td>
            <td>
              <div style="font-family: var(--font-mono); font-weight: 800; color: #ffffff;">${primaryPyg.toLocaleString('es-PY')} Gs.</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-cyan);">$${(g.primaryPriceUsd || (primaryPyg / adminExchangeRate)).toFixed(2)} USDT</div>
            </td>
            <td>
              <div style="font-family: var(--font-mono); font-weight: 800; color: #ffffff;">${secondaryPyg.toLocaleString('es-PY')} Gs.</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-emerald);">$${(g.secondaryPriceUsd || (secondaryPyg / adminExchangeRate)).toFixed(2)} USDT</div>
            </td>
            <td>
              <span style="font-size: 0.75rem; color: var(--text-secondary); background: rgba(255,255,255,0.04); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                📸 ${shotsCount} capturas
              </span>
            </td>
            <td>
              <span class="btn-admin-action ${g.isAvailable ? 'emerald' : 'red'}" style="padding: 2px 8px; font-size: 0.7rem;">
                ${g.isAvailable ? 'Disponible' : 'Agotado'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-admin-action cyan" onclick="editGame('${g.id}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  <span>Editar</span>
                </button>
                <button class="btn-admin-action red" onclick="deleteGame('${g.id}')" title="Eliminar">✕</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    function renderGamesPagination(totalItems, totalPages, start, end) {
      const infoEl = document.getElementById('games-pagination-info');
      if (infoEl) {
        infoEl.textContent = totalItems === 0 
          ? 'Mostrando 0 de 0 videojuegos' 
          : `Mostrando ${start + 1} - ${end} de ${totalItems} videojuegos`;
      }

      const controlsEl = document.getElementById('games-pagination-controls');
      if (!controlsEl) return;

      if (totalPages <= 1) {
        controlsEl.innerHTML = '';
        return;
      }

      let btnsHtml = `
        <button class="btn-page" onclick="goToGamesPage(1)" ${gamesCurrentPage === 1 ? 'disabled' : ''}>«</button>
        <button class="btn-page" onclick="goToGamesPage(${gamesCurrentPage - 1})" ${gamesCurrentPage === 1 ? 'disabled' : ''}>‹</button>
      `;

      let startPage = Math.max(1, gamesCurrentPage - 2);
      let endPage = Math.min(totalPages, gamesCurrentPage + 2);

      for (let p = startPage; p <= endPage; p++) {
        btnsHtml += `
          <button class="btn-page ${p === gamesCurrentPage ? 'active' : ''}" onclick="goToGamesPage(${p})">${p}</button>
        `;
      }

      btnsHtml += `
        <button class="btn-page" onclick="goToGamesPage(${gamesCurrentPage + 1})" ${gamesCurrentPage === totalPages ? 'disabled' : ''}>›</button>
        <button class="btn-page" onclick="goToGamesPage(${totalPages})" ${gamesCurrentPage === totalPages ? 'disabled' : ''}>»</button>
      `;

      controlsEl.innerHTML = btnsHtml;
    }

    function goToGamesPage(p) {
      gamesCurrentPage = p;
      applyGamesFilterAndPaginate();
    }

    // Attach Search & Filter Listeners
    document.getElementById('games-search-input')?.addEventListener('input', () => {
      gamesCurrentPage = 1;
      applyGamesFilterAndPaginate();
    });
    document.getElementById('games-filter-platform')?.addEventListener('change', () => {
      gamesCurrentPage = 1;
      applyGamesFilterAndPaginate();
    });
    document.getElementById('games-page-size')?.addEventListener('change', () => {
      gamesCurrentPage = 1;
      applyGamesFilterAndPaginate();
    });

    // --- GAME EDITOR MODAL LOGIC & IMAGE COMPRESSION ---
    function closeGameEditorModal() {
      document.getElementById('modal-game-editor').style.display = 'none';
      currentUploadedScreenshots = [];
      document.getElementById('form-game-editor').reset();
    }

    document.getElementById('btn-open-modal-add-game')?.addEventListener('click', () => {
      document.getElementById('modal-game-editor-title').textContent = 'Nuevo Videojuego Digital';
      document.getElementById('game-edit-id').value = '';
      document.getElementById('form-game-editor').reset();
      document.getElementById('game-edit-cover-base64').value = '';
      document.getElementById('cover-upload-placeholder').style.display = 'block';
      document.getElementById('cover-upload-preview').style.display = 'none';
      currentUploadedScreenshots = [];
      renderScreenshotThumbnails();
      document.getElementById('game-primary-usd-calc').textContent = '≈ $0.00 USDT';
      document.getElementById('game-secondary-usd-calc').textContent = '≈ $0.00 USDT';
      document.getElementById('modal-game-editor').style.display = 'grid';
    });

    // Price live calc in Guaraníes
    document.getElementById('game-edit-price-primary-pyg')?.addEventListener('input', (e) => {
      const pyg = parseInt(e.target.value, 10) || 0;
      const usd = parseFloat((pyg / adminExchangeRate).toFixed(2));
      document.getElementById('game-primary-usd-calc').textContent = `≈ $${usd.toFixed(2)} USDT`;
    });
    document.getElementById('game-edit-price-secondary-pyg')?.addEventListener('input', (e) => {
      const pyg = parseInt(e.target.value, 10) || 0;
      const usd = parseFloat((pyg / adminExchangeRate).toFixed(2));
      document.getElementById('game-secondary-usd-calc').textContent = `≈ $${usd.toFixed(2)} USDT`;
    });

    // Cover File Compression & Preview
    document.getElementById('game-edit-cover-file')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const compressedBase64 = await compressImage(file, 900, 0.82);
        document.getElementById('game-edit-cover-base64').value = compressedBase64;
        document.getElementById('img-cover-preview').src = compressedBase64;
        document.getElementById('cover-upload-placeholder').style.display = 'none';
        document.getElementById('cover-upload-preview').style.display = 'flex';
      } catch (err) {
        alert('Error al procesar la imagen de portada: ' + err.message);
      }
    });

    // Multiple Screenshots File Compression (Up to 10)
    document.getElementById('game-edit-screenshots-file')?.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const remainingSlots = 10 - currentUploadedScreenshots.length;
      if (remainingSlots <= 0) {
        alert('Ya has alcanzado el límite de 10 capturas.');
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);

      for (const file of filesToProcess) {
        try {
          const compressed = await compressImage(file, 1000, 0.80);
          currentUploadedScreenshots.push(compressed);
        } catch (err) {
          console.error('Error compressing shot:', err);
        }
      }

      renderScreenshotThumbnails();
    });

    function renderScreenshotThumbnails() {
      const container = document.getElementById('screenshots-preview-container');
      const counter = document.getElementById('screenshots-counter');
      if (counter) counter.textContent = `${currentUploadedScreenshots.length} / 10 capturas`;

      if (!container) return;
      container.innerHTML = currentUploadedScreenshots.map((url, idx) => `
        <div class="screenshot-thumb-item">
          <img src="${url}">
          <button type="button" class="btn-remove-shot" onclick="removeScreenshot(${idx})" title="Eliminar captura">✕</button>
        </div>
      `).join('');
    }

    window.removeScreenshot = function(idx) {
      currentUploadedScreenshots.splice(idx, 1);
      renderScreenshotThumbnails();
    };

    // EDIT GAME (PRELOADS ALL DATA)
    window.editGame = function(id) {
      const game = allGamesList.find(g => g.id === id);
      if (!game) return;

      document.getElementById('modal-game-editor-title').textContent = `Editar Videojuego: ${game.title}`;
      document.getElementById('game-edit-id').value = game.id;
      document.getElementById('game-edit-title').value = game.title || '';
      document.getElementById('game-edit-platform').value = game.platform || 'PS5';
      document.getElementById('game-edit-genre').value = game.genre || 'Acción';
      
      const primaryPyg = game.primaryPricePyg || Math.round((game.primaryPriceUsd || 39.99) * adminExchangeRate);
      const secondaryPyg = game.secondaryPricePyg || Math.round((game.secondaryPriceUsd || (game.primaryPriceUsd * 0.65)) * adminExchangeRate);

      document.getElementById('game-edit-price-primary-pyg').value = primaryPyg;
      document.getElementById('game-edit-price-secondary-pyg').value = secondaryPyg;
      document.getElementById('game-primary-usd-calc').textContent = `≈ $${(primaryPyg / adminExchangeRate).toFixed(2)} USDT`;
      document.getElementById('game-secondary-usd-calc').textContent = `≈ $${(secondaryPyg / adminExchangeRate).toFixed(2)} USDT`;

      // Cover
      const existingCover = game.coverUrl || game.coverImage;
      if (existingCover) {
        document.getElementById('game-edit-cover-base64').value = existingCover;
        document.getElementById('img-cover-preview').src = existingCover;
        document.getElementById('cover-upload-placeholder').style.display = 'none';
        document.getElementById('cover-upload-preview').style.display = 'flex';
      }

      // Screenshots
      currentUploadedScreenshots = Array.isArray(game.screenshots) ? [...game.screenshots] : [];
      renderScreenshotThumbnails();

      document.getElementById('game-edit-desc').value = game.description || '';
      document.getElementById('game-edit-available').checked = game.isAvailable !== false;

      document.getElementById('modal-game-editor').style.display = 'grid';
    };

    // SUBMIT GAME (CREATE OR PUT UPDATE)
    document.getElementById('form-game-editor')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('game-edit-id').value;
      const title = document.getElementById('game-edit-title').value.trim();
      const platform = document.getElementById('game-edit-platform').value;
      const genre = document.getElementById('game-edit-genre').value.trim();
      const primaryPricePyg = parseInt(document.getElementById('game-edit-price-primary-pyg').value, 10);
      const secondaryPricePyg = parseInt(document.getElementById('game-edit-price-secondary-pyg').value, 10);
      const coverImage = document.getElementById('game-edit-cover-base64').value;
      const description = document.getElementById('game-edit-desc').value.trim();
      const isAvailable = document.getElementById('game-edit-available').checked;

      if (!primaryPricePyg || isNaN(primaryPricePyg)) {
        alert('Por favor ingresa un precio válido en Guaraníes para Cuenta Primaria.');
        return;
      }

      const payload = {
        title,
        platform,
        genre,
        primaryPricePyg,
        secondaryPricePyg: secondaryPricePyg || Math.round(primaryPricePyg * 0.65),
        coverImage,
        screenshots: currentUploadedScreenshots,
        description,
        isAvailable
      };

      const endpoint = id ? `/api/admin/games/${id}` : '/api/admin/games';
      const method = id ? 'PUT' : 'POST';

      try {
        const btn = document.getElementById('btn-save-game-submit');
        btn.textContent = 'Guardando...';
        btn.disabled = true;

        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        btn.textContent = 'Guardar Videojuego';
        btn.disabled = false;

        if (!res.ok) throw new Error(data.error || 'Error al guardar');

        alert(data.message || '¡Videojuego guardado con éxito!');
        closeGameEditorModal();
        loadGames();
      } catch (err) {
        alert('Error: ' + err.message);
        document.getElementById('btn-save-game-submit').disabled = false;
        document.getElementById('btn-save-game-submit').textContent = 'Guardar Videojuego';
      }
    });

    window.deleteGame = async function(id) {
      if (!confirm('¿Deseas eliminar permanentemente este videojuego del catálogo?')) return;
      try {
        const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message || 'Eliminado');
        loadGames();
      } catch (e) { alert('Error al eliminar'); }
    };

    // =======================================================
    // GIFT CARDS & MARCAS ENGINE
    // =======================================================
    window.switchGcSubtab = function(subtabId) {
      document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.querySelector(`[data-subtab="${subtabId}"]`);
      if (activeBtn) activeBtn.classList.add('active');

      document.getElementById('subtab-gc-brands').style.display = subtabId === 'subtab-gc-brands' ? 'block' : 'none';
      document.getElementById('subtab-gc-variations').style.display = subtabId === 'subtab-gc-variations' ? 'block' : 'none';
    };

    async function loadGiftCardBrands() {
      try {
        const res = await fetch('/api/admin/giftcards/brands');
        const data = await res.json();
        allGiftCardBrands = data.brands || [];

        document.getElementById('badge-gc-count').textContent = allGiftCardBrands.length;
        const ovGc = document.getElementById('overview-badge-gc-count');
        if (ovGc) ovGc.textContent = `${allGiftCardBrands.length} marcas`;
        document.getElementById('gc-brands-count-tab').textContent = allGiftCardBrands.length;

        let totalVars = 0;
        allGiftCardBrands.forEach(b => { totalVars += (b.variations || []).length; });
        document.getElementById('gc-variations-count-tab').textContent = totalVars;

        renderBrandsTable();
        renderAllVariationsTable();
      } catch (e) { console.error('Error loading giftcards:', e); }
    }

    function renderBrandsTable() {
      const tbody = document.getElementById('table-giftcards-brands-list');
      if (!tbody) return;

      if (allGiftCardBrands.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary);">No hay marcas registradas. Crea una nueva marca con el botón superior.</td></tr>';
        return;
      }

      tbody.innerHTML = allGiftCardBrands.map(b => {
        const varsCount = (b.variations || []).length;
        let priceRange = 'Sin variaciones';
        if (varsCount > 0) {
          const prices = b.variations.map(v => v.pricePyg || Math.round(v.priceUsd * adminExchangeRate));
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          priceRange = min === max ? `${min.toLocaleString('es-PY')} Gs.` : `${min.toLocaleString('es-PY')} - ${max.toLocaleString('es-PY')} Gs.`;
        }

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${b.logoUrl || '/assets/branding/icon.png'}" style="width: 46px; height: 36px; object-fit: contain; border-radius: 6px; background: rgba(0,0,0,0.5); padding: 3px; border: 1px solid rgba(255,255,255,0.1);">
                <div>
                  <strong style="color: #ffffff; display: block; font-size: 0.88rem;">${b.name}</strong>
                  <span style="font-size: 0.72rem; color: var(--text-tertiary);">${b.description || 'Oficial'}</span>
                </div>
              </div>
            </td>
            <td><span class="btn-admin-action cyan" style="padding: 2px 8px; font-size: 0.72rem;">${b.category || 'Gaming'}</span></td>
            <td>
              <span style="font-weight: 800; color: var(--accent-emerald);">${varsCount} variaciones activas</span>
            </td>
            <td style="font-family: var(--font-mono); font-size: 0.84rem; color: #ffffff;">
              ${priceRange}
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn-admin-action emerald" onclick="openAddVariationModal('${b.id}', '${b.name}')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>+ Variación</span>
                </button>
                <button class="btn-admin-action red" onclick="deleteBrand('${b.id}')" title="Eliminar Marca">✕</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    function renderAllVariationsTable() {
      const tbody = document.getElementById('table-giftcards-variations-list');
      if (!tbody) return;

      const allVars = [];
      allGiftCardBrands.forEach(b => {
        (b.variations || []).forEach(v => {
          allVars.push({ ...v, brandId: b.id, brandName: b.name, brandLogo: b.logoUrl });
        });
      });

      if (allVars.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary);">No hay variaciones creadas.</td></tr>';
        return;
      }

      tbody.innerHTML = allVars.map(v => {
        const pyg = v.pricePyg || Math.round(v.priceUsd * adminExchangeRate);
        const usd = v.priceUsd || parseFloat((pyg / adminExchangeRate).toFixed(2));

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${v.brandLogo || ''}" style="width: 24px; height: 24px; object-fit: contain; border-radius: 4px;">
                <strong style="color: var(--accent-cyan); font-size: 0.84rem;">${v.brandName}</strong>
              </div>
            </td>
            <td>
              <strong style="color: #ffffff;">${v.name}</strong>
            </td>
            <td style="font-family: var(--font-mono); font-weight: 800; color: #ffffff;">
              ${pyg.toLocaleString('es-PY')} Gs.
            </td>
            <td style="font-family: var(--font-mono); color: var(--accent-cyan);">
              $${usd.toFixed(2)} USDT
            </td>
            <td>
              <button class="btn-admin-action red" onclick="deleteVariation('${v.brandId}', '${v.id}')" title="Eliminar Variación">✕</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Modal Create Brand
    document.getElementById('btn-open-modal-add-brand')?.addEventListener('click', () => {
      document.getElementById('modal-brand-editor-title').textContent = 'Nueva Marca / Producto de Gift Card';
      document.getElementById('brand-edit-id').value = '';
      document.getElementById('form-brand-editor').reset();
      document.getElementById('brand-edit-logo-base64').value = '';
      document.getElementById('img-brand-logo-preview').src = '/assets/branding/icon.png';
      document.getElementById('modal-brand-editor').style.display = 'grid';
    });

    // Logo Upload File Compression
    document.getElementById('brand-edit-logo-file')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const base64 = await compressImage(file, 400, 0.85);
        document.getElementById('brand-edit-logo-base64').value = base64;
        document.getElementById('img-brand-logo-preview').src = base64;
      } catch (err) { alert('Error: ' + err.message); }
    });

    document.getElementById('form-brand-editor')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('brand-edit-id').value;
      const name = document.getElementById('brand-edit-name').value.trim();
      const category = document.getElementById('brand-edit-category').value;
      const logoImage = document.getElementById('brand-edit-logo-base64').value;
      const description = document.getElementById('brand-edit-desc').value.trim();

      const endpoint = id ? `/api/admin/giftcards/brands/${id}` : '/api/admin/giftcards/brands';
      const method = id ? 'PUT' : 'POST';

      try {
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, category, logoImage, description })
        });
        const data = await res.json();
        alert(data.message || 'Marca guardada');
        document.getElementById('modal-brand-editor').style.display = 'none';
        loadGiftCardBrands();
      } catch (err) { alert('Error al guardar marca'); }
    });

    window.deleteBrand = async function(brandId) {
      if (!confirm('¿Eliminar esta marca y todas sus variaciones?')) return;
      try {
        const res = await fetch(`/api/admin/giftcards/brands/${brandId}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message || 'Marca eliminada');
        loadGiftCardBrands();
      } catch (e) { alert('Error al eliminar'); }
    };

    // Variation Modal
    window.openAddVariationModal = function(brandId, brandName) {
      document.getElementById('var-edit-brand-id').value = brandId;
      document.getElementById('var-edit-brand-name').value = brandName;
      document.getElementById('form-variation-editor').reset();
      document.getElementById('var-usd-calc').textContent = '≈ $0.00 USDT';
      document.getElementById('modal-variation-editor').style.display = 'grid';
    };

    document.getElementById('var-edit-price-pyg')?.addEventListener('input', (e) => {
      const pyg = parseInt(e.target.value, 10) || 0;
      const usd = parseFloat((pyg / adminExchangeRate).toFixed(2));
      document.getElementById('var-usd-calc').textContent = `≈ $${usd.toFixed(2)} USDT`;
    });

    document.getElementById('form-variation-editor')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const brandId = document.getElementById('var-edit-brand-id').value;
      const name = document.getElementById('var-edit-name').value.trim();
      const pricePyg = parseInt(document.getElementById('var-edit-price-pyg').value, 10);

      try {
        const res = await fetch(`/api/admin/giftcards/brands/${brandId}/variations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, denomination: name, pricePyg })
        });
        const data = await res.json();
        alert(data.message || 'Variación agregada');
        document.getElementById('modal-variation-editor').style.display = 'none';
        loadGiftCardBrands();
      } catch (e) { alert('Error al agregar variación'); }
    });

    window.deleteVariation = async function(brandId, varId) {
      if (!confirm('¿Eliminar esta variación?')) return;
      try {
        const res = await fetch(`/api/admin/giftcards/brands/${brandId}/variations/${varId}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message || 'Variación eliminada');
        loadGiftCardBrands();
      } catch (e) { alert('Error al eliminar variación'); }
    };

    // =======================================================
    // TAB 4: PENDING ORDERS & DELIVERY DISPATCH ENGINE
    // =======================================================
    async function loadPendingOrders() {
      try {
        const type = document.getElementById('filter-orders-type')?.value || 'all';
        const res = await fetch(`/api/admin/orders/pending?type=${type}`);
        const data = await res.json();

        const badge = document.getElementById('badge-pending-orders');
        const ovBadge = document.getElementById('overview-badge-pending-orders');
        if (badge) {
          if (data.pendingCount > 0) {
            badge.textContent = data.pendingCount;
            badge.style.display = 'inline-block';
          } else {
            badge.style.display = 'none';
          }
        }
        if (ovBadge) {
          if (data.pendingCount > 0) {
            ovBadge.textContent = `${data.pendingCount} pendientes`;
            ovBadge.style.display = 'inline-block';
          } else {
            ovBadge.style.display = 'none';
          }
        }

        renderPendingOrdersTable(data.pendingOrders || []);
        renderDeliveredOrdersTable(data.deliveredOrders || []);
      } catch (e) { console.error('Error loading pending orders:', e); }
    }

    function renderPendingOrdersTable(orders) {
      const tbody = document.getElementById('table-pending-orders');
      if (!tbody) return;

      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">🎉 ¡Excelente! No hay entregas pendientes en este momento.</td></tr>';
        return;
      }

      tbody.innerHTML = orders.map(o => `
        <tr>
          <td>
            <strong style="font-family: var(--font-mono); color: #ffffff;">${o.id}</strong>
            <div style="font-size: 0.72rem; color: var(--text-tertiary);">${new Date(o.createdAt).toLocaleString()}</div>
          </td>
          <td>
            <strong style="color: #ffffff; display: block;">${o.buyerName || 'Cliente'}</strong>
            <span style="font-size: 0.74rem; color: var(--text-tertiary);">${o.buyerEmail || o.buyerId}</span>
          </td>
          <td>
            <strong style="color: var(--accent-cyan); display: block;">${o.productTitle || o.title}</strong>
            <span class="btn-admin-action cyan" style="padding: 1px 6px; font-size: 0.7rem; margin-top: 3px;">${o.option || o.platform || 'Entrega Digital'}</span>
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-weight: 800; color: #ffffff;">${(o.pricePaidPyg || (o.pricePaidUsd * adminExchangeRate) || 0).toLocaleString('es-PY')} Gs.</div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-emerald);">$${(o.pricePaidUsd || 0).toFixed(2)} USDT</div>
          </td>
          <td>
            <span class="btn-admin-action amber" style="padding: 2px 8px; font-size: 0.72rem; font-weight: 800;">
              ⏳ En Preparación
            </span>
          </td>
          <td>
            <button class="btn-admin-action emerald" onclick="openDeliverModal('${o.id}')" style="padding: 7px 14px; font-size: 0.8rem; font-weight: 800;">
              <span>✓ Entregar al Cliente</span>
            </button>
          </td>
        </tr>
      `).join('');
    }

    function renderDeliveredOrdersTable(orders) {
      const tbody = document.getElementById('table-delivered-orders');
      if (!tbody) return;

      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary);">No hay entregas completadas registradas.</td></tr>';
        return;
      }

      tbody.innerHTML = orders.map(o => `
        <tr>
          <td><span style="font-family: var(--font-mono); font-size: 0.76rem; color: #94a3b8;">${o.id}</span></td>
          <td><strong style="color: #ffffff;">${o.buyerName || o.buyerEmail}</strong></td>
          <td><strong style="color: var(--accent-cyan);">${o.productTitle} (${o.option || o.platform || ''})</strong></td>
          <td style="font-size: 0.74rem; color: var(--text-tertiary);">${new Date(o.deliveredAt || o.createdAt).toLocaleString()}</td>
          <td><code style="background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; font-size: 0.74rem; color: var(--accent-emerald);">${o.code || o.credentials || 'ENTREGADO'}</code></td>
          <td><span class="btn-admin-action emerald" style="padding: 2px 8px; font-size: 0.7rem;">Entregado</span></td>
        </tr>
      `).join('');
    }

    window.openDeliverModal = async function(orderId) {
      try {
        const res = await fetch('/api/admin/orders/pending');
        const data = await res.json();
        const order = (data.pendingOrders || []).find(o => o.id === orderId);
        if (!order) return alert('Orden no encontrada');

        document.getElementById('deliver-order-id').value = order.id;
        document.getElementById('deliver-modal-product-title').textContent = order.productTitle;
        document.getElementById('deliver-modal-option').textContent = order.option || order.platform || 'Entrega Digital';
        document.getElementById('deliver-modal-buyer-info').textContent = `${order.buyerName || 'Cliente'} (${order.buyerEmail || order.buyerId})`;
        document.getElementById('form-order-deliver').reset();

        document.getElementById('modal-order-deliver').style.display = 'grid';
      } catch (err) { alert('Error al cargar datos de la orden'); }
    };

    document.getElementById('form-order-deliver')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const orderId = document.getElementById('deliver-order-id').value;
      const deliveredEmail = document.getElementById('deliver-account-email').value.trim();
      const deliveredPassword = document.getElementById('deliver-account-password').value.trim();
      const deliveredCode = document.getElementById('deliver-code-input').value.trim();
      const deliveredInstructions = document.getElementById('deliver-instructions').value.trim();

      if (!deliveredCode && !deliveredEmail && !deliveredPassword && !deliveredInstructions) {
        alert('Debes ingresar al menos el código digital o las credenciales de la cuenta para entregar.');
        return;
      }

      try {
        const res = await fetch(`/api/admin/orders/${orderId}/deliver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deliveredEmail,
            deliveredPassword,
            deliveredCode,
            deliveredInstructions
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al procesar');

        alert(data.message || '¡Entrega realizada con éxito!');
        document.getElementById('modal-order-deliver').style.display = 'none';
        loadPendingOrders();
      } catch (err) { alert('Error: ' + err.message); }
    });

    // =======================================================
    // FINANZAS, RECIENTES, STREAMING, USUARIOS, SMM
    // =======================================================
    function renderRecentTransactions(list) {
      const tbody = document.getElementById('table-recent-transactions');
      if (!tbody) return;
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-tertiary);">No hay movimientos registrados.</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(tx => `
        <tr>
          <td><strong style="font-family: var(--font-mono); color: #fff;">${tx.id}</strong><div style="font-size: 0.72rem; color: var(--text-tertiary);">${new Date(tx.createdAt).toLocaleDateString()}</div></td>
          <td><strong style="color: var(--accent-cyan);">${tx.userName || tx.userId}</strong></td>
          <td><span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${tx.type}</span></td>
          <td style="font-family: var(--font-mono); font-weight: 700;">${(tx.localAmount || 0).toLocaleString('es-PY')} Gs.</td>
          <td style="font-family: var(--font-mono); color: var(--accent-cyan);">$${(tx.amountUsd || 0).toFixed(2)}</td>
          <td><span style="font-size: 0.76rem; color: var(--text-secondary);">${tx.method}</span></td>
          <td><span class="btn-admin-action ${tx.status === 'approved' ? 'emerald' : 'amber'}" style="padding: 2px 8px; font-size: 0.7rem;">${tx.status}</span></td>
        </tr>
      `).join('');
    }

    window.currentPendingDeposits = [];

    function renderPendingDeposits(list) {
      window.currentPendingDeposits = list || [];
      const tbody = document.getElementById('table-pending-deposits');
      if (!tbody) return;
      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No hay recargas pendientes de aprobación.</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(tx => {
        const hasReceipt = tx.receiptData && tx.receiptData.length > 50;
        return `
        <tr>
          <td>
            <strong style="color: #ffffff; display: block;">${tx.userName || tx.userId}</strong>
            <span style="font-size: 0.72rem; color: var(--text-tertiary);">ID: ${tx.id}</span>
          </td>
          <td><strong style="color: var(--accent-cyan);">${tx.method === 'sipap_paraguay' ? 'SIPAP (Bancos PY)' : 'Binance USDT'}</strong></td>
          <td style="font-family: var(--font-mono); font-weight: 800; color: #34d399;">${(tx.localAmount || 0).toLocaleString('es-PY')} Gs.</td>
          <td style="font-family: var(--font-mono); color: var(--accent-cyan);">$${(tx.amountUsd || 0).toFixed(2)}</td>
          <td>
            ${hasReceipt ? `
              <button class="btn-admin-action cyan" onclick="openReceiptViewer('${tx.id}')" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 800;">
                📷 Ver Comprobante
              </button>
            ` : `
              <span style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-tertiary);">${tx.reference || 'Sin foto'}</span>
            `}
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn-admin-action emerald" onclick="approveDeposit('${tx.id}')">✓ Aprobar</button>
              <button class="btn-admin-action red" onclick="rejectDeposit('${tx.id}')">✕ Rechazar</button>
            </div>
          </td>
        </tr>
      `;
      }).join('');
    }

    function openReceiptViewer(txId) {
      const tx = (window.currentPendingDeposits || []).find(t => t.id === txId);
      if (!tx) return;

      const modal = document.getElementById('modal-receipt-viewer');
      const userEl = document.getElementById('receipt-modal-user');
      const amountEl = document.getElementById('receipt-modal-amount');
      const imgEl = document.getElementById('receipt-modal-img');
      const noImgEl = document.getElementById('receipt-modal-no-img');
      const btnApprove = document.getElementById('receipt-btn-approve');
      const btnReject = document.getElementById('receipt-btn-reject');

      if (userEl) userEl.textContent = tx.userName || tx.userId;
      if (amountEl) amountEl.textContent = (tx.localAmount || 0).toLocaleString('es-PY') + ' Gs. (' + (tx.amountUsd || 0).toFixed(2) + ' USDT)';

      if (tx.receiptData && tx.receiptData.length > 50) {
        if (imgEl) {
          imgEl.src = tx.receiptData;
          imgEl.style.display = 'block';
        }
        if (noImgEl) noImgEl.style.display = 'none';
      } else {
        if (imgEl) imgEl.style.display = 'none';
        if (noImgEl) noImgEl.style.display = 'block';
      }

      if (btnApprove) {
        btnApprove.onclick = () => {
          closeReceiptViewer();
          approveDeposit(tx.id);
        };
      }
      if (btnReject) {
        btnReject.onclick = () => {
          closeReceiptViewer();
          rejectDeposit(tx.id);
        };
      }

      if (modal) modal.style.display = 'flex';
    }

    function closeReceiptViewer() {
      const modal = document.getElementById('modal-receipt-viewer');
      if (modal) modal.style.display = 'none';
    }

    async function approveDeposit(id) {
      if (!confirm('¿Deseas aprobar esta recarga y acreditar los fondos al usuario?')) return;
      try {
        const res = await fetch(`/api/admin/approve-deposit/${id}`, { method: 'POST' });
        const data = await res.json();
        alert(data.message || 'Recarga aprobada');
        loadAdminData();
      } catch (e) { alert('Error al aprobar.'); }
    }

    async function rejectDeposit(id) {
      const reason = prompt('Motivo del rechazo:', 'Comprobante no válido o pago no recibido');
      if (!reason) return;
      try {
        const res = await fetch(`/api/admin/reject-deposit/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });
        const data = await res.json();
        alert(data.message || 'Recarga rechazada');
        loadAdminData();
      } catch (e) { alert('Error al rechazar.'); }
    }

    async function loadStreamingData() {
      try {
        const resPending = await fetch('/api/admin/streaming/pending');
        const dataPending = await resPending.json();
        
        const badgePending = document.getElementById('badge-pending-subs');
        if (badgePending) {
          if (dataPending.count > 0) {
            badgePending.textContent = dataPending.count;
            badgePending.style.display = 'inline-block';
          } else {
            badgePending.style.display = 'none';
          }
        }

        const tbodyPending = document.getElementById('table-streaming-pending');
        if (tbodyPending) {
          if (!dataPending.submissions || dataPending.submissions.length === 0) {
            tbodyPending.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">🎉 ¡Excelente! No hay solicitudes pendientes de moderación.</td></tr>';
          } else {
            tbodyPending.innerHTML = dataPending.submissions.map(s => {
              const profiles = s.pinsDecrypted || {};
              const totalCap = Math.max(1, s.totalSlots || 5);
              const availCount = Math.min(totalCap, Math.max(0, s.availableSlots !== undefined ? s.availableSlots : totalCap));
              
              let profilesSummary = '';
              for (let i = 1; i <= totalCap; i++) {
                const p = profiles[i] || profiles[String(i)] || {};
                const isOcc = typeof p === 'object' ? (p.status === 'occupied' || p.isOccupied === true || p.isAvailable === false) : (i > availCount);
                const pName = typeof p === 'object' && p.name ? p.name : `Perfil ${i}`;
                const pin = typeof p === 'object' ? (p.pin || '') : (typeof p === 'string' ? p : '');
                
                profilesSummary += `
                  <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.04); border: 1px solid ${isOcc ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin: 2px;">
                    <strong style="color: #ffffff;">#${i} ${pName}:</strong>
                    <span style="color: ${isOcc ? '#f87171' : '#34d399'}; font-weight: 700;">${isOcc ? '🔴 Personal' : (pin ? `PIN: ${pin}` : '🟢 Libre')}</span>
                  </span>
                `;
              }

              return `
                <tr>
                  <td>
                    <strong style="color: #ffffff; display: block;">${s.sellerName || s.sellerId}</strong>
                    <span style="font-size: 0.72rem; color: var(--text-tertiary);">ID: ${s.sellerId}</span>
                  </td>
                  <td>
                    <strong style="color: var(--accent-cyan); display: block;">${s.serviceName}</strong>
                    <span style="font-size: 0.74rem; color: var(--text-tertiary);">${s.planName || 'Plan Compartido'}</span>
                  </td>
                  <td>
                    <div style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald);">
                      ${availCount} / ${totalCap} cupos libres
                    </div>
                    <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 2px; max-width: 260px;">
                      ${profilesSummary}
                    </div>
                  </td>
                  <td>
                    <div style="font-family: var(--font-mono); font-weight: 800; color: #ffffff;">${((s.pricePerSlotUsd || 3.99) * adminExchangeRate).toLocaleString('es-PY')} Gs.</div>
                    <div style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--accent-cyan);">$${(s.pricePerSlotUsd || 3.99).toFixed(2)} USDT</div>
                  </td>
                  <td>
                    <div style="background: rgba(0,0,0,0.5); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); font-family: var(--font-mono); font-size: 0.74rem; word-break: break-all;">
                      <div style="color: #38bdf8; margin-bottom: 2px;">🔑 ${s.credentialsDecrypted || 'Credenciales protegidas'}</div>
                      <button type="button" class="btn-admin-action cyan" style="padding: 2px 6px; font-size: 0.68rem; margin-top: 2px;" onclick="navigator.clipboard.writeText('${s.credentialsDecrypted || ''}'); alert('Credenciales copiadas al portapapeles');">Copiar para Probar</button>
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      <button class="btn-admin-action emerald" onclick="approveStreaming('${s.id}')" style="justify-content: center; font-weight: 800;">
                        <span>✓ Aprobar y Publicar</span>
                      </button>
                      <button class="btn-admin-action red" onclick="rejectStreaming('${s.id}')" style="justify-content: center; font-size: 0.74rem;">
                        <span>✕ Rechazar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('');
          }
        }

        const resActive = await fetch('/api/admin/streaming/active-groups');
        const dataActive = await resActive.json();
        const tbodyActive = document.getElementById('table-streaming-active');
        if (tbodyActive) {
          if (!dataActive.groups || dataActive.groups.length === 0) {
            tbodyActive.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary);">No hay grupos de streaming activos.</td></tr>';
          } else {
                        tbodyActive.innerHTML = dataActive.groups.map(g => {
              const isOfficial = g.isOfficial || g.sellerId === 'usr_admin';
              const expInfo = g.accountExpirationDate ? `<div style="font-size: 0.68rem; color: #fbbf24; margin-top: 2px;">📅 Vence: ${g.accountExpirationDate}</div>` : '';
              return `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="color: #ffffff;">${g.serviceName}</strong>
                    ${isOfficial ? '<span style="background: rgba(16,185,129,0.2); color: #34d399; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.4);">OFICIAL</span>' : ''}
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-tertiary);">${g.planName}</div>
                  ${expInfo}
                </td>
                <td><strong style="color: var(--accent-cyan);">${g.sellerName || 'Oficial'}</strong></td>
                <td>
                  <span class="btn-admin-action cyan" style="padding: 2px 8px; font-size: 0.72rem; font-weight: 800;">
                    ${g.availableSlots || 0} libres / ${g.totalSlots} total
                  </span>
                </td>
                <td style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald);">
                  ${(g.pricePyg || 0).toLocaleString('es-PY')} Gs.
                  <div style="font-size: 0.68rem; color: var(--text-tertiary); font-weight: 400;">($${g.pricePerSlotUsd} USDT)</div>
                </td>
                <td><span class="btn-admin-action emerald" style="padding: 2px 8px; font-size: 0.7rem;">🟢 Activo en Tienda</span></td>
                <td>
                  <button class="btn-admin-action red" onclick="rejectStreaming('${g.id}')" title="Desactivar cuenta del catálogo">
                    ✕ Desactivar
                  </button>
                </td>
              </tr>
            `;
            }).join('');
          }
        }
      } catch (e) { console.error('Error loading streaming data:', e); }
    }

    async function approveStreaming(id) {
      if (!confirm('¿Deseas aprobar esta cuenta y publicarla en la tienda oficial?')) return;
      try {
        const res = await fetch(`/api/admin/streaming/approve/${id}`, { method: 'POST' });
        const data = await res.json();
        alert(data.message || 'Aprobada');
        loadStreamingData();
      } catch (e) { alert('Error al aprobar'); }
    }

    async function rejectStreaming(id) {
      if (!confirm('¿Deseas rechazar o desactivar este grupo de streaming?')) return;
      try {
        const res = await fetch(`/api/admin/streaming/reject/${id}`, { method: 'POST' });
        const data = await res.json();
        alert(data.message || 'Rechazada');
        loadStreamingData();
      } catch (e) { alert('Error al procesar'); }
    }

    // ========================================================
    // 🎨 HERO ACCORDION BANNERS ENGINE (ADMIN - 100% OPCIONAL)
    // ========================================================
    function compressHeroBanner(file, orientation) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
          return reject(new Error('El archivo no es una imagen válida.'));
        }
        const maxW = orientation === 'horizontal' ? 1600 : 700;
        const maxH = orientation === 'horizontal' ? 700 : 1000;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxW) {
              height = Math.round((height * maxW) / width);
              width = maxW;
            }
            if (height > maxH) {
              width = Math.round((width * maxH) / height);
              height = maxH;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            // High quality, fast compressed JPEG: ~120KB
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressed);
          };
          img.onerror = () => reject(new Error('Error al cargar la imagen seleccionada.'));
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      });
    }

    async function loadHeroBannersAdmin() {
      try {
        const res = await fetch('/api/banners/admin');
        const data = await res.json();
        if (data.banners && Array.isArray(data.banners)) {
          allHeroBannersList = data.banners;
          while (allHeroBannersList.length < 4) {
            allHeroBannersList.push({
              id: `banner_${allHeroBannersList.length + 1}`,
              title: '',
              tagline: '',
              badge: '',
              imgHorizontal: '',
              imgVertical: '',
              ctaText: '',
              ctaUrl: '#section-games',
              sortOrder: allHeroBannersList.length,
              isActive: true
            });
          }
          renderHeroBannersEditor();
        }
      } catch (err) {
        console.error('Error loading hero banners admin:', err);
      }
    }

    function renderHeroBannersEditor() {
      const container = document.getElementById('hero-banners-editor-container');
      if (!container) return;

      container.innerHTML = allHeroBannersList.slice(0, 4).map((b, idx) => {
        const hasH = Boolean(b.imgHorizontal);
        const hasV = Boolean(b.imgVertical);

        return `
        <div class="hero-banner-admin-card" data-banner-idx="${idx}">
          <!-- CARD HEADER -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: rgba(0, 194, 255, 0.15); color: var(--accent-cyan); font-weight: 800; font-size: 0.74rem; padding: 3px 8px; border-radius: 6px;">PORTADA #${idx + 1}</span>
              <strong style="color: #ffffff; font-size: 0.92rem;">${b.title || 'Portada ' + (idx + 1)}</strong>
            </div>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.76rem; color: #ffffff; cursor: pointer; background: rgba(255,255,255,0.04); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
              <input type="checkbox" id="hero-banner-active-${idx}" ${b.isActive !== false ? 'checked' : ''} style="width: 15px; height: 15px; cursor: pointer;">
              <span>Activo en Portada</span>
            </label>
          </div>

          <!-- SUBIDA DE IMÁGENES: HORIZONTAL Y VERTICAL -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            
            <!-- DROPZONE HORIZONTAL -->
            <div class="admin-form-group" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="admin-form-label" style="margin-bottom: 0; font-size: 0.76rem;">🖼️ Imagen Horizontal Panorámica (1600x600 px)</label>
                <span style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700;">Pantalla Completa</span>
              </div>
              
              <input type="hidden" id="hero-input-h-${idx}" value="${b.imgHorizontal || ''}">
              <div class="file-upload-zone" style="padding: 12px; position: relative; border-radius: 12px; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(5,7,14,0.7);">
                <input type="file" accept="image/*" onchange="handleHeroBannerUpload(event, ${idx}, 'horizontal')" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2;">
                
                <div id="hero-preview-container-h-${idx}" style="width: 100%; ${hasH ? 'display: flex;' : 'display: none;'} flex-direction: column; align-items: center;">
                  <img id="hero-thumb-h-${idx}" class="hero-preview-thumb-h" src="${b.imgHorizontal || ''}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); margin-bottom: 6px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <span style="font-size: 0.74rem; color: var(--accent-emerald); font-weight: 800;">✓ Imagen horizontal cargada</span>
                    <button type="button" onclick="event.stopPropagation(); removeHeroBannerImage(${idx}, 'horizontal')" style="background: none; border: none; color: #ef4444; font-size: 0.72rem; cursor: pointer; text-decoration: underline;">Quitar</button>
                  </div>
                </div>

                <div id="hero-placeholder-h-${idx}" style="${hasH ? 'display: none;' : 'display: flex;'} flex-direction: column; align-items: center; text-align: center;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" style="margin-bottom: 6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <div style="font-size: 0.8rem; font-weight: 700; color: #ffffff;">Haz clic o arrastra la imagen horizontal aquí</div>
                  <div style="font-size: 0.7rem; color: var(--text-tertiary);">Formato recomendado: 1600x600 px</div>
                </div>
              </div>
            </div>

            <!-- DROPZONE VERTICAL -->
            <div class="admin-form-group" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="admin-form-label" style="margin-bottom: 0; font-size: 0.76rem;">📱 Imagen Vertical / Artwork (600x900 px)</label>
                <span style="font-size: 0.7rem; color: var(--accent-purple); font-weight: 700;">Modo Móvil / Acordeón</span>
              </div>
              
              <input type="hidden" id="hero-input-v-${idx}" value="${b.imgVertical || ''}">
              <div class="file-upload-zone" style="padding: 12px; position: relative; border-radius: 12px; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(5,7,14,0.7);">
                <input type="file" accept="image/*" onchange="handleHeroBannerUpload(event, ${idx}, 'vertical')" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2;">
                
                <div id="hero-preview-container-v-${idx}" style="${hasV ? 'display: flex;' : 'display: none;'} align-items: center; justify-content: space-between; width: 100%;">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img id="hero-thumb-v-${idx}" class="hero-preview-thumb-v" src="${b.imgVertical || ''}" style="width: 75px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);">
                    <div style="text-align: left;">
                      <div style="font-size: 0.76rem; color: var(--accent-emerald); font-weight: 800;">✓ Imagen vertical cargada</div>
                      <div style="font-size: 0.72rem; color: var(--text-tertiary); margin-top: 4px;">Clic para cambiarla</div>
                    </div>
                  </div>
                  <button type="button" onclick="event.stopPropagation(); removeHeroBannerImage(${idx}, 'vertical')" style="background: none; border: none; color: #ef4444; font-size: 0.72rem; cursor: pointer; text-decoration: underline;">Quitar</button>
                </div>

                <div id="hero-placeholder-v-${idx}" style="${hasV ? 'display: none;' : 'display: flex;'} flex-direction: column; align-items: center; text-align: center;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2" style="margin-bottom: 6px;"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  <div style="font-size: 0.8rem; font-weight: 700; color: #ffffff;">Haz clic o arrastra la imagen vertical aquí</div>
                  <div style="font-size: 0.7rem; color: var(--text-tertiary);">Formato recomendado: 600x900 px (o se usará la horizontal)</div>
                </div>
              </div>
            </div>

          </div>

          <!-- CAMPOS 100% OPCIONALES -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; margin-top: 6px;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <span>📝 Información y Enlace (100% Opcional)</span>
            </div>

            <div class="admin-form-group" style="margin-bottom: 10px;">
              <label class="admin-form-label" style="font-size: 0.72rem; color: var(--text-secondary);">Título (Opcional)</label>
              <input type="text" id="hero-banner-title-${idx}" class="admin-form-input" value="${b.title || ''}" placeholder="ej: Mi Banner de Temporada (o dejar vacío)" style="padding: 8px 12px; font-size: 0.84rem;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div class="admin-form-group" style="margin-bottom: 0;">
                <label class="admin-form-label" style="font-size: 0.72rem; color: var(--text-secondary);">Badge Superior (Opcional)</label>
                <input type="text" id="hero-banner-badge-${idx}" class="admin-form-input" value="${b.badge || ''}" placeholder="ej: NOVEDAD (o dejar vacío)" style="padding: 8px 12px; font-size: 0.84rem;">
              </div>
              <div class="admin-form-group" style="margin-bottom: 0;">
                <label class="admin-form-label" style="font-size: 0.72rem; color: var(--text-secondary);">Texto Botón CTA (Opcional)</label>
                <input type="text" id="hero-banner-cta-${idx}" class="admin-form-input" value="${b.ctaText || ''}" placeholder="ej: Ver Catálogo (o dejar vacío)" style="padding: 8px 12px; font-size: 0.84rem;">
              </div>
            </div>

            <div class="admin-form-group" style="margin-bottom: 10px;">
              <label class="admin-form-label" style="font-size: 0.72rem; color: var(--text-secondary);">Lema / Subtítulo (Opcional)</label>
              <input type="text" id="hero-banner-tagline-${idx}" class="admin-form-input" value="${b.tagline || ''}" placeholder="ej: Descubre las mejores ofertas (o dejar vacío)" style="padding: 8px 12px; font-size: 0.84rem;">
            </div>

            <div class="admin-form-group" style="margin-bottom: 0;">
              <label class="admin-form-label" style="font-size: 0.72rem; color: var(--text-secondary);">Enlace de Destino (Opcional)</label>
              <input type="text" id="hero-banner-url-${idx}" class="admin-form-input" value="${b.ctaUrl || ''}" placeholder="ej: #section-games o /service.html?platform=netflix" style="padding: 8px 12px; font-size: 0.84rem;">
            </div>
          </div>
        </div>
      `;
      }).join('');
    }

    window.removeHeroBannerImage = function(idx, orientation) {
      const inputId = orientation === 'horizontal' ? `hero-input-h-${idx}` : `hero-input-v-${idx}`;
      const input = document.getElementById(inputId);
      if (input) input.value = '';
      if (allHeroBannersList[idx]) {
        if (orientation === 'horizontal') allHeroBannersList[idx].imgHorizontal = '';
        else allHeroBannersList[idx].imgVertical = '';
      }
      if (orientation === 'horizontal') {
        const thumb = document.getElementById(`hero-thumb-h-${idx}`);
        const previewBox = document.getElementById(`hero-preview-container-h-${idx}`);
        const placeholder = document.getElementById(`hero-placeholder-h-${idx}`);
        if (thumb) thumb.src = '';
        if (previewBox) previewBox.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      } else {
        const thumb = document.getElementById(`hero-thumb-v-${idx}`);
        const previewBox = document.getElementById(`hero-preview-container-v-${idx}`);
        const placeholder = document.getElementById(`hero-placeholder-v-${idx}`);
        if (thumb) thumb.src = '';
        if (previewBox) previewBox.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      }
    };

    window.handleHeroBannerUpload = async function(event, idx, orientation) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const compressed = await compressHeroBanner(file, orientation);
        
        // Save base64 internally in hidden input and memory
        const inputId = orientation === 'horizontal' ? `hero-input-h-${idx}` : `hero-input-v-${idx}`;
        const input = document.getElementById(inputId);
        if (input) input.value = compressed;
        
        if (allHeroBannersList[idx]) {
          if (orientation === 'horizontal') allHeroBannersList[idx].imgHorizontal = compressed;
          else allHeroBannersList[idx].imgVertical = compressed;
        }

        // Update preview UI cleanly
        if (orientation === 'horizontal') {
          const thumb = document.getElementById(`hero-thumb-h-${idx}`);
          const previewBox = document.getElementById(`hero-preview-container-h-${idx}`);
          const placeholder = document.getElementById(`hero-placeholder-h-${idx}`);
          if (thumb) thumb.src = compressed;
          if (previewBox) previewBox.style.display = 'flex';
          if (placeholder) placeholder.style.display = 'none';

          // If vertical input is currently empty, also auto-fill vertical preview so both orientations have artwork
          const inputV = document.getElementById(`hero-input-v-${idx}`);
          if (inputV && !inputV.value) {
            inputV.value = compressed;
            if (allHeroBannersList[idx]) allHeroBannersList[idx].imgVertical = compressed;
            const thumbV = document.getElementById(`hero-thumb-v-${idx}`);
            const previewBoxV = document.getElementById(`hero-preview-container-v-${idx}`);
            const placeholderV = document.getElementById(`hero-placeholder-v-${idx}`);
            if (thumbV) thumbV.src = compressed;
            if (previewBoxV) previewBoxV.style.display = 'flex';
            if (placeholderV) placeholderV.style.display = 'none';
          }
        } else {
          const thumb = document.getElementById(`hero-thumb-v-${idx}`);
          const previewBox = document.getElementById(`hero-preview-container-v-${idx}`);
          const placeholder = document.getElementById(`hero-placeholder-v-${idx}`);
          if (thumb) thumb.src = compressed;
          if (previewBox) previewBox.style.display = 'flex';
          if (placeholder) placeholder.style.display = 'none';
        }
      } catch (err) {
        alert('Error al procesar la imagen: ' + err.message);
      }
    };

    async function saveHeroBannersAdmin() {
      const saveBtn = document.getElementById('btn-save-all-hero-banners');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>⏳ Guardando y publicando...</span>';
      }

      const bannersToSave = [];
      for (let i = 0; i < 4; i++) {
        const existing = allHeroBannersList[i] || {};
        const inputH = document.getElementById(`hero-input-h-${i}`);
        const inputV = document.getElementById(`hero-input-v-${i}`);

        bannersToSave.push({
          id: existing.id || `banner_${i + 1}`,
          title: document.getElementById(`hero-banner-title-${i}`)?.value?.trim() || '',
          tagline: document.getElementById(`hero-banner-tagline-${i}`)?.value?.trim() || '',
          badge: document.getElementById(`hero-banner-badge-${i}`)?.value?.trim() || '',
          ctaText: document.getElementById(`hero-banner-cta-${i}`)?.value?.trim() || '',
          ctaUrl: document.getElementById(`hero-banner-url-${i}`)?.value?.trim() || '#section-games',
          imgHorizontal: (inputH?.value) || existing.imgHorizontal || '',
          imgVertical: (inputV?.value) || existing.imgVertical || (inputH?.value) || existing.imgHorizontal || '',
          isActive: document.getElementById(`hero-banner-active-${i}`)?.checked !== false,
          sortOrder: i
        });
      }

      try {
        const res = await fetch('/api/banners/admin', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': 'usr_admin'
          },
          body: JSON.stringify({ banners: bannersToSave })
        });
        const data = await res.json();
        if (data.success) {
          alert('🎉 ¡Las imágenes y portadas han sido guardadas y publicadas con éxito en la tienda!');
          allHeroBannersList = data.banners;
          renderHeroBannersEditor();
        } else {
          alert(data.error || 'No se pudieron guardar los banners');
        }
      } catch (err) {
        alert('Error de conexión al guardar los banners: ' + err.message);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Guardar Banners</span>
          `;
        }
      }
    }

    document.getElementById('btn-save-all-hero-banners')?.addEventListener('click', saveHeroBannersAdmin);

    // =======================================================
    // 7. GESTIÓN DE USUARIOS AUDITADA & PAGINADA (10 EN 10)
    // =======================================================
    async function loadUsers() {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        allUsersList = data.users || [];

        // Render Top KPI Cards
        if (data.stats) {
          const s = data.stats;
          document.getElementById('users-kpi-total').textContent = s.totalUsers || 0;
          document.getElementById('users-kpi-breakdown').textContent = `${s.clientsCount || 0} Clientes • ${s.sellersCount || 0} Vendedores • ${s.adminsCount || 0} Admins`;
          document.getElementById('users-kpi-balance-gs').textContent = (s.totalBalancePyg || 0).toLocaleString('es-PY') + ' Gs.';
          document.getElementById('users-kpi-balance-usd').textContent = '$' + (s.totalBalanceUsd || 0).toFixed(2) + ' USDT';
          document.getElementById('users-kpi-escrow-gs').textContent = (s.totalEscrowPyg || 0).toLocaleString('es-PY') + ' Gs.';
          document.getElementById('users-kpi-escrow-usd').textContent = '$' + (s.totalEscrowUsd || 0).toFixed(2) + ' USDT';
          document.getElementById('users-kpi-deposits-gs').textContent = (s.approvedDepositsPyg || 0).toLocaleString('es-PY') + ' Gs.';
          document.getElementById('users-kpi-deposits-usd').textContent = '$' + (s.approvedDepositsUsd || 0).toFixed(2) + ' USDT';
          document.getElementById('users-kpi-payouts-gs').textContent = (s.approvedPayoutsPyg || 0).toLocaleString('es-PY') + ' Gs.';
          document.getElementById('users-kpi-payouts-usd').textContent = '$' + (s.approvedPayoutsUsd || 0).toFixed(2) + ' USDT';
        }

        const ovUsers = document.getElementById('overview-badge-users-count');
        if (ovUsers) ovUsers.textContent = `${allUsersList.length} usuarios`;

        applyUsersFilters();
      } catch (e) { console.error('Error loading users:', e); }
    }

    function applyUsersFilters() {
      const q = document.getElementById('users-search-input')?.value.toLowerCase().trim() || '';
      const role = document.getElementById('users-filter-role')?.value || 'all';
      const sort = document.getElementById('users-filter-sort')?.value || 'recent';

      let list = [...allUsersList];

      if (q) {
        list = list.filter(u => 
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q))
        );
      }

      if (role !== 'all') {
        list = list.filter(u => u.role === role);
      }

      if (sort === 'balance_desc') {
        list.sort((a, b) => (b.balanceUsd || 0) - (a.balanceUsd || 0));
      } else if (sort === 'orders_desc') {
        list.sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0));
      } else if (sort === 'name_asc') {
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else {
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }

      currentFilteredUsers = list;
      usersCurrentPage = 1;
      renderUsersTable();
    }

    function renderUsersTable() {
      const tbody = document.getElementById('table-users-list');
      const infoEl = document.getElementById('users-pagination-info');
      const controlsEl = document.getElementById('users-pagination-controls');
      if (!tbody) return;

      const total = currentFilteredUsers.length;
      const totalPages = Math.ceil(total / usersPageSize) || 1;
      if (usersCurrentPage > totalPages) usersCurrentPage = totalPages;
      if (usersCurrentPage < 1) usersCurrentPage = 1;

      const startIndex = (usersCurrentPage - 1) * usersPageSize;
      const endIndex = Math.min(startIndex + usersPageSize, total);
      const pageItems = currentFilteredUsers.slice(startIndex, endIndex);

      if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No se encontraron usuarios coincidentes.</td></tr>';
        if (infoEl) infoEl.textContent = 'Mostrando 0 de 0 usuarios';
        if (controlsEl) controlsEl.innerHTML = '';
        return;
      }

      tbody.innerHTML = pageItems.map(u => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${u.avatar || '/assets/branding/icon.png'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.15);">
              <div>
                <strong style="color: #ffffff; display: block; font-size: 0.86rem;">${u.name}</strong>
                <span style="font-size: 0.73rem; color: var(--text-tertiary);">${u.email}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="btn-admin-action ${u.role === 'admin' ? 'amber' : (u.role === 'seller' ? 'emerald' : 'cyan')}" style="padding: 2px 8px; font-size: 0.72rem; text-transform: uppercase;">
              ${u.role === 'admin' ? 'Admin Master' : (u.role === 'seller' ? 'Vendedor' : 'Cliente')}
            </span>
          </td>
          <td>
            <strong style="font-family: var(--font-mono); color: #ffffff; font-size: 0.88rem;">${(u.balancePyg || 0).toLocaleString('es-PY')} Gs.</strong>
          </td>
          <td>
            <span style="font-family: var(--font-mono); color: var(--accent-emerald); font-weight: 700;">$${(u.balanceUsd || 0).toFixed(2)} USDT</span>
          </td>
          <td>
            <span style="font-family: var(--font-mono); color: var(--accent-purple); font-size: 0.82rem;">${(u.pendingEscrowPyg || 0).toLocaleString('es-PY')} Gs.</span>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-weight: 700;">${u.ordersCount || 0} compras</span>
          </td>
          <td style="font-size: 0.74rem; color: var(--text-tertiary);">
            ${new Date(u.createdAt).toLocaleDateString()}
          </td>
          <td>
            <span class="btn-admin-action emerald" style="padding: 2px 8px; font-size: 0.7rem;">✓ Verificado</span>
          </td>
        </tr>
      `).join('');

      if (infoEl) {
        infoEl.textContent = `Mostrando ${startIndex + 1} - ${endIndex} de ${total} usuarios`;
      }

      if (controlsEl) {
        let btns = '';
        btns += `<button class="btn-page" ${usersCurrentPage === 1 ? 'disabled' : ''} onclick="changeUsersPage(${usersCurrentPage - 1})">‹ Anterior</button>`;
        for (let p = 1; p <= totalPages; p++) {
          if (p === 1 || p === totalPages || (p >= usersCurrentPage - 1 && p <= usersCurrentPage + 1)) {
            btns += `<button class="btn-page ${p === usersCurrentPage ? 'active' : ''}" onclick="changeUsersPage(${p})">${p}</button>`;
          } else if (p === usersCurrentPage - 2 || p === usersCurrentPage + 2) {
            btns += `<span style="color: var(--text-tertiary); padding: 0 4px;">...</span>`;
          }
        }
        btns += `<button class="btn-page ${usersCurrentPage === totalPages ? 'disabled' : ''} onclick="changeUsersPage(${usersCurrentPage + 1})">Siguiente ›</button>`;
        controlsEl.innerHTML = btns;
      }
    }

    window.changeUsersPage = function(p) {
      usersCurrentPage = p;
      renderUsersTable();
    };

    document.getElementById('users-search-input')?.addEventListener('input', applyUsersFilters);
    document.getElementById('users-filter-role')?.addEventListener('change', applyUsersFilters);
    document.getElementById('users-filter-sort')?.addEventListener('change', applyUsersFilters);
    document.getElementById('users-page-size')?.addEventListener('change', (e) => {
      usersPageSize = parseInt(e.target.value, 10) || 10;
      usersCurrentPage = 1;
      renderUsersTable();
    });

    // =======================================================
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
          if (kpiSub) kpiSub.textContent = `${st.completedCount || 0} completados • ${st.inProgressCount || 0} en curso`;
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

        return `
          <tr>
            <td>
              <strong style="color: #ffffff; display: block; font-family: var(--font-mono); font-size: 0.82rem;">${o.id}</strong>
              <span style="font-size: 0.72rem; color: var(--text-tertiary);">${dateStr}</span>
            </td>
            <td>
              <strong style="color: #ffffff; display: block; font-size: 0.88rem;">${o.userName || o.userId}</strong>
              <span style="font-size: 0.72rem; color: var(--text-tertiary);">ID: ${o.userId}</span>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                <span style="padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; ${platBadgeStyle}">
                  ${platIcon} ${o.platform || 'Red Social'}
                </span>
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan);">${(o.quantity || 0).toLocaleString()} uds.</span>
              </div>
              <strong style="color: #ffffff; font-size: 0.84rem;">${o.serviceName || o.serviceTitle}</strong>
            </td>
            <td>
              <div style="display: flex; align-items: center; gap: 6px; max-width: 260px;">
                <a href="${o.link.startsWith('http') ? o.link : 'https://' + o.link}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.8rem; font-family: var(--font-mono); word-break: break-all; max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  🔗 ${o.link}
                </a>
                <button type="button" class="btn-admin-action cyan" style="padding: 2px 6px; font-size: 0.68rem; flex-shrink: 0;" onclick="navigator.clipboard.writeText('${o.link}'); alert('Enlace copiado al portapapeles: ' + '${o.link}');" title="Copiar enlace objetivo">
                  Copiar
                </button>
              </div>
            </td>
            <td>
              <div style="font-family: var(--font-mono); font-weight: 800; color: #ffffff;">${priceGs} Gs.</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-cyan);">$${(o.pricePaidUsd || 0).toFixed(2)} USDT</div>
            </td>
            <td>
              ${isCompleted ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; padding: 4px 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800;">
                  ✓ Completado
                </span>
              ` : `
                <div>
                  <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; padding: 4px 10px; border-radius: 8px; font-size: 0.74rem; font-weight: 800;">
                    ⏳ En Preparación
                  </span>
                  <div style="font-size: 0.68rem; color: var(--text-tertiary); margin-top: 2px;">Plazo: 24 a 48 hs</div>
                </div>
              `}
            </td>
            <td>
              ${isCompleted ? `
                <span style="color: #34d399; font-size: 0.76rem; font-weight: 700;">✓ Despachado</span>
              ` : `
                <button type="button" class="btn-admin-action emerald" onclick="completeSmmOrder('${o.id}')" style="padding: 6px 12px; font-size: 0.76rem; font-weight: 800; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);">
                  ✓ Marcar Completado
                </button>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }

    async function completeSmmOrder(orderId) {
      if (!confirm('¿Confirmas que ya has cargado este servicio en el perfil del cliente y deseas marcarlo como COMPLETADO?')) return;
      try {
        const res = await fetch(`/api/admin/smm/orders/${orderId}/complete`, { method: 'POST' });
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
    }

    document.getElementById('form-platform-settings')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const exchangeRatePyg = document.getElementById('settings-rate-pyg').value;
      const commissionPercent = document.getElementById('settings-commission').value;
      
      const bankName = document.getElementById('settings-bank-name')?.value || '';
      const bankHolder = document.getElementById('settings-bank-holder')?.value || '';
      const bankDoc = document.getElementById('settings-bank-doc')?.value || '';
      const bankAccount = document.getElementById('settings-bank-acc')?.value || '';
      const bankAlias = document.getElementById('settings-bank-alias')?.value || '';

      const binanceId = document.getElementById('settings-binance-id')?.value || '';
      const binanceWallet = document.getElementById('settings-binance-wallet')?.value || '';

      try {
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exchangeRatePyg,
            commissionPercent,
            paraguayBankDetails: {
              bank: bankName,
              accountHolder: bankHolder,
              rucOrCi: bankDoc,
              accountNumber: bankAccount,
              aliasSipap: bankAlias
            },
            binanceDetails: {
              payId: binanceId,
              walletAddress: binanceWallet
            }
          })
        });
        const data = await res.json();
        alert(data.message || 'Configuración bancaria y financiera guardada con éxito.');
        adminExchangeRate = parseInt(exchangeRatePyg, 10);
        document.getElementById('header-rate-display').textContent = `1 USDT = ${adminExchangeRate.toLocaleString('es-PY')} Gs.`;
      } catch (err) { alert('Error al guardar configuración bancaria.'); }
    });

    // =======================================================
    // TAB: CUSTODY PAYOUTS (LISTO PARA PAGAR) ENGINE
    // =======================================================
    async function loadCustodyPayouts() {
      try {
        const res = await fetch('/api/admin/payouts/custody');
        const data = await res.json();
        if (!data.success) return;

        const { stats, payouts } = data;

        // Badges & Stats
        const badgeReady = document.getElementById('badge-ready-payouts');
        const ovReady = document.getElementById('overview-badge-ready-payouts');
        if (badgeReady) {
          if (stats.readyForReleaseCount > 0) {
            badgeReady.textContent = stats.readyForReleaseCount;
            badgeReady.style.display = 'inline-block';
          } else {
            badgeReady.style.display = 'none';
          }
        }
        if (ovReady) {
          if (stats.readyForReleaseCount > 0) {
            ovReady.textContent = `${stats.readyForReleaseCount} listos`;
            ovReady.style.display = 'inline-block';
          } else {
            ovReady.style.display = 'none';
          }
        }

        const statCount = document.getElementById('stat-custody-count');
        if (statCount) statCount.textContent = stats.totalPendingSales || 0;

        const statTotalPyg = document.getElementById('stat-custody-total-pyg');
        if (statTotalPyg) statTotalPyg.textContent = `${(stats.totalPendingPayoutPyg || 0).toLocaleString('es-PY')} Gs. en retención`;

        const statReadyCount = document.getElementById('stat-custody-ready-count');
        if (statReadyCount) statReadyCount.textContent = stats.readyForReleaseCount || 0;

        const statCommUsd = document.getElementById('stat-custody-commissions-usd');
        if (statCommUsd) {
          const totalCommUsd = (payouts || []).reduce((sum, p) => sum + (p.commissionUsd || 0), 0);
          statCommUsd.textContent = `$${totalCommUsd.toFixed(2)} USDT`;
        }

        renderCustodyPayoutsTable(payouts || []);
      } catch (err) {
        console.error('Error loading custody payouts:', err);
      }
    }

    function renderCustodyPayoutsTable(payouts) {
      const tbody = document.getElementById('table-custody-payouts-list');
      if (!tbody) return;

      if (payouts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No hay ventas registradas en custodia en este momento.</td></tr>';
        return;
      }

      tbody.innerHTML = payouts.map(p => {
        const isPaid = p.payoutStatus === 'paid';
        const isReady = p.isReadyForRelease && !isPaid;

        return `
          <tr>
            <td>
              <strong style="color: #ffffff; display: block;">${p.serviceName}</strong>
              <span class="btn-admin-action cyan" style="padding: 1px 6px; font-size: 0.68rem;">Perfil #${p.slotNumber}</span>
            </td>
            <td>
              <strong style="color: #ffffff; display: block;">${p.sellerName}</strong>
              <span style="font-size: 0.72rem; color: var(--text-tertiary);">${p.sellerEmail || p.sellerId}</span>
            </td>
            <td>
              <strong style="color: #ffffff; display: block;">${p.buyerName}</strong>
              <span style="font-size: 0.72rem; color: var(--text-tertiary);">${p.buyerId}</span>
            </td>
            <td>
              <div style="font-size: 0.76rem; color: #94a3b8;">Venta: ${new Date(p.purchaseDate).toLocaleDateString('es-PY')}</div>
              <div style="font-size: 0.74rem; color: var(--text-tertiary);">Vence: ${new Date(p.expiresAt).toLocaleDateString('es-PY')}</div>
            </td>
            <td>
              ${isPaid ? `
                <span class="btn-admin-action" style="padding: 2px 8px; font-size: 0.72rem; background: rgba(255,255,255,0.06); color: #94a3b8;">
                  Completado
                </span>
              ` : isReady ? `
                <span class="btn-admin-action emerald" style="padding: 2px 8px; font-size: 0.72rem; font-weight: 800;">
                  ⚡ Listo para Pagar (0 días)
                </span>
              ` : `
                <span class="btn-admin-action amber" style="padding: 2px 8px; font-size: 0.72rem;">
                  ⏳ Faltan ${p.daysRemaining} días
                </span>
              `}
            </td>
            <td>
              <div style="font-family: var(--font-mono); font-weight: 700; color: #ffffff;">${p.pricePaidPyg.toLocaleString('es-PY')} Gs.</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">$${p.pricePaidUsd.toFixed(2)} USDT</div>
            </td>
            <td>
              <span style="color: var(--accent-cyan); font-weight: 700;">${p.commissionPercent}%</span>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8;">$${p.commissionUsd.toFixed(2)}</div>
            </td>
            <td>
              <div style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald); font-size: 0.92rem;">${p.netPayoutPyg.toLocaleString('es-PY')} Gs.</div>
              <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-emerald);">$${p.netPayoutUsd.toFixed(2)} USDT</div>
            </td>
            <td>
              ${isPaid ? `
                <span style="font-size: 0.74rem; color: var(--accent-emerald); font-weight: 700; display: flex; align-items: center; gap: 4px;">
                  ✓ Pago Liberado
                </span>
              ` : `
                <button class="btn-admin-action ${isReady ? 'emerald' : 'amber'}" onclick="releaseSellerPayout('${p.slotId}', '${p.sellerName}', ${p.netPayoutPyg})" style="padding: 7px 12px; font-size: 0.78rem; font-weight: 800;">
                  <span>${isReady ? '⚡ Liberar Pago' : 'Liberar Pago (Manual)'}</span>
                </button>
              `}
            </td>
          </tr>
        `;
      }).join('');
    }

    window.releaseSellerPayout = async function(slotId, sellerName, amountPyg) {
      if (!confirm(`¿Confirmas la liberación del pago de ${amountPyg.toLocaleString('es-PY')} Gs. a ${sellerName}? Se acreditará de inmediato a su saldo disponible.`)) {
        return;
      }

      try {
        const res = await fetch(`/api/admin/payouts/release/${slotId}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert(`🎉 ${data.message}`);
          loadCustodyPayouts();
          loadAdminData();
        } else {
          alert(data.error || 'No se pudo liberar el pago.');
        }
      } catch (err) {
        alert('Error al conectar con el servidor.');
      }
    };

    // =======================================================
    // TAB: GESTIÓN DE SERVICIOS DE STREAMING & MONETIZACIÓN
    // =======================================================
    let currentStreamingServices = [];
    let streamingSearchQuery = '';
    let streamingCurrentPage = 1;
    const streamingPageSize = 10;

    async function loadServicesConfig() {
      try {
        const res = await fetch('/api/admin/streaming-services');
        const data = await res.json();
        if (!data.success) return;

        currentStreamingServices = data.services || [];
        renderServicesConfigTable();
      } catch (err) {
        console.error('Error loading streaming services:', err);
      }
    }

    function getFilteredStreamingServices() {
      if (!streamingSearchQuery) return currentStreamingServices;
      const q = streamingSearchQuery.toLowerCase().trim();
      return currentStreamingServices.filter(s => {
        const name = (s.name || '').toLowerCase();
        const id = (s.id || '').toLowerCase();
        const plan = (s.planName || '').toLowerCase();
        const badge = (s.badgeText || '').toLowerCase();
        return name.includes(q) || id.includes(q) || plan.includes(q) || badge.includes(q);
      });
    }

    function renderServicesConfigTable() {
      const tbody = document.getElementById('table-services-pricing-list');
      if (!tbody) return;

      const filtered = getFilteredStreamingServices();
      const totalItems = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / streamingPageSize));

      if (streamingCurrentPage > totalPages) {
        streamingCurrentPage = totalPages;
      }

      const startIndex = (streamingCurrentPage - 1) * streamingPageSize;
      const endIndex = Math.min(startIndex + streamingPageSize, totalItems);
      const pageItems = filtered.slice(startIndex, endIndex);

      // Search counter badge
      const countEl = document.getElementById('streaming-search-count');
      if (countEl) {
        if (streamingSearchQuery) {
          countEl.innerHTML = `<span style="color: var(--accent-cyan); font-weight: 700;">${totalItems}</span> de ${currentStreamingServices.length} servicios encontrados`;
        } else {
          countEl.innerHTML = `Total: <strong style="color: #ffffff;">${totalItems}</strong> servicios`;
        }
      }

      if (totalItems === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-tertiary); padding: 2.5rem;">No hay servicios de streaming creados. Haz clic en <strong>"+ Crear Nuevo Servicio"</strong> para agregar uno.</td></tr>';
        renderStreamingPagination(0, 0, 0, 1);
        return;
      }

      tbody.innerHTML = pageItems.map(s => {
        const pricePyg = s.pricePerSlotPyg || 25000;
        const comm = s.commissionPercent !== undefined ? s.commissionPercent : 10;
        const netSlot = Math.round(pricePyg * (1 - comm / 100));
        const maxSlots = s.maxSlots || 5;
        const iconUrl = s.iconUrl || s.thumbnailUrl || '/assets/branding/icon.png';
        const bannerUrl = s.bannerHorizontal || '/assets/branding/icon.png';
        const waiting = s.waitingCount || 0;
        const isActive = s.isActive !== false;
        const usdPrice = (s.pricePerSlotUsd || (pricePyg / 7500)).toFixed(2);

        return `
          <tr>
            <td style="white-space: nowrap;">
              <div style="display: inline-flex; align-items: center; gap: 10px;">
                <img src="${iconUrl}" alt="${s.name}" style="width: 34px; height: 34px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.12); flex-shrink: 0;" onerror="this.src='/assets/branding/icon.png'">
                <div>
                  <strong style="color: #ffffff; font-size: 0.88rem; display: inline-block;">${s.name}</strong>
                  <span style="display: inline-block; font-size: 0.72rem; color: var(--accent-cyan); background: rgba(0,194,255,0.08); padding: 2px 7px; border-radius: 6px; border: 1px solid rgba(0,194,255,0.2); margin-left: 6px;">${s.planName || `Plan ${maxSlots} Pantallas`}</span>
                  <span style="display: inline-block; font-size: 0.65rem; background: rgba(255,255,255,0.05); padding: 1px 5px; border-radius: 4px; color: var(--text-tertiary); margin-left: 4px;">ID: ${s.id}</span>
                </div>
              </div>
            </td>
            <td style="white-space: nowrap;">
              <div style="width: 76px; height: 36px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); background: #000; display: inline-block; vertical-align: middle;">
                <img src="${bannerUrl}" alt="${s.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/assets/branding/icon.png'">
              </div>
            </td>
            <td style="white-space: nowrap;">
              <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-cyan); font-size: 0.9rem;">${pricePyg.toLocaleString('es-PY')} Gs.</span>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-tertiary); margin-left: 4px;">($${usdPrice})</span>
            </td>
            <td style="white-space: nowrap; text-align: center;">
              <span style="font-weight: 800; color: #ffffff; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 3px 9px; border-radius: 7px; font-size: 0.82rem;">
                ${maxSlots} cupos
              </span>
            </td>
            <td style="white-space: nowrap;">
              <span style="font-weight: 800; color: var(--accent-amber); font-size: 0.88rem;">${comm}%</span>
              <span style="font-size: 0.74rem; color: var(--text-tertiary); margin-left: 4px;">(${Math.round(pricePyg * (comm / 100)).toLocaleString('es-PY')} Gs.)</span>
            </td>
            <td style="white-space: nowrap;">
              <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald); font-size: 0.9rem;">${netSlot.toLocaleString('es-PY')} Gs.</span>
              <span style="font-size: 0.72rem; color: var(--text-tertiary);">/asiento</span>
            </td>
            <td style="white-space: nowrap;">
              <span style="padding: 3px 8px; font-size: 0.74rem; font-weight: 800; border-radius: 6px; ${waiting > 0 ? 'background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);' : 'background: rgba(255,255,255,0.04); color: var(--text-tertiary);'}">
                ${waiting > 0 ? `🔥 ${waiting} esperando` : '0 esperando'}
              </span>
            </td>
            <td style="white-space: nowrap;">
              <span style="padding: 3px 8px; font-size: 0.74rem; font-weight: 800; border-radius: 6px; ${isActive ? 'background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);' : 'background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);'}">
                ${isActive ? '🟢 Activo' : '🔴 Oculto'}
              </span>
            </td>
            <td style="white-space: nowrap; text-align: right;">
              <div style="display: inline-flex; gap: 6px; align-items: center;">
                <button type="button" class="btn-admin-action amber" onclick="openEditServiceModal('${s.id}')" title="Editar parámetros, imágenes y precios" style="padding: 5px 10px; font-size: 0.74rem; font-weight: 800;">
                  <span>✏️ Editar</span>
                </button>
                <a href="/service?platform=${s.id}" target="_blank" class="btn-admin-action cyan" title="Ver Hub en vivo" style="padding: 5px 8px; font-size: 0.74rem;">
                  <span>👁️</span>
                </a>
                <button type="button" class="btn-admin-action red" onclick="deleteStreamingService('${s.id}', '${s.name.replace(/'/g, "\\'")}')" title="Eliminar servicio" style="padding: 5px 8px; font-size: 0.74rem;">
                  <span>🗑️</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      renderStreamingPagination(startIndex + 1, endIndex, totalItems, totalPages);
    }

    function renderStreamingPagination(start, end, total, totalPages) {
      const infoEl = document.getElementById('streaming-pagination-info');
      const btnsEl = document.getElementById('streaming-pagination-buttons');
      if (!infoEl || !btnsEl) return;

      if (total === 0) {
        infoEl.textContent = 'Sin resultados';
        btnsEl.innerHTML = '';
        return;
      }

      infoEl.textContent = `Mostrando ${start} - ${end} de ${total} servicios`;

      let btnsHtml = `
        <button type="button" class="btn-page" ${streamingCurrentPage <= 1 ? 'disabled' : ''} onclick="changeStreamingPage(${streamingCurrentPage - 1})">
          ‹ Anterior
        </button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || (p >= streamingCurrentPage - 1 && p <= streamingCurrentPage + 1)) {
          btnsHtml += `
            <button type="button" class="btn-page ${p === streamingCurrentPage ? 'active' : ''}" onclick="changeStreamingPage(${p})">
              ${p}
            </button>
          `;
        } else if (p === streamingCurrentPage - 2 || p === streamingCurrentPage + 2) {
          btnsHtml += `<span style="color: var(--text-tertiary); padding: 0 4px;">...</span>`;
        }
      }

      btnsHtml += `
        <button type="button" class="btn-page" ${streamingCurrentPage >= totalPages ? 'disabled' : ''} onclick="changeStreamingPage(${streamingCurrentPage + 1})">
          Siguiente ›
        </button>
      `;

      btnsEl.innerHTML = btnsHtml;
    }

    window.changeStreamingPage = function(page) {
      streamingCurrentPage = page;
      renderServicesConfigTable();
    };

    // Live search listener
    document.getElementById('input-search-streaming')?.addEventListener('input', function(e) {
      streamingSearchQuery = e.target.value;
      streamingCurrentPage = 1;
      renderServicesConfigTable();
    });

    // --- RESET COMPLETO DE FORMULARIO E IMÁGENES DE SERVICIO ---
    window.resetCreateServiceForm = function() {
      const form = document.getElementById('form-create-streaming-service');
      if (form) form.reset();

      // Limpiar campos de texto explícitamente para evitar valores residuales
      ['create-srv-name', 'create-srv-id', 'create-srv-plan', 'create-srv-badge', 'create-srv-tagline', 'create-srv-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      // Limpiar 100% las imágenes (inputs, URLs y vistas previas)
      const iconUrl = document.getElementById('create-srv-icon-url');
      if (iconUrl) iconUrl.value = '';
      const iconFile = document.getElementById('file-create-srv-icon');
      if (iconFile) iconFile.value = '';
      const previewIcon = document.getElementById('preview-create-srv-icon');
      if (previewIcon) {
        previewIcon.style.display = 'none';
        const img = previewIcon.querySelector('img');
        if (img) img.src = '';
      }

      const bannerUrl = document.getElementById('create-srv-banner-url');
      if (bannerUrl) bannerUrl.value = '';
      const bannerFile = document.getElementById('file-create-srv-banner');
      if (bannerFile) bannerFile.value = '';
      const previewBanner = document.getElementById('preview-create-srv-banner');
      if (previewBanner) {
        previewBanner.style.display = 'none';
        const img = previewBanner.querySelector('img');
        if (img) img.src = '';
      }

      // Restablecer valores numéricos por defecto
      const priceEl = document.getElementById('create-srv-price');
      if (priceEl) priceEl.value = '25000';
      const slotsEl = document.getElementById('create-srv-slots');
      if (slotsEl) slotsEl.value = '5';
      const commEl = document.getElementById('create-srv-comm');
      if (commEl) commEl.value = '10';

      updateCreateModalCalc();
    };

    // --- POPUP DE ESTADO / FEEDBACK PARA SERVICIOS ---
    window.showStreamingPopupStatus = function(state, title, desc, autoCloseMs = 0, onAutoClose = null) {
      const popup = document.getElementById('popup-status-streaming');
      if (!popup) return;

      const iconWrap = document.getElementById('popup-status-icon-wrap');
      const titleEl = document.getElementById('popup-status-title');
      const descEl = document.getElementById('popup-status-desc');
      const actionEl = document.getElementById('popup-status-action');

      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
      if (actionEl) actionEl.style.display = (state === 'error') ? 'block' : 'none';

      if (iconWrap) {
        if (state === 'loading') {
          iconWrap.innerHTML = `
            <div style="width: 52px; height: 52px; border: 3px solid rgba(0, 194, 255, 0.2); border-top-color: var(--accent-cyan); border-radius: 50%; animation: spinPublish 0.8s linear infinite; margin: 0 auto;"></div>
          `;
        } else if (state === 'success') {
          iconWrap.innerHTML = `
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 2px solid rgba(16, 185, 129, 0.5); display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 1.9rem; color: #10b981; animation: popScale 0.3s ease-out;">
              ✓
            </div>
          `;
        } else if (state === 'error') {
          iconWrap.innerHTML = `
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: 2px solid rgba(239, 68, 68, 0.5); display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 1.9rem; color: #ef4444; animation: popScale 0.3s ease-out;">
              ✕
            </div>
          `;
        }
      }

      popup.style.display = 'flex';

      if (autoCloseMs > 0) {
        setTimeout(() => {
          popup.style.display = 'none';
          if (typeof onAutoClose === 'function') onAutoClose();
        }, autoCloseMs);
      }
    };

    window.closePublishStatusPopup = function() {
      const popup = document.getElementById('popup-status-streaming');
      if (popup) popup.style.display = 'none';
    };

    // --- MODAL: CREAR SERVICIO ---
    window.openCreateServiceModal = function(defaultCategory = 'streaming') {
      const modal = document.getElementById('modal-create-streaming-service');
      resetCreateServiceForm();
      const catSelect = document.getElementById('create-srv-category');
      if (catSelect) {
        catSelect.value = defaultCategory;
      }
      const titleEl = document.getElementById('create-srv-modal-title');
      if (titleEl) {
        titleEl.textContent = defaultCategory === 'ai_tools' ? 'Crear Nueva App Pro / Cuenta IA' : 'Crear Nuevo Servicio de Streaming';
      }
      if (modal) modal.style.display = 'grid';
    };

    window.closeCreateServiceModal = function() {
      const modal = document.getElementById('modal-create-streaming-service');
      if (modal) modal.style.display = 'none';
      resetCreateServiceForm();
    };

    window.updateCreateModalCalc = function() {
      const price = Math.round(parseFloat(document.getElementById('create-srv-price')?.value) || 0);
      const slots = parseInt(document.getElementById('create-srv-slots')?.value, 10) || 1;
      const comm = parseFloat(document.getElementById('create-srv-comm')?.value) || 0;

      const netSlot = Math.round(price * (1 - comm / 100));
      const totalAccount = netSlot * slots;

      const elSlot = document.getElementById('create-calc-net-slot');
      const elAcc = document.getElementById('create-calc-total-account');

      if (elSlot) elSlot.textContent = `${netSlot.toLocaleString('es-PY')} Gs.`;
      if (elAcc) elAcc.textContent = `${totalAccount.toLocaleString('es-PY')} Gs. / mes`;
    };

    // Create Service Image Handlers
    document.getElementById('file-create-srv-icon')?.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          document.getElementById('create-srv-icon-url').value = evt.target.result;
          const box = document.getElementById('preview-create-srv-icon');
          if (box) {
            box.style.display = 'block';
            box.querySelector('img').src = evt.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    });

    document.getElementById('file-create-srv-banner')?.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          document.getElementById('create-srv-banner-url').value = evt.target.result;
          const box = document.getElementById('preview-create-srv-banner');
          if (box) {
            box.style.display = 'block';
            box.querySelector('img').src = evt.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Create Service Submit
    document.getElementById('form-create-streaming-service')?.addEventListener('submit', async function(e) {
      e.preventDefault();
      const srvName = document.getElementById('create-srv-name').value.trim();
      const srvId = document.getElementById('create-srv-id').value.trim() || srvName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const category = document.getElementById('create-srv-category')?.value || 'streaming';
      const iconVal = document.getElementById('create-srv-icon-url').value.trim();
      const bannerVal = document.getElementById('create-srv-banner-url').value.trim();

      const payload = {
        name: srvName,
        id: srvId,
        category: category,
        planName: document.getElementById('create-srv-plan').value.trim(),
        badgeText: document.getElementById('create-srv-badge').value.trim(),
        tagline: document.getElementById('create-srv-tagline').value.trim(),
        description: document.getElementById('create-srv-desc').value.trim(),
        iconUrl: iconVal || bannerVal || '',
        bannerHorizontal: bannerVal || iconVal || '',
        pricePerSlotPyg: Math.round(parseFloat(document.getElementById('create-srv-price').value) || 25000),
        maxSlots: parseInt(document.getElementById('create-srv-slots').value, 10) || 5,
        commissionPercent: parseFloat(document.getElementById('create-srv-comm').value) || 10,
        isActive: true
      };

      // 1. Mostrar popup "Publicando servicio..." con loader animado
      showStreamingPopupStatus('loading', 'Publicando servicio...', `Guardando "${srvName}" y publicando en el catálogo...`);

      try {
        const res = await fetch('/api/admin/streaming-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          // 2. Resetear inmediatamente todo el formulario y TODAS las imágenes para que quede completamente limpio
          resetCreateServiceForm();
          loadServicesConfig();
          loadWorkToolsData();

          // 3. Mostrar estado Verificado que se cierra solo en 1.5s y mantiene la pantalla lista para subir el siguiente servicio
          showStreamingPopupStatus(
            'success',
            '¡Servicio Verificado & Publicado!',
            data.message || `El servicio "${srvName}" ya está activo en el catálogo.`,
            1500,
            () => {
              // Mantener el modal abierto con todo reseteado para subir más servicios inmediatamente
              const modal = document.getElementById('modal-create-streaming-service');
              if (modal) modal.style.display = 'grid';
              document.getElementById('create-srv-name')?.focus();
            }
          );
        } else {
          showStreamingPopupStatus('error', 'No se pudo publicar', data.error || 'Error al crear el servicio.');
        }
      } catch (err) {
        showStreamingPopupStatus('error', 'Error de conexión', 'No se pudo conectar con el servidor.');
      }
    });

    // --- MODAL: EDITAR SERVICIO ---
    window.openEditServiceModal = function(serviceId) {
      const s = currentStreamingServices.find(item => item.id === serviceId);
      if (!s) return;

      document.getElementById('edit-srv-id').value = s.id;
      document.getElementById('edit-srv-name').value = s.name || '';
      document.getElementById('edit-srv-status').value = s.isActive !== false ? 'true' : 'false';

      const catSelect = document.getElementById('edit-srv-category');
      if (catSelect) {
        catSelect.value = (s.category === 'ai_tools' || s.category === 'work_tools' || ['chatgpt', 'claude', 'gemini', 'minea', 'canva', 'midjourney', 'dise-o-premium-plantillas'].includes(s.id)) ? 'ai_tools' : 'streaming';
      }

      document.getElementById('edit-srv-plan').value = s.planName || '';
      document.getElementById('edit-srv-badge').value = s.badgeText || '';
      document.getElementById('edit-srv-tagline').value = s.tagline || '';
      document.getElementById('edit-srv-desc').value = s.description || '';
      document.getElementById('edit-srv-icon-url').value = s.iconUrl || s.thumbnailUrl || '';
      document.getElementById('edit-srv-banner-url').value = s.bannerHorizontal || '';
      document.getElementById('edit-srv-price').value = s.pricePerSlotPyg || 25000;
      document.getElementById('edit-srv-slots').value = s.maxSlots || 5;
      document.getElementById('edit-srv-comm').value = s.commissionPercent !== undefined ? s.commissionPercent : 10;
      document.getElementById('edit-srv-waiting').value = s.waitingCount || 0;

      const imgIcon = document.getElementById('img-preview-edit-icon');
      if (imgIcon) imgIcon.src = s.iconUrl || s.thumbnailUrl || '/assets/branding/icon.png';

      const imgBanner = document.getElementById('img-preview-edit-banner');
      if (imgBanner) imgBanner.src = s.bannerHorizontal || '/assets/branding/icon.png';

      updateEditModalCalc();

      const modal = document.getElementById('modal-edit-streaming-service');
      if (modal) modal.style.display = 'grid';
    };

    window.closeEditServiceModal = function() {
      const modal = document.getElementById('modal-edit-streaming-service');
      if (modal) modal.style.display = 'none';
    };

    window.updateEditModalCalc = function() {
      const price = Math.round(parseFloat(document.getElementById('edit-srv-price')?.value) || 0);
      const slots = parseInt(document.getElementById('edit-srv-slots')?.value, 10) || 1;
      const comm = parseFloat(document.getElementById('edit-srv-comm')?.value) || 0;

      const netSlot = Math.round(price * (1 - comm / 100));
      const totalAccount = netSlot * slots;

      const elSlot = document.getElementById('edit-calc-net-slot');
      const elAcc = document.getElementById('edit-calc-total-account');

      if (elSlot) elSlot.textContent = `${netSlot.toLocaleString('es-PY')} Gs.`;
      if (elAcc) elAcc.textContent = `${totalAccount.toLocaleString('es-PY')} Gs. / mes`;
    };

    // Edit Service Image Handlers
    document.getElementById('file-edit-srv-icon')?.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          document.getElementById('edit-srv-icon-url').value = evt.target.result;
          const img = document.getElementById('img-preview-edit-icon');
          if (img) img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    document.getElementById('file-edit-srv-banner')?.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          document.getElementById('edit-srv-banner-url').value = evt.target.result;
          const img = document.getElementById('img-preview-edit-banner');
          if (img) img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // Edit Service Submit
    document.getElementById('form-edit-streaming-service')?.addEventListener('submit', async function(e) {
      e.preventDefault();
      const serviceId = document.getElementById('edit-srv-id').value;
      const category = document.getElementById('edit-srv-category')?.value || 'streaming';
      const iconVal = document.getElementById('edit-srv-icon-url').value.trim();
      const bannerVal = document.getElementById('edit-srv-banner-url').value.trim();

      const payload = {
        name: document.getElementById('edit-srv-name').value.trim(),
        category: category,
        isActive: document.getElementById('edit-srv-status').value === 'true',
        planName: document.getElementById('edit-srv-plan').value.trim(),
        badgeText: document.getElementById('edit-srv-badge').value.trim(),
        tagline: document.getElementById('edit-srv-tagline').value.trim(),
        description: document.getElementById('edit-srv-desc').value.trim(),
        iconUrl: iconVal || bannerVal || '',
        bannerHorizontal: bannerVal || iconVal || '',
        pricePerSlotPyg: Math.round(parseFloat(document.getElementById('edit-srv-price').value) || 25000),
        maxSlots: parseInt(document.getElementById('edit-srv-slots').value, 10) || 5,
        commissionPercent: parseFloat(document.getElementById('edit-srv-comm').value) || 10,
        waitingCount: parseInt(document.getElementById('edit-srv-waiting').value, 10) || 0
      };

      showStreamingPopupStatus('loading', 'Guardando cambios...', `Actualizando configuración de ${payload.name}...`);

      try {
        const res = await fetch(`/api/admin/streaming-services/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          closeEditServiceModal();
          loadServicesConfig();
          loadWorkToolsData();
          showStreamingPopupStatus('success', '¡Cambios Guardados!', data.message || 'Servicio actualizado con éxito.', 1400);
        } else {
          showStreamingPopupStatus('error', 'Error al actualizar', data.error || 'No se pudo actualizar el servicio.');
        }
      } catch (err) {
        showStreamingPopupStatus('error', 'Error de conexión', 'No se pudo conectar con el servidor.');
      }
    });

    // Delete Service
    window.deleteStreamingService = async function(serviceId, serviceName) {
      if (!confirm(`¿Estás seguro de eliminar el servicio "${serviceName}"? Ya no aparecerá en el catálogo ni en la página de inicio.`)) {
        return;
      }

      try {
        const res = await fetch(`/api/admin/streaming-services/${serviceId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          alert(`🗑️ ${data.message}`);
          loadServicesConfig();
          loadWorkToolsData();
        } else {
          alert(data.error || 'No se pudo eliminar el servicio.');
        }
      } catch (err) {
        alert('Error al conectar con el servidor.');
      }
    };

    // =======================================================
    // TAB 11: PERSONALIZACIÓN SAAS & MARCA BLANCA ENGINE
    // =======================================================
    let currentTenantData = null;

    window.applyPresetColor = function(primary, accent) {
      const pInput = document.getElementById('tenant-primary-color');
      const pPicker = document.getElementById('tenant-primary-color-picker');
      const aInput = document.getElementById('tenant-accent-color');
      const aPicker = document.getElementById('tenant-accent-color-picker');

      if (pInput) pInput.value = primary;
      if (pPicker) pPicker.value = primary;
      if (aInput) aInput.value = accent;
      if (aPicker) aPicker.value = accent;
    };

    // Color Pickers input sync
    document.getElementById('tenant-primary-color-picker')?.addEventListener('input', (e) => {
      const el = document.getElementById('tenant-primary-color');
      if (el) el.value = e.target.value;
    });
    document.getElementById('tenant-primary-color')?.addEventListener('input', (e) => {
      const el = document.getElementById('tenant-primary-color-picker');
      if (el && e.target.value.match(/^#[0-9a-f]{6}$/i)) el.value = e.target.value;
    });

    document.getElementById('tenant-accent-color-picker')?.addEventListener('input', (e) => {
      const el = document.getElementById('tenant-accent-color');
      if (el) el.value = e.target.value;
    });
    document.getElementById('tenant-accent-color')?.addEventListener('input', (e) => {
      const el = document.getElementById('tenant-accent-color-picker');
      if (el && e.target.value.match(/^#[0-9a-f]{6}$/i)) el.value = e.target.value;
    });

    // Logo Upload File Handler
    document.getElementById('file-tenant-logo')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const base64 = await compressImage(file, 600, 0.9);
        document.getElementById('tenant-logo-url').value = base64;
        const preview = document.getElementById('img-preview-tenant-logo');
        if (preview) preview.src = base64;
      } catch (err) {
        alert('Error al procesar logo: ' + err.message);
      }
    });

    // Favicon Upload File Handler
    document.getElementById('file-tenant-favicon')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const base64 = await compressImage(file, 128, 0.9);
        document.getElementById('tenant-favicon-url').value = base64;
        const preview = document.getElementById('img-preview-tenant-favicon');
        if (preview) preview.src = base64;
      } catch (err) {
        alert('Error al procesar favicon: ' + err.message);
      }
    });

    // URL input live previews
    document.getElementById('tenant-logo-url')?.addEventListener('input', (e) => {
      const preview = document.getElementById('img-preview-tenant-logo');
      if (preview && e.target.value) preview.src = e.target.value;
    });

    document.getElementById('tenant-favicon-url')?.addEventListener('input', (e) => {
      const preview = document.getElementById('img-preview-tenant-favicon');
      if (preview && e.target.value) preview.src = e.target.value;
    });

    async function loadTenantSettings() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tenantSlug = urlParams.get('tenant') || urlParams.get('t') || '';
        const headers = tenantSlug ? { 'x-tenant-slug': tenantSlug } : {};

        const res = await fetch('/api/tenant/current', { headers });
        const data = await res.json();

        if (data && data.success && data.tenant) {
          currentTenantData = data.tenant;
          const t = data.tenant;
          const b = t.branding || {};
          const s = t.settings || {};
          const pb = s.paraguayBankDetails || {};
          const bin = s.binanceDetails || {};
          const mods = s.enabledModules || {};

          // Populate Form Fields
          if (document.getElementById('tenant-brand-name')) document.getElementById('tenant-brand-name').value = b.brandName || t.name || '';
          if (document.getElementById('tenant-logo-url')) document.getElementById('tenant-logo-url').value = b.logoUrl || '';
          if (document.getElementById('img-preview-tenant-logo')) document.getElementById('img-preview-tenant-logo').src = b.logoUrl || '/assets/branding/logo.png';
          if (document.getElementById('tenant-favicon-url')) document.getElementById('tenant-favicon-url').value = b.iconUrl || '';
          if (document.getElementById('img-preview-tenant-favicon')) document.getElementById('img-preview-tenant-favicon').src = b.iconUrl || '/assets/branding/icon.png';

          const pColor = b.primaryColor || '#0284c7';
          const aColor = b.accentColor || '#00c2ff';
          if (document.getElementById('tenant-primary-color')) document.getElementById('tenant-primary-color').value = pColor;
          if (document.getElementById('tenant-primary-color-picker')) document.getElementById('tenant-primary-color-picker').value = pColor;
          if (document.getElementById('tenant-accent-color')) document.getElementById('tenant-accent-color').value = aColor;
          if (document.getElementById('tenant-accent-color-picker')) document.getElementById('tenant-accent-color-picker').value = aColor;

          if (document.getElementById('tenant-subdomain-url')) {
            document.getElementById('tenant-subdomain-url').textContent = `https://${t.slug}.gamsplit.com`;
          }
          if (document.getElementById('tenant-live-store-link')) {
            document.getElementById('tenant-live-store-link').href = `/store?tenant=${t.slug}`;
          }
          if (document.getElementById('tenant-custom-domain')) {
            document.getElementById('tenant-custom-domain').value = t.customDomain && !t.customDomain.includes('.gamsplit.') ? t.customDomain : '';
          }

          if (document.getElementById('tenant-whatsapp')) document.getElementById('tenant-whatsapp').value = b.whatsappSupport || '+595981000000';
          if (document.getElementById('tenant-bank-name')) document.getElementById('tenant-bank-name').value = pb.bank || pb.bankName || 'Banco Familiar';
          if (document.getElementById('tenant-bank-holder')) document.getElementById('tenant-bank-holder').value = pb.accountHolder || pb.holderName || t.name;
          if (document.getElementById('tenant-bank-account')) document.getElementById('tenant-bank-account').value = pb.accountNumber || '01-000000-1';
          if (document.getElementById('tenant-bank-alias')) document.getElementById('tenant-bank-alias').value = pb.aliasSipap || `${t.slug}.py`;

          if (document.getElementById('tenant-binance-id')) document.getElementById('tenant-binance-id').value = bin.payId || bin.binancePayId || '849201934';
          if (document.getElementById('tenant-exchange-rate')) document.getElementById('tenant-exchange-rate').value = b.exchangeRate || 7500;

          if (document.getElementById('tenant-mod-streaming')) document.getElementById('tenant-mod-streaming').checked = mods.streaming !== false;
          if (document.getElementById('tenant-mod-games')) document.getElementById('tenant-mod-games').checked = mods.games !== false;
          if (document.getElementById('tenant-mod-giftcards')) document.getElementById('tenant-mod-giftcards').checked = mods.giftcards !== false;
          if (document.getElementById('tenant-mod-p2p')) document.getElementById('tenant-mod-p2p').checked = s.allowUserReselling !== false && mods.p2pSharing !== false;
          if (document.getElementById('tenant-commission-percent')) document.getElementById('tenant-commission-percent').value = s.commissionPercent || 3.0;
        }
      } catch (err) {
        console.error('Error loading tenant settings:', err);
      }
    }

    document.getElementById('form-tenant-customizer')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentTenantData || !currentTenantData.id) {
        alert('No se pudo identificar la tienda actual.');
        return;
      }

      const brandName = document.getElementById('tenant-brand-name').value.trim();
      const logoUrl = document.getElementById('tenant-logo-url').value.trim();
      const iconUrl = document.getElementById('tenant-favicon-url').value.trim();
      const primaryColor = document.getElementById('tenant-primary-color').value.trim();
      const accentColor = document.getElementById('tenant-accent-color').value.trim();
      const customDomain = document.getElementById('tenant-custom-domain').value.trim();
      const whatsapp = document.getElementById('tenant-whatsapp').value.trim();

      const bankName = document.getElementById('tenant-bank-name').value.trim();
      const bankHolder = document.getElementById('tenant-bank-holder').value.trim();
      const bankAccount = document.getElementById('tenant-bank-account').value.trim();
      const bankAlias = document.getElementById('tenant-bank-alias').value.trim();

      const binanceId = document.getElementById('tenant-binance-id').value.trim();
      const exchangeRate = parseFloat(document.getElementById('tenant-exchange-rate').value) || 7500;

      const modStreaming = document.getElementById('tenant-mod-streaming').checked;
      const modGames = document.getElementById('tenant-mod-games').checked;
      const modGiftcards = document.getElementById('tenant-mod-giftcards').checked;
      const modP2p = document.getElementById('tenant-mod-p2p').checked;
      const commissionPercent = parseFloat(document.getElementById('tenant-commission-percent').value) || 3.0;

      const btnSave = document.getElementById('btn-save-tenant-settings');
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.textContent = 'Guardando Cambios...';
      }

      try {
        const payload = {
          name: brandName,
          customDomain: customDomain || null,
          branding: {
            brandName: brandName,
            logoUrl: logoUrl || currentTenantData.branding?.logoUrl || '/assets/branding/logo.png',
            iconUrl: iconUrl || currentTenantData.branding?.iconUrl || '/assets/branding/icon.png',
            primaryColor: primaryColor || '#0284c7',
            accentColor: accentColor || '#00c2ff',
            whatsappSupport: whatsapp || '+595981000000',
            exchangeRate: exchangeRate,
            currency: 'PYG'
          },
          settings: {
            commissionPercent: commissionPercent,
            allowUserReselling: modP2p,
            paraguayBankDetails: {
              bank: bankName,
              accountHolder: bankHolder,
              accountNumber: bankAccount,
              aliasSipap: bankAlias
            },
            binanceDetails: {
              payId: binanceId,
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

        const res = await fetch(`/api/saas/tenants/${currentTenantData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.success) {
          alert('🎉 ¡Configuración de tienda y marca guardada exitosamente!');
          loadTenantSettings();
        } else {
          alert(data.error || 'Error al guardar la configuración.');
        }
      } catch (err) {
        alert('Error de conexión con el servidor.');
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.textContent = '💾 Guardar Todos los Cambios de Tienda';
        }
      }
    });

    // Refresh & Logout
    document.getElementById('btn-refresh-admin')?.addEventListener('click', () => {
      loadAdminData();
    });

    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
      localStorage.removeItem('gb_admin_session');
      localStorage.removeItem('gb_user');
      localStorage.removeItem('gb_token');
      window.location.href = '/admin/login';
    });

    // Guard & WebSocket Real-time listener
    document.addEventListener('DOMContentLoaded', () => {
      initAdminSidebar();
      const adminSession = localStorage.getItem('gb_admin_session');
      if (!adminSession) {
        window.location.href = '/admin/login';
        return;
      }
      loadAdminData();
      loadCustodyPayouts();

      // Connect WebSocket for real-time order alerts
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const socket = new WebSocket(wsUrl);
        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'NEW_ORDER_PENDING') {
              loadPendingOrders();
              loadCustodyPayouts();
            } else if (msg.type === 'NEW_SMM_ORDER') {
              loadSmmOrders();
              loadAdminData();
            }
          } catch (err) {}
        };
      } catch (wsErr) {}
    });
  
    // =======================================================
    // ADMIN DIRECT "CREAR CUENTA" (STOCK OFICIAL PARA TIENDA)
    // =======================================================
    window.openAdminCreateAccountModal = async function() {
      const modal = document.getElementById('modal-admin-create-account');
      if (!modal) return;

      // Ensure services config is loaded
      if (!currentStreamingServices || currentStreamingServices.length === 0) {
        try {
          const res = await fetch('/api/admin/streaming-services');
          const data = await res.json();
          if (data.services) currentStreamingServices = data.services;
        } catch (e) {}
      }

      const select = document.getElementById('admin-acc-service-select');
      if (select && Array.isArray(currentStreamingServices) && currentStreamingServices.length > 0) {
        select.innerHTML = currentStreamingServices.map(s => `
          <option value="${s.id}" data-max-slots="${s.maxSlots || 5}" data-price="${s.pricePerSlotPyg || 25000}" data-icon="${s.iconUrl || s.thumbnailUrl || '/assets/branding/icon.png'}" data-plan="${s.planName || ''}">
            ${s.name} - ${(s.pricePerSlotPyg || 25000).toLocaleString('es-PY')} Gs. / asiento
          </option>
        `).join('');
        onAdminAccountServiceSelectChange();
      }

      // Default expiration date to 30 days in future
      const d = new Date();
      d.setDate(d.getDate() + 30);
      const expInput = document.getElementById('admin-acc-exp-date');
      if (expInput) expInput.value = d.toISOString().split('T')[0];

      modal.style.display = 'flex';
    };

    window.closeAdminCreateAccountModal = function() {
      const modal = document.getElementById('modal-admin-create-account');
      if (modal) modal.style.display = 'none';
    };

    window.onAdminAccountServiceSelectChange = function() {
      const select = document.getElementById('admin-acc-service-select');
      if (!select) return;
      const opt = select.selectedOptions[0];
      if (!opt) return;

      const maxSlots = parseInt(opt.dataset.maxSlots || '5', 10);
      const pricePyg = parseInt(opt.dataset.price || '25000', 10);
      const icon = opt.dataset.icon || '/assets/branding/icon.png';
      const plan = opt.dataset.plan || 'Plan Oficial';

      const iconPreview = document.getElementById('admin-acc-service-icon-preview');
      if (iconPreview) iconPreview.src = icon;
      const planPreview = document.getElementById('admin-acc-service-plan-preview');
      if (planPreview) planPreview.textContent = plan;
      const slotsInput = document.getElementById('admin-acc-total-slots');
      if (slotsInput) slotsInput.value = maxSlots;
      const priceInput = document.getElementById('admin-acc-price-pyg');
      if (priceInput) priceInput.value = pricePyg;

      renderAdminAccountProfilesInputs();
    };

    window.renderAdminAccountProfilesInputs = function() {
      const container = document.getElementById('admin-acc-profiles-container');
      if (!container) return;

      const totalSlots = Math.max(1, parseInt(document.getElementById('admin-acc-total-slots')?.value || '5', 10));
      let html = '';

      for (let i = 1; i <= totalSlots; i++) {
        html += `
          <div style="display: grid; grid-template-columns: 1fr 140px 140px; gap: 10px; align-items: center; background: rgba(5,7,14,0.7); border: 1px solid rgba(255,255,255,0.08); padding: 8px 12px; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.74rem; font-weight: 800; color: var(--accent-cyan); background: rgba(0,194,255,0.15); padding: 2px 7px; border-radius: 4px;">#${i}</span>
              <input type="text" class="admin-form-input profile-name-input" data-slot="${i}" value="Perfil ${i}" placeholder="Nombre de Perfil" style="padding: 6px 10px; font-size: 0.82rem;">
            </div>
            <div>
              <input type="text" class="admin-form-input profile-pin-input" data-slot="${i}" placeholder="PIN (ej: ${1000 + i * 111})" maxlength="8" style="padding: 6px 10px; font-size: 0.82rem; font-family: var(--font-mono); text-align: center;">
            </div>
            <div style="text-align: right;">
              <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.74rem; color: #34d399; cursor: pointer;">
                <input type="checkbox" class="profile-avail-checkbox" data-slot="${i}" checked style="width: 15px; height: 15px; accent-color: #10b981; cursor: pointer;">
                <span>Disponible</span>
              </label>
            </div>
          </div>
        `;
      }

      container.innerHTML = html;
    };

    document.getElementById('form-admin-create-account')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const serviceId = document.getElementById('admin-acc-service-select').value;
      const accountEmail = document.getElementById('admin-acc-email').value.trim();
      const accountPassword = document.getElementById('admin-acc-password').value.trim();
      const expirationDate = document.getElementById('admin-acc-exp-date').value;
      const totalSlots = parseInt(document.getElementById('admin-acc-total-slots').value, 10);
      const pricePerSlotPyg = parseInt(document.getElementById('admin-acc-price-pyg').value, 10);
      const instructions = document.getElementById('admin-acc-instructions').value.trim();

      // Collect profiles
      const profileNames = document.querySelectorAll('.profile-name-input');
      const profilePins = document.querySelectorAll('.profile-pin-input');
      const profileAvails = document.querySelectorAll('.profile-avail-checkbox');

      const profiles = [];
      let availableCount = 0;

      profileNames.forEach((input, idx) => {
        const slotNum = idx + 1;
        const name = input.value.trim() || `Perfil ${slotNum}`;
        const pin = profilePins[idx] ? profilePins[idx].value.trim() : '';
        const isAvailable = profileAvails[idx] ? profileAvails[idx].checked : true;
        if (isAvailable) availableCount++;

        profiles.push({
          slotNumber: slotNum,
          name,
          pin,
          isAvailable
        });
      });

      const btnSubmit = document.getElementById('btn-submit-admin-create-account');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Guardando Cuenta...';
      }

      try {
        const res = await fetch('/api/admin/streaming/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId,
            accountEmail,
            accountPassword,
            expirationDate,
            totalSlots,
            availableSlots: availableCount,
            pricePerSlotPyg,
            profiles,
            instructions
          })
        });

        const data = await res.json();
        if (data.success) {
          alert('🎉 ' + data.message);
          closeAdminCreateAccountModal();
          // Reset form
          document.getElementById('admin-acc-email').value = '';
          document.getElementById('admin-acc-password').value = '';
          loadStreamingData();
        } else {
          alert(data.error || 'No se pudo crear la cuenta.');
        }
      } catch (err) {
        alert('Error al conectar con el servidor.');
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<span>💾 Guardar y Publicar Cuenta en Tienda</span>';
        }
      }
    });


    // =======================================================
    // 08. HERRAMIENTAS DE TRABAJO & INTELIGENCIA ARTIFICIAL
    // =======================================================
    let allWorkToolsAccounts = [];
    let allWorkToolsCatalog = [];

    async function loadWorkToolsData() {
      try {
        const [servicesRes, activeSubsRes] = await Promise.all([
          fetch('/api/admin/streaming-services'),
          fetch('/api/admin/streaming/active')
        ]);

        const servicesData = await servicesRes.json();
        const activeSubsData = await activeSubsRes.json();

        const allServices = servicesData.services || [];
        currentStreamingServices = allServices;
        allWorkToolsCatalog = allServices.filter(s => s.category === 'ai_tools' || s.category === 'work_tools' || ['chatgpt', 'claude', 'gemini', 'minea', 'canva', 'midjourney', 'dise-o-premium-plantillas'].includes(s.id));

        const activeSubs = activeSubsData.subscriptions || [];
        allWorkToolsAccounts = activeSubs.filter(sub => {
          const sKey = (sub.serviceKey || sub.serviceId || '').toLowerCase();
          const sName = (sub.serviceName || '').toLowerCase();
          return allWorkToolsCatalog.some(t => t.id === sKey || sName.includes(t.id) || sName.includes('chatgpt') || sName.includes('claude') || sName.includes('gemini') || sName.includes('minea') || sName.includes('canva') || sName.includes('midjourney'));
        });

        // Update KPIs
        const totalCatalogEl = document.getElementById('tools-kpi-total-catalog');
        const totalAccountsEl = document.getElementById('tools-kpi-total-accounts');
        const accountsSubEl = document.getElementById('tools-kpi-accounts-sub');
        const availableSlotsEl = document.getElementById('tools-kpi-available-slots');
        const avgPriceEl = document.getElementById('tools-kpi-avg-price');
        const badgeCountEl = document.getElementById('badge-tools-count');

        let totalOccupiedSlots = 0;
        let totalAvailSlots = 0;

        allWorkToolsAccounts.forEach(acc => {
          const total = Math.max(1, acc.totalSlots || 2);
          const avail = acc.availableSlots !== undefined ? acc.availableSlots : total;
          totalAvailSlots += avail;
          totalOccupiedSlots += Math.max(0, total - avail);
        });

        if (totalCatalogEl) totalCatalogEl.textContent = `${allWorkToolsCatalog.length} Servicios`;
        if (totalAccountsEl) totalAccountsEl.textContent = `${allWorkToolsAccounts.length} Cuentas`;
        if (accountsSubEl) accountsSubEl.textContent = `${totalOccupiedSlots} Asientos Ocupados`;
        if (availableSlotsEl) availableSlotsEl.textContent = `${totalAvailSlots} Libres`;
        if (badgeCountEl) badgeCountEl.textContent = allWorkToolsCatalog.length;

        if (avgPriceEl) {
          const prices = allWorkToolsCatalog.map(s => s.pricePerSlotPyg || 0).filter(p => p > 0);
          const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
          avgPriceEl.textContent = `${avg.toLocaleString('es-PY')} Gs.`;
        }

        // Populate tool dropdown filter
        const filterSelect = document.getElementById('tools-filter-select');
        if (filterSelect) {
          const prevVal = filterSelect.value;
          filterSelect.innerHTML = '<option value="all">Todas las Apps / IAs</option>' + 
            allWorkToolsCatalog.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
          if (prevVal) filterSelect.value = prevVal;
        }

        // Render Subpane 1 CRUD Table
        renderAiToolsServicesCrudTable(allWorkToolsCatalog);

        // Render Subpane 2 Accounts Grid
        applyWorkToolsFilters();
      } catch (err) {
        console.error('Error loading work tools data:', err);
      }
    }

    function renderAiToolsServicesCrudTable(catalog) {
      const tbody = document.getElementById('table-ai-services-crud');
      if (!tbody) return;

      if (!catalog || catalog.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-tertiary); padding: 2.5rem;">No hay servicios de Apps Pro & Cuentas IA registrados. Haz clic en <strong>"+ Crear App Pro / Servicio IA"</strong> para agregar el primero con su portada horizontal.</td></tr>';
        return;
      }

      tbody.innerHTML = catalog.map(s => {
        const pricePyg = s.pricePerSlotPyg || 25000;
        const comm = s.commissionPercent !== undefined ? s.commissionPercent : 10;
        const netSlot = Math.round(pricePyg * (1 - comm / 100));
        const maxSlots = s.maxSlots || 5;
        const bannerUrl = s.bannerHorizontal || s.iconUrl || s.thumbnailUrl || '/assets/branding/icon.png';
        const iconUrl = s.iconUrl || s.thumbnailUrl || '/assets/branding/icon.png';
        const isActive = s.isActive !== false;
        const usdPrice = (s.pricePerSlotUsd || (pricePyg / 7500)).toFixed(2);

        return `
          <tr>
            <td style="white-space: nowrap;">
              <div style="width: 106px; height: 50px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); background: #07090e; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                <img src="${bannerUrl}" alt="${s.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/assets/branding/icon.png'">
              </div>
            </td>
            <td style="white-space: nowrap;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <img src="${iconUrl}" alt="${s.name}" style="width: 26px; height: 26px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);" onerror="this.src='/assets/branding/icon.png'">
                <div>
                  <strong style="color: #ffffff; font-size: 0.88rem; display: block;">${s.name}</strong>
                  ${s.badgeText ? `<span style="display: inline-block; font-size: 0.68rem; color: #c084fc; background: rgba(168,85,247,0.12); padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(168,85,247,0.25);">${s.badgeText}</span>` : ''}
                  <span style="display: inline-block; font-size: 0.65rem; background: rgba(255,255,255,0.05); padding: 1px 5px; border-radius: 4px; color: var(--text-tertiary); margin-left: 3px;">ID: ${s.id}</span>
                </div>
              </div>
            </td>
            <td style="white-space: nowrap;">
              <div style="font-weight: 700; color: #ffffff; font-size: 0.82rem;">${s.planName || 'Plan Pro / Plus'}</div>
              <div style="font-size: 0.72rem; color: var(--text-tertiary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s.tagline || s.description || 'Acceso directo'}</div>
            </td>
            <td style="white-space: nowrap;">
              <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-cyan); font-size: 0.9rem;">${pricePyg.toLocaleString('es-PY')} Gs.</span>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-tertiary); margin-left: 4px;">($${usdPrice})</span>
            </td>
            <td style="white-space: nowrap; text-align: center;">
              <span style="font-weight: 800; color: #ffffff; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 3px 9px; border-radius: 7px; font-size: 0.82rem;">
                ${maxSlots} asientos
              </span>
            </td>
            <td style="white-space: nowrap;">
              <span style="font-weight: 800; color: var(--accent-amber); font-size: 0.88rem;">${comm}%</span>
              <span style="font-size: 0.74rem; color: var(--text-tertiary); margin-left: 4px;">(${Math.round(pricePyg * (comm / 100)).toLocaleString('es-PY')} Gs.)</span>
            </td>
            <td style="white-space: nowrap;">
              <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-emerald); font-size: 0.9rem;">${netSlot.toLocaleString('es-PY')} Gs.</span>
              <span style="font-size: 0.72rem; color: var(--text-tertiary);">/mes</span>
            </td>
            <td style="white-space: nowrap;">
              <span style="padding: 3px 8px; font-size: 0.74rem; font-weight: 800; border-radius: 6px; ${isActive ? 'background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);' : 'background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);'}">
                ${isActive ? '🟢 Activo' : '🔴 Oculto'}
              </span>
            </td>
            <td style="white-space: nowrap; text-align: right;">
              <div style="display: inline-flex; gap: 6px; align-items: center;">
                <button type="button" class="btn-admin-action amber" onclick="openEditServiceModal('${s.id}')" title="Editar parámetros, imágenes y precios" style="padding: 5px 10px; font-size: 0.74rem; font-weight: 800;">
                  <span>✏️ Editar</span>
                </button>
                <a href="/service?platform=${s.id}" target="_blank" class="btn-admin-action cyan" title="Ver Hub en vivo" style="padding: 5px 8px; font-size: 0.74rem;">
                  <span>👁️</span>
                </a>
                <button type="button" class="btn-admin-action red" onclick="deleteStreamingService('${s.id}', '${s.name.replace(/'/g, "\\'")}')" title="Eliminar servicio" style="padding: 5px 8px; font-size: 0.74rem;">
                  <span>🗑️</span>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    function applyWorkToolsFilters() {
      const q = (document.getElementById('tools-search-input')?.value || '').toLowerCase().trim();
      const toolFilter = document.getElementById('tools-filter-select')?.value || 'all';
      const statusFilter = document.getElementById('tools-filter-status')?.value || 'all';

      let filtered = [...allWorkToolsAccounts];

      if (q) {
        filtered = filtered.filter(a =>
          (a.serviceName && a.serviceName.toLowerCase().includes(q)) ||
          (a.credentialsDecrypted && a.credentialsDecrypted.toLowerCase().includes(q)) ||
          (a.sellerName && a.sellerName.toLowerCase().includes(q))
        );
      }

      if (toolFilter !== 'all') {
        filtered = filtered.filter(a => {
          const sKey = (a.serviceKey || a.serviceId || '').toLowerCase();
          const sName = (a.serviceName || '').toLowerCase();
          return sKey.includes(toolFilter) || sName.includes(toolFilter);
        });
      }

      if (statusFilter === 'available') {
        filtered = filtered.filter(a => (a.availableSlots || 0) > 0);
      } else if (statusFilter === 'full') {
        filtered = filtered.filter(a => (a.availableSlots || 0) <= 0);
      }

      renderWorkToolsAccountsGrid(filtered);
    }

    function renderWorkToolsAccountsGrid(accounts) {
      const container = document.getElementById('work-tools-accounts-grid');
      if (!container) return;

      if (!accounts || accounts.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 14px;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🤖</div>
            <h4 style="font-size: 1.1rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">No hay cuentas de IA que coincidan</h4>
            <p style="font-size: 0.82rem; color: var(--text-tertiary); max-width: 480px; margin: 0 auto 1.25rem auto;">
              Carga cuentas oficiales de ChatGPT Plus, Claude Pro, Gemini o Minea para tener stock listo para la venta en GamesBoy.
            </p>
            <button type="button" class="btn-admin-action emerald" onclick="openAdminCreateAccountModal('chatgpt')" style="padding: 10px 20px; font-weight: 800;">
              <span>+ Cargar Primera Cuenta de IA</span>
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = accounts.map(acc => {
        const total = Math.max(1, acc.totalSlots || 2);
        const avail = acc.availableSlots !== undefined ? acc.availableSlots : total;
        const occupied = Math.max(0, total - avail);
        const pct = Math.round((occupied / total) * 100);

        const creds = acc.credentialsDecrypted || acc.credentials || 'Credenciales protegidas';
        const parts = creds.split(':::');
        const userEmail = parts[0] || creds;
        const pass = parts[1] || '';

        const expDate = acc.expiresAt ? new Date(acc.expiresAt).toLocaleDateString('es-PY') : '30 días';

        return `
          <div class="tool-product-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <div>
                <span style="font-size: 0.72rem; color: #c084fc; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); padding: 2px 7px; border-radius: 6px; font-weight: 800; display: inline-block; margin-bottom: 4px;">
                  🤖 ${acc.serviceName || 'Herramienta IA'}
                </span>
                <h4 style="font-size: 1rem; font-weight: 800; color: #ffffff; margin: 0;">${acc.planName || 'Plan Pro / Plus'}</h4>
              </div>
              <span style="font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; background: ${avail > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${avail > 0 ? '#34d399' : '#f87171'}; border: 1px solid ${avail > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};">
                ${avail > 0 ? `${avail} Libre(s)` : 'Completa'}
              </span>
            </div>

            <!-- Credentials Box -->
            <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px; font-family: var(--font-mono); font-size: 0.78rem;">
              <div style="color: #ffffff; word-break: break-all; margin-bottom: 2px;">
                <span style="color: var(--text-tertiary);">Email:</span> <strong>${userEmail}</strong>
              </div>
              ${pass ? `
                <div style="color: var(--accent-cyan); word-break: break-all;">
                  <span style="color: var(--text-tertiary);">Clave:</span> <strong>${pass}</strong>
                </div>
              ` : ''}
              <button type="button" class="btn-admin-action cyan" style="margin-top: 6px; padding: 2px 8px; font-size: 0.68rem;" onclick="navigator.clipboard.writeText('${userEmail} ::: ${pass}'); alert('Credenciales copiadas al portapapeles');">
                Copiar Acceso
              </button>
            </div>

            <!-- Progress Bar of Seats -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-tertiary); margin-bottom: 4px;">
                <span>Asientos Asignados: <strong>${occupied} / ${total}</strong></span>
                <span>Vence: <strong>${expDate}</strong></span>
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ${pct}%; background: ${pct >= 100 ? '#f43f5e' : (pct >= 50 ? '#f59e0b' : '#10b981')};"></div>
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: auto;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 800; color: #ffffff;">
                ${((acc.pricePerSlotUsd || 4.5) * adminExchangeRate).toLocaleString('es-PY')} Gs.
              </span>
              <button type="button" class="btn-admin-action red" style="padding: 4px 8px; font-size: 0.72rem;" onclick="deleteStreamingAccount('${acc.id}')">
                Eliminar
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // =======================================================
    // 09. AGENTE WHATSAPP IA & MURO DE NOTAS ENGINE
    // =======================================================
    let allAiNotesList = [];

    async function loadAiWhatsappTab() {
      await Promise.all([
        loadAiWhatsappConfig(),
        loadAiNotesWall()
      ]);
    }

    async function loadAiWhatsappConfig() {
      try {
        const res = await fetch('/api/ai-support/admin/config');
        const data = await res.json();
        if (data.config) {
          const cfg = data.config;
          const promptEl = document.getElementById('ai-config-system-prompt');
          const providerEl = document.getElementById('ai-config-provider');
          const modelEl = document.getElementById('ai-config-model');
          const apiKeyEl = document.getElementById('ai-config-api-key');

          if (promptEl) promptEl.value = cfg.systemPrompt || '';
          if (providerEl) providerEl.value = cfg.provider || 'builtin';
          if (modelEl) modelEl.value = cfg.model || 'gpt-4o-mini';
          if (apiKeyEl) apiKeyEl.value = cfg.apiKey || '';

          const phones = cfg.phoneNumbers || {};
          if (document.getElementById('ai-phone-general')) document.getElementById('ai-phone-general').value = phones.general || '+595981000000';
          if (document.getElementById('ai-phone-games')) document.getElementById('ai-phone-games').value = phones.games || '+595982000000';
          if (document.getElementById('ai-phone-streaming')) document.getElementById('ai-phone-streaming').value = phones.streaming || '+595983000000';
          if (document.getElementById('ai-phone-tools')) document.getElementById('ai-phone-tools').value = phones.tools || '+595984000000';
          if (document.getElementById('ai-phone-payments')) document.getElementById('ai-phone-payments').value = phones.payments || '+595985000000';
        }
      } catch (err) {
        console.error('Error loading AI WhatsApp config:', err);
      }
    }

    async function saveAiWhatsappConfig() {
      try {
        const systemPrompt = document.getElementById('ai-config-system-prompt')?.value || '';
        const provider = document.getElementById('ai-config-provider')?.value || 'builtin';
        const model = document.getElementById('ai-config-model')?.value || 'gpt-4o-mini';
        const apiKey = document.getElementById('ai-config-api-key')?.value || '';

        const phoneNumbers = {
          general: document.getElementById('ai-phone-general')?.value || '+595981000000',
          games: document.getElementById('ai-phone-games')?.value || '+595982000000',
          streaming: document.getElementById('ai-phone-streaming')?.value || '+595983000000',
          tools: document.getElementById('ai-phone-tools')?.value || '+595984000000',
          payments: document.getElementById('ai-phone-payments')?.value || '+595985000000'
        };

        const res = await fetch('/api/ai-support/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt, provider, model, apiKey, phoneNumbers })
        });

        const data = await res.json();
        if (data.success) {
          alert('🎉 ' + data.message);
        } else {
          alert('Error: ' + (data.error || 'No se pudo guardar la configuración.'));
        }
      } catch (err) {
        alert('Error al conectar con el servidor.');
      }
    }

    async function loadAiNotesWall() {
      try {
        const res = await fetch('/api/ai-support/admin/notes');
        const data = await res.json();
        allAiNotesList = data.notes || [];

        // Update KPIs
        if (data.stats) {
          const st = data.stats;
          const kpiTotal = document.getElementById('ai-kpi-total-notes');
          const kpiPending = document.getElementById('ai-kpi-pending-notes');
          const kpiLeads = document.getElementById('ai-kpi-leads-count');
          const kpiSuggs = document.getElementById('ai-kpi-suggestions-count');
          const badgeCount = document.getElementById('badge-ai-notes-count');

          if (kpiTotal) kpiTotal.textContent = st.totalNotes || 0;
          if (kpiPending) kpiPending.textContent = st.pendingNotes || 0;
          if (kpiLeads) kpiLeads.textContent = st.leadsCount || 0;
          if (kpiSuggs) kpiSuggs.textContent = st.suggestionsCount || 0;

          if (badgeCount) {
            if (st.pendingNotes > 0) {
              badgeCount.textContent = st.pendingNotes;
              badgeCount.style.display = 'inline-block';
            } else {
              badgeCount.style.display = 'none';
            }
          }
        }

        filterAiNotes();
      } catch (err) {
        console.error('Error loading AI notes:', err);
      }
    }

    function filterAiNotes() {
      const q = (document.getElementById('ai-notes-search')?.value || '').toLowerCase().trim();
      const tagFilter = document.getElementById('ai-notes-filter-tag')?.value || 'all';
      const statusFilter = document.getElementById('ai-notes-filter-status')?.value || 'all';

      let filtered = [...allAiNotesList];

      if (q) {
        filtered = filtered.filter(n =>
          (n.clientName && n.clientName.toLowerCase().includes(q)) ||
          (n.clientPhone && n.clientPhone.toLowerCase().includes(q)) ||
          (n.summary && n.summary.toLowerCase().includes(q))
        );
      }

      if (tagFilter !== 'all') {
        filtered = filtered.filter(n => n.tag === tagFilter);
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(n => n.status === statusFilter);
      }

      renderAiNotesStream(filtered);
    }

    function renderAiNotesStream(notes) {
      const container = document.getElementById('ai-notes-stream-container');
      if (!container) return;

      if (!notes || notes.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2.5rem; color: var(--text-tertiary); background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
            🎉 No hay notas coincidentes con los filtros seleccionados.
          </div>
        `;
        return;
      }

      container.innerHTML = notes.map(n => {
        const isPending = n.status === 'pending';
        const dateStr = new Date(n.createdAt || Date.now()).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        
        // Tag styles
        let tagBadge = 'background: rgba(0, 194, 255, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);';
        let tagIcon = '📦';
        if (n.tag === 'lead_purchase') {
          tagBadge = 'background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);';
          tagIcon = '🎯';
        } else if (n.tag === 'suggestion') {
          tagBadge = 'background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35);';
          tagIcon = '💡';
        } else if (n.tag === 'technical_issue') {
          tagBadge = 'background: rgba(244, 63, 94, 0.15); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.35);';
          tagIcon = '⚠️';
        }

        const phoneClean = (n.clientPhone || '').replace(/[^0-9]/g, '');

        return `
          <div class="ai-note-card ${n.tag || 'general'}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; ${tagBadge}">
                  ${tagIcon} ${n.tagLabel || 'Nota de Asistente'}
                </span>
                <span style="font-size: 0.72rem; color: var(--text-tertiary); margin-left: 6px;">${dateStr}</span>
              </div>
              <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: ${isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isPending ? '#fbbf24' : '#34d399'}; border: 1px solid ${isPending ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'};">
                ${isPending ? '⏳ Pendiente' : '✓ Revisado'}
              </span>
            </div>

            <!-- Client Info Row -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <strong style="color: #ffffff; font-size: 0.88rem;">${n.clientName || 'Cliente'}</strong>
              ${n.clientPhone ? `
                <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-cyan);">${n.clientPhone}</span>
              ` : ''}
            </div>

            <!-- Summary Paragraph -->
            <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.45; background: rgba(0,0,0,0.3); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
              ${n.summary}
            </p>

            <!-- Actions Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 2px;">
              <div style="display: flex; gap: 6px;">
                ${phoneClean ? `
                  <a href="https://wa.me/${phoneClean}?text=Hola%20${encodeURIComponent(n.clientName || '')},%20te%20escribimos%20desde%20GamesBoy%20respecto%20a%20tu%20consulta" target="_blank" rel="noopener noreferrer" class="btn-admin-action emerald" style="padding: 4px 10px; font-size: 0.72rem; font-weight: 800; text-decoration: none;">
                    📲 Abrir WhatsApp
                  </a>
                ` : ''}
                <button type="button" class="btn-admin-action cyan" style="padding: 4px 8px; font-size: 0.72rem;" onclick="navigator.clipboard.writeText('${n.summary.replace(/'/g, "\\'")}'); alert('Nota copiada al portapapeles');">
                  Copiar Nota
                </button>
              </div>

              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn-admin-action" style="padding: 4px 10px; font-size: 0.72rem; font-weight: 800; background: ${isPending ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${isPending ? '#34d399' : '#fbbf24'}; border: 1px solid ${isPending ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'};" onclick="toggleAiNoteStatus('${n.id}')">
                  ${isPending ? '✓ Marcar Atendido' : '⏳ Marcar Pendiente'}
                </button>
                <button type="button" class="btn-admin-action red" style="padding: 4px 8px; font-size: 0.72rem;" onclick="deleteAiNote('${n.id}')">
                  ✕
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    async function toggleAiNoteStatus(noteId) {
      try {
        const res = await fetch(`/api/ai-support/admin/notes/${noteId}/resolve`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          loadAiNotesWall();
        }
      } catch (e) { alert('Error al actualizar nota'); }
    }

    async function deleteAiNote(noteId) {
      if (!confirm('¿Deseas eliminar esta nota del muro?')) return;
      try {
        const res = await fetch(`/api/ai-support/admin/notes/${noteId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          loadAiNotesWall();
        }
      } catch (e) { alert('Error al eliminar nota'); }
    }

  