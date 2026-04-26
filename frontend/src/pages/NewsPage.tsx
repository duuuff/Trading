import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { NewsItem } from '../types';

const sentimentClass = {
  bullish: 'text-success',
  bearish: 'text-danger',
  neutral: 'text-text-muted',
};
const sentimentIcon = { bullish: '↑', bearish: '↓', neutral: '—' };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'À l\'instant';
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d}j`;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await api.news.list();
      setNews(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  if (loading) {
    return (
      <div className="px-4 py-5 space-y-3 animate-pulse">
        <div className="h-6 bg-card rounded w-32" />
        {[1,2,3,4].map((i) => <div key={i} className="card p-4 h-20" />)}
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Actualités</h2>
          <p className="text-sm text-text-secondary mt-0.5">Vos actifs suivis</p>
        </div>
        <button
          onClick={() => fetchNews(true)}
          disabled={refreshing}
          className="btn-ghost text-xs px-3 py-2"
        >
          {refreshing ? '…' : 'Actualiser'}
        </button>
      </div>

      {error && (
        <div className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl p-3">
          {error}
        </div>
      )}

      {!error && news.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-secondary text-sm">Aucune actualité disponible.</p>
          <p className="text-text-muted text-xs mt-1">Abonnez-vous à des actifs pour recevoir des news.</p>
          <Link to="/assets" className="btn-primary mt-4 inline-flex">Explorer les actifs</Link>
        </div>
      )}

      <div className="space-y-2">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 block hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-semibold text-text-muted bg-surface px-1.5 py-0.5 rounded">
                    {item.asset_symbol}
                  </span>
                  <span className={`text-xs font-medium ${sentimentClass[item.sentiment]}`}>
                    {sentimentIcon[item.sentiment]}
                  </span>
                  <span className="text-xs text-text-muted ml-auto">{timeAgo(item.published_at)}</span>
                </div>
                <p className="text-sm text-text-primary leading-snug line-clamp-3">{item.title}</p>
                {item.summary && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.summary}</p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
