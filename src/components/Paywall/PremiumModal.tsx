import { Check, Zap, Crown } from 'lucide-react'
import { Modal } from '../UI/Modal'
import { useUser } from '../../context/UserContext'
import type { UserPlan } from '../../types'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: string
}

const plans: Array<{
  id: UserPlan
  name: string
  price: string
  period: string
  icon: typeof Zap
  features: string[]
  highlighted: boolean
  cta: string
}> = [
  {
    id: 'standard',
    name: 'Standard',
    price: '5€',
    period: '/mois',
    icon: Zap,
    cta: 'Choisir Standard',
    highlighted: true,
    features: [
      '10 actifs en portefeuille',
      'Historique 3 ans',
      'Tous les événements clés',
      'Actualités en quasi temps réel',
      'Analyses de marché',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '10€',
    period: '/mois',
    icon: Crown,
    cta: 'Choisir Pro',
    highlighted: false,
    features: [
      'Actifs illimités',
      'Historique 5 ans complet',
      'Alertes personnalisées',
      'Actualités en temps réel',
      'Analyses approfondies',
      'Accès API',
    ],
  },
]

export function PremiumModal({ isOpen, onClose, reason }: PremiumModalProps) {
  const { upgradePlan, plan } = useUser()

  const handleUpgrade = (targetPlan: UserPlan) => {
    upgradePlan(targetPlan)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Passez à la version Premium">
      <div className="px-5 pt-3 pb-2 space-y-4">
        {reason && (
          <p className="text-sm text-muted bg-surface border border-border rounded-xl px-4 py-3">
            {reason}
          </p>
        )}
        <p className="text-sm text-slate-300">
          Débloquez toutes les fonctionnalités pour des analyses plus complètes.
        </p>

        <div className="space-y-3">
          {plans.map((p) => {
            const Icon = p.icon
            const isCurrent = plan === p.id
            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-4 ${
                  p.highlighted
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      size={18}
                      className={p.highlighted ? 'text-primary' : 'text-warning'}
                    />
                    <span className="font-bold text-slate-100">{p.name}</span>
                    {p.highlighted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/30">
                        POPULAIRE
                      </span>
                    )}
                  </div>
                  <span className="text-xl font-bold text-slate-100">
                    {p.price}
                    <span className="text-sm font-normal text-muted">{p.period}</span>
                  </span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-150 ${
                    isCurrent
                      ? 'bg-surface text-muted border border-border cursor-default'
                      : p.highlighted
                        ? 'btn-primary'
                        : 'btn-outline'
                  }`}
                >
                  {isCurrent ? 'Plan actuel' : p.cta}
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-muted pb-2">
          Sans engagement • Annulable à tout moment
        </p>
      </div>
    </Modal>
  )
}
