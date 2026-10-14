import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Non-destructive PostgreSQL Connection Tester
 * Security rule: NEVER prints passwords, secret tokens, or full connection URIs.
 */
async function testConnection() {
  console.log('====================================================');
  console.log('🔍 GamesBoy.net — Diagnóstico de Conexión PostgreSQL');
  console.log('====================================================');

  const dbUrl = process.env.DATABASE_URL;
  const parsedUrl = dbUrl ? new URL(dbUrl) : null;
  const host = process.env.DB_HOST || (parsedUrl ? parsedUrl.hostname : 'N/A');
  const port = process.env.DB_PORT || (parsedUrl ? parsedUrl.port : '5432');
  const database = process.env.DB_NAME || (parsedUrl ? parsedUrl.pathname.replace('/', '') : 'N/A');
  const user = process.env.DB_USER || (parsedUrl ? parsedUrl.username : 'N/A');
  const ssl = process.env.DB_SSL !== 'false';

  console.log('📋 Parámetros de Conexión (Sin Secretos):');
  console.log(`   • Host / Pooler : ${host}:${port}`);
  console.log(`   • Base de Datos : ${database}`);
  console.log(`   • Usuario DB    : ${user}`);
  console.log(`   • SSL Requerido : ${ssl ? 'Sí (rejectUnauthorized: false)' : 'No'}`);
  console.log('----------------------------------------------------');

  if (!dbUrl && !process.env.DB_HOST) {
    console.error('❌ Error: Ni DATABASE_URL ni DB_HOST están configurados en el entorno.');
    process.exit(1);
  }

  let pool = new Pool({
    connectionString: dbUrl || undefined,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 7000
  });

  try {
    const startTime = Date.now();
    const client = await pool.connect();
    const elapsed = Date.now() - startTime;

    const res = await client.query(`
      SELECT 
        1 AS alive, 
        current_database() AS db_name, 
        current_user AS db_user, 
        current_schema() AS active_schema,
        version() AS pg_version
    `);
    client.release();

    console.log('✅ ¡CONEXIÓN EXITOSA CON SUPABASE / POSTGRESQL!');
    console.log(`   • Latencia de Conexión : ${elapsed} ms`);
    console.log(`   • Base de Datos Activa : ${res.rows[0].db_name}`);
    console.log(`   • Usuario Confirmado   : ${res.rows[0].db_user}`);
    console.log(`   • Esquema por Defecto  : ${res.rows[0].active_schema}`);
    console.log('====================================================');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ FALLÓ LA CONEXIÓN A POSTGRESQL:');
    console.error(`   • Código de Error PG : ${err.code || 'SIN_CODIGO'}`);
    console.error(`   • Mensaje Técnico    : ${err.message}`);
    console.log('----------------------------------------------------');
    if (err.code === '28P01') {
      console.log('💡 DIAGNÓSTICO: Error 28P01 (password authentication failed).');
      console.log('   La contraseña configurada en DATABASE_URL / DB_PASSWORD es incorrecta o fue restablecida en Supabase.');
      console.log('   Acción requerida: Restablecer la contraseña en Supabase Dashboard y actualizar DATABASE_URL.');
    } else if (err.message && err.message.includes('timeout')) {
      console.log('💡 DIAGNÓSTICO: Tiempo de espera agotado al conectar al puerto 6543 (Pooler).');
      console.log('   Probando conexión directa al puerto estándar 5432...');
      
      const directHost = host.includes('pooler.supabase.com') ? `db.${user.replace('postgres.', '')}.supabase.co` : host;
      const directPool = new Pool({
        host: directHost,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });
      try {
        const directClient = await directPool.connect();
        console.log(`✅ ¡Conexión directa a ${directHost}:5432 EXITOSA!`);
        directClient.release();
        await directPool.end();
        process.exit(0);
      } catch (directErr) {
        console.log(`   • Resultado puerto 5432 (${directHost}): ${directErr.code || 'ERROR'} - ${directErr.message}`);
        if (directErr.code === '28P01') {
          console.log('   🎯 Servidor Supabase alcanzado en puerto 5432. Autenticación rechazada por contraseña incorrecta.');
        }
        await directPool.end();
      }
    }
    console.log('====================================================');
    await pool.end();
    process.exit(1);
  }
}

testConnection();
