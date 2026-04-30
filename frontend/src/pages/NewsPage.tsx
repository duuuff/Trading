import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { SkeletonNewsCard } from '../components/Skeleton';
import type { NewsItem, NewsPeriod } from '../types';

const PERIODS: { key: NewsPeriod; label: string }[] = [
  { key: 'day', label: "Aujourd'hui" },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
];

const SENTIMENT_CONFIG = {
  bullish: { label: 'Positif', color: 'text-success', bg: 'bg-success/10 border-success/20' },
  bearish: { label: 'Négatif', color: 'text-danger', bg: 'bg-danger/10 border-danger/20' },
  neutral: { label: 'Neutre', color: 'text-text-muted', bg: 'bg-surface border-border' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `Il y a ${d}j`;
}

function formatDay(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupByDay(items: NewsItem[]): [string, NewsItem[]][] {
  const map: Record<string, NewsItem[]> = {};
  for (const item of items) {
    const day = item.published_at.slice(0, 10);
    if (!map[day]) map[day] = [];
    map[day].push(item);
  }
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

function groupByAsset(items: NewsItem[]): [string, NewsItem[]][] {
  const map: Record<string, NewsItem[]> = {};
  for (const item of items) {
    if (!map[item.asset_symbol]) map[item.asset_symbol] = [];
    map[item.asset_symbol].push(item);
  }
  return Object.entries(map).sort(([, a], [, b]) => b.length - a.length);
}

function NewsCard({ item }: { item: NewsItem }) {
  const sentiment = SENTIMENT_CONFIG[item.sentiment as keyof typeof SENTIMENT_CONFIG] ?? SENTIMENT_CONFIG.neutral;
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-4 block active:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono font-semibold text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
          {item.asset_symbol}
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sentiment.bg} ${sentiment.color}`}>
          {sentiment.label}
        </span>
        <span className="text-[10px] text-text-muted ml-auto">{timeAgo(item.published_at)}</span>
      </div>
      <p className="text-sm text-text-primary leading-snug">{item.title}</p>
      {item.summary && (
        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">{item.summary}</p>
      )}
      <p className="text-xs text-primary mt-2.5 flex items-center gap-1 font-medium">
        Lire l'article
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </p>
    </a>
  );
}

function DayView({ news }: { news: NewsItem[] }) {
  return (
    <div className="space-y-2">
      {news.map((item, i) => <NewsCard key={i} item={item} />)}
    </div>
  );
}

function WeekView({ news }: { news: NewsItem[] }) {
  const groups = groupByDay(news);
  return (
    <div className="space-y-5">
      {groups.map(([day, items]) => (
        <div key={day}>
          <div className="flex items-center gap-2 mb-2.5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider capitalize">
              {formatDay(day)}
            </h3>
            <span className="text-[10px] bg-surface border border-border rounded-full px-2 py-0.5 text-text-muted">
              {items.length}
            </span>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => <NewsCard key={i} item={item} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthView({ news }: { news: NewsItem[] }) {
  const groups = groupByAsset(news);
  return (
    <div className="space-y-3">
      {groups.map(([symbol, items]) => {
        const [first, ...rest] = items;
        const sentiment = SENTIMENT_CONFIG[first.sentiment as keyof typeof SENTIMENT_CONFIG] ?? SENTIMENT_CONFIG.neutral;
        return (
          <div key={symbol} className="card overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-text-primary">{symbol}</span>
                  <span className="text-[10px] bg-surface border border-border rounded-full px-2 py-0.5 text-text-muted">
                    {items.length} article{items.length > 1 ? 's' : ''}
                  </span>
                </div>
                <Link to={`/chart/${symbol}`} className="text-[10px] text-primary font-medium flex items-center gap-1">
                  Voir graphique
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <a href={first.url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-surface/50 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sentiment.bg} ${sentiment.color}`}>
                  {sentiment.label}
                </span>
                <span className="text-[10px] text-text-muted ml-auto">{timeAgo(first.published_at)}</span>
              </div>
              <p className="text-sm font-medium text-text-primary leading-snug">{first.title}</p>
              {first.summary && (
                <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">{first.summary}</p>
              )}
            </a>
            {rest.length > 0 && (
              <details className="group border-t border-border/50">
                <summary className="px-4 py-2.5 text-xs text-text-muted cursor-pointer hover:text-text-secondary transition-colors list-none flex items-center gap-1.5">
                  <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {rest.length} article{rest.length > 1 ? 's' : ''} de plus
                </summary>
                <div className="divide-y divide-border/30">
                  {rest.map((item, i) => {
                    const s = SENTIMENT_CONFIG[item.sentiment as keyof typeof SENTIMENT_CONFIG] ?? SENTIMENT_CONFIG.neutral;
                    return (
                      <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 hover:bg-surface/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${s.bg} ${s.color}`}>{s.label}</span>
                          <span className="text-[10px] text-text-muted ml-auto">{timeAgo(item.published_at)}</span>
                        </div>
                        <p className="text-xs text-text-primary leading-snug">{item.title}</p>
                      </a>
                    );
                  })}
                </div>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EmptyNewsState() {
  return (
    <div className="card p-8 text-center border-dashed">
      <div className="flex justify-center mb-4">
        <svg width="72" height="56" viewBox="0 0 72 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="4" width="44" height="48" rx="4" fill="#1a1a24" stroke="#2a2a3a" strokeWidth="1.5"/>
          <rect x="16" y="14" width="28" height="2.5" rx="1.25" fill="#2a2a3a"/>
          <rect x="16" y="20" width="20" height="2.5" rx="1.25" fill="#2a2a3a"/>
          <rect x="16" y="30" width="28" height="2" rx="1" fill="#2a2a3a"/>
          <rect x="16" y="35" width="22" height="2" rx="1" fill="#2a2a3a"/>
          <rect x="16" y="40" width="16" height="2" rx="1" fill="#2a2a3a"/>
          <circle cx="54" cy="38" r="13" fill="#111118" stroke="#2a2a3a" strokeWidth="1.5"/>
          <circle cx="54" cy="38" r="8" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.5"/>
          <line x1="60" y1="44" x2="65" y2="50" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5"/>
          <text x="54" y="42" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="600" opacity="0.7">?</text>
        </svg>
      </div>
      <p className="text-sm font-medium text-text-primary">Aucune actualité pour le moment</p>
      <p className="text-xs text-text-muted mt-1.5 leading-relaxed max-w-xs mx-auto">
        Suivez des actifs boursiers pour recevoir ici leurs dernières actualités et décider s'ils méritent votre attention.
      </p>
      <Link to="/assets" className="btn-primary text-sm mt-4 inline-flex">
        Choisir des actifs à suivre
      </Link>
    </div>
  );
}

export default function NewsPage() {
  const [period, setPeriod] = useState<NewsPeriod>('day');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async (p: NewsPeriod, showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.news.list(p);
      setNews(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNews(period); }, [period, fetchNews]);

  if (loading) {
    return (
      <div className="px-4 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-28 bg-border/60 rounded animate-pulse" />
            <div className="h-3.5 w-40 bg-border/60 rounded animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-border/60 rounded-xl animate-pulse" />
        </div>
        <div className="h-10 bg-border/60 rounded-xl animate-pulse" />
        {[1, 2, 3, 4].map((i) => <SkeletonNewsCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Actualités</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {news.length > 0 ? `${news.length} articles · vos actifs` : 'Vos actifs suivis'}
          </p>
        </div>
        <button
          onClick={() => fetchNews(period, true)}
          disabled={refreshing}
          className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"
        >
          <svg
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      <div className="flex gap-1 bg-surface rounded-xl p-1">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              period === key ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl p-3">
          {error}
        </div>
      )}

      {!error && news.length === 0 && <EmptyNewsState />}

      {news.length > 0 && (
        period === 'day' ? <DayView news={news} /> :
        period === 'week' ? <WeekView news={news} /> :
        <MonthView news={news} />
      )}
    </div>
  );
}
