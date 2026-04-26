import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) {
    res.status(400).json({ error: 'Email et mot de passe requis (min. 8 caractères)' });
    return;
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    res.status(409).json({ error: 'Cet email est déjà utilisé' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)'
  ).run(email.toLowerCase().trim(), hash);

  const token = signToken({ userId: result.lastInsertRowid as number, email: email.toLowerCase().trim(), plan: 'free' });
  res.status(201).json({ token, plan: 'free' });
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT id, email, password_hash, plan FROM users WHERE email = ?').get(
    email.toLowerCase().trim()
  ) as { id: number; email: string; password_hash: string; plan: string } | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: 'Identifiants invalides' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, plan: user.plan as 'free' | 'premium' });
  res.json({ token, plan: user.plan });
});

export default router;
