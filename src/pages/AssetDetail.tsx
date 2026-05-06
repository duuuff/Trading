import { useState, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Bell, BellOff } from 'lucide-react'
import { Header } from '../components/Layout/Header'
import { TradingChart } from '../components/Chart/TradingChart'
import { Modal } from '../components/UI/Modal'
import { ImpactBadge, CategoryBadge } from '../components/UI/Badge'
import { PremiumModal } from '../components/Paywall/PremiumModal'
import { useUser } from '../context/UserContext'
import { assets } from '../data/assets'
import { marketEvents } from '../data/events'
import { chartDataMap } from '../data/chartData'
import type { MarketEvent, Timeframe } from '../types'

const TIMEFRAMES: Timeframe[] = ['1M', '3M', '6M', '1Y', '3Y', 'ALL']

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  if (price >= 1000) return price.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
  return price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function severityStars(s: 1 | 2 | 3): string {
  return '●'.repeat(s) + '○'.repeat(3 - s)
}

export function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const { isInWatchlist, toggleWatchlist, canAddToWatchlist, canAccessPremiumContent } =
    useUser()
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y')
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null)
  const [showPremium, setShowPremium] = useState(false)

  const asset = assets.find((a) => a.id === id)
  if (!asset) return <Navigate to="/" replace />

  const data = chartDataMap[id!] ?? []
  const lastCandle = data[data.length - 1]
  const prevCandle = data[data.length - 2]
  const price = lastCandle?.close ?? 0
  const prevPrice = prevCandle?.close ?? price
  const change = price - prevPrice
  const changePct = prevPrice ? (change / prevPrice) * 100 : 0
  const isPositive = changePct >= 0

  const inWatchlist = isInWatchlist(asset.id)

  const relevantEvents = useMemo(
    () =>
      marketEvents.filter(
        (e) =>
          e.affectedAssets.includes(asset.id) &&
          (!e.isPremium || canAccessPremiumContent()),
      ),
    [asset.id, canAccessPremiumContent],
  )

  const handleWatchlistToggle = () => {
    if (!inWatchlist && !canAddToWatchlist()) {
      setShowPremium(true)
      return
    }
    toggleWatchlist(asset.id)
  }

  const handleEventClick = (ev: MarketEvent) => {
    setSelectedEvent(ev)
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Header showBack title={asset.name} />

      {/* Asset Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                {asset.symbol}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted">
                {asset.type === 'index'
                  ? 'Indice'
                  : asset.type === 'etf'
                    ? 'ETF'
                    : asset.type === 'crypto'
                      ? 'Crypto'
                      : 'Action'}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100 tabular-nums">
              {formatPrice(price)}{' '}
              <span className="text-base font-normal text-muted">{asset.currency}</span>
            </p>
            <div
              className={`flex items-center gap-1.5 mt-1 text-sm font-semibold ${
                isPositive ? 'text-success' : 'text-danger'
              }`}
            >
              {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {isPositive ? '+' : ''}
              {formatPrice(change)} ({isPositive ? '+' : ''}
              {changePct.toFixed(2)}%)
              <span className="text-xs font-normal text-muted">vs veille</span>
            </div>
          </div>
          <button
            onClick={handleWatchlistToggle}
            className={`p-2.5 rounded-xl border transition-colors duration-150 ${
              inWatchlist
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'border-border text-muted hover:border-primary hover:text-primary'
            }`}
            aria-label={inWatchlist ? 'Retirer de la liste' : 'Ajouter à la liste'}
          >
            {inWatchlist ? <BellOff size={18} /> : <Bell size={18} />}
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="px-4 pb-2">
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                timeframe === tf
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-slate-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-bg overflow-hidden">
        <TradingChart
          data={data}
          events={relevantEvents}
          timeframe={timeframe}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Chart legend */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0 border-b-2 border-success inline-block" />
          Hausse
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0 border-b-2 border-danger inline-block" />
          Baisse
        </span>
        <span className="flex items-center gap-1.5 text-[10px]">▲▼ Événements (cliquez)</span>
      </div>

      {/* Description */}
      <div className="px-4 mt-2">
        <p className="text-sm text-muted leading-relaxed">{asset.description}</p>
      </div>

      {/* Events List */}
      <section className="px-4 mt-5">
        <h2 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-3">
          Événements associés ({relevantEvents.length})
        </h2>
        <div className="space-y-2">
          {relevantEvents.length === 0 && (
            <p className="text-sm text-muted text-center py-4">
              Aucun événement pour cette période.
            </p>
          )}
          {relevantEvents.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              className="card w-full px-4 py-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`text-lg flex-shrink-0 ${
                      ev.impact === 'negative'
                        ? 'text-danger'
                        : ev.impact === 'positive'
                          ? 'text-success'
                          : 'text-warning'
                    }`}
                  >
                    {ev.impact === 'negative' ? '▼' : ev.impact === 'positive' ? '▲' : '◆'}
                  </span>
                  <p className="text-sm font-semibold text-slate-100 leading-snug">
                    {ev.title}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold flex-shrink-0 ${
                    ev.variation < 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {ev.variation > 0 ? '+' : ''}
                  {ev.variation}%
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <ImpactBadge impact={ev.impact} />
                <CategoryBadge category={ev.category} />
                <span className="text-xs text-muted">{ev.date}</span>
                <span className="text-xs text-muted ml-auto">{severityStars(ev.severity)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.shortLabel}
      >
        {selectedEvent && (
          <div className="px-5 pt-2 space-y-4">
            <div>
              <p className="text-base font-bold text-slate-100 leading-snug mb-3">
                {selectedEvent.title}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <ImpactBadge impact={selectedEvent.impact} />
                <CategoryBadge category={selectedEvent.category} />
                <span
                  className={`text-sm font-bold ${
                    selectedEvent.variation < 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {selectedEvent.variation > 0 ? '+' : ''}
                  {selectedEvent.variation}% (4 sem.)
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted mb-4">
                <span>📅 {selectedEvent.date}</span>
                <span>Sévérité : {severityStars(selectedEvent.severity)}</span>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedEvent.summary}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-2">Actifs concernés :</p>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.affectedAssets.map((sid) => {
                  const a = assets.find((x) => x.id === sid)
                  return (
                    <span
                      key={sid}
                      className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-border text-slate-300 font-medium"
                    >
                      {a?.symbol ?? sid}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        reason="Vous avez atteint la limite de votre plan gratuit. Passez à Premium pour suivre plus d'actifs."
      />
    </div>
  )
}
