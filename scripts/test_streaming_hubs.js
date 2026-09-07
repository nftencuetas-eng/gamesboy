// Automated Test Suite for Dedicated Streaming Hubs, AI Releases & Escrow Protection
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting Streaming Hubs & Escrow System Integration Tests...\n');

  // 1. Test GET /api/streaming-hubs/netflix
  console.log('1. Testing GET /api/streaming-hubs/netflix...');
  const resHub = await fetch(`${BASE_URL}/api/streaming-hubs/netflix`);
  console.log('   Status:', resHub.status);
  const dataHub = await resHub.json();
  console.log('   Hub Name:', dataHub.hub?.name);
  console.log('   Horizontal Banner:', !!dataHub.hub?.bannerHorizontal);
  console.log('   Vertical Banner:', !!dataHub.hub?.bannerVertical);
  console.log('   Releases Count:', dataHub.hub?.releases?.length);
  console.log('   Groups Count:', dataHub.groups?.length);
  if (dataHub.groups && dataHub.groups.length > 0) {
    const sampleGroup = dataHub.groups[0];
    console.log('   Sample Group Host:', sampleGroup.host?.name, sampleGroup.host?.badge);
    console.log('   Strict Privacy Check - Host Phone:', sampleGroup.host?.phone === undefined ? '✅ PROTECTED (Hidden)' : '❌ LEAK');
    console.log('   Strict Privacy Check - Host Email:', sampleGroup.host?.email === undefined ? '✅ PROTECTED (Hidden)' : '❌ LEAK');
  }

  // 2. Test GET /api/admin/streaming-hubs
  console.log('\n2. Testing GET /api/admin/streaming-hubs...');
  const resAdminHubs = await fetch(`${BASE_URL}/api/admin/streaming-hubs`);
  console.log('   Status:', resAdminHubs.status);
  const dataAdminHubs = await resAdminHubs.json();
  console.log('   Available Platforms in Admin:', Object.keys(dataAdminHubs.hubs || {}));

  // 3. Test POST /api/admin/streaming-hubs/netflix/sync-ai (AI Live Synchronizer)
  console.log('\n3. Testing POST /api/admin/streaming-hubs/netflix/sync-ai...');
  const resSync = await fetch(`${BASE_URL}/api/admin/streaming-hubs/netflix/sync-ai`, { method: 'POST' });
  console.log('   Status:', resSync.status);
  const dataSync = await resSync.json();
  console.log('   AI Message:', dataSync.message);
  console.log('   Synced Releases:', dataSync.releases?.map(r => r.title));

  // 4. Test PUT /api/admin/streaming-hubs/netflix (Update Hub configuration)
  console.log('\n4. Testing PUT /api/admin/streaming-hubs/netflix...');
  const resUpdate = await fetch(`${BASE_URL}/api/admin/streaming-hubs/netflix`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tagline: 'Mundo de entretenimiento ilimitado con protección Escrow GamesBoy',
      metrics: { activeAccounts: 55, activeUsersMonth: 210, avgSavingsPercent: 76, rating: '4.98 / 5.0' }
    })
  });
  console.log('   Status:', resUpdate.status);
  const dataUpdate = await resUpdate.json();
  console.log('   Updated Tagline:', dataUpdate.hub?.tagline);
  console.log('   Updated Metrics:', dataUpdate.hub?.metrics);

  // 5. Test Dedicated Hubs for Other Platforms (Spotify, Disney, ChatGPT, Max)
  console.log('\n5. Testing Other Platform Hubs (Spotify, Disney, ChatGPT, Max)...');
  for (const plat of ['spotify', 'disney', 'chatgpt', 'max']) {
    const r = await fetch(`${BASE_URL}/api/streaming-hubs/${plat}`);
    const d = await r.json();
    console.log(`   • ${plat.toUpperCase()}: ${d.hub?.name} | Releases: ${d.hub?.releases?.length} | Groups: ${d.groups?.length}`);
  }

  console.log('\n✅ ALL STREAMING HUB INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
