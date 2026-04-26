import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Subscription } from '../types';

const TYPE_ICONS: Record<string, string> = {
  stock: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  etf: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  index: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  crypto: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const POPULAR = [
  { to: '/chart/SPY', symbol: 'SPY', label: 'S&P 500' },
  { to: '/chart/QQQ', symbol: 'QQQ', label: 'Nasdaq 100' },
  { to: '/chart/BTC-USD', symbol: 'BTC-USD', label: 'Bitcoin' },
  { to: '/chart/%5EFCHI', symbol: '^FCHI', label: 'CAC 40' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.subscriptions.list()
      .then(setSubs)
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Plan banner */}
      {user?.plan === 'free' && (
        <Link to="/account" className="block card p-4 border-primary/30 bg-primary/5 active:bg-primary/10 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Passer à Premium — 9,99€/mois</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {subs.length}/3 actifs utilisés · Actifs illimités + alertes
              </p>
            </div>
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Mes actifs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Mes actifs suivis</h3>
          <Link to="/assets" className="text-xs text-primary font-medium">+ Ajouter</Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="card p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : subs.length === 0 ? (
          <div className="card p-6 text-center border-dashed">
            <svg className="w-8 h-8 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm font-medium text-text-primary">Aucun actif suivi</p>
            <p className="text-xs text-text-muted mt-1 mb-4">Suivez des actions, ETF ou indices pour les retrouver ici et recevoir leurs actualités.</p>
            <Link to="/assets" className="btn-primary text-sm">Explorer les actifs</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {subs.map((sub) => (
              <Link
                key={sub.id}
                to={`/chart/${encodeURIComponent(sub.symbol)}`}
                className="card p-4 flex items-center gap-3 active:border-primary/40 transition-colors block"
              >
                <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICONS[sub.type] ?? TYPE_ICONS.stock} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text-primary font-mono">{sub.symbol}</span>
                    <span className="text-[10px] text-text-muted uppercase bg-surface px-1.5 py-0.5 rounded">{sub.type}</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{sub.name}</p>
                </div>
                <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Marchés populaires */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Marchés populaires</h3>
        </div>
        <p className="text-xs text-text-muted mb-3">Explorez les graphiques et les événements associés.</p>
        <div className="grid grid-cols-2 gap-2">
          {POPULAR.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="card p-3 active:border-primary/40 transition-colors"
            >
              <p className="text-[10px] font-mono text-text-muted">{item.symbol}</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">{item.label}</p>
              <p className="text-[10px] text-primary mt-1 flex items-center gap-0.5">
                Voir le graphique
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
