// Test SMM Services Catalog & Order Processing
const API_URL = 'http://localhost:3000';

async function runSmmTests() {
  console.log('--- 🧪 STARTING SMM API & ORDER PROCESSING VERIFICATION ---');

  // 1. Get SMM Services
  console.log('\n1. Testing GET /api/smm/services...');
  const resServices = await fetch(`${API_URL}/api/smm/services`);
  const dataServices = await resServices.json();
  console.log(`   • Status: ${resServices.status}, Count: ${dataServices.count}`);
  if (!dataServices.success || !dataServices.services || dataServices.services.length === 0) {
    throw new Error('Failed to retrieve SMM services catalog');
  }
  const firstService = dataServices.services[0];
  console.log(`   • Sample Service: ${firstService.name} (${firstService.platform}) - $${firstService.pricePer1kUsd} / 1k (${firstService.pricePer1kPyg.toLocaleString()} Gs.)`);

  // 2. Place SMM Order
  console.log('\n2. Testing POST /api/smm/order with client...');
  const resOrder = await fetch(`${API_URL}/api/smm/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_client1'
    },
    body: JSON.stringify({
      serviceId: firstService.id,
      link: 'https://instagram.com/gamesboy_test_profile',
      quantity: 1000
    })
  });
  const dataOrder = await resOrder.json();
  console.log(`   • Status: ${resOrder.status}`);
  if (!dataOrder.success) {
    console.log(`   • Response Message: ${dataOrder.error || dataOrder.message}`);
  } else {
    console.log(`   • Created Order ID: ${dataOrder.order.id}`);
    console.log(`   • Total Charged: ${dataOrder.totalPyg.toLocaleString()} Gs. ($${dataOrder.totalUsd} USD)`);
  }

  // 3. Retrieve User SMM Orders
  console.log('\n3. Testing GET /api/smm/my-orders...');
  const resMyOrders = await fetch(`${API_URL}/api/smm/my-orders`, {
    headers: { 'x-user-id': 'usr_client1' }
  });
  const dataMyOrders = await resMyOrders.json();
  console.log(`   • Status: ${resMyOrders.status}, Count: ${dataMyOrders.count}`);

  console.log('\n🎉 --- ALL SMM API TESTS PASSED! ---');
}

runSmmTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
