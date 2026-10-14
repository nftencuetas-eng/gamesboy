import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDb, testConnectionAndMigrate, isDbConnected } from './config/db.js';
import { ensureDefaultAdmin } from './services/auth.service.js';

import authRoutes from './routes/auth.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve(__dirname, '..', 'client');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Security Headers & CORS
app.use(helmet({
  contentSecurityPolicy: false, // Allows inline fonts/styles for maximum UI flexibility
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'GamesBoy.net Core Engine v2.0',
    database_connected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes); // Provides /api/categories and /api/products
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// Static Client Files
app.use(express.static(clientDir));

// Clean Navigation Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(clientDir, 'admin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(clientDir, 'login.html'));
});

// Fallback for Single Page App / Marketplace
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ [Server Error]:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor.' : err.message
  });
});

// Server Initialization
async function startServer() {
  console.log('🚀 Initializing GamesBoy.net Platform Engine...');

  // Database setup
  initDb();
  await testConnectionAndMigrate();
  await ensureDefaultAdmin();

  const server = app.listen(PORT, HOST, () => {
    console.log(`🎮 [GamesBoy Engine] Listening on http://${HOST}:${PORT}`);
    console.log(`⚡ [Environment] ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛡️ [Admin Panel] Accessible at http://${HOST}:${PORT}/admin`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('🛑 Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
