import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell } from 'lucide-react'
import { useUser } from '../../context/UserContext'

interface HeaderProps {
  title?: string
  showBack?: boolean
  showNotification?: boolean
}

export function Header({
  title,
  showBack = false,
  showNotification = false,
}: HeaderProps) {
  const navigate = useNavigate()
  const { plan } = useUser()

  return (
    <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 text-muted hover:text-slate-200 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <polyline
                points="4,24 10,16 15,20 20,10 28,14"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="10" r="3" fill="#22C55E" />
            </svg>
            <span className="font-bold text-base tracking-tight text-slate-100">
              MarketLens
            </span>
          </div>
        )}
        {title && showBack && (
          <span className="font-semibold text-slate-100 text-base">{title}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {plan !== 'free' && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
            {plan === 'pro' ? 'PRO' : 'STANDARD'}
          </span>
        )}
        {showNotification && (
          <button
            className="p-1.5 text-muted hover:text-slate-200 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        )}
      </div>
    </header>
  )
}
