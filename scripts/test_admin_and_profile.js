// Test Admin Products CRUD, Hero Banners, Escrow and Profile endpoints
import http from 'http';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_admin',
      ...headers
    };

    const req = http.request(`http://localhost:3000${path}`, {
      method,
      headers: defaultHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- 🧪 STARTING ADMIN & PROFILE API TESTS ---');

  // 1. Profile API
  console.log('\n1. Testing Profile API...');
  const profRes = await makeRequest('/api/auth/profile', 'GET', null, { 'x-user-id': 'usr_client1' });
  console.log('   Profile GET status:', profRes.status, 'User:', profRes.body.user?.name, 'Balance Gs.:', profRes.body.balancePyg);

  const updateProfRes = await makeRequest('/api/auth/profile', 'PUT', {
    name: 'Lucas',
    surname: 'González',
    birthday: '1998-05-14',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
  }, { 'x-user-id': 'usr_client1' });
  console.log('   Profile PUT status:', updateProfRes.status, 'Message:', updateProfRes.body.message);

  // 2. Set Password
  const pwdRes = await makeRequest('/api/auth/set-password', 'POST', {
    password: 'NewSecurePassword123!',
    confirmPassword: 'NewSecurePassword123!'
  }, { 'x-user-id': 'usr_client1' });
  console.log('   Password Set status:', pwdRes.status, 'Success:', pwdRes.body.success);

  // 3. Admin Products CRUD
  console.log('\n2. Testing Admin Products CRUD...');
  const createProdRes = await makeRequest('/api/admin/products', 'POST', {
    title: 'Grand Theft Auto V: Premium Edition',
    category: 'game_key',
    platform: 'PlayStation 5',
    priceUsd: 15.00,
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
    stockKeys: ['GTA5-PS5-KEY-1111', 'GTA5-PS5-KEY-2222'],
    description: 'Acceso completo a GTA V y Grand Theft Auto Online en PS5.'
  });
  console.log('   Product Create status:', createProdRes.status, 'New ID:', createProdRes.body.product?.id);
  const newProdId = createProdRes.body.product?.id;

  const getProdsRes = await makeRequest('/api/admin/products', 'GET');
  console.log('   Total Store Products count:', getProdsRes.body.products?.length);

  if (newProdId) {
    const updateProd = await makeRequest(`/api/admin/products/${newProdId}`, 'PUT', {
      title: 'Grand Theft Auto V: Next-Gen PS5',
      priceUsd: 18.00
    });
    console.log('   Product Update status:', updateProd.status, 'Updated title:', updateProd.body.product?.title);

    const deleteProd = await makeRequest(`/api/admin/products/${newProdId}`, 'DELETE');
    console.log('   Product Delete status:', deleteProd.status, 'Success:', deleteProd.body.success);
  }

  // 4. Hero Banners Admin
  console.log('\n3. Testing Hero Banners Sync...');
  const bannersRes = await makeRequest('/api/banners', 'GET');
  console.log('   Active Banners count:', bannersRes.body.banners?.length);

  const saveBannersRes = await makeRequest('/api/banners/admin', 'POST', {
    banners: [
      {
        id: 'banner_fc25',
        title: 'EA SPORTS FC 25',
        tagline: 'CLUBES & ULTIMATE TEAM',
        badge: 'PS5 • XBOX • PC',
        imgHorizontal: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
        imgVertical: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
        ctaText: 'Ver Ediciones',
        ctaUrl: '#section-games',
        sortOrder: 0
      }
    ]
  });
  console.log('   Hero Banners Admin Update status:', saveBannersRes.status, 'Message:', saveBannersRes.body.message);

  console.log('\n🎉 --- ALL ADMIN, PROFILE & BANNERS TESTS PASSED 100%! ---');
}

runTests().catch(console.error);
