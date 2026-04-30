import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { fetchNews } from '../services/yahooFinance.js';

const router = Router();

const PERIOD_CONFIG = {
  day:   { count: 5,  cacheTtlH: 1,  windowH: 24  },
  week:  { count: 15, cacheTtlH: 3,  windowH: 168 },
  month: { count: 30, cacheTtlH: 6,  windowH: 720 },
} as const;
type Period = keyof typeof PERIOD_CONFIG;

router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const period: Period = (req.query.period as Period) in PERIOD_CONFIG
    ? (req.query.period as Period)
    : 'day';
  const { count, cacheTtlH, windowH } = PERIOD_CONFIG[period];

  const db = getDb();

  const subs = db.prepare(`
    SELECT a.symbol, a.id as asset_id
    FROM subscriptions s
    JOIN assets a ON a.id = s.asset_id
    WHERE s.user_id = ?
  `).all(req.user!.userId) as { symbol: string; asset_id: number }[];

  if (subs.length === 0) { res.json([]); return; }

  interface NewsRow {
    asset_symbol: string;
    title: string;
    summary: string | null;
    url: string;
    published_at: string;
    sentiment: string;
  }

  const allNews: NewsRow[] = [];
  const windowCutoff = new Date(Date.now() - windowH * 3_600_000).toISOString();

  for (const sub of subs) {
    try {
      const cached = db.prepare(`
        SELECT title, summary, url, published_at, sentiment, ? as asset_symbol
        FROM news_cache
        WHERE asset_id = ? AND fetched_at > datetime('now', '-${cacheTtlH} hour')
          AND published_at >= ?
        ORDER BY published_at DESC
        LIMIT ?
      `).all(sub.symbol, sub.asset_id, windowCutoff, count) as NewsRow[];

      if (cached.length > 0) {
        allNews.push(...cached);
        continue;
      }

      const articles = await fetchNews(sub.symbol, count);

      db.prepare('DELETE FROM news_cache WHERE asset_id = ?').run(sub.asset_id);

      for (const article of articles) {
        const publishedAt = new Date(article.providerPublishTime * 1000).toISOString();
        db.prepare(`
          INSERT INTO news_cache (asset_id, title, summary, url, published_at, sentiment)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(sub.asset_id, article.title, null, article.link ?? '', publishedAt, 'neutral');

        if (publishedAt >= windowCutoff) {
          allNews.push({
            asset_symbol: sub.symbol,
            title: article.title,
            summary: null,
            url: article.link ?? '',
            published_at: publishedAt,
            sentiment: 'neutral',
          });
        }
      }
    } catch { /* skip asset on error */ }
  }

  allNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  res.json(allNews);
});

export default router;
