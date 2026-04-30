import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

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

const SunIcon    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>;
const MoonIcon   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const MonitorIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [desktop, setDesktop] = useState(() => localStorage.getItem('layout-mode') === 'desktop');

  useEffect(() => {
    localStorage.setItem('layout-mode', desktop ? 'desktop' : 'mobile');
  }, [desktop]);

  const handleLogout = () => { logout(); navigate('/auth'); };

  const ThemeToggle = () => (
    <button onClick={toggleTheme} className="btn-ghost px-2.5 py-1.5" title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );

  if (desktop) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* ── Desktop header ── */}
        <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
          <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-6">

            {/* Logo */}
            <Link to="/" className="font-bold text-xl tracking-tight text-text-primary flex-shrink-0">
              Market<span className="text-primary">Lens</span>
            </Link>

            {/* Nav tabs — centered */}
            <nav className="flex-1 flex items-center justify-center gap-1">
              {navItems.map((item) => {
                const active = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-card'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Account section */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ThemeToggle />

              {/* Connected badge */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                  <span className="text-xs text-text-secondary font-medium max-w-[140px] truncate">{user.email}</span>
                  {user.plan === 'premium' && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">PRO</span>
                  )}
                </div>
              )}

              {/* Settings */}
              <Link to="/account" className="btn-ghost px-2.5 py-1.5" title="Paramètres du compte">
                <SettingsIcon />
              </Link>

              {/* Mobile view toggle */}
              <button onClick={() => setDesktop(false)} className="btn-ghost px-2.5 py-1.5" title="Vue mobile">
                <PhoneIcon />
              </button>

              {/* Logout */}
              <button onClick={handleLogout} className="btn-ghost px-2.5 py-1.5 text-danger hover:text-danger hover:bg-danger/10 hover:border-danger/20" title="Déconnexion">
                <LogoutIcon />
              </button>
            </div>
          </div>
        </header>

        {/* Content — full width */}
        <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6">
          <Outlet />
        </main>
      </div>
    );
  }

  // ── Mobile layout ──
  return (
    <div className="flex flex-col min-h-screen pb-[env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight text-text-primary">
            Market<span className="text-primary">Lens</span>
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={() => setDesktop(true)} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5" title="Vue bureau">
              <MonitorIcon />
              Vue bureau
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-40 bg-surface/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex">
          {navItems.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${active ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}
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
