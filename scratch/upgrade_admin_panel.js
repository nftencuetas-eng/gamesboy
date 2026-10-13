import fs from 'fs';

console.log('🚀 Starting Complete Surgical Overhaul of client/admin.html...');

let html = fs.readFileSync('client/admin.html', 'utf8');

// Normalize line breaks
html = html.replace(/\r\n/g, '\n');

// =======================================================
// 1. UPGRADE CSS STYLES IN <head>
// =======================================================
// Enhance sidebar, topbar command bar, cards, tables, work tools, and AI notes wall styles
const newStyles = `
    /* GamesBoy 2026 Master Admin Design System - 100% Dark Slate & Matte Charcoal */
    :root {
      --admin-bg-base: #07090e;
      --admin-bg-surface: #0e121b;
      --admin-bg-card: #131722;
      --admin-bg-elevated: #181d2c;
      --admin-border-subtle: rgba(255, 255, 255, 0.07);
      --admin-border-strong: rgba(255, 255, 255, 0.14);
      --admin-text-main: #f8fafc;
      --admin-text-muted: #94a3b8;
      --admin-text-dim: #64748b;
      --accent-cyan: #00c2ff;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --accent-purple: #a855f7;
      --accent-rose: #f43f5e;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    body {
      background: var(--admin-bg-base) !important;
      color: var(--admin-text-main);
      font-family: var(--font-body);
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    .admin-layout {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      min-height: 100vh;
      width: 100%;
      box-sizing: border-box;
      background: var(--admin-bg-base);
      transition: grid-template-columns 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .admin-layout.collapsed {
      grid-template-columns: 78px minmax(0, 1fr);
    }

    /* Master Sidebar */
    .admin-sidebar {
      background: rgba(11, 14, 22, 0.98);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-right: 1px solid var(--admin-border-subtle);
      padding: 1.25rem 0.9rem;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      box-sizing: border-box;
      z-index: 50;
      text-align: left;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    .admin-sidebar::-webkit-scrollbar { display: none !important; }

    .sidebar-header-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--admin-border-subtle);
    }

    /* Category Cluster Headers */
    .sidebar-category-header {
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--admin-text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 12px 10px 5px 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      user-select: none;
    }
    .sidebar-category-header::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.04);
      margin-left: 6px;
    }

    .admin-menu-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 12px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--admin-text-muted);
      font-size: 0.83rem;
      font-weight: 700;
      cursor: pointer;
      text-align: left;
      border-radius: 9px;
      transition: all 0.16s ease;
      position: relative;
    }
    .admin-menu-btn:hover {
      background: rgba(255, 255, 255, 0.04);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.07);
    }
    .admin-menu-btn.active {
      background: linear-gradient(135deg, rgba(0, 194, 255, 0.14) 0%, rgba(0, 112, 243, 0.08) 100%);
      border-color: rgba(0, 194, 255, 0.35);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(0, 194, 255, 0.15);
    }
    .admin-menu-btn.active svg {
      stroke: var(--accent-cyan);
    }
    .admin-menu-btn .badge-count {
      margin-left: auto;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 9999px;
      line-height: 1;
    }

    /* Top Command Header Bar */
    .admin-top-command-bar {
      position: sticky;
      top: 0;
      background: rgba(8, 10, 16, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--admin-border-subtle);
      padding: 0.9rem 2.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      z-index: 40;
      margin-bottom: 1.75rem;
    }
    .admin-top-heading-box {
      display: flex;
      flex-direction: column;
    }
    .admin-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--admin-text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .admin-breadcrumbs span.active-bread {
      color: var(--accent-cyan);
    }
    .admin-top-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .admin-rate-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      font-family: var(--font-mono);
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: var(--accent-emerald);
      padding: 5px 12px;
      border-radius: 8px;
    }

    /* Executive Cards & Grid */
    .admin-card {
      background: var(--admin-bg-card);
      border: 1px solid var(--admin-border-subtle);
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
      margin-bottom: 1.5rem;
    }

    /* AI Notes Wall Cards */
    .ai-note-card {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-subtle);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 10px;
      position: relative;
    }
    .ai-note-card:hover {
      border-color: rgba(168, 85, 247, 0.35);
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.45);
    }
    .ai-note-card.lead_purchase {
      border-left: 3px solid #10b981;
    }
    .ai-note-card.suggestion {
      border-left: 3px solid #a855f7;
    }
    .ai-note-card.stock_inquiry {
      border-left: 3px solid #00c2ff;
    }
    .ai-note-card.technical_issue {
      border-left: 3px solid #f43f5e;
    }

    /* Work Tools / AI Cards */
    .tool-product-card {
      background: var(--admin-bg-surface);
      border: 1px solid var(--admin-border-subtle);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;
    }
    .tool-product-card:hover {
      border-color: rgba(0, 194, 255, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }

    /* Tables refinement */
    .admin-table th {
      background: rgba(14, 18, 28, 0.95);
      color: var(--admin-text-dim);
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 12px 14px;
      border-bottom: 1px solid var(--admin-border-subtle);
    }
    .admin-table td {
      padding: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.84rem;
      vertical-align: middle;
    }
    .admin-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
`;

// Insert the upgraded CSS into <style> tag
html = html.replace('/* Top header of sidebar with Logo + Collapse Button */', newStyles + '\n    /* Top header of sidebar with Logo + Collapse Button */');

// =======================================================
// 2. UPGRADE SIDEBAR MARKUP (5 CATEGORIZED CLUSTERS)
// =======================================================
const oldSidebarNavMarker = '<nav id="admin-sidebar-nav" style="display: flex; flex-direction: column; gap: 3px; flex-grow: 1;">';
const oldSidebarNavEnd = '</nav>';

const navStartIdx = html.indexOf(oldSidebarNavMarker);
const navEndIdx = html.indexOf(oldSidebarNavEnd, navStartIdx);

if (navStartIdx !== -1 && navEndIdx !== -1) {
  const newSidebarNav = `<nav id="admin-sidebar-nav" style="display: flex; flex-direction: column; gap: 3px; flex-grow: 1;">
        
        <!-- ======================================================= -->
        <!-- CLUSTER 1: MONITOR & OPERACIONES (DESPACHO DIARIO)      -->
        <!-- ======================================================= -->
        <div class="sidebar-category-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          <span>1. Operaciones & Despacho</span>
        </div>
        <button class="admin-menu-btn active" data-tab="tab-overview" title="01. Métricas & Resumen Ejecutivo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <span>01. Dashboard Ejecutivo</span>
        </button>
        <button class="admin-menu-btn" data-tab="tab-orders-delivery" title="02. Despacho de Pedidos (Videojuegos & Gift Cards)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>02. Despacho de Pedidos</span>
          <span class="badge-count red" id="badge-pending-orders" style="display: none;">0</span>
        </button>
        <button class="admin-menu-btn" data-tab="tab-smm-orders" title="03. Crecimiento en Redes Sociales (SMM 24-48h)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          <span>03. Redes Sociales (SMM)</span>
          <span class="badge-count amber" id="badge-pending-smm" style="display: none;">0</span>
        </button>
        <button class="admin-menu-btn" data-tab="tab-custody-payouts" title="04. Liquidación a Vendedores (Escrow)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>04. Payouts Vendedores</span>
          <span class="badge-count emerald" id="badge-ready-payouts" style="display: none;">0</span>
        </button>

        <!-- ======================================================= -->
        <!-- CLUSTER 2: CATÁLOGO & INVENTARIO DE PRODUCTOS           -->
        <!-- ======================================================= -->
        <div class="sidebar-category-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          <span>2. Catálogo & Inventario</span>
        </div>
        <button class="admin-menu-btn" data-tab="tab-games-management" title="05. Videojuegos Digitales">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>05. Videojuegos Digitales</span>
          <span class="badge-count" id="badge-games-count">0</span>
        </button>
        <button class="admin-menu-btn" data-tab="tab-giftcards-management" title="06. Tarjetas de Regalo & Licencias">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"></rect><path d="M12 8v12"></path><path d="M12 8h4.5a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8z"></path><path d="M12 8H7.5a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8z"></path></svg>
          <span>06. Tarjetas de Regalo</span>
          <span class="badge-count cyan" id="badge-gc-count">0</span>
        </button>
        <button class="admin-menu-btn" data-tab="tab-streaming-moderation" title="07. Cuentas Streaming & Asientos">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
          <span>07. Cuentas Streaming</span>
          <span class="badge-count red" id="badge-pending-subs" style="display: none;">0</span>
        </button>
        <button class="admin-menu-btn" data-tab="tab-work-tools" title="08. Herramientas de Trabajo & IA (ChatGPT, Claude, Minea)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.1 12.5"></path></svg>
          <span>08. Herramientas & IA</span>
          <span class="badge-count purple" id="badge-tools-count">6</span>
        </button>

        <!-- ======================================================= -->
        <!-- CLUSTER 3: ATENCIÓN AL CLIENTE & IA (WHATSAPP WIDGET)   -->
        <!-- ======================================================= -->
        <div class="sidebar-category-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span>3. Atención al Cliente</span>
        </div>
        <button class="admin-menu-btn" data-tab="tab-ai-whatsapp" title="09. Agente WhatsApp IA & Muro de Notas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          <span>09. WhatsApp IA & Notas</span>
          <span class="badge-count emerald" id="badge-ai-notes-count" style="display: none;">0</span>
        </button>

        <!-- ======================================================= -->
        <!-- CLUSTER 4: COMUNIDAD & MARKETING                        -->
        <!-- ======================================================= -->
        <div class="sidebar-category-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>4. Comunidad & Marketing</span>
        </div>
        <button class="admin-menu-btn" data-tab="tab-users" title="10. Directorio de Usuarios & Saldos">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          <span>10. Usuarios & Billeteras</span>
        </button>
        <button class="admin-menu-btn" data-tab="tab-hero-banners" title="11. Banners de Inicio (Hero Accordion)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          <span>11. Banners de Portada</span>
        </button>

        <!-- ======================================================= -->
        <!-- CLUSTER 5: FINANZAS & CONFIGURACIÓN MAESTRA             -->
        <!-- ======================================================= -->
        <div class="sidebar-category-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span>5. Finanzas & Ajustes</span>
        </div>
        <button class="admin-menu-btn" data-tab="tab-finance" title="12. Finanzas, Recargas SIPAP & Bancos">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="12" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span>12. Finanzas & SIPAP</span>
          <span class="badge-count red" id="badge-pending-deposits" style="display: none;">0</span>
        </button>
        <button class="admin-menu-btn" data-tab="tab-tenant-settings" title="13. Marca Blanca & Configuración">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span>13. Marca Blanca & Ajustes</span>
        </button>
      </nav>`;

  html = html.substring(0, navStartIdx) + newSidebarNav + html.substring(navEndIdx + oldSidebarNavEnd.length);
  console.log('✅ Sidebar upgraded to 5 organized operational clusters!');
}

// =======================================================
// 3. UPGRADE TOP COMMAND BAR
// =======================================================
const oldTopBarMarker = '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); flex-wrap: wrap; gap: 14px;">';
const newTopBar = `<!-- MASTER TOP COMMAND BAR -->
      <header class="admin-top-command-bar">
        <div class="admin-top-heading-box">
          <div class="admin-breadcrumbs">
            <span>GamesBoy Control</span>
            <span>/</span>
            <span class="active-bread" id="admin-bread-active">Dashboard Ejecutivo</span>
          </div>
          <h1 id="admin-view-heading" style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 900; color: #ffffff; margin: 2px 0 0 0;">
            Métricas & Panel de Control General
          </h1>
          <p id="admin-view-subtitle" style="font-size: 0.8rem; color: var(--admin-text-muted); margin: 2px 0 0 0;">
            Auditoría en tiempo real, volumen transaccionado, saldos y operaciones en Paraguay.
          </p>
        </div>

        <div class="admin-top-actions">
          <!-- Live Rate Indicator -->
          <div class="admin-rate-pill">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
            <span>Tasa:</span>
            <strong id="header-rate-display">1 USDT = 7.550 Gs.</strong>
          </div>

          <!-- Quick Action Buttons -->
          <button type="button" class="btn-admin-action emerald" onclick="openAdminCreateAccountModal()" style="padding: 7px 14px; font-size: 0.78rem; font-weight: 800;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>+ Cargar Cuenta (Streaming / IA)</span>
          </button>

          <a href="/" target="_blank" class="btn-admin-action cyan" style="padding: 7px 12px; font-size: 0.78rem;" title="Abrir Tienda Oficial">
            <span>👁️ Ver Tienda</span>
          </a>

          <button id="btn-refresh-admin" class="btn-admin-action" style="padding: 7px 12px; font-size: 0.78rem; background: rgba(255,255,255,0.05); color: #fff;" onclick="loadAdminData()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
        </div>
      </header>`;

const topBarIdx = html.indexOf(oldTopBarMarker);
if (topBarIdx !== -1) {
  const topBarEndIdx = html.indexOf('</div>\n      </div>', topBarIdx);
  if (topBarEndIdx !== -1) {
    html = html.substring(0, topBarIdx) + newTopBar + html.substring(topBarEndIdx + '</div>\n      </div>'.length);
    console.log('✅ Top Command Bar inserted successfully!');
  }
}

// =======================================================
// 4. ADD NEW TAB: tab-work-tools & tab-ai-whatsapp
// =======================================================
const newSectionPanes = `
      <!-- ======================================================= -->
      <!-- TAB 8: HERRAMIENTAS DE TRABAJO & INTELIGENCIA ARTIFICIAL-->
      <!-- ======================================================= -->
      <section id="tab-work-tools" class="admin-section-pane">
        
        <!-- Action & Subtitle Banner -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 14px; background: rgba(16, 20, 32, 0.85); border: 1px solid rgba(168, 85, 247, 0.25); padding: 1.25rem 1.5rem; border-radius: 16px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 3px 8px; border-radius: 6px; font-size: 0.82rem;">PRODUCCIÓN & IA</span>
              <span>Herramientas de Trabajo & Software de IA</span>
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-tertiary); margin: 0;">
              Administra cuentas oficiales compartidas de <strong>ChatGPT Plus (GPT-4o), Claude Pro, Gemini Advanced, Minea Dropshipping, Canva Pro y Midjourney</strong>.
            </p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button type="button" class="btn-admin-action emerald" onclick="openAdminCreateAccountModal('chatgpt')" style="padding: 10px 18px; font-size: 0.88rem; font-weight: 800; box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>+ Cargar Cuenta de Herramienta IA</span>
            </button>
            <button type="button" class="btn-admin-action cyan" onclick="loadWorkToolsData()" style="padding: 10px 14px; font-size: 0.84rem;">
              <span>🔄 Actualizar</span>
            </button>
          </div>
        </div>

        <!-- 4 KPI Cards for Work Tools -->
        <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.5rem;">
          <div class="kpi-card purple">
            <div class="kpi-header">
              <span class="kpi-title">Herramientas en Catálogo</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path></svg>
            </div>
            <div class="kpi-value-gs" id="tools-kpi-total-catalog">6 Servicios</div>
            <div class="kpi-value-usd" style="font-size: 0.74rem;">ChatGPT, Claude, Gemini, Minea, Canva, Midjourney</div>
          </div>
          <div class="kpi-card cyan">
            <div class="kpi-header">
              <span class="kpi-title">Cuentas Cargadas en Bóveda</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect></svg>
            </div>
            <div class="kpi-value-gs" id="tools-kpi-total-accounts">0 Cuentas</div>
            <div class="kpi-value-usd" id="tools-kpi-accounts-sub">0 Asientos Ocupados</div>
          </div>
          <div class="kpi-card emerald">
            <div class="kpi-header">
              <span class="kpi-title">Asientos Libres para Venta</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="kpi-value-gs" id="tools-kpi-available-slots" style="color: #34d399;">0 Libres</div>
            <div class="kpi-value-usd" style="font-size: 0.74rem;">Stock Inmediato para Tienda</div>
          </div>
          <div class="kpi-card amber">
            <div class="kpi-header">
              <span class="kpi-title">Precio Promedio por Asiento</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="kpi-value-gs" id="tools-kpi-avg-price">34.000 Gs.</div>
            <div class="kpi-value-usd" style="font-size: 0.74rem;">$4.50 USDT mensual</div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="admin-card">
          <div class="filter-toolbar">
            <input type="text" id="tools-search-input" class="filter-input-search" placeholder="🔍 Buscar por herramienta, cuenta, email o usuario asignado..." oninput="applyWorkToolsFilters()">
            
            <div style="display: flex; gap: 8px; align-items: center;">
              <label style="font-size: 0.74rem; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase;">Herramienta:</label>
              <select id="tools-filter-select" class="admin-form-select" style="width: auto; padding: 7px 12px; font-size: 0.82rem;" onchange="applyWorkToolsFilters()">
                <option value="all">Todas las Herramientas</option>
                <option value="chatgpt">ChatGPT Plus & GPT-4o</option>
                <option value="claude">Claude Pro (Sonnet 3.5)</option>
                <option value="gemini">Gemini Advanced Ultra</option>
                <option value="minea">Minea Dropshipping Spy</option>
                <option value="canva">Canva Pro Equipo</option>
                <option value="midjourney">Midjourney AI Pro</option>
              </select>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              <label style="font-size: 0.74rem; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase;">Disponibilidad:</label>
              <select id="tools-filter-status" class="admin-form-select" style="width: auto; padding: 7px 12px; font-size: 0.82rem;" onchange="applyWorkToolsFilters()">
                <option value="all">Todos los Estados</option>
                <option value="available">Con Asientos Libres</option>
                <option value="full">Cuentas Llenas</option>
              </select>
            </div>
          </div>

          <!-- Accounts & Work Tools List Grid -->
          <div id="work-tools-accounts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-top: 1rem;">
            <!-- Rendered dynamically by loadWorkToolsData -->
          </div>
        </div>
      </section>

      <!-- ======================================================= -->
      <!-- TAB 9: AGENTE WHATSAPP IA & MURO DE NOTAS               -->
      <!-- ======================================================= -->
      <section id="tab-ai-whatsapp" class="admin-section-pane">
        
        <!-- Header Banner -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 14px; background: linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(0, 194, 255, 0.08) 100%); border: 1px solid rgba(37, 211, 102, 0.25); padding: 1.25rem 1.5rem; border-radius: 16px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="background: rgba(37, 211, 102, 0.2); color: #25D366; padding: 3px 8px; border-radius: 6px; font-size: 0.82rem;">ATENCIÓN AL CLIENTE 24/7</span>
              <span>Agente WhatsApp IA & Muro de Notas de Clientes</span>
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-tertiary); margin: 0;">
              Entrena las respuestas de tu asistente virtual, configura los números telefónicos por departamento y audita las notas y sugerencias que deja la IA.
            </p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button type="button" class="btn-admin-action emerald" onclick="saveAiWhatsappConfig()" style="padding: 10px 18px; font-size: 0.88rem; font-weight: 800;">
              <span>💾 Guardar Entrenamiento IA</span>
            </button>
            <button type="button" class="btn-admin-action cyan" onclick="loadAiWhatsappTab()" style="padding: 10px 14px; font-size: 0.84rem;">
              <span>🔄 Recargar Muro</span>
            </button>
          </div>
        </div>

        <!-- 4 KPI Cards for AI Notes -->
        <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1.5rem;">
          <div class="kpi-card cyan">
            <div class="kpi-header">
              <span class="kpi-title">Total Notas de Clientes</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div class="kpi-value-gs" id="ai-kpi-total-notes">0</div>
            <div class="kpi-value-usd" style="font-size: 0.74rem;">Generadas automáticamente por la IA</div>
          </div>
          <div class="kpi-card amber">
            <div class="kpi-header">
              <span class="kpi-title">Pendientes de Atención</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="kpi-value-gs" id="ai-kpi-pending-notes" style="color: #fbbf24;">0</div>
            <div class="kpi-value-usd" style="font-size: 0.74rem; color: #fbbf24;">Requieren revisión del administrador</div>
          </div>
          <div class="kpi-card emerald">
            <div class="kpi-header">
              <span class="kpi-title">Leads de Compra Calientes</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>
            </div>
            <div class="kpi-value-gs" id="ai-kpi-leads-count" style="color: #34d399;">0</div>
            <div class="kpi-value-usd" style="font-size: 0.74rem;">Clientes listos para comprar</div>
          </div>
          <div class="kpi-card purple">
            <div class="kpi-header">
              <span class="kpi-title">Sugerencias de Catálogo</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <div class="kpi-value-gs" id="ai-kpi-suggestions-count">0</div>
            <div class="kpi-value-usd" style="font-size: 0.74rem;">Ideas de nuevos productos o juegos</div>
          </div>
        </div>

        <!-- 2-COLUMN OPERATIONAL DASHBOARD: LEFT CONFIG / RIGHT NOTES WALL -->
        <div style="display: grid; grid-template-columns: minmax(360px, 440px) minmax(0, 1fr); gap: 20px; align-items: start;">
          
          <!-- LEFT COLUMN: TRAINING & WHATSAPP CONFIG -->
          <div class="admin-card" style="border-color: rgba(37, 211, 102, 0.25);">
            <h4 style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
              <span style="color: #25D366;">🤖</span>
              <span>Entrenamiento del Asistente Virtual</span>
            </h4>
            <p style="font-size: 0.78rem; color: var(--text-tertiary); margin-bottom: 1.25rem;">
              Define la personalidad, conocimiento de precios y directrices que usará la IA con los visitantes.
            </p>

            <form id="form-ai-whatsapp-config" onsubmit="event.preventDefault(); saveAiWhatsappConfig();">
              <!-- System Prompt Textarea -->
              <div style="margin-bottom: 1.25rem;">
                <label style="display: block; font-size: 0.78rem; font-weight: 800; color: #e2e8f0; margin-bottom: 6px; text-transform: uppercase;">
                  System Prompt (Instrucciones Maestras):
                </label>
                <textarea id="ai-config-system-prompt" class="admin-form-input" rows="8" style="width: 100%; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.45; resize: vertical;" placeholder="Escribe aquí las instrucciones de comportamiento, tono y catálogo para la IA..."></textarea>
              </div>

              <!-- AI Provider & API Key -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.74rem; font-weight: 800; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase;">
                    Motor de IA:
                  </label>
                  <select id="ai-config-provider" class="admin-form-select" style="font-size: 0.82rem;">
                    <option value="builtin">Motor Integrado Inteligente (Recomendado)</option>
                    <option value="openai">OpenAI (ChatGPT)</option>
                    <option value="groq">Groq (Ultra Rápido Llama 3.3)</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 0.74rem; font-weight: 800; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase;">
                    Modelo:
                  </label>
                  <input type="text" id="ai-config-model" class="admin-form-input" placeholder="gpt-4o-mini" value="gpt-4o-mini" style="font-size: 0.82rem; font-family: var(--font-mono);">
                </div>
              </div>

              <div style="margin-bottom: 1.25rem;">
                <label style="display: block; font-size: 0.74rem; font-weight: 800; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase;">
                  API Key (Opcional - Déjalo vacío para usar el motor integrado):
                </label>
                <input type="password" id="ai-config-api-key" class="admin-form-input" placeholder="sk-proj-..." style="font-size: 0.82rem; font-family: var(--font-mono);">
              </div>

              <!-- Enrutamiento Telefónico Multi-Departamento -->
              <h5 style="font-size: 0.88rem; font-weight: 800; color: var(--accent-cyan); margin: 1.25rem 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1rem;">
                📞 Enrutamiento de WhatsApp por Departamento
              </h5>
              <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 12px;">
                Asigna el número correspondiente donde el bot redirigirá al cliente según el producto consultado (puedes usar el mismo número en todos).
              </p>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div>
                  <label style="display: block; font-size: 0.72rem; font-weight: 800; color: #cbd5e1; margin-bottom: 3px;">📱 WhatsApp General / Soporte Principal:</label>
                  <input type="text" id="ai-phone-general" class="admin-form-input" placeholder="+595981000000" style="font-family: var(--font-mono); font-size: 0.82rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.72rem; font-weight: 800; color: #cbd5e1; margin-bottom: 3px;">🎮 WhatsApp Videojuegos & Cuentas:</label>
                  <input type="text" id="ai-phone-games" class="admin-form-input" placeholder="+595981000000" style="font-family: var(--font-mono); font-size: 0.82rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.72rem; font-weight: 800; color: #cbd5e1; margin-bottom: 3px;">📺 WhatsApp Streaming & Pantallas:</label>
                  <input type="text" id="ai-phone-streaming" class="admin-form-input" placeholder="+595981000000" style="font-family: var(--font-mono); font-size: 0.82rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.72rem; font-weight: 800; color: #cbd5e1; margin-bottom: 3px;">🤖 WhatsApp Herramientas de Trabajo & IA:</label>
                  <input type="text" id="ai-phone-tools" class="admin-form-input" placeholder="+595981000000" style="font-family: var(--font-mono); font-size: 0.82rem;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.72rem; font-weight: 800; color: #cbd5e1; margin-bottom: 3px;">💳 WhatsApp Pagos, Transferencias & SIPAP:</label>
                  <input type="text" id="ai-phone-payments" class="admin-form-input" placeholder="+595981000000" style="font-family: var(--font-mono); font-size: 0.82rem;">
                </div>
              </div>

              <button type="submit" class="btn-admin-action emerald" style="width: 100%; justify-content: center; padding: 12px; font-weight: 800; margin-top: 1.25rem;">
                <span>💾 Guardar Todo el Entrenamiento & Teléfonos</span>
              </button>
            </form>
          </div>

          <!-- RIGHT COLUMN: ADMIN NOTES WALL (MURO DE NOTAS DE CLIENTES) -->
          <div class="admin-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px;">
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 800; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 8px;">
                  <span>📋 Muro de Notas & Sugerencias de Clientes</span>
                </h4>
                <p style="font-size: 0.78rem; color: var(--text-tertiary); margin: 3px 0 0 0;">
                  Notas inteligentes extraídas de las conversaciones de WhatsApp con clientes para seguimiento del administrador.
                </p>
              </div>
              <button type="button" class="btn-admin-action cyan" onclick="loadAiNotesWall()" style="padding: 6px 12px; font-size: 0.78rem;">
                <span>🔄 Actualizar Notas</span>
              </button>
            </div>

            <!-- Notes Filter Toolbar -->
            <div class="filter-toolbar" style="margin-bottom: 1rem;">
              <input type="text" id="ai-notes-search" class="filter-input-search" placeholder="🔍 Buscar por cliente, consulta o teléfono..." oninput="filterAiNotes()">
              
              <select id="ai-notes-filter-tag" class="admin-form-select" style="width: auto; padding: 7px 12px; font-size: 0.82rem;" onchange="filterAiNotes()">
                <option value="all">Todas las Etiquetas</option>
                <option value="lead_purchase">🎯 Leads de Compra</option>
                <option value="suggestion">💡 Sugerencias</option>
                <option value="stock_inquiry">📦 Consultas de Stock</option>
                <option value="technical_issue">⚠️ Problemas Técnicos</option>
              </select>

              <select id="ai-notes-filter-status" class="admin-form-select" style="width: auto; padding: 7px 12px; font-size: 0.82rem;" onchange="filterAiNotes()">
                <option value="all">Todos los Estados</option>
                <option value="pending">⏳ Pendientes</option>
                <option value="reviewed">✓ Atendidos / Revisados</option>
              </select>
            </div>

            <!-- Notes Cards Stream -->
            <div id="ai-notes-stream-container" style="display: flex; flex-direction: column; gap: 12px; max-height: 720px; overflow-y: auto; padding-right: 4px;">
              <!-- Rendered dynamically by loadAiNotesWall -->
            </div>
          </div>
        </div>
      </section>
`;

// Insert the new sections right before </main>
html = html.replace('</main>', newSectionPanes + '\n    </main>');
console.log('✅ tab-work-tools and tab-ai-whatsapp sections added to admin.html!');

// =======================================================
// 5. UPDATE JAVASCRIPT TAB DESCRIPTIONS & SWITCHER
// =======================================================
const oldTabDescMarker = "const tabDescriptions = {";
const oldTabDescEnd = "};";
const tabDescStartIdx = html.indexOf(oldTabDescMarker);
const tabDescEndIdx = html.indexOf(oldTabDescEnd, tabDescStartIdx);

if (tabDescStartIdx !== -1 && tabDescEndIdx !== -1) {
  const newTabDescriptions = `const tabDescriptions = {
      'tab-overview': { title: '01. Dashboard Ejecutivo & Métricas en Vivo', subtitle: 'Auditoría en tiempo real, volumen transaccionado, saldos y operaciones en Paraguay.' },
      'tab-orders-delivery': { title: '02. Bandeja de Despacho de Pedidos', subtitle: 'Despacho manual y seguro de credenciales de videojuegos y códigos de gift cards.' },
      'tab-smm-orders': { title: '03. Crecimiento en Redes Sociales (Bandeja SMM)', subtitle: 'Control y despacho de órdenes de seguidores, likes, vistas y miembros con plazo de 24 a 48 hs.' },
      'tab-custody-payouts': { title: '04. Liquidación a Vendedores (Escrow)', subtitle: 'Fondos en custodia con ciclo de garantía y liberación manual de pagos a anfitriones.' },
      'tab-games-management': { title: '05. Gestión de Videojuegos Digitales', subtitle: 'Catálogo por consolas, precios en Guaraníes, stock de claves y subida de capturas.' },
      'tab-giftcards-management': { title: '06. Tarjetas de Regalo & Licencias', subtitle: 'Marcas oficiales (PlayStation, Xbox, Steam, Google Play) y administración de variaciones de saldo.' },
      'tab-streaming-moderation': { title: '07. Cuentas Streaming & Asientos Oficiales', subtitle: 'Catálogo de servicios de entretenimiento (Netflix, Spotify, Disney+, Max) y moderación de cuentas.' },
      'tab-work-tools': { title: '08. Herramientas de Trabajo & Inteligencia Artificial', subtitle: 'Cuentas de productividad: ChatGPT Plus (GPT-4o), Claude Pro, Gemini Advanced, Minea, Canva y Midjourney.' },
      'tab-ai-whatsapp': { title: '09. Agente WhatsApp IA & Muro de Notas', subtitle: 'Entrenamiento del asistente virtual oficial, enrutamiento telefónico y notas de leads de clientes.' },
      'tab-users': { title: '10. Directorio de Usuarios & Billeteras', subtitle: 'Auditoría de clientes, vendedores, saldos reales en Gs./USDT y fondos en garantía.' },
      'tab-hero-banners': { title: '11. Banners de Inicio (Hero Accordion)', subtitle: 'Personalización de los 4 banners interactivos de la portada, imágenes panorámicas y móviles.' },
      'tab-finance': { title: '12. Finanzas, Recargas SIPAP & Cuentas Bancarias', subtitle: 'Aprobación de comprobantes SIPAP/USDT, cuentas bancarias de Paraguay y Binance Pay.' },
      'tab-tenant-settings': { title: '13. Personalización de Marca Blanca & Ajustes SaaS', subtitle: 'Configuración de marca, dominios, comisiones y pasarelas de pago de tu plataforma.' }
    };`;

  html = html.substring(0, tabDescStartIdx) + newTabDescriptions + html.substring(tabDescEndIdx + oldTabDescEnd.length);
  console.log('✅ tabDescriptions updated with all 13 modules!');
}

// Update switchAdminTab implementation to handle breadcrumbs and new modules
const oldSwitchAdminTab = `    window.switchAdminTab = function(tabId) {
      menuButtons.forEach(b => {
        if (b.getAttribute('data-tab') === tabId) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      sectionPanes.forEach(p => {
        if (p.id === tabId) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });`;

const newSwitchAdminTab = `    window.switchAdminTab = function(tabId) {
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
      if (tabId === 'tab-ai-whatsapp') loadAiWhatsappTab();`;

if (html.includes(oldSwitchAdminTab)) {
  html = html.replace(oldSwitchAdminTab, newSwitchAdminTab);
  console.log('✅ switchAdminTab updated with breadcrumbs and new tab triggers!');
}

// =======================================================
// 6. ADD JAVASCRIPT HANDLERS FOR WORK TOOLS & AI WHATSAPP
// =======================================================
const newHandlersScript = `
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
        allWorkToolsCatalog = allServices.filter(s => s.category === 'work_tools' || ['chatgpt', 'claude', 'gemini', 'minea', 'canva', 'midjourney'].includes(s.id));

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
        const badgeCountEl = document.getElementById('badge-tools-count');

        let totalOccupiedSlots = 0;
        let totalAvailSlots = 0;

        allWorkToolsAccounts.forEach(acc => {
          const total = Math.max(1, acc.totalSlots || 2);
          const avail = acc.availableSlots !== undefined ? acc.availableSlots : total;
          totalAvailSlots += avail;
          totalOccupiedSlots += Math.max(0, total - avail);
        });

        if (totalCatalogEl) totalCatalogEl.textContent = \`\${allWorkToolsCatalog.length} Servicios\`;
        if (totalAccountsEl) totalAccountsEl.textContent = \`\${allWorkToolsAccounts.length} Cuentas\`;
        if (accountsSubEl) accountsSubEl.textContent = \`\${totalOccupiedSlots} Asientos Ocupados\`;
        if (availableSlotsEl) availableSlotsEl.textContent = \`\${totalAvailSlots} Libres\`;
        if (badgeCountEl) badgeCountEl.textContent = allWorkToolsCatalog.length;

        applyWorkToolsFilters();
      } catch (err) {
        console.error('Error loading work tools data:', err);
      }
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
        container.innerHTML = \`
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
        \`;
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

        return \`
          <div class="tool-product-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <div>
                <span style="font-size: 0.72rem; color: #c084fc; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); padding: 2px 7px; border-radius: 6px; font-weight: 800; display: inline-block; margin-bottom: 4px;">
                  🤖 \${acc.serviceName || 'Herramienta IA'}
                </span>
                <h4 style="font-size: 1rem; font-weight: 800; color: #ffffff; margin: 0;">\${acc.planName || 'Plan Pro / Plus'}</h4>
              </div>
              <span style="font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; background: \${avail > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color: \${avail > 0 ? '#34d399' : '#f87171'}; border: 1px solid \${avail > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};">
                \${avail > 0 ? \`\${avail} Libre(s)\` : 'Completa'}
              </span>
            </div>

            <!-- Credentials Box -->
            <div style="background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px; font-family: var(--font-mono); font-size: 0.78rem;">
              <div style="color: #ffffff; word-break: break-all; margin-bottom: 2px;">
                <span style="color: var(--text-tertiary);">Email:</span> <strong>\${userEmail}</strong>
              </div>
              \${pass ? \`
                <div style="color: var(--accent-cyan); word-break: break-all;">
                  <span style="color: var(--text-tertiary);">Clave:</span> <strong>\${pass}</strong>
                </div>
              \` : ''}
              <button type="button" class="btn-admin-action cyan" style="margin-top: 6px; padding: 2px 8px; font-size: 0.68rem;" onclick="navigator.clipboard.writeText('\${userEmail} ::: \${pass}'); alert('Credenciales copiadas al portapapeles');">
                Copiar Acceso
              </button>
            </div>

            <!-- Progress Bar of Seats -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-tertiary); margin-bottom: 4px;">
                <span>Asientos Asignados: <strong>\${occupied} / \${total}</strong></span>
                <span>Vence: <strong>\${expDate}</strong></span>
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: \${pct}%; background: \${pct >= 100 ? '#f43f5e' : (pct >= 50 ? '#f59e0b' : '#10b981')};"></div>
              </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: auto;">
              <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 800; color: #ffffff;">
                \${((acc.pricePerSlotUsd || 4.5) * adminExchangeRate).toLocaleString('es-PY')} Gs.
              </span>
              <button type="button" class="btn-admin-action red" style="padding: 4px 8px; font-size: 0.72rem;" onclick="deleteStreamingAccount('\${acc.id}')">
                Eliminar
              </button>
            </div>
          </div>
        \`;
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
        container.innerHTML = \`
          <div style="text-align: center; padding: 2.5rem; color: var(--text-tertiary); background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
            🎉 No hay notas coincidentes con los filtros seleccionados.
          </div>
        \`;
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

        return \`
          <div class="ai-note-card \${n.tag || 'general'}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; \${tagBadge}">
                  \${tagIcon} \${n.tagLabel || 'Nota de Asistente'}
                </span>
                <span style="font-size: 0.72rem; color: var(--text-tertiary); margin-left: 6px;">\${dateStr}</span>
              </div>
              <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: \${isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: \${isPending ? '#fbbf24' : '#34d399'}; border: 1px solid \${isPending ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'};">
                \${isPending ? '⏳ Pendiente' : '✓ Revisado'}
              </span>
            </div>

            <!-- Client Info Row -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <strong style="color: #ffffff; font-size: 0.88rem;">\${n.clientName || 'Cliente'}</strong>
              \${n.clientPhone ? \`
                <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-cyan);">\${n.clientPhone}</span>
              \` : ''}
            </div>

            <!-- Summary Paragraph -->
            <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0; line-height: 1.45; background: rgba(0,0,0,0.3); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
              \${n.summary}
            </p>

            <!-- Actions Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 2px;">
              <div style="display: flex; gap: 6px;">
                \${phoneClean ? \`
                  <a href="https://wa.me/\${phoneClean}?text=Hola%20\${encodeURIComponent(n.clientName || '')},%20te%20escribimos%20desde%20GamesBoy%20respecto%20a%20tu%20consulta" target="_blank" rel="noopener noreferrer" class="btn-admin-action emerald" style="padding: 4px 10px; font-size: 0.72rem; font-weight: 800; text-decoration: none;">
                    📲 Abrir WhatsApp
                  </a>
                \` : ''}
                <button type="button" class="btn-admin-action cyan" style="padding: 4px 8px; font-size: 0.72rem;" onclick="navigator.clipboard.writeText('\${n.summary.replace(/'/g, "\\\\'")}'); alert('Nota copiada al portapapeles');">
                  Copiar Nota
                </button>
              </div>

              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn-admin-action" style="padding: 4px 10px; font-size: 0.72rem; font-weight: 800; background: \${isPending ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: \${isPending ? '#34d399' : '#fbbf24'}; border: 1px solid \${isPending ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'};" onclick="toggleAiNoteStatus('\${n.id}')">
                  \${isPending ? '✓ Marcar Atendido' : '⏳ Marcar Pendiente'}
                </button>
                <button type="button" class="btn-admin-action red" style="padding: 4px 8px; font-size: 0.72rem;" onclick="deleteAiNote('\${n.id}')">
                  ✕
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    async function toggleAiNoteStatus(noteId) {
      try {
        const res = await fetch(\`/api/ai-support/admin/notes/\${noteId}/resolve\`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          loadAiNotesWall();
        }
      } catch (e) { alert('Error al actualizar nota'); }
    }

    async function deleteAiNote(noteId) {
      if (!confirm('¿Deseas eliminar esta nota del muro?')) return;
      try {
        const res = await fetch(\`/api/ai-support/admin/notes/\${noteId}\`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          loadAiNotesWall();
        }
      } catch (e) { alert('Error al eliminar nota'); }
    }
`;

// Insert the new handlers right before the end of the script tag in client/admin.html
const lastScriptEnd = html.lastIndexOf('</script>');
if (lastScriptEnd !== -1) {
  html = html.substring(0, lastScriptEnd) + newHandlersScript + '\n  </script>' + html.substring(lastScriptEnd + '</script>'.length);
  console.log('✅ JavaScript handlers for Work Tools & AI WhatsApp added to admin.html!');
}

fs.writeFileSync('client/admin.html', html, 'utf8');
console.log('🎉 Complete surgical upgrade applied to client/admin.html!');
