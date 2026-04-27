import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import TradingChart from '../components/TradingChart';
import EventModal from '../components/EventModal';
import type { Asset, Candle, MarketEvent } from '../types';

type Period = '3m' | '6m' | '1y' | '2y' | '5y';

const periods: Period[] = ['3m', '6m', '1y', '2y', '5y'];

const impactClass = { bullish: 'badge-bullish', bearish: 'badge-bearish', neutral: 'badge-neutral' };
const impactIcon = { bullish: '↑', bearish: '↓', neutral: '—' };

export default function ChartPage() {
  const { symbol = '' } = useParams<{ symbol: string }>();
  const { user } = useAuth();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [period, setPeriod] = useState<Period>('1y');
  const [loading, setLoading] = useState(true);
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
    api.assets.chart(decodedSymbol, period)
      .then((d) => setCandles(d.candles))
      .catch(() => {});
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
      alert(err instanceof Error ? err.message : 'Erreur');
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
        <div className="h-6 bg-card rounded w-32" />
        <div className="h-80 bg-card rounded-2xl" />
      </div>
    );
  }

  if (error && !asset) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-danger text-sm">{error}</p>
        <Link to="/" className="btn-ghost mt-4 inline-flex">Retour</Link>
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
              <Link to="/" className="text-text-muted hover:text-text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h2 className="font-bold text-lg font-mono">{asset?.symbol}</h2>
              <span className="text-xs text-text-muted uppercase bg-surface px-2 py-0.5 rounded-full">{asset?.type}</span>
            </div>
            <p className="text-sm text-text-secondary mt-0.5 ml-6">{asset?.name}</p>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={subLoading}
            className={isSubscribed ? 'btn-ghost text-xs px-3 py-2' : 'btn-primary text-xs px-3 py-2'}
          >
            {subLoading ? '…' : isSubscribed ? 'Désabonner' : 'Suivre'}
          </button>
        </div>

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
        <div className="card overflow-hidden">
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
        </div>

        {/* Legend */}
        {events.length > 0 && (
          <div className="flex gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1"><span className="text-success">↑</span> Haussier</span>
            <span className="flex items-center gap-1"><span className="text-danger">↓</span> Baissier</span>
            <span className="flex items-center gap-1"><span>—</span> Neutre</span>
            <span className="ml-auto italic">Cliquer sur une flèche</span>
          </div>
        )}

        {/* Events list */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Événements ({events.length})
          </h3>

          {events.length === 0 ? (
            <div className="card p-5 text-center">
              <p className="text-text-muted text-sm">Aucun événement associé.</p>
              {user?.plan === 'premium' && (
                <p className="text-xs text-text-muted mt-1">Les membres Premium peuvent en ajouter.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="card p-4 w-full text-left hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className={`${impactClass[evt.impact]} flex-shrink-0 mt-0.5`}>
                      {impactIcon[evt.impact]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary leading-snug">{evt.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
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
