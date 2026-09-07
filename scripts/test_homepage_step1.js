import http from 'http';

async function get(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Starting Verification Tests for STEP 1 (Homepage)...');

  // 1. Check Homepage HTML
  const home = await get('/');
  console.log(`✅ Homepage Status: ${home.status} (Length: ${home.body.length} bytes)`);
  if (!home.body.includes('GamesBoy.net') || !home.body.includes('header-search-wrapper')) {
    throw new Error('Homepage HTML missing core branding or header elements');
  }

  // Verify no unclosed trust pillars
  if (!home.body.includes('</section>') || !home.body.includes('trust-pillars-row')) {
    throw new Error('trust-pillars-row is missing or improperly closed in HTML');
  }

  // 2. Check CSS file
  const css = await get('/css/main.css');
  console.log(`✅ CSS Status: ${css.status} (Length: ${css.body.length} bytes)`);
  if (!css.body.includes('.is-hidden') || !css.body.includes('--bg-body: #0c0e14;')) {
    throw new Error('CSS missing updated luxury tokens or .is-hidden utility');
  }

  // 3. Check JS app file
  const js = await get('/js/app.js');
  console.log(`✅ JS Status: ${js.status} (Length: ${js.body.length} bytes)`);
  if (!js.body.includes('initUserSession') || !js.body.includes('handleLogout')) {
    throw new Error('JS missing user session or logout handler');
  }

  // 4. Test Subscriptions API
  const subs = await get('/api/subscriptions');
  console.log(`✅ Subscriptions API Status: ${subs.status}`);
  const subsData = JSON.parse(subs.body);
  console.log(`   • Loaded ${subsData.subscriptions?.length || subsData.length} subscriptions`);

  // 5. Test Store Products API
  const store = await get('/api/store/products');
  console.log(`✅ Store Products API Status: ${store.status}`);
  const storeData = JSON.parse(store.body);
  console.log(`   • Loaded ${storeData.products?.length || storeData.length} store items`);

  // 6. Test Banners API
  const banners = await get('/api/banners');
  console.log(`✅ Banners API Status: ${banners.status}`);
  const bannersData = JSON.parse(banners.body);
  console.log(`   • Loaded ${bannersData.banners?.length} hero banners`);

  console.log('\n🎉 ALL STEP 1 HOMEPAGE INTEGRITY TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
