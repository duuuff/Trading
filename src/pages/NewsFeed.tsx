import { useState } from 'react'
import { Lock, ExternalLink } from 'lucide-react'
import { Header } from '../components/Layout/Header'
import { SentimentDot, PotentialImpactBadge } from '../components/UI/Badge'
import { Modal } from '../components/UI/Modal'
import { PremiumModal } from '../components/Paywall/PremiumModal'
import { useUser } from '../context/UserContext'
import { newsItems } from '../data/news'
import { assets } from '../data/assets'
import type { NewsItem } from '../types'

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `il y a ${diffDays} j`
  return dateStr
}

export function NewsFeed() {
  const { watchlist, canAccessPremiumContent } = useUser()
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [showPremium, setShowPremium] = useState(false)

  const watchedIds = watchlist
  const allRelevant = newsItems.filter(
    (n) => watchedIds.includes(n.assetId) || watchedIds.length === 0,
  )

  const filters = [
    { id: 'all', label: 'Tout' },
    ...watchedIds.map((id) => {
      const a = assets.find((x) => x.id === id)
      return { id, label: a?.symbol ?? id }
    }),
  ]

  const displayed = allRelevant.filter(
    (n) => activeFilter === 'all' || n.assetId === activeFilter,
  )

  const handleOpen = (item: NewsItem) => {
    if (item.isPremium && !canAccessPremiumContent()) {
      setShowPremium(true)
      return
    }
    setSelectedNews(item)
  }

  const sentimentLabel: Record<string, string> = {
    positive: 'Positif',
    negative: 'Négatif',
    neutral: 'Neutre',
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Header showNotification />

      <div className="px-4 pt-4">
        <h1 className="text-lg font-bold text-slate-100 mb-1">Actualités</h1>
        <p className="text-sm text-muted mb-4">Vos actifs suivis, analysés.</p>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
                activeFilter === f.id
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* News cards */}
        {displayed.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted">
              Aucune actualité pour les actifs sélectionnés.
            </p>
            <p className="text-xs text-muted mt-1">
              Ajoutez des actifs dans "Explorer" pour recevoir leurs news.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((item) => {
              const asset = assets.find((a) => a.id === item.assetId)
              const isLocked = item.isPremium && !canAccessPremiumContent()
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpen(item)}
                  className="card w-full px-4 py-4 text-left active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-slate-300">
                        {asset?.symbol}
                      </span>
                      <PotentialImpactBadge impact={item.potentialImpact} />
                    </div>
                    <span className="text-xs text-muted flex-shrink-0">
                      {timeAgo(item.date)}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    {isLocked ? (
                      <Lock size={14} className="text-warning mt-0.5 flex-shrink-0" />
                    ) : (
                      <SentimentDot sentiment={item.sentiment} />
                    )}
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        isLocked ? 'text-muted' : 'text-slate-100'
                      }`}
                    >
                      {isLocked ? (
                        <span className="blur-sm select-none">
                          {item.title}
                        </span>
                      ) : (
                        item.title
                      )}
                    </p>
                  </div>

                  {!isLocked && (
                    <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}

                  {isLocked && (
                    <p className="text-xs text-warning mt-2 font-medium">
                      🔒 Réservé aux abonnés Premium
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted">
                      {sentimentLabel[item.sentiment]} · {item.source}
                    </span>
                    {!isLocked && (
                      <ExternalLink size={12} className="text-muted" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* News Detail Modal */}
      <Modal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        title={selectedNews ? assets.find((a) => a.id === selectedNews.assetId)?.symbol : undefined}
      >
        {selectedNews && (
          <div className="px-5 pt-2 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <SentimentDot sentiment={selectedNews.sentiment} />
              <span className="text-xs text-muted">
                {sentimentLabel[selectedNews.sentiment]}
              </span>
              <PotentialImpactBadge impact={selectedNews.potentialImpact} />
              <span className="text-xs text-muted ml-auto">{selectedNews.date}</span>
            </div>

            <h3 className="text-base font-bold text-slate-100 leading-snug">
              {selectedNews.title}
            </h3>

            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedNews.summary}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-muted pb-2">
              <span>Source : {selectedNews.source}</span>
              <button className="flex items-center gap-1 text-primary font-medium">
                Lire l'article <ExternalLink size={11} />
              </button>
            </div>
          </div>
        )}
      </Modal>

      <PremiumModal
        isOpen={showPremium}
        onClose={() => setShowPremium(false)}
        reason="Cet article est réservé aux abonnés. Passez à Premium pour accéder à toutes les actualités en temps réel."
      />
    </div>
  )
}
