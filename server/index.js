import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';

import config from './config/env.js';
import { initDatabase } from './config/database.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import walletRouter from './routes/wallet.js';
import subscriptionsRouter from './routes/subscriptions.js';
import storeRouter from './routes/store.js';
import sellerRouter from './routes/seller.js';
import adminRouter from './routes/admin.js';
import bannersRouter from './routes/banners.js';
import smmRouter from './routes/smm.js';
import streamingHubsRouter from './routes/streamingHubs.js';
import saasRouter from './routes/saas.js';
import tenantResolver from './middleware/tenantResolver.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
  console.warn('⚠️ [Process] Handled uncaughtException:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.warn('⚠️ [Process] Handled unhandledRejection:', reason);
});

const app = express();
const server = http.createServer(app);

// Initialize WebSocket Server for Realtime notifications (approvals, new orders)
const wss = new WebSocketServer({ server, path: '/ws' });
app.set('wss', wss);

let onlineUsers = 0;

wss.on('connection', (ws) => {
  onlineUsers++;
  
  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    message: `Conectado a GamesBoy.net Marketplace Engine`,
    onlineUsers,
    serverTime: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.action === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    onlineUsers = Math.max(0, onlineUsers - 1);
  });
});

// Security & Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '35mb' })); // Support direct image file uploads and base64 screenshots
app.use(express.urlencoded({ extended: true, limit: '35mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Multi-Tenant Resolution Middleware (Applies tenant context to all incoming requests)
app.use(tenantResolver);

// Static Client Files
const clientPath = path.resolve(__dirname, '../client');
app.use(express.static(clientPath));

// Mount Modular API Routes
app.use('/health', healthRouter);
app.use('/api/tenant', saasRouter);
app.use('/api/saas', saasRouter);
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/store', storeRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/sellers', sellerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/smm', smmRouter);
app.use('/api/streaming-hubs', streamingHubsRouter);
app.use('/api/admin/streaming-hubs', streamingHubsRouter);
app.use('/api/admin/streaming-services', streamingHubsRouter);

// Clean Routes & Admin aliases
app.get('/', (req, res) => {
  // If on a specific tenant subdomain, custom domain, or tenant parameter -> render store
  const isCustomTenant = req.tenant && req.tenant.id !== 'tnt_gamesboy_main';
  const hasTenantQuery = req.query.tenant || req.query.t || req.query.store;
  if (isCustomTenant || hasTenantQuery) {
    return res.sendFile(path.join(clientPath, 'store.html'));
  }
  // Otherwise render SaaS Master Landing
  return res.sendFile(path.join(clientPath, 'index.html'));
});

app.get('/store', (req, res) => res.sendFile(path.join(clientPath, 'store.html')));
app.get('/store.html', (req, res) => res.sendFile(path.join(clientPath, 'store.html')));
app.get('/marketplace', (req, res) => res.sendFile(path.join(clientPath, 'store.html')));
app.get('/saas', (req, res) => res.sendFile(path.join(clientPath, 'index.html')));
app.get('/landing', (req, res) => res.sendFile(path.join(clientPath, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(clientPath, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(clientPath, 'admin.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(clientPath, 'admin.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(clientPath, 'admin-login.html')));
app.get('/admin-login', (req, res) => res.sendFile(path.join(clientPath, 'admin-login.html')));
app.get('/admin-login.html', (req, res) => res.sendFile(path.join(clientPath, 'admin-login.html')));
app.get('/admid', (req, res) => res.redirect('/admin'));
app.get('/admid/login', (req, res) => res.redirect('/admin/login'));
app.get('/profile', (req, res) => res.sendFile(path.join(clientPath, 'profile.html')));
app.get('/profile.html', (req, res) => res.sendFile(path.join(clientPath, 'profile.html')));
app.get('/service', (req, res) => res.sendFile(path.join(clientPath, 'service.html')));
app.get('/service.html', (req, res) => res.sendFile(path.join(clientPath, 'service.html')));
app.get('/seller', (req, res) => res.sendFile(path.join(clientPath, 'seller.html')));
app.get('/seller.html', (req, res) => res.sendFile(path.join(clientPath, 'seller.html')));
app.get('/purchases', (req, res) => res.sendFile(path.join(clientPath, 'purchases.html')));
app.get('/purchases.html', (req, res) => res.sendFile(path.join(clientPath, 'purchases.html')));
app.get('/monetizar', (req, res) => res.sendFile(path.join(clientPath, 'monetizar.html')));
app.get('/monetizar.html', (req, res) => res.sendFile(path.join(clientPath, 'monetizar.html')));
app.get('/generar-ingresos', (req, res) => res.sendFile(path.join(clientPath, 'monetizar.html')));

// Fallback for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  const isCustomTenant = req.tenant && req.tenant.id !== 'tnt_gamesboy_main';
  if (isCustomTenant) {
    return res.sendFile(path.join(clientPath, 'store.html'));
  }
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server & Initialize Database
async function startServer() {
  console.log('==============================================');
  console.log(`🚀 Starting GamesBoy.net Marketplace Core`);
  console.log(`🌐 Target Domain: ${config.appDomain}`);
  console.log(`📦 Environment:   ${config.nodeEnv}`);
  console.log('==============================================');

  await initDatabase();

  server.listen(config.port, config.host, () => {
    console.log(`✨ Server running at: http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`);
    console.log(`📡 WebSocket ready at: ws://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}/ws`);
    console.log('==============================================');
  });
}

process.on('SIGINT', () => {
  console.log('\n🛑 Gracefully shutting down GamesBoy server...');
  server.close(() => {
    console.log('👋 Server closed.');
    process.exit(0);
  });
});

startServer();
