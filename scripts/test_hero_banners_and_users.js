import http from 'http';
import fs from 'fs';
import path from 'path';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Verification Tests for Hero Banners & Users Overhaul...');

  // 1. Verify /api/banners and /api/banners/admin
  console.log('\n--- 1. Testing Hero Banners API ---');
  const bannersRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/banners',
    method: 'GET'
  });
  console.log(`GET /api/banners Status: ${bannersRes.status}`);
  if (!bannersRes.body.banners || bannersRes.body.banners.length < 4) {
    throw new Error('Hero banners list must contain at least 4 banners');
  }
  console.log(`✅ Returned ${bannersRes.body.banners.length} active banners:`, bannersRes.body.banners.map(b => b.title));

  // Admin save custom banners
  const updateBannersRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/banners/admin',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    banners: [
      {
        id: 'banner_fc25',
        title: 'EA SPORTS FC 25 (Edición Campeones)',
        tagline: 'CLUBES, ULTIMATE TEAM & MODO CARRERA',
        badge: 'PS5 • XBOX • PC',
        imgHorizontal: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80',
        imgVertical: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
        ctaText: 'Ver Ediciones',
        ctaUrl: '#section-games',
        sortOrder: 0,
        isActive: true
      },
      ...bannersRes.body.banners.slice(1)
    ]
  });
  console.log(`POST /api/banners/admin Status: ${updateBannersRes.status}, Message: ${updateBannersRes.body.message}`);
  if (!updateBannersRes.body.success) throw new Error('Failed to update hero banners');
  console.log('✅ Hero Banners updated and synced with database!');

  // 2. Testing /api/admin/users
  console.log('\n--- 2. Testing Users & Accounting Metrics API ---');
  const usersRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users',
    method: 'GET'
  });
  console.log(`GET /api/admin/users Status: ${usersRes.status}`);
  if (!usersRes.body.users || !usersRes.body.stats) {
    throw new Error('Users endpoint missing users or stats object');
  }
  console.log('✅ Users Count:', usersRes.body.count);
  console.log('✅ Accounting Stats:', JSON.stringify(usersRes.body.stats, null, 2));

  // 3. Testing HTML Structure Integrity
  console.log('\n--- 3. Testing admin.html Structure Integrity ---');
  const adminHtml = fs.readFileSync('client/admin.html', 'utf-8');
  
  if (!adminHtml.includes('id="tab-hero-banners"')) throw new Error('tab-hero-banners not found in admin.html');
  console.log('✅ Found <section id="tab-hero-banners">');

  if (!adminHtml.includes('id="tab-users"')) throw new Error('tab-users not found in admin.html');
  console.log('✅ Found <section id="tab-users">');

  if (!adminHtml.includes('users-kpi-grid')) throw new Error('users-kpi-grid not found in admin.html');
  console.log('✅ Found .users-kpi-grid');

  if (!adminHtml.includes('users-pagination-controls')) throw new Error('users-pagination-controls not found in admin.html');
  console.log('✅ Found #users-pagination-controls');

  if (adminHtml.includes('id="modal-user-adjust"')) throw new Error('modal-user-adjust should be removed');
  console.log('✅ Verified: modal-user-adjust has been completely removed!');

  if (adminHtml.includes('<span>Ver Tienda</span>')) throw new Error('Admin sidebar should not contain Ver Tienda');
  console.log('✅ Verified: Ver Tienda link removed from admin sidebar (Strict Auditor separation)!');

  console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
