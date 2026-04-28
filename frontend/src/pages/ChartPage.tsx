import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import TradingChart from '../components/TradingChart';
import EventModal from '../components/EventModal';
import { SkeletonChartPage } from '../components/Skeleton';
import type { Asset, Candle, MarketEvent } from '../types';

type Period = '3m' | '6m' | '1y' | '2y' | '5y';

const periods: Period[] = ['3m', '6m', '1y', '2y', '5y'];

const IMPACT_BADGE: Record<string, string> = {
  bullish: 'badge-bullish',
  bearish: 'badge-bearish',
  neutral: 'badge-neutral',
};
const IMPACT_ICON: Record<string, string> = { bullish: '↑', bearish: '↓', neutral: '—' };
const IMPACT_LABEL: Record<string, string> = { bullish: 'Haussier', bearish: 'Baissier', neutral: 'Neutre' };

export default function ChartPage() {
  const { symbol = '' } = useParams<{ symbol: string }>();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [period, setPeriod] = useState<Period>('1y');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subFlash, setSubFlash] = useState<'add' | 'remove' | null>(null);

  const decodedSymbol = decodeURIComponent(symbol);

  useEffect(() => {
    setError('');
    setLoading(true);
    Promise.all([
      api.assets.get(decodedSymbol),
      api.assets.chart(decodedSymbol, period),
      api.assets.events(decodedSymbol),
      api.subscriptions.list(),
    ])
      .then(([a, chartData, evts, subs]) => {
        setAsset(a);
        setCandles(chartData.candles);
        setEvents(evts);
        setIsSubscribed(subs.some((s) => s.symbol === decodedSymbol));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [decodedSymbol]);

  useEffect(() => {
    if (!asset) return;
    setChartLoading(true);
    api.assets.chart(decodedSymbol, period)
      .then((d) => setCandles(d.candles))
      .catch(() => {})
      .finally(() => setChartLoading(false));
  }, [period, decodedSymbol, asset]);

  const handleSubscribe = async () => {
    setSubLoading(true);
    try {
      if (isSubscribed) {
        await api.subscriptions.remove(decodedSymbol);
        setIsSubscribed(false);
        setSubFlash('remove');
      } else {
        await api.subscriptions.add(decodedSymbol);
        setIsSubscribed(true);
        setSubFlash('add');
      }
      setTimeout(() => setSubFlash(null), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubLoading(false);
    }
  };

  const handleEventClick = useCallback((event: MarketEvent) => {
    setSelectedEvent(event);
  }, []);

  if (loading) return <SkeletonChartPage />;

  if (error && !asset) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-danger text-sm mb-4">{error}</p>
        <Link to="/" className="btn-ghost">Retour</Link>
      </div>
    );
  }

  const subBtnBase = 'text-xs px-3 py-2 flex items-center gap-1.5 rounded-xl font-medium transition-colors';
  const subBtnClass = isSubscribed
    ? `${subBtnBase} bg-success/10 text-success border border-success/20 ${subFlash === 'add' ? 'animate-flash-success' : ''}`
    : `${subBtnBase} bg-primary text-white hover:bg-primary-dark ${subFlash === 'remove' ? 'animate-flash-remove' : ''}`;

  return (
    <>
      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-text-muted active:text-text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h2 className="font-bold text-lg font-mono">{asset?.symbol}</h2>
              <span className="text-[10px] text-text-muted uppercase bg-surface px-2 py-0.5 rounded-full">{asset?.type}</span>
            </div>
            <p className="text-sm text-text-secondary mt-0.5 ml-6">{asset?.name}</p>
          </div>
          <button onClick={handleSubscribe} disabled={subLoading} className={subBtnClass}>
            {subLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : isSubscribed ? (
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

        {/* Inline error */}
        {error && asset && (
          <div className="text-danger text-xs bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Period selector */}
        <div className="flex gap-1 bg-surface rounded-xl p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chart with loading overlay */}
        <div className="card overflow-hidden relative">
          {candles.length > 0 ? (
            <TradingChart candles={candles} events={events} onEventClick={handleEventClick} />
          ) : error ? (
            <div className="h-80 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <svg className="w-8 h-8 text-warning opacity-70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-text-primary">Données indisponibles</p>
                <p className="text-xs text-text-muted mt-1 max-w-xs">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError('');
                  api.assets.chart(decodedSymbol, period)
                    .then((d) => setCandles(d.candles))
                    .catch((err) => setError(err instanceof Error ? err.message : 'Erreur'));
                }}
                className="btn-ghost text-xs px-4 py-2"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-text-muted text-sm">Données indisponibles</p>
            </div>
          )}
          {/* Spinner overlay on period change */}
          {chartLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/70 backdrop-blur-sm">
              <svg className="w-7 h-7 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          )}
        </div>

        {/* Chart legend hint */}
        {events.length > 0 && (
          <div className="flex items-center gap-3 bg-surface rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="font-bold text-success text-sm">↑</span> Hausse
              <span className="font-bold text-danger text-sm ml-1">↓</span> Baisse
            </div>
            <p className="flex-1 text-right text-xs text-text-muted italic">
              Appuyez sur une flèche
            </p>
          </div>
        )}

        {/* Events list */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Événements liés ({events.length})
          </h3>

          {events.length === 0 ? (
            <div className="card p-5 text-center border-dashed">
              <p className="text-text-secondary text-sm">Aucun événement associé à cet actif.</p>
              <p className="text-xs text-text-muted mt-1">
                Les membres Premium peuvent en ajouter pour enrichir l'analyse.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="card p-4 w-full text-left active:border-primary/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`${IMPACT_BADGE[evt.impact]} flex-shrink-0 mt-0.5`}>
                      {IMPACT_ICON[evt.impact]} {IMPACT_LABEL[evt.impact]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted mb-0.5">
                        {new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm font-medium text-text-primary leading-snug">{evt.title}</p>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
}
