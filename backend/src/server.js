import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/index.js';
import { checkAndSeedDatabase } from './services/seedService.js';

// Setup custom DNS fallback for MongoDB Atlas SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS is not permitted
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/surpluslink';

// Middlewares
app.use(cors());
app.use(express.json());

// Serverless Cached Database Connection
let isConnected = false;
async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  try {
    console.log(`[SurplusLink] Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('[SurplusLink] Connected to MongoDB Atlas successfully.');

    // Seed initial data if state is empty
    await checkAndSeedDatabase();
  } catch (error) {
    console.error('[SurplusLink] Database connection notice:', error.message);
  }
}

// Connect DB on incoming requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SurplusLink API is running',
    health: '/api/health',
    donations: '/api/donations',
    clock: '/api/clock',
    dashboard: '/api/dashboard'
  });
});

// Only listen locally if not running as a Vercel serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[SurplusLink] Server listening on http://localhost:${PORT}`);
  });
  connectDB();
}

export default app;
