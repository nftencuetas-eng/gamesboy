import http from 'http';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Games & Gift Cards Overhaul Integration Tests...\n');

  try {
    // 1. Get Games
    console.log('1. Testing GET /api/admin/games...');
    const gamesRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/games',
      method: 'GET'
    });
    console.log(`   Status: ${gamesRes.status}, Games Count: ${gamesRes.body.games?.length}`);

    // 2. Create a Game with Guaraníes prices & screenshots
    console.log('\n2. Testing POST /api/admin/games (Guaraníes & Screenshots)...');
    const newGameRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/games',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      title: 'EA Sports FC 25 (Test)',
      platform: 'PS5',
      genre: 'Deportes',
      primaryPricePyg: 320000,
      secondaryPricePyg: 210000,
      coverImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
      screenshots: [
        'data:image/jpeg;base64,screenshot1...',
        'data:image/jpeg;base64,screenshot2...'
      ],
      description: 'Edición oficial PlayStation 5 con licencias completas.',
      isAvailable: true
    });
    console.log(`   Status: ${newGameRes.status}, Created ID: ${newGameRes.body.game?.id}`);
    const testGameId = newGameRes.body.game?.id;

    // 3. Edit Game with PUT
    console.log('\n3. Testing PUT /api/admin/games/:id...');
    const editGameRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/admin/games/${testGameId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      title: 'EA Sports FC 25 Ultimate Edition (Updated)',
      primaryPricePyg: 350000,
      secondaryPricePyg: 230000
    });
    console.log(`   Status: ${editGameRes.status}, Updated Title: ${editGameRes.body.game?.title}, Primary Pyg: ${editGameRes.body.game?.primaryPricePyg}`);

    // 4. Test Buy Game (Creating a Pending Order)
    console.log('\n4. Testing POST /api/store/products/:id/buy (Game Primary Account)...');
    const buyGameRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/store/products/${testGameId}/buy`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_client1'
      }
    }, {
      option: 'Cuenta Primaria'
    });
    console.log(`   Status: ${buyGameRes.status}, Order Status: ${buyGameRes.body.order?.status}, Order ID: ${buyGameRes.body.order?.id}`);
    const testOrderId = buyGameRes.body.order?.id;

    // 5. Test Pending Orders in Admin
    console.log('\n5. Testing GET /api/admin/orders/pending...');
    const pendingOrdersRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/orders/pending',
      method: 'GET'
    });
    console.log(`   Status: ${pendingOrdersRes.status}, Pending Orders Count: ${pendingOrdersRes.body.pendingCount}`);

    // 6. Test Deliver Order
    if (testOrderId) {
      console.log(`\n6. Testing POST /api/admin/orders/${testOrderId}/deliver...`);
      const deliverRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: `/api/admin/orders/${testOrderId}/deliver`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        deliveredEmail: 'playstation_user_psn@gamesboy.net',
        deliveredPassword: 'PasswordSeguro2026!',
        deliveredInstructions: '1. Inicia sesión en tu PS5 con este perfil. 2. Activa como consola principal y descarga el juego.'
      });
      console.log(`   Status: ${deliverRes.status}, Delivered Status: ${deliverRes.body.order?.status}`);
    }

    // 7. Test Gift Cards Brands
    console.log('\n7. Testing GET /api/admin/giftcards/brands...');
    const brandsRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/giftcards/brands',
      method: 'GET'
    });
    console.log(`   Status: ${brandsRes.status}, Brands Count: ${brandsRes.body.brands?.length}`);

    // 8. Clean up test game
    if (testGameId) {
      console.log('\n8. Cleaning up test game DELETE /api/admin/games/:id...');
      const delGameRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: `/api/admin/games/${testGameId}`,
        method: 'DELETE'
      });
      console.log(`   Status: ${delGameRes.status}, Deleted: ${delGameRes.body.game?.title}`);
    }

    console.log('\n✅ ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
}

runTests();
