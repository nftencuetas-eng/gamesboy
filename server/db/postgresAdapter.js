import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let isConnected = false;

export async function initPostgres() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('ℹ️ [PostgreSQL] No DATABASE_URL provided. Using resilient local JSON store.');
    return { connected: false, reason: 'NO_DATABASE_URL' };
  }

  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    });

    pool.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Pool] Idle client connection drop caught (auto-handled):', err.message);
    });

    // Test connection
    const client = await pool.connect();
    client.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Client] Handled client connection reset:', err.message);
    });
    console.log('🔌 [PostgreSQL / Supabase] Connected successfully to isolated GamesBoy cluster.');

    // Execute schema migration
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(sql);
      console.log('🛡️ [PostgreSQL] Isolated schema "gamesboy" and "gb_*" tables verified & ready.');
    }

    client.release();
    isConnected = true;
    return { connected: true, pool };
  } catch (error) {
    console.error('❌ [PostgreSQL / Supabase] Connection error:', error.message);
    console.warn('⚠️ Falling back to local storage engine.');
    isConnected = false;
    return { connected: false, error: error.message };
  }
}

export function getPool() {
  return pool;
}

export function isPgConnected() {
  return isConnected && pool !== null;
}

export function isConnectedFunc() {
  return isConnected && pool !== null;
}

export async function query(text, params) {
  if (!isConnected || !pool) {
    throw new Error('PostgreSQL is not connected');
  }
  return pool.query(text, params);
}

export default {
  initPostgres,
  getPool,
  isPgConnected,
  isConnected: isConnectedFunc,
  query
};

