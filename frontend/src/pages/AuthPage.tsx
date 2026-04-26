import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const features = [
  { icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z', label: 'Graphiques' },
  { icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label: 'Événements' },
  { icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', label: 'Actualités' },
];

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm">
        {/* Logo + pitch */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Market<span className="text-primary">Lens</span>
          </h1>
          <p className="text-text-secondary text-sm mt-2 leading-relaxed">
            Comprenez les marchés en associant<br />événements réels et variations de cours
          </p>

          {/* Feature pills */}
          <div className="flex justify-center gap-3 mt-5">
            {features.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <span className="text-[10px] text-text-muted">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Mot de passe</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="text-danger text-xs bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer un compte gratuit'}
            </button>
          </form>

          {mode === 'register' && (
            <p className="text-xs text-text-muted mt-4 text-center">
              Gratuit — 3 actifs inclus. Premium à 9,99€/mois pour tout débloquer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
