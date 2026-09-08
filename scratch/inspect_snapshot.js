import postgresAdapter from '../server/db/postgresAdapter.js';

async function main() {
  await postgresAdapter.initPostgres();
  const pool = postgresAdapter.getPool();

  const snap = await pool.query(`SELECT data FROM gamesboy.gb_platform_storage WHERE key = 'marketplace_master_state'`);
  if (snap.rows.length === 0) {
    console.log('No snapshot found');
    return;
  }

  const data = snap.rows[0].data;
  console.log('Master state keys:', Object.keys(data));
  console.log('store_products count in master_state:', (data.store_products || []).length);
  console.log('streaming_services count in master_state:', (data.streaming_services || []).length);
  console.log('giftcard_brands count in master_state:', (data.giftcard_brands || []).length);
  console.log('subscriptions count in master_state:', (data.subscriptions || []).length);
  console.log('hero_banners count in master_state:', (data.hero_banners || []).length);

  if (data.store_products && data.store_products.length > 0) {
    console.log('First 3 store products:', data.store_products.slice(0, 3).map(p => ({ id: p.id, title: p.title, coverImage: p.coverImage?.substring(0, 30) })));
  }

  if (data.streaming_services && data.streaming_services.length > 0) {
    console.log('First 3 streaming services:', data.streaming_services.slice(0, 3).map(s => ({ id: s.id, name: s.name, iconUrl: s.iconUrl?.substring(0, 30) })));
  }

  if (data.giftcard_brands && data.giftcard_brands.length > 0) {
    console.log('First 3 giftcard brands:', data.giftcard_brands.slice(0, 3).map(b => ({ id: b.id, name: b.name, variationsCount: (b.variations || []).length })));
  }
}

main().catch(console.error);
