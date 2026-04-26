import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { getDb } from './db/database.js';
import authRouter from './routes/auth.js';
import assetsRouter from './routes/assets.js';
import subscriptionsRouter from './routes/subscriptions.js';
import newsRouter from './routes/news.js';
import accountRouter from './routes/account.js';

const PORT = process.env.PORT || 3001;

// Ensure data directory exists
fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });

// Initialize DB
getDb();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/news', newsRouter);
app.use('/api/account', accountRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});
