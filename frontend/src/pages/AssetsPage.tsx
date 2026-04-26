import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Asset, Subscription } from '../types';

type FilterType = 'all' | 'stock' | 'etf' | 'index' | 'crypto';

const typeLabel: Record<FilterType, string> = {
  all: 'Tous',
  stock: 'Actions',
  etf: 'ETF',
  index: 'Indices',
  crypto: 'Crypto',
};

const typeBadge = (type: string) => {
  const c: Record<string, string> = {
    stock: 'bg-primary/10 text-primary border-primary/20',
    etf: 'bg-warning/10 text-warning border-warning/20',
    index: 'bg-success/10 text-success border-success/20',
    crypto: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return c[type] ?? c.stock;
};

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.assets.list(), api.subscriptions.list()])
      .then(([a, s]) => {
        setAssets(a);
        setSubs(new Set(s.map((sub: Subscription) => sub.symbol)));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter((a) => {
    const matchType = filter === 'all' || a.type === filter;
    const matchQuery = !query || a.symbol.toLowerCase().includes(query.toLowerCase()) || a.name.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const toggle = async (symbol: string) => {
    setToggling(symbol);
    try {
      if (subs.has(symbol)) {
        await api.subscriptions.remove(symbol);
        setSubs((prev) => { const n = new Set(prev); n.delete(symbol); return n; });
      } else {
        await api.subscriptions.add(symbol);
        setSubs((prev) => new Set(prev).add(symbol));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Actifs</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          {user?.plan === 'free' ? `${subs.size}/3 suivis (Free)` : `${subs.size} suivis (Premium)`}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          className="input pl-9"
          placeholder="Rechercher (symbole, nom…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {(Object.keys(typeLabel) as FilterType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === t ? 'bg-primary text-white' : 'bg-surface text-text-muted border border-border hover:text-text-primary'
            }`}
          >
            {typeLabel[t]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="card p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((asset) => {
            const subscribed = subs.has(asset.symbol);
            return (
              <div key={asset.id} className="card p-4 flex items-center gap-3">
                <Link to={`/chart/${encodeURIComponent(asset.symbol)}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm font-mono">{asset.symbol}</span>
                    <span className={`badge border text-[10px] ${typeBadge(asset.type)}`}>{asset.type}</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{asset.name}</p>
                </Link>
                <button
                  onClick={() => toggle(asset.symbol)}
                  disabled={toggling === asset.symbol}
                  className={subscribed ? 'btn-ghost text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}
                >
                  {toggling === asset.symbol ? '…' : subscribed ? 'Suivi' : 'Suivre'}
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-text-muted text-sm py-8">Aucun résultat</p>
          )}
        </div>
      )}
    </div>
  );
}
