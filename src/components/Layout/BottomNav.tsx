import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, Newspaper, User } from 'lucide-react'

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/explorer', icon: Search, label: 'Explorer' },
  { to: '/actualites', icon: Newspaper, label: 'Actualités' },
  { to: '/compte', icon: User, label: 'Compte' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border safe-bottom">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 pt-3 gap-0.5 transition-colors duration-150 ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            <Icon size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
