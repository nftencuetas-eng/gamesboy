import postgresAdapter from '../server/db/postgresAdapter.js';

async function main() {
  const r = await postgresAdapter.initPostgres();
  console.log('Postgres connection status:', r);
  if (!r.connected) return;

  const pool = postgresAdapter.getPool();

  try {
    const snap = await pool.query(`SELECT key, length(data::text) as len, updated_at FROM gamesboy.gb_platform_storage`);
    console.log('--- gb_platform_storage ---');
    console.log(snap.rows);

    const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'gamesboy' ORDER BY table_name`);
    console.log('--- Tables in gamesboy schema ---');
    console.log(tables.rows.map(t => t.table_name));

    for (const t of tables.rows) {
      try {
        const c = await pool.query(`SELECT count(*) FROM gamesboy.${t.table_name}`);
        console.log(`Table ${t.table_name}: ${c.rows[0].count} rows`);
      } catch (e) {
        console.log(`Table ${t.table_name}: error ${e.message}`);
      }
    }
  } catch (err) {
    console.error('Error querying:', err);
  }
}

main().catch(console.error);
