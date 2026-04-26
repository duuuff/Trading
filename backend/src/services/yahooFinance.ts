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
    '3m': { range: '3mo', interval: '1d' },
    '6m': { range: '6mo', interval: '1d' },
    '1y': { range: '1y', interval: '1d' },
    '2y': { range: '2y', interval: '1wk' },
    '5y': { range: '5y', interval: '1wk' },
  };
  const { range, interval } = rangeMap[period] ?? rangeMap['1y'];

  const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  const res = await fetch(url, { headers: DEFAULT_HEADERS });
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

export async function fetchNews(symbol: string): Promise<YFNewsItem[]> {
  const url = `${YF_BASE}/v1/finance/search?q=${encodeURIComponent(symbol)}&newsCount=5&quotesCount=0`;

  const res = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!res.ok) throw new Error(`Yahoo Finance news HTTP ${res.status}`);

  const data = (await res.json()) as YFSearchResponse;
  return data.news ?? [];
}
