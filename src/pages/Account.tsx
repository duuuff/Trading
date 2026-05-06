import { useState } from 'react'
import { Check, ChevronRight, Zap, Crown, User2, HelpCircle, Shield, Bell } from 'lucide-react'
import { Header } from '../components/Layout/Header'
import { PremiumModal } from '../components/Paywall/PremiumModal'
import { useUser } from '../context/UserContext'
import { FREE_ASSET_LIMIT, STANDARD_ASSET_LIMIT } from '../data/assets'

const featureMatrix = [
  { label: 'Actifs suivis', free: '3', standard: '10', pro: 'Illimité' },
  { label: 'Historique', free: '1 an', standard: '3 ans', pro: '5 ans' },
  { label: 'Événements', free: '5 récents', standard: 'Tous', pro: 'Tous' },
  { label: 'Actualités', free: 'Basique', standard: 'Quasi temps réel', pro: 'Temps réel' },
  { label: 'Notifications push', free: '—', standard: '✓', pro: '✓' },
  { label: 'Alertes perso.', free: '—', standard: '—', pro: '✓' },
  { label: 'Accès API', free: '—', standard: '—', pro: '✓' },
]

export function Account() {
  const { plan, watchlist, upgradePlan } = useUser()
  const [showPremium, setShowPremium] = useState(false)

  const limit =
    plan === 'free'
      ? FREE_ASSET_LIMIT
      : plan === 'standard'
        ? STANDARD_ASSET_LIMIT
        : 9999
  const limitLabel = limit === 9999 ? '∞' : `${limit}`
  const usageWidth = limit === 9999 ? 100 : Math.min((watchlist.length / limit) * 100, 100)

  const planNames: Record<string, string> = {
    free: 'Gratuit',
    standard: 'Standard',
    pro: 'Pro',
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Header />

      <div className="px-4 pt-4 space-y-5">
        {/* Profile Card */}
        <div className="card px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <User2 size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Compte MarketLens</p>
              <p className="text-xs text-muted">Plan actuel : {planNames[plan]}</p>
            </div>
            {plan !== 'free' && (
              <div className="ml-auto">
                {plan === 'pro' ? (
                  <Crown size={20} className="text-warning" />
                ) : (
                  <Zap size={20} className="text-primary" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="card px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-200">Actifs suivis</p>
            <span className="text-sm font-bold text-slate-100">
              {watchlist.length}
              <span className="text-muted font-normal"> / {limitLabel}</span>
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden border border-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usageWidth >= 90 ? 'bg-danger' : usageWidth >= 70 ? 'bg-warning' : 'bg-primary'
              }`}
              style={{ width: `${usageWidth}%` }}
            />
          </div>
          {plan === 'free' && watchlist.length >= FREE_ASSET_LIMIT && (
            <p className="text-xs text-danger mt-2">
              Limite atteinte — passez à Premium pour en ajouter davantage.
            </p>
          )}
        </div>

        {/* Plan Actions */}
        {plan === 'free' && (
          <button
            onClick={() => setShowPremium(true)}
            className="w-full rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 px-5 py-4 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-100">Passer à Premium</p>
                <p className="text-xs text-muted mt-0.5">Dès 5€/mois · Sans engagement</p>
              </div>
              <ChevronRight size={18} className="text-primary" />
            </div>
          </button>
        )}

        {plan !== 'free' && (
          <div className="card px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Abonnement {planNames[plan]}
                </p>
                <p className="text-xs text-muted">Actif · Prochain renouvellement le 25/05/2025</p>
              </div>
              <button
                onClick={() => upgradePlan('free')}
                className="text-xs text-danger font-medium"
              >
                Résilier
              </button>
            </div>
          </div>
        )}

        {/* Feature Comparison Table */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Comparatif des plans
          </h2>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-4 text-center border-b border-border">
              <div className="py-2.5 px-2" />
              {['Gratuit', 'Standard', 'Pro'].map((name) => (
                <div
                  key={name}
                  className={`py-2.5 px-1 text-xs font-bold ${
                    (plan === 'standard' && name === 'Standard') ||
                    (plan === 'pro' && name === 'Pro') ||
                    (plan === 'free' && name === 'Gratuit')
                      ? 'text-primary'
                      : 'text-muted'
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>
            {featureMatrix.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 text-center items-center ${
                  i < featureMatrix.length - 1 ? 'border-b border-border/50' : ''
                }`}
              >
                <div className="py-2.5 px-3 text-left text-xs text-muted">{row.label}</div>
                {[row.free, row.standard, row.pro].map((val, j) => (
                  <div key={j} className="py-2.5 px-1 text-xs text-slate-300">
                    {val === '✓' ? (
                      <Check size={13} className="text-success mx-auto" />
                    ) : val === '—' ? (
                      <span className="text-muted">—</span>
                    ) : (
                      val
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Settings Links */}
        <div className="card divide-y divide-border/50">
          {[
            { icon: Bell, label: 'Notifications' },
            { icon: Shield, label: 'Confidentialité' },
            { icon: HelpCircle, label: 'Aide & Support' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className="text-muted" />
                <span className="text-sm text-slate-200">{label}</span>
              </div>
              <ChevronRight size={15} className="text-muted" />
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted pb-2">
          MarketLens v1.0 · © 2025
        </p>
      </div>

      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  )
}
