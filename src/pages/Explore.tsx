import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Lock, Check, ChevronRight } from 'lucide-react'
import { Header } from '../components/Layout/Header'
import { PremiumModal } from '../components/Paywall/PremiumModal'
import { useUser } from '../context/UserContext'
import { assets } from '../data/assets'
import type { AssetType } from '../types'

type FilterType = AssetType | 'all'

const FILTERS: Array<{ id: FilterType; label: string }> = [
  { id: 'all', label: 'Tous' },
  { id: 'index', label: 'Indices' },
  { id: 'stock', label: 'Actions' },
  { id: 'etf', label: 'ETF' },
  { id: 'crypto', label: 'Crypto' },
]

const typeLabels: Record<AssetType, string> = {
  index: 'Indice',
  stock: 'Action',
  etf: 'ETF',
  crypto: 'Crypto',
}

const countryFlags: Record<string, string> = {
  US: '🇺🇸',
  FR: '🇫🇷',
  EU: '🇪🇺',
  WORLD: '🌍',
  CRYPTO: '₿',
}

export function Explore() {
  const navigate = useNavigate()
  const { isInWatchlist, toggleWatchlist, canAddToWatchlist, canAccessPremiumContent } =
    useUser()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [showPremium, setShowPremium] = useState(false)
  const [premiumReason, setPremiumReason] = useState('')

  const filtered = assets.filter((a) => {
    const matchQuery =
      !query ||
      a.symbol.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase())
    const matchFilter = filter === 'all' || a.type === filter
    return matchQuery && matchFilter
  })

  const handleToggle = (assetId: string, isPremiumAsset: boolean) => {
    if (isPremiumAsset && !canAccessPremiumContent()) {
      setPremiumReason(
        'Cet actif est réservé aux abonnés Premium. Passez à la version payante pour le suivre.',
      )
      setShowPremium(true)
      return
    }
    const alreadyIn = isInWatchlist(assetId)
    if (!alreadyIn && !canAddToWatchlist()) {
      setPremiumReason(
        'Vous avez atteint la limite de votre plan gratuit (3 actifs). Passez à Premium pour en suivre davantage.',
      )
      setShowPremium(true)
      return
    }
    toggleWatchlist(assetId)
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Header />

      <div className="px-4 pt-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Rechercher un actif, ETF, indice…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-slate-100 placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div className="px-4 mt-4 space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted py-8">Aucun résultat.</p>
        )}
        {filtered.map((asset) => {
          const inWatch = isInWatchlist(asset.id)
          const locked = asset.isPremium && !canAccessPremiumContent()
          return (
            <div key={asset.id} className="card flex items-center gap-3 px-4 py-3.5">
              {/* Asset info — navigates to detail */}
              <button
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
                onClick={() => navigate(`/actif/${asset.id}`)}
              >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-300">
                    {asset.symbol.slice(0, 3)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-100">{asset.symbol}</p>
                    <span className="text-muted">{countryFlags[asset.country]}</span>
                    {locked && <Lock size={11} className="text-warning" />}
                  </div>
                  <p className="text-xs text-muted truncate">{asset.name}</p>
                  <span className="text-[10px] text-muted">
                    {typeLabels[asset.type]}
                    {asset.sector ? ` · ${asset.sector}` : ''}
                  </span>
                </div>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/actif/${asset.id}`)}
                  className="p-2 text-muted hover:text-slate-200 transition-colors"
                  aria-label="Voir le graphique"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => handleToggle(asset.id, asset.isPremium)}
                  className={`p-2 rounded-lg border transition-colors duration-150 ${
                    inWatch
                      ? 'bg-success/15 border-success/30 text-success'
                      : locked
                        ? 'border-border text-warning'
                        : 'border-border text-muted hover:border-primary hover:text-primary'
                  }`}
                  aria-label={inWatch ? 'Retirer' : 'Suivre'}
                >
                  {locked ? (
                    <Lock size={15} />
                  ) : inWatch ? (
                    <Check size={15} />
                  ) : (
                    <span className="text-xs font-bold">+</span>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        reason={premiumReason}
      />
    </div>
  )
}
