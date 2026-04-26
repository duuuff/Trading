import type { Asset, Candle, MarketEvent, Subscription, NewsItem, User } from '../types';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function headers(auth = false): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur réseau');
  return data as T;
}

// Auth
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; plan: string }>('/auth/login', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string) =>
      request<{ token: string; plan: string }>('/auth/register', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
      }),
  },

  account: {
    me: () => request<User>('/account/me', { headers: headers(true) }),
    upgrade: () =>
      request<{ token: string; plan: string; message: string }>('/account/upgrade', {
        method: 'POST',
        headers: headers(true),
      }),
  },

  assets: {
    list: (params?: { type?: string; q?: string }) => {
      const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
      return request<Asset[]>(`/assets${qs}`, { headers: headers(true) });
    },
    get: (symbol: string) => request<Asset>(`/assets/${symbol}`, { headers: headers(true) }),
    chart: (symbol: string, period = '1y') =>
      request<{ symbol: string; candles: Candle[] }>(`/assets/${symbol}/chart?period=${period}`, { headers: headers(true) }),
    events: (symbol: string) => request<MarketEvent[]>(`/assets/${symbol}/events`, { headers: headers(true) }),
    createEvent: (symbol: string, data: Partial<MarketEvent>) =>
      request<MarketEvent>(`/assets/${symbol}/events`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify(data),
      }),
  },

  subscriptions: {
    list: () => request<Subscription[]>('/subscriptions', { headers: headers(true) }),
    add: (symbol: string) =>
      request<{ message: string }>('/subscriptions', {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ symbol }),
      }),
    remove: (symbol: string) =>
      request<{ message: string }>(`/subscriptions/${symbol}`, {
        method: 'DELETE',
        headers: headers(true),
      }),
  },

  news: {
    list: () => request<NewsItem[]>('/news', { headers: headers(true) }),
  },
};
