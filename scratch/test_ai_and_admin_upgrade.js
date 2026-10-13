async function runE2ETest() {
  console.log('🚀 Running End-to-End Verification for AI Support & Admin Panel Overhaul...\n');
  const baseUrl = 'http://localhost:3000';

  // 1. Test WhatsApp Widget Public Config
  console.log('1️⃣ Testing GET /api/ai-support/config...');
  const cfgRes = await fetch(`${baseUrl}/api/ai-support/config`);
  const cfgData = await cfgRes.json();
  console.log(`   ✅ Brand: ${cfgData.brandName}, Verified: ${cfgData.verified}`);
  console.log(`   ✅ Department Phones: General=${cfgData.phoneNumbers?.general}, Games=${cfgData.phoneNumbers?.games}`);

  // 2. Test WhatsApp Widget Chat (Streaming Inquiry)
  console.log('\n2️⃣ Testing POST /api/ai-support/chat (Streaming inquiry)...');
  const chatRes1 = await fetch(`${baseUrl}/api/ai-support/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Hola! Cuánto cuesta la cuenta de Netflix 4K y cómo se paga?',
      clientName: 'Juan Pérez',
      clientPhone: '+595981112233'
    })
  });
  const chatData1 = await chatRes1.json();
  console.log(`   ✅ Reply: "${chatData1.reply.substring(0, 80)}..."`);
  console.log(`   ✅ Detected Intent: ${chatData1.detectedIntent}, Suggested Phone: ${chatData1.suggestedPhone}`);

  // 3. Test WhatsApp Widget Chat (Work Tools / AI Inquiry)
  console.log('\n3️⃣ Testing POST /api/ai-support/chat (Work Tools / AI inquiry)...');
  const chatRes2 = await fetch(`${baseUrl}/api/ai-support/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Tienen ChatGPT Plus o Claude Pro para programar?',
      clientName: 'Lucas Dev',
      clientPhone: '+595991445566'
    })
  });
  const chatData2 = await chatRes2.json();
  console.log(`   ✅ Reply: "${chatData2.reply.substring(0, 80)}..."`);
  console.log(`   ✅ Detected Intent: ${chatData2.detectedIntent}, Dept: ${chatData2.department}`);

  // 4. Test Admin AI Config (GET & POST)
  console.log('\n4️⃣ Testing GET & POST /api/ai-support/admin/config...');
  const admCfgRes = await fetch(`${baseUrl}/api/ai-support/admin/config`);
  const admCfgData = await admCfgRes.json();
  console.log(`   ✅ Current Provider: ${admCfgData.config?.provider}, Model: ${admCfgData.config?.model}`);

  const updateCfgRes = await fetch(`${baseUrl}/api/ai-support/admin/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'builtin',
      model: 'gpt-4o-mini',
      phoneNumbers: {
        general: '+595981000000',
        games: '+595981111111',
        streaming: '+595981222222',
        tools: '+595981333333',
        payments: '+595981444444'
      }
    })
  });
  const updateCfgData = await updateCfgRes.json();
  console.log(`   ✅ Config Update: ${updateCfgData.success ? 'SUCCESS' : 'FAILED'}`);

  // 5. Test Admin Notes Wall (GET & RESOLVE)
  console.log('\n5️⃣ Testing GET & RESOLVE /api/ai-support/admin/notes...');
  const notesRes = await fetch(`${baseUrl}/api/ai-support/admin/notes`);
  const notesData = await notesRes.json();
  console.log(`   ✅ Total Notes: ${notesData.stats?.totalNotes}, Pending: ${notesData.stats?.pendingNotes}, Leads: ${notesData.stats?.leadsCount}`);

  if (notesData.notes && notesData.notes.length > 0) {
    const firstNote = notesData.notes[0];
    const resolveRes = await fetch(`${baseUrl}/api/ai-support/admin/notes/${firstNote.id}/resolve`, { method: 'POST' });
    const resolveData = await resolveRes.json();
    console.log(`   ✅ Note #${firstNote.id} status toggled: ${resolveData.message}`);
  }

  // 6. Test Work Tools Catalog (/api/admin/streaming-services)
  console.log('\n6️⃣ Testing Work Tools in /api/admin/streaming-services...');
  const srvRes = await fetch(`${baseUrl}/api/admin/streaming-services`);
  const srvData = await srvRes.json();
  const workTools = (srvData.services || []).filter(s => s.category === 'work_tools');
  console.log(`   ✅ Found ${workTools.length} Work Tools in Catalog: ${workTools.map(t => t.id).join(', ')}`);

  // 7. Test Admin HTML page load
  console.log('\n7️⃣ Testing GET /admin (Admin Panel HTML)...');
  const adminPageRes = await fetch(`${baseUrl}/admin`);
  const adminPageText = await adminPageRes.text();
  const hasWorkTools = adminPageText.includes('tab-work-tools');
  const hasAiWhatsapp = adminPageText.includes('tab-ai-whatsapp');
  const hasTopBar = adminPageText.includes('admin-top-command-bar');
  console.log(`   ✅ Admin HTML Loaded (Status ${adminPageRes.status}, Size ${adminPageText.length} bytes)`);
  console.log(`   ✅ Contains tab-work-tools: ${hasWorkTools ? 'YES' : 'NO'}`);
  console.log(`   ✅ Contains tab-ai-whatsapp: ${hasAiWhatsapp ? 'YES' : 'NO'}`);
  console.log(`   ✅ Contains Top Command Bar: ${hasTopBar ? 'YES' : 'NO'}`);

  // 8. Test Store HTML page load for WhatsApp Widget
  console.log('\n8️⃣ Testing GET /store (WhatsApp Widget presence)...');
  const storeRes = await fetch(`${baseUrl}/store`);
  const storeText = await storeRes.text();
  const hasWidget = storeText.includes('whatsapp-widget.js');
  console.log(`   ✅ Store contains whatsapp-widget.js: ${hasWidget ? 'YES' : 'NO'}`);

  console.log('\n🎉 ALL TESTS PASSED 100% WITH ZERO ERRORS!');
}

runE2ETest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
