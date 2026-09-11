import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  appName: process.env.APP_NAME || 'GamSplit',
  appDomain: process.env.APP_DOMAIN || 'gamsplit.com',
  appUrl: process.env.APP_URL || 'https://www.gamsplit.com',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  db: {
    type: (process.env.DB_TYPE || 'postgresql').toLowerCase(),
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'gamesboy_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'
  },
  
  jwtSecret: process.env.JWT_SECRET || 'gamesboy_default_secret_key',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '1056486263995-t692uq5j62i7esq32v3tmut0t151n9kd.apps.googleusercontent.com'
};

export default config;
