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
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '15mb' })); // Support base64 receipt uploads
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Static Client Files
const clientPath = path.resolve(__dirname, '../client');
app.use(express.static(clientPath));

// Mount Modular API Routes
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/store', storeRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/banners', bannersRouter);

// Clean Routes without .html extension
app.get('/login', (req, res) => res.sendFile(path.join(clientPath, 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(clientPath, 'admin.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(clientPath, 'admin-login.html')));
app.get('/admin-login', (req, res) => res.sendFile(path.join(clientPath, 'admin-login.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(clientPath, 'profile.html')));
app.get('/profile.html', (req, res) => res.sendFile(path.join(clientPath, 'profile.html')));

// Fallback for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
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
