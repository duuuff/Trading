import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

const PREMIUM_FEATURES = [
  'Actifs illimités à suivre',
  'Création d\'événements personnalisés',
  'Alertes sur nouveaux événements',
  'Analyses multi-actifs',
];

const FREE_FEATURES = [
  '3 actifs suivis',
  'Graphiques avec événements',
  'Actualités de vos actifs',
];

export default function AccountPage() {
  const { user: authUser, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.account.me().then(setUser).catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const { token } = await api.account.upgrade();
      localStorage.setItem('token', token);
      await refresh();
      const u = await api.account.me();
      setUser(u);
      showToast('Bienvenue dans MarketLens Premium !');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setUpgrading(false);
    }
  };

  const isPremium = authUser?.plan === 'premium';

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-success text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* User card */}
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-base">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.email}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full border ${
              isPremium
                ? 'bg-warning/10 text-warning border-warning/20'
                : 'bg-surface text-text-muted border-border'
            }`}>
              {isPremium ? '★ Premium' : 'Plan gratuit'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-text-primary">{user?.subscription_count ?? 0}</p>
            <p className="text-xs text-text-muted mt-0.5">Actifs suivis</p>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-text-primary">{isPremium ? '∞' : '3'}</p>
            <p className="text-xs text-text-muted mt-0.5">Limite</p>
          </div>
        </div>
      </div>

      {/* Premium upsell */}
      {!isPremium && (
        <div className="card p-5 border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-text-primary">MarketLens Premium</h3>
              <p className="text-xs text-text-secondary mt-0.5">Débloquez tout le potentiel de l'app</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-xl font-bold text-primary leading-none">9,99€</p>
              <p className="text-[10px] text-text-muted">/mois</p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-surface rounded-xl p-3">
              <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">Gratuit</p>
              <ul className="space-y-1.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <svg className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Premium</p>
              <ul className="space-y-1.5">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <svg className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button onClick={handleUpgrade} disabled={upgrading} className="btn-primary w-full">
            {upgrading ? 'Traitement…' : 'Passer à Premium — 9,99€/mois'}
          </button>
          <p className="text-[10px] text-text-muted text-center mt-2">Annulable à tout moment · Paiement sécurisé</p>
        </div>
      )}

      {/* Premium confirmation */}
      {isPremium && (
        <div className="card p-4 border-warning/20 bg-warning/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
              <span className="text-warning text-base">★</span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Abonné Premium</p>
              <p className="text-xs text-text-secondary mt-0.5">Toutes les fonctionnalités sont débloquées.</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout} className="btn-danger w-full mt-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Se déconnecter
      </button>
    </div>
  );
}
