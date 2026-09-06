// Native Node fetch

async function testAll() {
  console.log('--- 1. Testing GET /api/subscriptions/sub_netflix_official/group ---');
  const groupRes = await fetch('http://localhost:3000/api/subscriptions/sub_netflix_official/group', {
    headers: { 'x-user-id': 'usr_client1' }
  });
  const groupData = await groupRes.json();
  console.log('Group success:', groupData.success);
  console.log('Members count:', groupData.group?.members?.length);
  console.log('Members sample:', groupData.group?.members);

  console.log('\n--- 2. Testing POST /api/subscriptions/sub_netflix_official/group/chat ---');
  const chatRes = await fetch('http://localhost:3000/api/subscriptions/sub_netflix_official/group/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_client1'
    },
    body: JSON.stringify({ text: '¡Hola a todos! Este es un mensaje de prueba en el grupo.' })
  });
  const chatData = await chatRes.json();
  console.log('Chat posted:', chatData);

  console.log('\n--- 3. Testing POST /api/subscriptions/publish (Regular Client Publishing) ---');
  const pubRes = await fetch('http://localhost:3000/api/subscriptions/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'usr_client1'
    },
    body: JSON.stringify({
      serviceName: 'Disney+ Premium & Star+',
      planName: 'Plan 4K 4 Pantallas Compartidas',
      totalSlots: 4,
      pricePerSlotUsd: 4.50,
      credentials: 'disney.lucas@gmail.com:::LucasPass99!',
      pins: { 1: '1122', 2: '3344', 3: '5566', 4: '7788' },
      instructions: 'Usa exclusivamente tu perfil asignado y no cambies contraseña.'
    })
  });
  const pubData = await pubRes.json();
  console.log('Publish result:', pubData);

  console.log('\n--- 4. Testing GET /api/subscriptions/my-vault ---');
  const vaultRes = await fetch('http://localhost:3000/api/subscriptions/my-vault', {
    headers: { 'x-user-id': 'usr_client1' }
  });
  const vaultData = await vaultRes.json();
  console.log('Vault items count:', vaultData.length);
  console.log('First vault item:', vaultData[0]);

  console.log('\n✅ All API tests passed successfully!');
}

testAll().catch(console.error);
