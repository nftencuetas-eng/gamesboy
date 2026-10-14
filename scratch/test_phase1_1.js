/**
 * ==============================================================================
 * GAMESBOY — FASE 1.1 VERIFICATION SUITE (scratch/test_phase1_1.js)
 * Validates:
 * 1. Gift card image flicker elimination (no hero-showcase.png or generic login icons)
 * 2. Banner anti-flicker & cache invalidation (versioning, neutral skeletons, no-cache headers)
 * 3. Tab 13 (Marca Blanca & Ajustes SaaS) DOM presence, activation & API integration
 * 4. Backward compatibility & zero regressions for Phase 1 security rules
 * ==============================================================================
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import '../server/config/env.js';
import cryptoService from '../server/services/cryptoService.js';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 ======================================================');
  console.log('🧪 GAMESBOY — VERIFICACIÓN AUTOMATIZADA DE FASE 1.1');
  console.log('🧪 ======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // --- 1. VERIFICACIÓN OBJETIVO 1A: TARJETAS DE REGALO ---
  console.log('--- 1. Objetivo 1A: Corrección de Imágenes en Tarjetas de Regalo ---');
  
  // 1.1 Endpoint de marcas de tarjetas de regalo
  const resBrands = await makeRequest('/api/store/giftcards/brands');
  assert(resBrands.statusCode === 200, 'GET /api/store/giftcards/brands responde 200 OK');
  assert(resBrands.json && resBrands.json.brands && resBrands.json.brands.length >= 8, `Se retornan ${resBrands.json?.brands?.length} marcas oficiales de tarjetas`);
  
  const hasLoginGraphicInBrands = resBrands.json.brands.some(b => 
    (b.logoUrl && (b.logoUrl.includes('hero-showcase') || b.logoUrl.includes('icon.png'))) ||
    (b.coverUrl && (b.coverUrl.includes('hero-showcase') || b.coverUrl.includes('icon.png')))
  );
  assert(!hasLoginGraphicInBrands, 'Ninguna marca de tarjeta de regalo usa hero-showcase.png ni el icon.png genérico');

  // 1.2 Catálogo general de productos
  const resProds = await makeRequest('/api/store/products');
  assert(resProds.statusCode === 200, 'GET /api/store/products responde 200 OK');
  const giftCardProds = (resProds.json || []).filter(p => p.category === 'gift_card');
  assert(giftCardProds.length > 0, `Se encontraron ${giftCardProds.length} productos con categoría gift_card`);
  
  const hasHeroShowcaseInGc = giftCardProds.some(p => p.coverUrl && p.coverUrl.includes('hero-showcase.png'));
  assert(!hasHeroShowcaseInGc, 'Los productos gift_card en /api/store/products NO usan hero-showcase.png como cover');

  // 1.3 Verificación de lógica en client/js/app.js
  const appJs = fs.readFileSync(path.resolve('client/js/app.js'), 'utf8');
  assert(appJs.includes("const GB_CATALOG_CACHE_VERSION = 'gb_v10_hero_banners_and_giftcards_sync'"), 'Versión de caché actualizada a gb_v10 para invalidar caches obsoletos');
  assert(!appJs.includes("state.storeProducts.filter(p => p.category === 'gift_card')"), 'renderRetailGiftCards NO utiliza fallback a storeProducts con imágenes genéricas');
  assert(!appJs.includes("if (clean.includes('apple') || clean.includes('itunes')) return '/assets/giftcards/apple.svg';\n  return '/assets/branding/icon.png'"), 'getGiftcardAsset NO retorna icon.png como fallback');

  // --- 2. VERIFICACIÓN OBJETIVO 1B: BANNERS HERO ---
  console.log('\n--- 2. Objetivo 1B: Corrección de Portadas y Banners Hero ---');
  
  const resBanners = await makeRequest('/api/banners');
  assert(resBanners.statusCode === 200, 'GET /api/banners responde 200 OK');
  assert(resBanners.headers['cache-control'] && resBanners.headers['cache-control'].includes('no-cache'), 'GET /api/banners incluye cabeceras de no-cache para evitar imágenes obsoletas');
  assert(resBanners.json && Array.isArray(resBanners.json.banners) && resBanners.json.banners.length === 4, `Se retornan exactamente 4 banners configurados (recibidos: ${resBanners.json?.banners?.length})`);
  
  const hasActiveImages = resBanners.json.banners.some(b => Boolean(b.imgHorizontal || b.imgVertical));
  assert(hasActiveImages, 'Los banners configurados contienen imágenes activas en base64 / URL');

  assert(appJs.includes('eneba-slide-skeleton'), 'initHeroAccordion implementa skeleton neutro Dark Obsidian para prevenir destellos de imágenes antiguas');

  // --- 3. VERIFICACIÓN OBJETIVO 2: MARCA BLANCA Y AJUSTES SAAS (TAB 13) ---
  console.log('\n--- 3. Objetivo 2: Verificación de Marca Blanca y Ajustes SaaS (Tab 13) ---');

  // 3.1 Respuesta de /admin
  const resAdmin = await makeRequest('/admin');
  assert(resAdmin.statusCode === 200, 'GET /admin responde 200 OK');
  assert(resAdmin.headers['cache-control'] && resAdmin.headers['cache-control'].includes('no-store'), 'GET /admin tiene Cache-Control no-store para evitar páginas cacheadas en blanco');
  assert(resAdmin.data.includes('id="tab-tenant-settings"'), 'La sección tab-tenant-settings está presente en el HTML servido');
  assert(resAdmin.data.includes('data-tab="tab-tenant-settings"'), 'El botón de menú data-tab="tab-tenant-settings" está presente en el menú');
  assert(resAdmin.data.includes('switchAdminTab'), 'Función global switchAdminTab está presente');
  assert(resAdmin.data.includes('loadTenantSettings'), 'Función global loadTenantSettings está presente');

  // 3.2 Verificación de elementos del formulario en Tab 13
  const requiredIds = [
    'tenant-brand-name', 'tenant-logo-url', 'img-preview-tenant-logo',
    'tenant-favicon-url', 'img-preview-tenant-favicon', 'tenant-primary-color',
    'tenant-primary-color-picker', 'tenant-accent-color', 'tenant-accent-color-picker',
    'tenant-subdomain-url', 'tenant-live-store-link', 'tenant-custom-domain',
    'tenant-whatsapp', 'tenant-bank-name', 'tenant-bank-holder',
    'tenant-bank-account', 'tenant-bank-alias', 'tenant-binance-id',
    'tenant-exchange-rate', 'tenant-mod-streaming', 'tenant-mod-games',
    'tenant-mod-giftcards', 'tenant-mod-p2p', 'tenant-commission-percent',
    'form-tenant-customizer', 'btn-save-tenant-settings'
  ];
  let allIdsPresent = true;
  for (const id of requiredIds) {
    if (!resAdmin.data.includes(`id="${id}"`)) {
      allIdsPresent = false;
      console.error(`Missing ID: ${id}`);
    }
  }
  assert(allIdsPresent, 'Los 26 campos, selectores de color, enlaces y botones de Tab 13 existen en el DOM');

  // 3.3 Endpoint /api/tenant/current
  const resTenantCurrent = await makeRequest('/api/tenant/current');
  assert(resTenantCurrent.statusCode === 200, 'GET /api/tenant/current responde 200 OK');
  assert(resTenantCurrent.json && resTenantCurrent.json.success && resTenantCurrent.json.tenant, 'GET /api/tenant/current retorna los datos completos del tenant');
  assert(resTenantCurrent.json.tenant.id === 'tnt_gamesboy_main', `Tenant actual es tnt_gamesboy_main (recibido: ${resTenantCurrent.json.tenant.id})`);

  // 3.4 Actualización protegida de configuración SaaS
  const adminToken = cryptoService.generateToken({ userId: 'usr_admin', role: 'admin', email: 'admin@gamesboy.net' });
  const clientToken = cryptoService.generateToken({ userId: 'usr_client1', role: 'client', email: 'lucas@cliente.com' });

  // Intento sin auth -> 401
  const resPutNoAuth = await makeRequest(`/api/saas/tenants/${resTenantCurrent.json.tenant.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'Unauthorized Store' }
  });
  assert(resPutNoAuth.statusCode === 401, 'PUT /api/saas/tenants/:id sin autenticación es rechazado con 401');

  // Intento con rol cliente -> 403
  const resPutClient = await makeRequest(`/api/saas/tenants/${resTenantCurrent.json.tenant.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` },
    body: { name: 'Unauthorized Store' }
  });
  assert(resPutClient.statusCode === 403, 'PUT /api/saas/tenants/:id con rol CLIENT es rechazado con 403 Forbidden');

  // Intento con admin -> 200 OK
  const resPutAdmin = await makeRequest(`/api/saas/tenants/${resTenantCurrent.json.tenant.id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${adminToken}`,
      'x-user-id': 'usr_admin'
    },
    body: {
      name: resTenantCurrent.json.tenant.name,
      customDomain: resTenantCurrent.json.tenant.customDomain,
      branding: resTenantCurrent.json.tenant.branding,
      settings: resTenantCurrent.json.tenant.settings
    }
  });
  assert(resPutAdmin.statusCode === 200 && resPutAdmin.json.success, 'PUT /api/saas/tenants/:id con admin es aprobado con 200 OK y persiste sin alterar datos reales');

  // --- 4. VERIFICACIÓN OBJETIVO 3: SEGURIDAD Y REGRESIONES DE FASE 1 ---
  console.log('\n--- 4. Objetivo 3: Conservación de Seguridad y Reglas de Fase 1 ---');

  const resOverviewNoAuth = await makeRequest('/api/admin/overview');
  assert(resOverviewNoAuth.statusCode === 401, 'GET /api/admin/overview sin token devuelve 401');

  const resBannersAdminNoAuth = await makeRequest('/api/banners/admin');
  assert(resBannersAdminNoAuth.statusCode === 401, 'GET /api/banners/admin sin token devuelve 401');

  const resAiNotesNoAuth = await makeRequest('/api/ai-support/admin/notes');
  assert(resAiNotesNoAuth.statusCode === 401, 'GET /api/ai-support/admin/notes sin token devuelve 401');

  const resTenantsListNoAuth = await makeRequest('/api/saas/tenants');
  assert(resTenantsListNoAuth.statusCode === 401, 'GET /api/saas/tenants sin token devuelve 401');

  console.log('\n======================================================');
  console.log(`📊 RESULTADOS FINALES: ${passed} PASARON, ${failed} FALLARON`);
  console.log('======================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
