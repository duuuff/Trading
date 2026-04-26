export type Plan = 'free' | 'premium';

export interface User {
  id: number;
  email: string;
  plan: Plan;
  created_at: string;
  subscription_count: number;
}

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'index' | 'crypto';
  description: string | null;
  currency: string;
  exchange: string | null;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketEvent {
  id: number;
  asset_id: number;
  date: string;
  title: string;
  description: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  source_url: string | null;
  created_at: string;
}

export interface Subscription {
  id: number;
  symbol: string;
  name: string;
  type: string;
  currency: string;
  created_at: string;
}

export interface NewsItem {
  asset_symbol: string;
  title: string;
  summary: string | null;
  url: string;
  published_at: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}
