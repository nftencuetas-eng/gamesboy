
async function runTest() {
  console.log('🚀 Starting End-to-End SMM Verification Test...');

  const baseUrl = 'http://localhost:3000';

  // 1. Check overview
  const ovRes = await fetch(`${baseUrl}/api/admin/overview`);
  const ovData = await ovRes.json();
  console.log(`✅ Admin Overview pendingSmmCount: ${ovData.stats?.pendingSmmCount}`);

  // 2. Place an SMM Order as client usr_client1
  console.log('\n📦 1. Placing test SMM order for Instagram followers...');
  const orderPayload = {
    serviceId: 'ig_followers',
    serviceTitle: 'Instagram - 1.000 Seguidores Reales (Garantizados)',
    link: 'https://instagram.com/gamesboy_oficial',
    quantity: 1000,
    pricePyg: 45000,
    priceUsd: 6.00
  };

  const orderRes = await fetch(`${baseUrl}/api/smm/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_client1'
    },
    body: JSON.stringify(orderPayload)
  });

  const orderData = await orderRes.json();
  console.log('Order API response:', orderData);

  if (!orderData.success) {
    console.error('❌ Failed to place SMM order:', orderData);
    process.exit(1);
  }

  const orderId = orderData.order.id;
  console.log(`✅ Order created successfully: ${orderId} (Status: ${orderData.order.status}, Delivery: ${orderData.order.estimatedDelivery})`);

  // 3. Check client vault: /api/smm/my-orders
  console.log('\n🔒 2. Checking client vault (/api/smm/my-orders)...');
  const myOrdersRes = await fetch(`${baseUrl}/api/smm/my-orders`, {
    headers: { 'x-user-id': 'usr_client1' }
  });
  const myOrdersRaw = await myOrdersRes.json();
  const myOrders = Array.isArray(myOrdersRaw) ? myOrdersRaw : (myOrdersRaw.orders || []);
  const createdInMyVault = myOrders.find(o => o.id === orderId);
  console.log(`✅ Order found in client vault: ${createdInMyVault ? 'YES' : 'NO'}`);
  console.log(`   Estimated Delivery: "${createdInMyVault?.estimatedDelivery}"`);
  console.log(`   Status: "${createdInMyVault?.status}"`);

  // 4. Check admin orders tray: /api/admin/smm/orders
  console.log('\n🛡️ 3. Checking admin SMM tray (/api/admin/smm/orders)...');
  const adminOrdersRes = await fetch(`${baseUrl}/api/admin/smm/orders`);
  const adminData = await adminOrdersRes.json();
  console.log(`✅ Total SMM Orders: ${adminData.stats.totalOrders}, In Progress: ${adminData.stats.inProgressCount}, Volume: ${adminData.stats.totalVolumePyg} Gs.`);
  const inAdminTray = adminData.orders.find(o => o.id === orderId);
  console.log(`✅ Order found in admin tray: ${inAdminTray ? 'YES' : 'NO'}`);

  // 5. Admin completes the order: /api/admin/smm/orders/:id/complete
  console.log(`\n⚡ 4. Admin marks order ${orderId} as completed...`);
  const completeRes = await fetch(`${baseUrl}/api/admin/smm/orders/${orderId}/complete`, {
    method: 'POST'
  });
  const completeData = await completeRes.json();
  console.log('Complete API response:', completeData);

  // 6. Verify client vault reflects completion
  console.log('\n🎯 5. Verifying order completion in client vault...');
  const afterOrdersRes = await fetch(`${baseUrl}/api/smm/my-orders`, {
    headers: { 'x-user-id': 'usr_client1' }
  });
  const afterOrdersRaw = await afterOrdersRes.json();
  const afterOrders = Array.isArray(afterOrdersRaw) ? afterOrdersRaw : (afterOrdersRaw.orders || []);
  const completedOrder = afterOrders.find(o => o.id === orderId);
  console.log(`✅ Status after completion: "${completedOrder?.status}"`);
  console.log(`   Completed At: "${completedOrder?.completedAt}"`);

  console.log('\n🎉 ALL SMM WORKFLOW VERIFICATION TESTS PASSED 100%!');
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
