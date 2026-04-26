import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Subscription } from '../types';

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

  const typeIcon = (type: string) => {
    const icons: Record<string, string> = {
      stock: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      etf: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      index: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      crypto: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[type] || icons.stock;
  };

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Bonjour</h2>
        <p className="text-sm text-text-secondary mt-0.5">{user?.email}</p>
      </div>

      {/* Plan banner for free users */}
      {user?.plan === 'free' && (
        <Link to="/account" className="block card p-4 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Passer à Premium</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {subs.length}/3 actifs · Actifs illimités, alertes & analyses
              </p>
            </div>
            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Subscribed assets */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Mes actifs</h3>
          <Link to="/assets" className="text-xs text-primary hover:underline">Gérer</Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-border rounded w-24 mb-2" />
                <div className="h-3 bg-border rounded w-36" />
              </div>
            ))}
          </div>
        ) : subs.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-text-secondary text-sm">Aucun actif suivi pour le moment.</p>
            <Link to="/assets" className="btn-primary mt-4 inline-flex">Explorer les actifs</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {subs.map((sub) => (
              <Link
                key={sub.id}
                to={`/chart/${sub.symbol}`}
                className="card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors block"
              >
                <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon(sub.type)} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text-primary font-mono">{sub.symbol}</span>
                    <span className="text-xs text-text-muted uppercase">{sub.type}</span>
                  </div>
                  <p className="text-xs text-text-secondary truncate">{sub.name}</p>
                </div>
                <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Explorer</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { to: '/chart/SPY', label: 'S&P 500', sub: 'SPY' },
            { to: '/chart/QQQ', label: 'Nasdaq 100', sub: 'QQQ' },
            { to: '/chart/BTC-USD', label: 'Bitcoin', sub: 'BTC-USD' },
            { to: '/chart/%5EFCHI', label: 'CAC 40', sub: '^FCHI' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="card p-3 hover:border-primary/40 transition-colors"
            >
              <p className="text-xs font-mono text-text-muted">{item.sub}</p>
              <p className="text-sm font-medium text-text-primary mt-0.5">{item.label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
