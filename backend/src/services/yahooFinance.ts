const YF_BASE = 'https://query1.finance.yahoo.com';

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0',
  'Accept': 'application/json',
};

export interface YFCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface YFNewsItem {
  title: string;
  link: string;
  providerPublishTime: number;
}

interface YFChartResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
    }>;
    error: unknown;
  };
}

interface YFSearchResponse {
  news: Array<{
    title: string;
    link: string;
    providerPublishTime: number;
  }>;
}

export async function fetchChart(symbol: string, period: string): Promise<YFCandle[]> {
  const rangeMap: Record<string, { range: string; interval: string }> = {
    '1m': { range: '1mo', interval: '1d' },
    '3m': { range: '3mo', interval: '1d' },
    '6m': { range: '6mo', interval: '1d' },
    '1y': { range: '1y',  interval: '1d' },
    '2y': { range: '2y',  interval: '1wk' },
    '5y': { range: '5y',  interval: '1wk' },
  };
  const { range, interval } = rangeMap[period] ?? rangeMap['1y'];

  const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let res: Response;
  try {
    res = await fetch(url, { headers: DEFAULT_HEADERS, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`Yahoo Finance HTTP ${res.status}`);

  const data = (await res.json()) as YFChartResponse;
  if (data.chart.error) throw new Error('Yahoo Finance error');

  const result = data.chart.result?.[0];
  if (!result) throw new Error('No data returned');

  const timestamps = result.timestamp;
  const quote = result.indicators.quote[0];

  const candles: YFCandle[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const o = quote.open[i];
    const h = quote.high[i];
    const l = quote.low[i];
    const c = quote.close[i];
    if (o == null || h == null || l == null || c == null) continue;
    candles.push({
      time: timestamps[i],
      open: Number(o.toFixed(4)),
      high: Number(h.toFixed(4)),
      low: Number(l.toFixed(4)),
      close: Number(c.toFixed(4)),
      volume: quote.volume[i] ?? 0,
    });
  }
  return candles;
}

// ── Quotes (current prices for multiple symbols) ──────────────────────

export interface YFQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
}

interface YFQuoteResponse {
  quoteResponse: { result: YFQuote[]; error: unknown };
}

export async function fetchQuotes(symbols: string[]): Promise<Map<string, YFQuote>> {
  if (symbols.length === 0) return new Map();
  const url = `${YF_BASE}/v7/finance/quote?symbols=${symbols.map(encodeURIComponent).join(',')}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let res: Response;
  try {
    res = await fetch(url, { headers: DEFAULT_HEADERS, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`Yahoo Finance quotes HTTP ${res.status}`);

  const data = (await res.json()) as YFQuoteResponse;
  const result = new Map<string, YFQuote>();
  for (const q of data.quoteResponse?.result ?? []) {
    result.set(q.symbol.toUpperCase(), q);
  }
  return result;
}

// ── Sparkline (last 30 daily closes) ──────────────────────────────────

export async function fetchSparkline(symbol: string): Promise<number[]> {
  try {
    const candles = await fetchChart(symbol, '1m');
    return candles.slice(-30).map(c => c.close);
  } catch {
    return [];
  }
}

export async function fetchNews(symbol: string): Promise<YFNewsItem[]> {
  const url = `${YF_BASE}/v1/finance/search?q=${encodeURIComponent(symbol)}&newsCount=5&quotesCount=0`;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  let res: Response;
  try {
    res = await fetch(url, { headers: DEFAULT_HEADERS, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
  if (!res.ok) throw new Error(`Yahoo Finance news HTTP ${res.status}`);

  const data = (await res.json()) as YFSearchResponse;
  return data.news ?? [];
}
