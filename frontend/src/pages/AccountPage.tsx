import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

export default function AccountPage() {
  const { user: authUser, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    api.account.me().then(setUser).catch(() => {});
  }, []);

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
      setUpgraded(true);
      const u = await api.account.me();
      setUser(u);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setUpgrading(false);
    }
  };

  const isPremium = authUser?.plan === 'premium';

  return (
    <div className="px-4 py-5 space-y-4">
      <h2 className="text-lg font-semibold">Mon compte</h2>

      {/* User info */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`badge border ${isPremium ? 'bg-warning/10 text-warning border-warning/20' : 'bg-surface text-text-muted border-border'}`}>
                {isPremium ? '★ Premium' : 'Free'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
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

      {/* Pricing */}
      {!isPremium && !upgraded && (
        <div className="card p-5 border-primary/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-text-primary">MarketLens Premium</h3>
              <p className="text-text-secondary text-sm mt-0.5">Passez au niveau supérieur</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">9,99€</p>
              <p className="text-xs text-text-muted">/mois</p>
            </div>
          </div>
          <ul className="space-y-2 mb-5">
            {[
              'Actifs illimités à suivre',
              'Alertes sur nouveaux événements',
              'Ajout d\'événements personnalisés',
              'Analyses multi-actifs',
              'Accès prioritaire aux nouvelles fonctions',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <button onClick={handleUpgrade} disabled={upgrading} className="btn-primary w-full">
            {upgrading ? 'Traitement…' : 'Passer à Premium — 9,99€/mois'}
          </button>
          <p className="text-xs text-text-muted text-center mt-2">Annulable à tout moment</p>
        </div>
      )}

      {(isPremium || upgraded) && (
        <div className="card p-4 border-warning/20 bg-warning/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">★</span>
            <div>
              <p className="font-medium text-text-primary">Abonné Premium</p>
              <p className="text-sm text-text-secondary">Merci pour votre soutien !</p>
            </div>
          </div>
        </div>
      )}

      {/* Free plan info */}
      {!isPremium && !upgraded && (
        <div className="card p-4">
          <h4 className="text-sm font-medium text-text-primary mb-2">Plan gratuit</h4>
          <ul className="space-y-1.5 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              3 actifs suivis
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Graphiques & événements
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Actualités de vos actifs
            </li>
          </ul>
        </div>
      )}

      {/* Logout */}
      <button onClick={handleLogout} className="btn-danger w-full">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Se déconnecter
      </button>
    </div>
  );
}
