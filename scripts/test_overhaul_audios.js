// Comprehensive Test Suite for Audio Overhaul (Hubs, Reviews, Purchases & Real Group Chat)

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 [TEST SUITE] Starting GamesBoy Overhaul Validation...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // 1. Test Streaming Hubs Endpoint
    console.log('--- 1. Testing Streaming Hubs API ---');
    const hubRes = await fetch(`${BASE_URL}/api/streaming-hubs/netflix`);
    const hubData = await hubRes.json();
    assert(hubData.success === true, 'Streaming Hub returns success: true');
    assert(hubData.hub && hubData.hub.name.includes('Netflix'), 'Hub data contains Netflix platform');
    assert(Array.isArray(hubData.hub.releases) && hubData.hub.releases.length > 0, 'Hub contains authentic releases list');
    assert(hubData.hub.releases[0].releaseDate !== undefined, 'Releases contain releaseDate information');
    assert(Array.isArray(hubData.groups) && hubData.groups.length > 0, 'Hub returns active groups for the platform');
    assert(hubData.groups[0].host && hubData.groups[0].host.name, 'Group returns host public metadata');

    // 2. Test Public Seller Profile API
    console.log('\n--- 2. Testing Public Seller Profile API ---');
    const sellerRes = await fetch(`${BASE_URL}/api/seller/public/usr_seller1`);
    const sellerData = await sellerRes.json();
    assert(sellerData.success === true, 'Public seller endpoint returns success: true');
    assert(sellerData.seller && sellerData.seller.name, `Seller profile found: ${sellerData.seller?.name}`);
    assert(Array.isArray(sellerData.listings), 'Seller returns active listings');
    assert(Array.isArray(sellerData.reviews) && sellerData.reviews.length > 0, 'Seller returns verified reviews list');
    assert(sellerData.seller.stats.rating !== undefined, `Seller rating calculated: ${sellerData.seller?.stats?.rating} ★`);

    // 3. Test Verified Reviews Security Validation
    console.log('\n--- 3. Testing Verified Reviews Security & Posting ---');
    // Test unauthenticated
    const unauthReviewRes = await fetch(`${BASE_URL}/api/seller/public/usr_seller1/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, comment: 'Intento sin login' })
    });
    assert(unauthReviewRes.status === 401, 'Unauthenticated review is rejected (401)');

    // Test verified buyer (usr_client1 has a slot in sub_netflix_official or seller1)
    const buyerReviewRes = await fetch(`${BASE_URL}/api/seller/public/usr_admin/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_client1'
      },
      body: JSON.stringify({
        rating: 5,
        comment: '¡Excelente atención y entrega inmediata de mi perfil 4K!'
      })
    });
    const buyerReviewData = await buyerReviewRes.json();
    assert(buyerReviewData.success === true, 'Verified buyer can post a review');
    assert(buyerReviewData.review && (buyerReviewData.review.buyerName === 'Lucas' || buyerReviewData.review.buyerName === 'Lucas_Py' || buyerReviewData.review.buyerName === 'Lucas González'), 'Review records real buyer name');

    // 4. Test Purchases Vault API
    console.log('\n--- 4. Testing Purchases Vault API ---');
    const vaultRes = await fetch(`${BASE_URL}/api/subscriptions/my-vault`, {
      headers: { 'x-user-id': 'usr_client1' }
    });
    const vaultSlots = await vaultRes.json();
    assert(Array.isArray(vaultSlots) && vaultSlots.length > 0, 'Purchases Vault returns client slots');
    assert(vaultSlots[0].credentials !== undefined, 'Slot includes decrypted credentials for client');
    assert(vaultSlots[0].assignedPin !== undefined, `Slot includes private PIN: ${vaultSlots[0].assignedPin}`);

    // 5. Test Real Group Chat API
    console.log('\n--- 5. Testing Real Group Chat API ---');
    const subId = vaultSlots[0].subscriptionId || 'sub_netflix_official';
    const groupRes = await fetch(`${BASE_URL}/api/subscriptions/${subId}/group`, {
      headers: { 'x-user-id': 'usr_client1' }
    });
    const groupData = await groupRes.json();
    assert(groupData.success === true, 'Group details and chat retrieved successfully');
    assert(Array.isArray(groupData.group.members) && groupData.group.members.length > 0, 'Group returns member list with roles');
    assert(Array.isArray(groupData.group.chatMessages), 'Group returns message history');

    // Send a new chat message
    const sendChatRes = await fetch(`${BASE_URL}/api/subscriptions/${subId}/group/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_client1'
      },
      body: JSON.stringify({ text: 'Hola a todos en el grupo, todo funcionando excelente.' })
    });
    const sendChatData = await sendChatRes.json();
    assert(sendChatData.success === true, 'Chat message sent successfully');
    assert(sendChatData.message && sendChatData.message.text.includes('Hola a todos'), 'Sent message text verified');

    // 6. Test Strict Admin Role Guard
    console.log('\n--- 6. Testing Strict Admin Role Guard on Purchases ---');
    const adminBuyRes = await fetch(`${BASE_URL}/api/subscriptions/${subId}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'usr_admin'
      }
    });
    assert(adminBuyRes.status === 403, 'Admin user is blocked from buying client slots (403)');

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  }

  console.log(`\n==============================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================`);

  if (failed > 0) process.exit(1);
}

runTests();
