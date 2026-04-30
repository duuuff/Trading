import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { fetchChart, fetchQuotes, fetchSparkline } from '../services/yahooFinance.js';

const router = Router();

// In-memory cache (60 seconds) for market data
let marketCache: { data: unknown; expiry: number } | null = null;

router.get('/', optionalAuth, (req: Request, res: Response): void => {
  const db = getDb();
  const { type, q } = req.query;

  let query = 'SELECT * FROM assets';
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (q) {
    conditions.push('(symbol LIKE ? OR name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY type, name';

  const assets = db.prepare(query).all(...params);
  res.json(assets);
});

router.get('/market', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  if (marketCache && marketCache.expiry > Date.now()) {
    res.json(marketCache.data);
    return;
  }
  try {
    const db = getDb();
    const assets = db.prepare('SELECT * FROM assets ORDER BY type, symbol').all() as {
      id: number; symbol: string; name: string; type: string; currency: string;
    }[];

    const symbols = assets.map(a => a.symbol);
    const [quotes, ...sparklines] = await Promise.all([
      fetchQuotes(symbols),
      ...symbols.map(s => fetchSparkline(s)),
    ]);

    const result = assets.map((asset, i) => {
      const q = quotes.get(asset.symbol.toUpperCase());
      return {
        ...asset,
        price: q?.regularMarketPrice ?? null,
        change: q?.regularMarketChange ?? null,
        changePercent: q?.regularMarketChangePercent ?? null,
        volume: q?.regularMarketVolume ?? null,
        sparkline: sparklines[i] ?? [],
      };
    });

    marketCache = { data: result, expiry: Date.now() + 60_000 };
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(502).json({ error: `Données marché indisponibles: ${message}` });
  }
});

router.get('/:symbol', optionalAuth, (req: Request, res: Response): void => {
  const db = getDb();
  const asset = db.prepare('SELECT * FROM assets WHERE symbol = ?').get(req.params.symbol.toUpperCase());
  if (!asset) {
    res.status(404).json({ error: 'Actif non trouvé' });
    return;
  }
  res.json(asset);
});

router.get('/:symbol/chart', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  const symbol = req.params.symbol;
  const period = (req.query.period as string) || '1y';

  try {
    const candles = await fetchChart(symbol, period);
    if (candles.length === 0) {
      res.status(404).json({ error: 'Données indisponibles pour cet actif' });
      return;
    }
    res.json({ symbol, candles });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(502).json({ error: `Impossible de récupérer les données: ${message}` });
  }
});

router.get('/:symbol/events', optionalAuth, (req: Request, res: Response): void => {
  const db = getDb();
  const asset = db.prepare('SELECT id FROM assets WHERE symbol = ?').get(req.params.symbol.toUpperCase()) as { id: number } | undefined;
  if (!asset) {
    res.status(404).json({ error: 'Actif non trouvé' });
    return;
  }
  const events = db.prepare(
    'SELECT * FROM events WHERE asset_id = ? ORDER BY date DESC'
  ).all(asset.id);
  res.json(events);
});

router.post('/:symbol/events', requireAuth, (req: Request, res: Response): void => {
  if (req.user?.plan !== 'premium') {
    res.status(403).json({ error: 'Fonctionnalité réservée aux abonnés Premium' });
    return;
  }

  const db = getDb();
  const asset = db.prepare('SELECT id FROM assets WHERE symbol = ?').get(req.params.symbol.toUpperCase()) as { id: number } | undefined;
  if (!asset) {
    res.status(404).json({ error: 'Actif non trouvé' });
    return;
  }

  const { date, title, description, impact, source_url } = req.body as {
    date?: string;
    title?: string;
    description?: string;
    impact?: string;
    source_url?: string;
  };

  if (!date || !title || !description) {
    res.status(400).json({ error: 'date, title et description sont requis' });
    return;
  }
  if (!['bullish', 'bearish', 'neutral'].includes(impact ?? '')) {
    res.status(400).json({ error: 'impact doit être bullish, bearish ou neutral' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO events (asset_id, date, title, description, impact, source_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(asset.id, date, title, description, impact ?? 'neutral', source_url ?? null, req.user!.userId);

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(event);
});

export default router;
