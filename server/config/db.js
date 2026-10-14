import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let isConnected = false;

// Initialize PostgreSQL connection pool
export function initDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('⚠️ [Database] No DATABASE_URL provided. Running in standalone memory/fallback mode.');
    return null;
  }

  try {
    const isSsl = process.env.DB_SSL === 'true' || connectionString.includes('sslmode=require');
    pool = new Pool({
      connectionString,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('❌ [Database Pool Error]:', err.message);
    });

    return pool;
  } catch (err) {
    console.error('❌ [Database] Failed to initialize connection pool:', err.message);
    return null;
  }
}

// Test connection and auto-run DDL schema if needed
export async function testConnectionAndMigrate() {
  if (!pool) return false;

  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as now, current_database() as db');
      console.log(`✅ [Database] Connected successfully to "${res.rows[0].db}" at ${res.rows[0].now}`);
      isConnected = true;

      // Check if gb_users exists; if not, execute schema
      const checkTable = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'gb_users'
        );
      `);

      if (!checkTable.rows[0].exists) {
        console.log('🔄 [Database] Running initial schema migration...');
        const schemaPath = path.resolve(__dirname, '..', 'db', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await client.query(sql);
          console.log('✅ [Database] Initial schema executed successfully!');
        }
      }

      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn(`⚠️ [Database] Connection warning: ${err.message}. Operating in fallback mode.`);
    isConnected = false;
    return false;
  }
}

export function getPool() {
  return pool;
}

export function isDbConnected() {
  return isConnected;
}

// Helper query function with error logging
export async function query(text, params) {
  if (!pool) {
    throw new Error('Database pool not initialized. Standalone mode active.');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.slice(0, 100), duration, rows: res.rowCount });
  }
  return res;
}
