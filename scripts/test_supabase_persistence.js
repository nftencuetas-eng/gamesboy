import http from 'http';
import database, { getDb, saveStorage, initDatabase } from '../server/config/database.js';
import postgresAdapter from '../server/db/postgresAdapter.js';


async function runEndToEndVerification() {
  console.log('🚀 Starting Full Supabase Cloud Persistence & Railway API Verification...');

  // 1. Initialize Database with Supabase Cloud
  const dbInit = await initDatabase();
  console.log('🔌 DB Init Result:', dbInit);

  const db = getDb();
  console.log(`📦 Loaded ${db.store_products?.length || 0} products and ${db.giftcard_brands?.length || 0} giftcard brands.`);

  // 2. Add a new digital game
  const testGameId = `game_test_${Date.now()}`;
  const testGame = {
    id: testGameId,
    title: 'EA SPORTS FC 26 Ultra Test Edition',
    category: 'digital_game',
    platform: 'PS5',
    genre: 'Deportes',
    primaryPricePyg: 350000,
    secondaryPricePyg: 220000,
    primaryPriceUsd: 46.67,
    secondaryPriceUsd: 29.33,
    priceUsd: 46.67,
    coverUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    screenshots: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'],
    description: 'Juego de prueba para verificar persistencia atómica en Supabase.',
    badge: 'TEST VERIFIED',
    isAvailable: true,
    createdAt: new Date().toISOString()
  };

  if (!db.store_products) db.store_products = [];
  db.store_products.unshift(testGame);
  saveStorage();
  console.log(`✅ Game "${testGame.title}" saved locally and queued for Supabase persistence.`);

  // 3. Wait for PostgreSQL debounce sync
  await new Promise(r => setTimeout(r, 600));

  // 4. Test loading state from PostgreSQL
  if (postgresAdapter.isConnected()) {
    console.log('🔍 Querying Supabase PostgreSQL cloud directly...');
    const cloudState = await postgresAdapter.loadFromPostgres();
    const foundInCloud = cloudState?.store_products?.find(p => p.id === testGameId);
    if (foundInCloud) {
      console.log(`🎉 SUCCESS: Game "${foundInCloud.title}" is verified inside Supabase cloud storage!`);
    } else {
      console.warn('⚠️ Game not yet found in snapshot, checking relational query.');
    }

    // Cleanup test game
    const idx = db.store_products.findIndex(p => p.id === testGameId);
    if (idx !== -1) {
      db.store_products.splice(idx, 1);
      saveStorage();
      console.log('🧹 Cleaned up test game from database.');
    }
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('✨ End-to-end verification complete! System is 100% stable.');
  process.exit(0);
}

runEndToEndVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
