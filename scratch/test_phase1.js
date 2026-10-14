/**
 * ==============================================================================
 * GAMESBOY STUDIO — FASE 1 VERIFICATION SUITE (scratch/test_phase1.js)
 * Tests HTML structural integrity, server auth boundaries, and public store.
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
  console.log('🧪 GAMESBOY STUDIO — VERIFICACIÓN AUTOMATIZADA DE FASE 1');
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

  // --- 1. ESTRUCTURA HTML (client/admin.html) ---
  console.log('--- 1. Verificación Estructural HTML ---');
  const adminHtml = fs.readFileSync(path.resolve('client/admin.html'), 'utf8');

  // Regex to extract all sections with id starting with tab-
  const sectionRegex = /<section\s+id="(tab-[a-z0-9-]+)"[^>]*>/g;
  const sectionsFound = [];
  let match;
  while ((match = sectionRegex.exec(adminHtml)) !== null) {
    sectionsFound.push(match[1]);
  }

  assert(sectionsFound.length === 13, `Se encontraron exactamente 13 secciones tab-* (encontradas: ${sectionsFound.length})`);
  assert(sectionsFound.includes('tab-tenant-settings'), 'La sección tab-tenant-settings está presente en el documento');
  assert(sectionsFound.includes('tab-custody-payouts'), 'La sección tab-custody-payouts está presente');

  // Verify tab-tenant-settings is NOT inside tab-custody-payouts
  const custodyIdx = adminHtml.indexOf('id="tab-custody-payouts"');
  const custodyCloseIdx = adminHtml.indexOf('</section>', custodyIdx);
  const tenantIdx = adminHtml.indexOf('id="tab-tenant-settings"');

  assert(custodyCloseIdx > custodyIdx && custodyCloseIdx < tenantIdx, 'La sección tab-custody-payouts se cierra con </section> ANTES de que abra tab-tenant-settings (Hermanas directas)');

  // Verify all 13 sidebar buttons exist
  const expectedTabs = [
    'tab-overview',
    'tab-orders-delivery',
    'tab-smm-orders',
    'tab-games-management',
    'tab-giftcards-management',
    'tab-streaming-moderation',
    'tab-users',
    'tab-ai-whatsapp',
    'tab-hero-banners',
    'tab-work-tools',
    'tab-finance',
    'tab-custody-payouts',
    'tab-tenant-settings'
  ];

  for (const tabId of expectedTabs) {
    assert(adminHtml.includes(`data-tab="${tabId}"`), `El botón de navegación lateral data-tab="${tabId}" está presente`);
  }

  // Verify design system link
  assert(adminHtml.includes('admin-studio.css'), 'El stylesheet admin-studio.css está vinculado en admin.html');
  assert(adminHtml.includes('core.js'), 'El script core.js está vinculado en admin.html');

  // --- 2. PROTECCIÓN DE RUTAS ADMINISTRATIVAS ---
  console.log('\n--- 2. Verificación de Seguridad y Autenticación del Servidor ---');

  // Test 2.1: Solicitud sin autenticación a /api/admin/overview -> debe ser 401
  const resNoAuth = await makeRequest('/api/admin/overview');
  assert(resNoAuth.statusCode === 401, `GET /api/admin/overview sin token devuelve 401 (recibido: ${resNoAuth.statusCode})`);

  // Test 2.2: Solicitud sin autenticación a /api/banners/admin -> debe ser 401
  const resBannersNoAuth = await makeRequest('/api/banners/admin');
  assert(resBannersNoAuth.statusCode === 401, `GET /api/banners/admin sin token devuelve 401 (recibido: ${resBannersNoAuth.statusCode})`);

  // Test 2.3: POST sin autenticación a /api/banners/admin -> debe ser 401
  const resBannersPostNoAuth = await makeRequest('/api/banners/admin', {
    method: 'POST',
    body: { banners: [] },
    headers: { 'Content-Type': 'application/json' }
  });
  assert(resBannersPostNoAuth.statusCode === 401, `POST /api/banners/admin sin token devuelve 401 (recibido: ${resBannersPostNoAuth.statusCode})`);

  // Test 2.4: Solicitud sin autenticación a /api/ai-support/admin/notes -> debe ser 401
  const resAiNotesNoAuth = await makeRequest('/api/ai-support/admin/notes');
  assert(resAiNotesNoAuth.statusCode === 401, `GET /api/ai-support/admin/notes sin token devuelve 401 (recibido: ${resAiNotesNoAuth.statusCode})`);

  // Test 2.5: Solicitud sin autenticación a /api/saas/tenants -> debe ser 401
  const resTenantsNoAuth = await makeRequest('/api/saas/tenants');
  assert(resTenantsNoAuth.statusCode === 401, `GET /api/saas/tenants sin token devuelve 401 (recibido: ${resTenantsNoAuth.statusCode})`);

  // Test 2.6: Solicitud con token de usuario CLIENTE ordinario (no admin) -> debe ser 403 Forbidden
  const clientToken = cryptoService.generateToken({ userId: 'usr_client1', role: 'client', email: 'cliente@gmail.com' });
  const resClientForbidden = await makeRequest('/api/admin/overview', {
    headers: { 'Authorization': `Bearer ${clientToken}` }
  });
  assert(resClientForbidden.statusCode === 403, `GET /api/admin/overview con rol 'client' devuelve 403 Forbidden (recibido: ${resClientForbidden.statusCode})`);

  // Test 2.7: Solicitud con token de ADMINISTRADOR válido -> debe ser 200 OK
  const adminToken = cryptoService.generateToken({ userId: 'usr_admin', role: 'admin', email: 'admin@gamesboy.net' });
  const resAdminOk = await makeRequest('/api/admin/overview', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(resAdminOk.statusCode === 200 && resAdminOk.json && resAdminOk.json.stats, `GET /api/admin/overview con token admin firmado devuelve 200 OK`);

  // Test 2.8: GET /api/banners/admin con token admin -> debe ser 200 OK
  const resBannersAdminOk = await makeRequest('/api/banners/admin', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(resBannersAdminOk.statusCode === 200 && resBannersAdminOk.json && resBannersAdminOk.json.banners, `GET /api/banners/admin con token admin devuelve 200 OK con banners`);

  // --- 3. INTEGRIDAD DE LA TIENDA PÚBLICA ---
  console.log('\n--- 3. Verificación de Integridad de la Tienda Pública ---');

  // Test 3.1: Tienda pública sigue accesible
  const resStore = await makeRequest('/store');
  assert(resStore.statusCode === 200, `GET /store responde 200 OK`);

  // Test 3.2: Catálogo público de banners sigue accesible sin auth
  const resBannersPublic = await makeRequest('/api/banners');
  assert(resBannersPublic.statusCode === 200 && resBannersPublic.json && resBannersPublic.json.banners, `GET /api/banners público responde 200 OK sin autenticación`);

  // Test 3.3: Catálogo público de streaming hubs sigue accesible
  const resStreamingPublic = await makeRequest('/api/streaming-hubs');
  assert(resStreamingPublic.statusCode === 200 && resStreamingPublic.json && resStreamingPublic.json.services, `GET /api/streaming-hubs público responde 200 OK`);

  // Test 3.4: Endpoint público de WhatsApp config sigue accesible
  const resWaConfig = await makeRequest('/api/ai-support/config');
  assert(resWaConfig.statusCode === 200 && resWaConfig.json && resWaConfig.json.phoneNumbers, `GET /api/ai-support/config público responde 200 OK`);

  console.log('\n======================================================');
  console.log(`📊 RESULTADO FINAL: ${passed} pruebas superadas, ${failed} fallidas`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Error fatal al ejecutar suite de pruebas:', err);
  process.exit(1);
});
