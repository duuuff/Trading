import type { EventCategory, ImpactLevel, Sentiment, PotentialImpact } from '../../types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted'
  size?: 'sm' | 'xs'
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-slate-700/50 text-slate-300 border border-slate-600/50',
    success: 'bg-success/15 text-success border border-success/25',
    danger: 'bg-danger/15 text-danger border border-danger/25',
    warning: 'bg-warning/15 text-warning border border-warning/25',
    info: 'bg-primary/15 text-primary border border-primary/25',
    muted: 'bg-surface text-muted border border-border',
  }
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    xs: 'text-[10px] px-1.5 py-0.5',
  }
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  )
}

export function ImpactBadge({ impact }: { impact: ImpactLevel }) {
  const map: Record<ImpactLevel, { variant: BadgeProps['variant']; label: string }> = {
    positive: { variant: 'success', label: '▲ Haussier' },
    negative: { variant: 'danger', label: '▼ Baissier' },
    neutral: { variant: 'warning', label: '◆ Neutre' },
  }
  const { variant, label } = map[impact]
  return <Badge variant={variant}>{label}</Badge>
}

export function CategoryBadge({ category }: { category: EventCategory }) {
  const map: Record<EventCategory, string> = {
    geopolitical: 'Géopolitique',
    monetary: 'Politique moné.',
    economic: 'Économique',
    corporate: 'Entreprise',
    health: 'Santé',
    tech: 'Technologie',
    political: 'Politique',
  }
  return <Badge variant="muted">{map[category]}</Badge>
}

export function SentimentDot({ sentiment }: { sentiment: Sentiment }) {
  const colors: Record<Sentiment, string> = {
    positive: 'bg-success',
    negative: 'bg-danger',
    neutral: 'bg-warning',
  }
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors[sentiment]}`}
    />
  )
}

export function PotentialImpactBadge({ impact }: { impact: PotentialImpact }) {
  const map: Record<PotentialImpact, { variant: BadgeProps['variant']; label: string }> = {
    high: { variant: 'danger', label: 'Impact élevé' },
    medium: { variant: 'warning', label: 'Impact moyen' },
    low: { variant: 'muted', label: 'Impact faible' },
  }
  const { variant, label } = map[impact]
  return (
    <Badge variant={variant} size="xs">
      {label}
    </Badge>
  )
}
