import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Accueil', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
  { to: '/assets', label: 'Actifs', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/news', label: 'Actualités', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { to: '/account', label: 'Compte', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const MonitorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

export default function Layout() {
  const location = useLocation();
  const [desktop, setDesktop] = useState(() => localStorage.getItem('layout-mode') === 'desktop');

  useEffect(() => {
    localStorage.setItem('layout-mode', desktop ? 'desktop' : 'mobile');
  }, [desktop]);

  if (desktop) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
          <div className="px-6 h-14 flex items-center justify-between">
            <span className="font-semibold text-lg tracking-tight text-text-primary">
              Market<span className="text-primary">Lens</span>
            </span>
            <button
              onClick={() => setDesktop(false)}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
              title="Passer en vue mobile"
            >
              <PhoneIcon />
              Vue mobile
            </button>
          </div>
        </header>

        {/* Body: sidebar + content */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-surface/40 border-r border-border flex flex-col gap-0.5 p-3">
            {navItems.map((item) => {
              const active = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-muted hover:text-text-primary hover:bg-card'
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </NavLink>
              );
            })}
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-5xl">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="flex flex-col min-h-screen pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight text-text-primary">
            Market<span className="text-primary">Lens</span>
          </span>
          <button
            onClick={() => setDesktop(true)}
            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="Passer en vue bureau"
          >
            <MonitorIcon />
            Vue bureau
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
