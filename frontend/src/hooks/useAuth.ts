import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const u = await api.account.me();
      setUser(u);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { token } = await api.auth.login(email, password);
    localStorage.setItem('token', token);
    await fetchUser();
  };

  const register = async (email: string, password: string) => {
    const { token } = await api.auth.register(email, password);
    localStorage.setItem('token', token);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refresh = fetchUser;

  return { user, loading, login, register, logout, refresh };
}
