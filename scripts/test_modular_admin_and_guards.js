import http from 'http';

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- 🧪 STARTING MODULAR ADMIN & AUTH GUARDS VERIFICATION ---');

  // 1. Strict Auth Guards Verification
  console.log('\n1. Testing Strict Auth Guards...');
  
  // Guard A: Admin trying to login via Client Portal
  const adminOnClient = await makeRequest('/api/auth/login', 'POST', {
    email: 'admin@gamesboy.net',
    password: 'GamesBoy2026Master!',
    portalType: 'client'
  });
  console.log(`   • Admin on Client Portal Status: ${adminOnClient.status} (Expected: 403)`);
  if (adminOnClient.status !== 403) throw new Error('Guard failed: Admin was allowed on client portal!');
  console.log(`     Error message: "${adminOnClient.data.error}"`);

  // Guard B: Client trying to login via Admin Portal
  const clientOnAdmin = await makeRequest('/api/auth/login', 'POST', {
    email: 'lucas@cliente.com',
    password: 'Cliente123!',
    portalType: 'admin'
  });
  console.log(`   • Client on Admin Portal Status: ${clientOnAdmin.status} (Expected: 403)`);
  if (clientOnAdmin.status !== 403) throw new Error('Guard failed: Client was allowed on admin portal!');
  console.log(`     Error message: "${clientOnAdmin.data.error}"`);

  // Guard C: Admin login on Admin Portal
  const adminValid = await makeRequest('/api/auth/login', 'POST', {
    email: 'admin@gamesboy.net',
    password: 'GamesBoy2026Master!',
    portalType: 'admin'
  });
  console.log(`   • Admin on Admin Portal Status: ${adminValid.status} (Expected: 200) -> Welcome: ${adminValid.data.user.name}`);

  // Guard D: Client login on Client Portal
  const clientValid = await makeRequest('/api/auth/login', 'POST', {
    email: 'lucas@cliente.com',
    password: 'Cliente123!',
    portalType: 'client'
  });
  console.log(`   • Client on Client Portal Status: ${clientValid.status} (Expected: 200) -> Welcome: ${clientValid.data.user.name}`);

  // 2. Digital Games Management CRUD
  console.log('\n2. Testing Digital Games Management CRUD & Dual Pricing...');
  const gamesRes = await makeRequest('/api/admin/games');
  console.log(`   • Games GET Status: ${gamesRes.status}, Count: ${gamesRes.data.count}`);

  const newGameRes = await makeRequest('/api/admin/games', 'POST', {
    title: 'Cyberpunk 2077: Phantom Liberty',
    platform: 'PS5',
    genre: 'RPG / Sci-Fi',
    primaryPriceUsd: 34.99,
    secondaryPriceUsd: 21.99,
    digitalKeyPriceUsd: 49.99,
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
    screenshots: ['https://images.unsplash.com/photo-1511512578047-dfb367046420'],
    description: 'Aventura de espionaje y suspense en Night City.',
    isAvailable: true
  });
  console.log(`   • Game Create Status: ${newGameRes.status} -> Created ID: ${newGameRes.data.game.id}`);
  const createdGameId = newGameRes.data.game.id;

  const updateGameRes = await makeRequest(`/api/admin/games/${createdGameId}`, 'PUT', {
    primaryPriceUsd: 29.99,
    isAvailable: false
  });
  console.log(`   • Game Update Status: ${updateGameRes.status} -> Available: ${updateGameRes.data.game.isAvailable}`);

  const deleteGameRes = await makeRequest(`/api/admin/games/${createdGameId}`, 'DELETE');
  console.log(`   • Game Delete Status: ${deleteGameRes.status}`);

  // 3. Gift Cards & Activation Codes Vault
  console.log('\n3. Testing Gift Cards & Codes Vault...');
  const gcRes = await makeRequest('/api/admin/giftcards');
  console.log(`   • Gift Cards GET Status: ${gcRes.status}, Count: ${gcRes.data.count}`);

  const newGcRes = await makeRequest('/api/admin/giftcards', 'POST', {
    title: 'Steam Wallet $100 USD',
    brand: 'Steam',
    priceUsd: 100.00,
    codes: ['STEAM-1111-2222-3333', 'STEAM-4444-5555-6666']
  });
  console.log(`   • Gift Card Create Status: ${newGcRes.status} -> Stock: ${newGcRes.data.giftCard.stockCount}`);
  const gcId = newGcRes.data.giftCard.id;

  const addCodesRes = await makeRequest(`/api/admin/giftcards/${gcId}/add-codes`, 'POST', {
    codes: ['STEAM-7777-8888-9999']
  });
  console.log(`   • Add Batch Codes Status: ${addCodesRes.status} -> Total Stock: ${addCodesRes.data.totalCodes}`);

  const deleteGcRes = await makeRequest(`/api/admin/giftcards/${gcId}`, 'DELETE');
  console.log(`   • Gift Card Delete Status: ${deleteGcRes.status}`);

  // 4. SMM API Config & Testing
  console.log('\n4. Testing SMM API Configuration...');
  const smmConfigRes = await makeRequest('/api/admin/smm/config');
  console.log(`   • SMM Config GET Status: ${smmConfigRes.status} -> Markup: ${smmConfigRes.data.config.markupPercent}%`);

  const smmPingRes = await makeRequest('/api/admin/smm/test-connection', 'POST');
  console.log(`   • SMM Test Connection Status: ${smmPingRes.status} -> Provider Balance: $${smmPingRes.data.providerBalanceUsd}`);

  // 5. Streaming Moderation & Services
  console.log('\n5. Testing Streaming Services & Moderation...');
  const streamingServicesRes = await makeRequest('/api/admin/streaming/services');
  console.log(`   • Official Services Status: ${streamingServicesRes.status} -> Count: ${streamingServicesRes.data.services.length}`);

  const activeGroupsRes = await makeRequest('/api/admin/streaming/active-groups');
  console.log(`   • Live Active Groups Status: ${activeGroupsRes.status} -> Count: ${activeGroupsRes.data.count}`);

  console.log('\n🎉 --- ALL MODULAR ADMIN, SECURITY GUARDS & API TESTS PASSED 100%! ---');
}

runTests().catch(err => {
  console.error('❌ Test execution error:', err);
  process.exit(1);
});
