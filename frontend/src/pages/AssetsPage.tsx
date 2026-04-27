import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { SkeletonAssetRow } from '../components/Skeleton';
import type { Asset, Subscription } from '../types';

type FilterType = 'all' | 'stock' | 'etf' | 'index' | 'crypto';

const TYPE_LABEL: Record<FilterType, string> = {
  all: 'Tous',
  stock: 'Actions',
  etf: 'ETF',
  index: 'Indices',
  crypto: 'Crypto',
};

const TYPE_BADGE: Record<string, string> = {
  stock: 'bg-primary/10 text-primary border-primary/20',
  etf: 'bg-warning/10 text-warning border-warning/20',
  index: 'bg-success/10 text-success border-success/20',
  crypto: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  // tracks which symbol just changed state for the flash animation
  const [flashSymbol, setFlashSymbol] = useState<{ symbol: string; type: 'add' | 'remove' } | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    Promise.all([api.assets.list(), api.subscriptions.list()])
      .then(([a, s]) => {
        setAssets(a);
        setSubs(new Set(s.map((sub: Subscription) => sub.symbol)));
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filtered = assets.filter((a) => {
    const matchType = filter === 'all' || a.type === filter;
    const matchQuery =
      !query ||
      a.symbol.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const toggle = async (symbol: string) => {
    setToggling(symbol);
    const wasSubscribed = subs.has(symbol);
    try {
      if (wasSubscribed) {
        await api.subscriptions.remove(symbol);
        setSubs((prev) => { const n = new Set(prev); n.delete(symbol); return n; });
        setFlashSymbol({ symbol, type: 'remove' });
      } else {
        await api.subscriptions.add(symbol);
        setSubs((prev) => new Set(prev).add(symbol));
        setFlashSymbol({ symbol, type: 'add' });
      }
      setTimeout(() => setFlashSymbol(null), 500);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-danger text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg">
          {toastMsg}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold">Actifs</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          {user?.plan === 'free'
            ? `${subs.size}/3 suivis — passez à Premium pour en ajouter plus`
            : `${subs.size} actifs suivis`}
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
          placeholder="Rechercher (ex: AAPL, Apple…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {(Object.keys(TYPE_LABEL) as FilterType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === t
                ? 'bg-primary text-white'
                : 'bg-surface text-text-muted border border-border hover:text-text-primary'
            }`}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonAssetRow key={i} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((asset) => {
            const subscribed = subs.has(asset.symbol);
            const isToggling = toggling === asset.symbol;
            const isFlashing = flashSymbol?.symbol === asset.symbol;
            const flashClass = isFlashing
              ? flashSymbol?.type === 'add'
                ? 'animate-flash-success'
                : 'animate-flash-remove'
              : '';

            return (
              <div key={asset.id} className="card p-4 flex items-center gap-3">
                <Link to={`/chart/${encodeURIComponent(asset.symbol)}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm font-mono">{asset.symbol}</span>
                    <span className={`badge border text-[10px] ${TYPE_BADGE[asset.type] ?? TYPE_BADGE.stock}`}>
                      {asset.type}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{asset.name}</p>
                </Link>
                <button
                  onClick={() => toggle(asset.symbol)}
                  disabled={isToggling}
                  aria-label={subscribed ? `Retirer ${asset.symbol}` : `Suivre ${asset.symbol}`}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${flashClass} ${
                    subscribed
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {isToggling ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : subscribed ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Suivi
                    </>
                  ) : (
                    '+ Suivre'
                  )}
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="card p-8 text-center border-dashed">
              <p className="text-text-muted text-sm">Aucun résultat pour « {query} »</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
