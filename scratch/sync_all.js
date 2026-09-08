import fs from 'fs';
import path from 'path';
import postgresAdapter from '../server/db/postgresAdapter.js';

async function main() {
  await postgresAdapter.initPostgres();
  const pool = postgresAdapter.getPool();

  const snap = await pool.query(`SELECT data FROM gamesboy.gb_platform_storage WHERE key = 'marketplace_master_state'`);
  if (snap.rows.length === 0) {
    console.log('No snapshot found in Supabase');
    return;
  }

  const cloudData = snap.rows[0].data;
  const dataFile = path.resolve('data/marketplace_storage.json');
  fs.writeFileSync(dataFile, JSON.stringify(cloudData, null, 2), 'utf8');
  console.log('✅ Local data/marketplace_storage.json synchronized directly with Supabase!');
  console.log(`- Store products: ${(cloudData.store_products || []).length}`);
  console.log(`- Streaming services: ${(cloudData.streaming_services || []).length}`);
  console.log(`- Giftcard brands: ${(cloudData.giftcard_brands || []).length}`);
}

main().catch(console.error);
