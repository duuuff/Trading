import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const FREE_LIMIT = 3;

router.get('/', requireAuth, (req: Request, res: Response): void => {
  const db = getDb();
  const subs = db.prepare(`
    SELECT s.id, s.created_at, a.symbol, a.name, a.type, a.currency
    FROM subscriptions s
    JOIN assets a ON a.id = s.asset_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `).all(req.user!.userId);
  res.json(subs);
});

router.post('/', requireAuth, (req: Request, res: Response): void => {
  const { symbol } = req.body;
  if (!symbol) {
    res.status(400).json({ error: 'symbol requis' });
    return;
  }

  const db = getDb();

  if (req.user!.plan === 'free') {
    const count = (db.prepare('SELECT COUNT(*) as c FROM subscriptions WHERE user_id = ?').get(req.user!.userId) as { c: number }).c;
    if (count >= FREE_LIMIT) {
      res.status(403).json({ error: `Limite de ${FREE_LIMIT} abonnements atteinte. Passez à Premium pour en ajouter plus.` });
      return;
    }
  }

  const asset = db.prepare('SELECT id FROM assets WHERE symbol = ?').get(symbol.toUpperCase()) as { id: number } | undefined;
  if (!asset) {
    res.status(404).json({ error: 'Actif non trouvé' });
    return;
  }

  try {
    db.prepare('INSERT INTO subscriptions (user_id, asset_id) VALUES (?, ?)').run(req.user!.userId, asset.id);
    res.status(201).json({ message: 'Abonnement créé' });
  } catch {
    res.status(409).json({ error: 'Déjà abonné à cet actif' });
  }
});

router.delete('/:symbol', requireAuth, (req: Request, res: Response): void => {
  const db = getDb();
  const asset = db.prepare('SELECT id FROM assets WHERE symbol = ?').get(req.params.symbol.toUpperCase()) as { id: number } | undefined;
  if (!asset) {
    res.status(404).json({ error: 'Actif non trouvé' });
    return;
  }

  const result = db.prepare('DELETE FROM subscriptions WHERE user_id = ? AND asset_id = ?').run(req.user!.userId, asset.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Abonnement non trouvé' });
    return;
  }
  res.json({ message: 'Désabonné' });
});

export default router;
