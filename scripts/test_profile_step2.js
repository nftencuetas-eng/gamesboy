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
  console.log('🧪 Starting Verification Tests for STEP 2 (Mi Cuenta & Perfil)...');

  // 1. Check Profile HTML
  const profile = await get('/profile.html');
  console.log(`✅ Profile HTML Status: ${profile.status} (Length: ${profile.body.length} bytes)`);
  if (!profile.body.includes('Mi Cuenta & Perfil') || !profile.body.includes('profile-surface-card')) {
    throw new Error('Profile HTML missing luxury surface cards or core title');
  }

  if (!profile.body.includes('user-purchases-container') || !profile.body.includes('pane-tab-purchases')) {
    throw new Error('Profile HTML missing purchases tab container');
  }

  // 2. Test User Profile API Endpoint
  const profileApi = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/profile',
      method: 'GET',
      headers: { 'x-user-id': 'usr_client1' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });

  console.log(`✅ Profile API Status: ${profileApi.status}`);
  const profileData = JSON.parse(profileApi.body);
  if (!profileData.success || !profileData.user) {
    throw new Error('Profile API failed to return user data for usr_client1');
  }
  console.log(`   • User: ${profileData.user.name} (${profileData.user.email})`);
  console.log(`   • Balance (Gs.): ${profileData.balancePyg?.toLocaleString('es-PY')} Gs.`);
  console.log(`   • Active Slots in Vault: ${profileData.mySlots?.length || 0}`);

  console.log('\n🎉 ALL STEP 2 PROFILE & PURCHASES INTEGRITY TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
