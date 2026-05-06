export type AssetType = 'stock' | 'etf' | 'index' | 'crypto'
export type Country = 'US' | 'EU' | 'FR' | 'WORLD' | 'CRYPTO'
export type Currency = 'USD' | 'EUR'
export type ImpactLevel = 'positive' | 'negative' | 'neutral'
export type Severity = 1 | 2 | 3
export type EventCategory =
  | 'geopolitical'
  | 'monetary'
  | 'economic'
  | 'corporate'
  | 'health'
  | 'tech'
  | 'political'
export type Sentiment = 'positive' | 'negative' | 'neutral'
export type PotentialImpact = 'high' | 'medium' | 'low'
export type UserPlan = 'free' | 'standard' | 'pro'
export type Timeframe = '1M' | '3M' | '6M' | '1Y' | '3Y' | 'ALL'

export interface Asset {
  id: string
  symbol: string
  name: string
  type: AssetType
  country: Country
  currency: Currency
  description: string
  isPremium: boolean
  sector?: string
}

export interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
}

export interface MarketEvent {
  id: string
  date: string
  shortLabel: string
  title: string
  category: EventCategory
  impact: ImpactLevel
  severity: Severity
  affectedAssets: string[]
  variation: number
  summary: string
  isPremium: boolean
}

export interface NewsItem {
  id: string
  assetId: string
  date: string
  title: string
  summary: string
  source: string
  sentiment: Sentiment
  potentialImpact: PotentialImpact
  isPremium: boolean
}

export interface UserState {
  plan: UserPlan
  watchlist: string[]
}

export interface PricingPlan {
  id: UserPlan
  name: string
  price: number
  period: string
  features: string[]
  highlighted: boolean
}
