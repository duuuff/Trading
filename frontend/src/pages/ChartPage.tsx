import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import TradingChart from '../components/TradingChart';
import EventModal from '../components/EventModal';
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
      } else {
        await api.subscriptions.add(decodedSymbol);
        setIsSubscribed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubLoading(false);
    }
  };

  const handleEventClick = useCallback((event: MarketEvent) => {
    setSelectedEvent(event);
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-5 space-y-4 animate-pulse">
        <div className="h-6 bg-card rounded w-40" />
        <div className="h-8 bg-card rounded" />
        <div className="h-80 bg-card rounded-2xl" />
      </div>
    );
  }

  if (error && !asset) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-danger text-sm mb-4">{error}</p>
        <Link to="/" className="btn-ghost">Retour</Link>
      </div>
    );
  }

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
          <button
            onClick={handleSubscribe}
            disabled={subLoading}
            className={isSubscribed ? 'btn-ghost text-xs px-3 py-2 flex items-center gap-1.5' : 'btn-primary text-xs px-3 py-2'}
          >
            {subLoading ? (
              '…'
            ) : isSubscribed ? (
              <>
                <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Suivi
              </>
            ) : (
              'Suivre'
            )}
          </button>
        </div>

        {/* Error inline (subscribe error) */}
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

        {/* Chart */}
        <div className={`card overflow-hidden transition-opacity ${chartLoading ? 'opacity-60' : 'opacity-100'}`}>
          {candles.length > 0 ? (
            <TradingChart candles={candles} events={events} onEventClick={handleEventClick} />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-text-muted text-sm">Données indisponibles</p>
            </div>
          )}
        </div>

        {/* Chart hint */}
        {events.length > 0 && (
          <div className="flex items-center gap-3 bg-surface rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="font-medium text-success">↑</span> Hausse
              <span className="font-medium text-danger ml-1">↓</span> Baisse
            </div>
            <div className="flex-1 text-right">
              <span className="text-xs text-text-muted italic">
                Appuyez sur une flèche pour voir l'événement
              </span>
            </div>
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
