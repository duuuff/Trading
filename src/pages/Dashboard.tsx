import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, ChevronRight, Zap, CalendarDays } from 'lucide-react'
import { Header } from '../components/Layout/Header'
import { ImpactBadge, CategoryBadge } from '../components/UI/Badge'
import { PremiumModal } from '../components/Paywall/PremiumModal'
import { useUser } from '../context/UserContext'
import { assets } from '../data/assets'
import { marketEvents } from '../data/events'
import { chartDataMap } from '../data/chartData'

function getLatestPriceInfo(assetId: string): {
  price: number
  change: number
  changePct: number
} {
  const data = chartDataMap[assetId]
  if (!data || data.length < 2) return { price: 0, change: 0, changePct: 0 }
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const change = last.close - prev.close
  const changePct = (change / prev.close) * 100
  return { price: last.close, change, changePct }
}

function formatPrice(price: number): string {
  if (price > 10000) return `${(price / 1000).toFixed(1)}k`
  if (price > 1000) return price.toFixed(0)
  if (price > 100) return price.toFixed(2)
  return price.toFixed(2)
}

export function Dashboard() {
  const navigate = useNavigate()
  const { watchlist, plan, canAccessPremiumContent } = useUser()
  const [showPremium, setShowPremium] = useState(false)

  const watchedAssets = assets.filter((a) => watchlist.includes(a.id))
  const recentEvents = marketEvents
    .filter((e) => !e.isPremium || canAccessPremiumContent())
    .slice(-5)
    .reverse()

  const marketOverview = ['SPX', 'NDX', 'CAC'].map((id) => {
    const asset = assets.find((a) => a.id === id)!
    const info = getLatestPriceInfo(id)
    return { asset, ...info }
  })

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Header showNotification />

      {/* Market Overview */}
      <section className="px-4 pt-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {marketOverview.map(({ asset, price, changePct }) => (
            <button
              key={asset.id}
              onClick={() => navigate(`/actif/${asset.id}`)}
              className="card flex-shrink-0 px-4 py-3 w-36 text-left active:scale-95 transition-transform"
            >
              <p className="text-xs text-muted font-medium mb-1">{asset.symbol}</p>
              <p className="text-sm font-bold text-slate-100">
                {formatPrice(price)}
                <span className="text-xs font-normal text-muted ml-1">{asset.currency}</span>
              </p>
              <div
                className={`flex items-center gap-1 mt-1 text-xs font-semibold ${
                  changePct >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {changePct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {changePct >= 0 ? '+' : ''}
                {changePct.toFixed(2)}%
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Watchlist */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">
            Ma liste de suivi
          </h2>
          <button
            onClick={() => navigate('/explorer')}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            Gérer <ChevronRight size={14} />
          </button>
        </div>

        {watchedAssets.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-sm text-muted">Aucun actif suivi.</p>
            <button
              onClick={() => navigate('/explorer')}
              className="mt-3 text-sm text-primary font-medium"
            >
              Explorer les marchés
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {watchedAssets.map((asset) => {
              const info = getLatestPriceInfo(asset.id)
              return (
                <button
                  key={asset.id}
                  onClick={() => navigate(`/actif/${asset.id}`)}
                  className="card w-full flex items-center justify-between px-4 py-3.5 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-300">
                        {asset.symbol.slice(0, 3)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-100">{asset.symbol}</p>
                      <p className="text-xs text-muted">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-100">
                      {formatPrice(info.price)}
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        info.changePct >= 0 ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {info.changePct >= 0 ? '+' : ''}
                      {info.changePct.toFixed(2)}%
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Recent Events */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">
            Événements récents
          </h2>
          <CalendarDays size={16} className="text-muted" />
        </div>
        <div className="space-y-2">
          {recentEvents.map((ev) => (
            <button
              key={ev.id}
              onClick={() => navigate(`/actif/${ev.affectedAssets[0]}`)}
              className="card w-full px-4 py-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-semibold text-slate-100 leading-snug flex-1">
                  {ev.title}
                </p>
                <ImpactBadge impact={ev.impact} />
              </div>
              <div className="flex items-center gap-2">
                <CategoryBadge category={ev.category} />
                <span className="text-xs text-muted">{ev.date}</span>
              </div>
            </button>
          ))}
          {!canAccessPremiumContent() && (
            <button
              onClick={() => setShowPremium(true)}
              className="card w-full px-4 py-4 text-center border-dashed active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Zap size={15} />
                <span className="text-sm font-semibold">
                  Voir tous les événements en Premium
                </span>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Upgrade Banner (free users) */}
      {plan === 'free' && (
        <section className="px-4 mt-6">
          <button
            onClick={() => setShowPremium(true)}
            className="w-full rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 px-5 py-4 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-100">Passez à Premium</p>
                <p className="text-xs text-muted mt-0.5">
                  Actifs illimités, historique complet, alertes
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-primary font-bold">5€/mois</span>
                <ChevronRight size={16} className="text-primary mt-0.5" />
              </div>
            </div>
          </button>
        </section>
      )}

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  )
}
