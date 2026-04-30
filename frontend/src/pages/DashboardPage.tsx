import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { SkeletonDashboardRow } from '../components/Skeleton';
import type { MarketAsset, Subscription } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────

function fmtPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1)    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function fmtVolume(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return String(v);
}

const TYPE_COLOR: Record<string, string> = {
  stock:  'bg-primary/10 text-primary border-primary/20',
  etf:    'bg-warning/10 text-warning border-warning/20',
  index:  'bg-success/10 text-success border-success/20',
  crypto: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

// ── Sparkline SVG ─────────────────────────────────────────────────────

function Sparkline({ prices, positive }: { prices: number[]; positive: boolean }) {
  if (!prices || prices.length < 2) return <div className="w-20 h-8" />;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 80, H = 32, pad = 2;
  const pts = prices
    .map((p, i) => `${(i / (prices.length - 1)) * W},${H - pad - ((p - min) / range) * (H - pad * 2)}`)
    .join(' ');
  const color = positive ? '#0ECB81' : '#F6465D';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Row skeleton ──────────────────────────────────────────────────────

function SkeletonTableRow() {
  return (
    <tr className="border-b border-border/50">
      {[32, 140, 56, 72, 56, 72, 80, 56].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 rounded animate-pulse bg-border/60" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ── Desktop table ─────────────────────────────────────────────────────

function MarketTable({ assets, subs, toggling, onToggle, onSort, sortKey, sortDir }: {
  assets: MarketAsset[];
  subs: Set<string>;
  toggling: string | null;
  onToggle: (e: React.MouseEvent, symbol: string) => void;
  onSort: (k: 'price' | 'change' | 'volume') => void;
  sortKey: string;
  sortDir: 1 | -1;
}) {
  const navigate = useNavigate();

  const SortTh = ({ label, col }: { label: string; col: 'price' | 'change' | 'volume' }) => (
    <th
      onClick={() => onSort(col)}
      className="px-4 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider cursor-pointer select-none hover:text-text-secondary transition-colors whitespace-nowrap"
    >
      {label} {sortKey === col ? (sortDir === -1 ? '↓' : '↑') : ''}
    </th>
  );

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider w-10">#</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Actif</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Type</th>
              <SortTh label="Prix" col="price" />
              <SortTh label="24h %" col="change" />
              <SortTh label="Volume" col="volume" />
              <th className="px-4 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">7 jours</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => {
              const positive = (asset.changePercent ?? 0) >= 0;
              const subscribed = subs.has(asset.symbol);
              const isToggling = toggling === asset.symbol;
              return (
                <tr
                  key={asset.id}
                  onClick={() => navigate(`/chart/${encodeURIComponent(asset.symbol)}`)}
                  className="border-b border-border/40 hover:bg-surface/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5 text-sm font-mono text-text-muted">{idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-bold font-mono text-text-primary">{asset.symbol}</p>
                    <p className="text-xs text-text-secondary truncate max-w-[160px]">{asset.name}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLOR[asset.type] ?? TYPE_COLOR.stock}`}>
                      {asset.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {asset.price != null
                      ? <span className="text-sm font-mono font-semibold text-text-primary">${fmtPrice(asset.price)}</span>
                      : <span className="text-xs text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {asset.changePercent != null
                      ? <span className={`text-sm font-mono font-semibold ${positive ? 'text-success' : 'text-danger'}`}>
                          {positive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                        </span>
                      : <span className="text-xs text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {asset.volume != null
                      ? <span className="text-sm font-mono text-text-secondary">{fmtVolume(asset.volume)}</span>
                      : <span className="text-xs text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      <Sparkline prices={asset.sparkline} positive={positive} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={e => onToggle(e, asset.symbol)}
                      disabled={isToggling}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                        subscribed
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-primary text-primary-fg hover:bg-primary-dark'
                      }`}
                    >
                      {isToggling
                        ? '…'
                        : subscribed ? '✓ Suivi' : '+ Suivre'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Mobile cards ──────────────────────────────────────────────────────

function MobileCards({ assets, subs, toggling, onToggle }: {
  assets: MarketAsset[];
  subs: Set<string>;
  toggling: string | null;
  onToggle: (e: React.MouseEvent, symbol: string) => void;
}) {
  return (
    <div className="space-y-2">
      {assets.map((asset) => {
        const positive = (asset.changePercent ?? 0) >= 0;
        const subscribed = subs.has(asset.symbol);
        return (
          <Link
            key={asset.id}
            to={`/chart/${encodeURIComponent(asset.symbol)}`}
            className="card p-4 flex items-center gap-3 active:border-primary/40 transition-colors block"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm font-mono text-text-primary">{asset.symbol}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${TYPE_COLOR[asset.type] ?? TYPE_COLOR.stock}`}>
                  {asset.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-text-secondary truncate mt-0.5">{asset.name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {asset.price != null && (
                <p className="text-sm font-mono font-semibold text-text-primary">${fmtPrice(asset.price)}</p>
              )}
              {asset.changePercent != null && (
                <p className={`text-xs font-mono font-semibold ${positive ? 'text-success' : 'text-danger'}`}>
                  {positive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </p>
              )}
            </div>
            <div onClick={e => e.preventDefault()}>
              <button
                onClick={e => onToggle(e, asset.symbol)}
                disabled={toggling === asset.symbol}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg ml-2 ${
                  subscribed
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-primary text-primary-fg'
                }`}
              >
                {toggling === asset.symbol ? '…' : subscribed ? '✓' : '+'}
              </button>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'price' | 'change' | 'volume' | ''>('');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [market, subscriptions] = await Promise.all([
        api.assets.market(),
        api.subscriptions.list(),
      ]);
      setAssets(market);
      setSubs(new Set(subscriptions.map((s: Subscription) => s.symbol)));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSub = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setToggling(symbol);
    try {
      if (subs.has(symbol)) {
        await api.subscriptions.remove(symbol);
        setSubs(prev => { const n = new Set(prev); n.delete(symbol); return n; });
      } else {
        await api.subscriptions.add(symbol);
        setSubs(prev => new Set(prev).add(symbol));
      }
    } catch { /* ignore */ }
    setToggling(null);
  };

  const handleSort = (key: 'price' | 'change' | 'volume') => {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(-1); }
  };

  const sorted = [...assets].sort((a, b) => {
    if (sortKey === 'price')  return ((a.price ?? 0) - (b.price ?? 0)) * sortDir;
    if (sortKey === 'change') return ((a.changePercent ?? 0) - (b.changePercent ?? 0)) * sortDir;
    if (sortKey === 'volume') return ((a.volume ?? 0) - (b.volume ?? 0)) * sortDir;
    return 0;
  });

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Plan banner (mobile only feel, desktop has header) */}
      {user?.plan === 'free' && (
        <Link to="/account" className="block card p-4 border-primary/30 bg-primary/5 active:bg-primary/10 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Passer à Premium — 9,99€/mois</p>
              <p className="text-xs text-text-secondary mt-0.5">{subs.size}/3 actifs utilisés · Actifs illimités + alertes</p>
            </div>
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Marchés</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {assets.length > 0 ? `${assets.length} actifs suivis en temps réel` : 'Chargement…'}
          </p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing || loading} className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5">
          <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      {error && (
        <div className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block">
        {loading ? (
          <div className="card overflow-hidden">
            <table className="w-full">
              <tbody>{Array.from({ length: 8 }).map((_, i) => <SkeletonTableRow key={i} />)}</tbody>
            </table>
          </div>
        ) : (
          <MarketTable
            assets={sorted}
            subs={subs}
            toggling={toggling}
            onToggle={toggleSub}
            onSort={handleSort}
            sortKey={sortKey}
            sortDir={sortDir}
          />
        )}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => <SkeletonDashboardRow key={i} />)}
          </div>
        ) : (
          <MobileCards assets={sorted} subs={subs} toggling={toggling} onToggle={toggleSub} />
        )}
      </div>

      {!loading && assets.length === 0 && !error && (
        <div className="card p-8 text-center border-dashed">
          <p className="text-text-muted text-sm">Aucun actif disponible.</p>
          <p className="text-xs text-text-muted mt-1">Lancez <code className="bg-surface px-1 rounded">npm run seed</code> pour initialiser les données.</p>
        </div>
      )}
    </div>
  );
}
