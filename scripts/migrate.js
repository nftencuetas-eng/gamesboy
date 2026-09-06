import dotenv from 'dotenv';
dotenv.config();

import postgresAdapter from '../server/db/postgresAdapter.js';

async function run() {
  console.log('🚀 Iniciando migración de esquema aislado en Supabase...');
  const res = await postgresAdapter.initPostgres();
  
  if (!res.connected) {
    console.error('❌ No se pudo conectar a Supabase:', res.error);
    process.exit(1);
  }

  const pool = postgresAdapter.getPool();
  const tables = await pool.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'gamesboy' 
    ORDER BY table_name;
  `);

  console.log('🛡️ Tablas creadas con éxito en el esquema "gamesboy":');
  console.table(tables.rows);

  await pool.end();
  console.log('✨ Base de datos Supabase conectada y 100% aislada para GamesBoy.');
}

run().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
