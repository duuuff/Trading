import { Router, Request, Response } from 'express';
import { getDb } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { fetchNews } from '../services/yahooFinance.js';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const db = getDb();

  const subs = db.prepare(`
    SELECT a.symbol, a.id as asset_id
    FROM subscriptions s
    JOIN assets a ON a.id = s.asset_id
    WHERE s.user_id = ?
  `).all(req.user!.userId) as { symbol: string; asset_id: number }[];

  if (subs.length === 0) {
    res.json([]);
    return;
  }

  interface NewsRow {
    asset_symbol: string;
    title: string;
    summary: string | null;
    url: string;
    published_at: string;
    sentiment: string;
  }

  const allNews: NewsRow[] = [];

  for (const sub of subs) {
    try {
      const cached = db.prepare(`
        SELECT title, summary, url, published_at, sentiment, ? as asset_symbol
        FROM news_cache
        WHERE asset_id = ? AND fetched_at > datetime('now', '-1 hour')
        ORDER BY published_at DESC
        LIMIT 5
      `).all(sub.symbol, sub.asset_id) as NewsRow[];

      if (cached.length > 0) {
        allNews.push(...cached);
        continue;
      }

      const articles = await fetchNews(sub.symbol);

      db.prepare('DELETE FROM news_cache WHERE asset_id = ?').run(sub.asset_id);

      for (const article of articles) {
        const sentiment = 'neutral';
        const publishedAt = new Date(article.providerPublishTime * 1000).toISOString();
        db.prepare(`
          INSERT INTO news_cache (asset_id, title, summary, url, published_at, sentiment)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(sub.asset_id, article.title, null, article.link ?? '', publishedAt, sentiment);

        allNews.push({
          asset_symbol: sub.symbol,
          title: article.title,
          summary: null,
          url: article.link ?? '',
          published_at: publishedAt,
          sentiment,
        });
      }
    } catch {
      // skip asset on error
    }
  }

  allNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  res.json(allNews);
});

export default router;
