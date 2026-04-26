import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, (req: Request, res: Response): void => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, plan, created_at FROM users WHERE id = ?').get(req.user!.userId) as {
    id: number;
    email: string;
    plan: string;
    created_at: string;
  } | undefined;

  if (!user) {
    res.status(404).json({ error: 'Utilisateur non trouvé' });
    return;
  }

  const subCount = (db.prepare('SELECT COUNT(*) as c FROM subscriptions WHERE user_id = ?').get(user.id) as { c: number }).c;

  res.json({ ...user, subscription_count: subCount });
});

// Simulate upgrade (in production, this would go through Stripe)
router.post('/upgrade', requireAuth, (req: Request, res: Response): void => {
  const db = getDb();
  db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('premium', req.user!.userId);

  const user = db.prepare('SELECT id, email, plan FROM users WHERE id = ?').get(req.user!.userId) as {
    id: number;
    email: string;
    plan: 'premium';
  };

  const token = signToken({ userId: user.id, email: user.email, plan: user.plan });
  res.json({ token, plan: user.plan, message: 'Bienvenue dans MarketLens Premium !' });
});

export default router;
