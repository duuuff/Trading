import type { CandleData } from '../types'

// Seeded LCG pseudo-random number generator for deterministic data
function makePrng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function isWeekday(date: Date): boolean {
  const d = date.getDay()
  return d !== 0 && d !== 6
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

interface Waypoint {
  date: string
  price: number
}

function generateCandles(
  waypoints: Waypoint[],
  volatility: number,
  seed: number,
): CandleData[] {
  const rng = makePrng(seed)
  const result: CandleData[] = []

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i]
    const to = waypoints[i + 1]
    const fromDate = new Date(from.date)
    const toDate = new Date(to.date)
    const totalMs = toDate.getTime() - fromDate.getTime()
    const totalDays = totalMs / (1000 * 60 * 60 * 24)

    let prevClose = from.price

    for (let d = 0; d < totalDays; d++) {
      const current = new Date(fromDate.getTime() + d * 24 * 60 * 60 * 1000)
      if (!isWeekday(current)) continue

      const t = d / totalDays
      const trend = from.price + (to.price - from.price) * t
      const noise = (rng() * 2 - 1) * volatility * trend
      const close = Math.max(trend + noise, trend * 0.5)
      const open = prevClose
      const range = Math.abs(close - open)
      const extra = range * (0.1 + rng() * 0.4)
      const high = Math.max(open, close) + extra
      const low = Math.min(open, close) - extra * 0.6

      result.push({
        time: formatDate(current),
        open: +open.toFixed(2),
        high: +high.toFixed(2),
        low: +low.toFixed(2),
        close: +close.toFixed(2),
      })

      prevClose = close
    }
  }

  // Remove duplicate dates (keep last)
  const seen = new Map<string, CandleData>()
  for (const c of result) seen.set(c.time, c)
  return Array.from(seen.values()).sort((a, b) => a.time.localeCompare(b.time))
}

// ── S&P 500 ───────────────────────────────────────────────────────────────────
const spxWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 3244 },
  { date: '2020-02-19', price: 3386 },
  { date: '2020-03-23', price: 2237 },
  { date: '2020-06-08', price: 3232 },
  { date: '2020-09-02', price: 3580 },
  { date: '2020-10-30', price: 3269 },
  { date: '2020-11-09', price: 3572 },
  { date: '2020-12-31', price: 3756 },
  { date: '2021-04-16', price: 4186 },
  { date: '2021-08-27', price: 4509 },
  { date: '2021-11-30', price: 4567 },
  { date: '2021-12-31', price: 4766 },
  { date: '2022-01-03', price: 4797 },
  { date: '2022-02-24', price: 4288 },
  { date: '2022-06-17', price: 3666 },
  { date: '2022-10-13', price: 3584 },
  { date: '2022-12-30', price: 3840 },
  { date: '2023-03-13', price: 3920 },
  { date: '2023-07-27', price: 4582 },
  { date: '2023-10-27', price: 4117 },
  { date: '2023-11-14', price: 4514 },
  { date: '2023-12-29', price: 4769 },
  { date: '2024-03-28', price: 5254 },
  { date: '2024-07-16', price: 5667 },
  { date: '2024-11-06', price: 5929 },
  { date: '2024-12-31', price: 5882 },
]

// ── NASDAQ 100 ────────────────────────────────────────────────────────────────
const ndxWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 8900 },
  { date: '2020-03-23', price: 6860 },
  { date: '2020-09-02', price: 12151 },
  { date: '2020-12-31', price: 12888 },
  { date: '2021-11-22', price: 16765 },
  { date: '2022-01-03', price: 16395 },
  { date: '2022-03-16', price: 13865 },
  { date: '2022-12-28', price: 10939 },
  { date: '2023-07-27', price: 15560 },
  { date: '2023-11-14', price: 15970 },
  { date: '2023-12-29', price: 16825 },
  { date: '2024-07-10', price: 20391 },
  { date: '2024-11-06', price: 21117 },
  { date: '2024-12-31', price: 21780 },
]

// ── CAC 40 ────────────────────────────────────────────────────────────────────
const cacWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 6040 },
  { date: '2020-03-18', price: 3754 },
  { date: '2020-08-17', price: 5148 },
  { date: '2020-12-31', price: 5585 },
  { date: '2021-11-17', price: 7182 },
  { date: '2021-12-31', price: 7153 },
  { date: '2022-02-24', price: 6618 },
  { date: '2022-09-28', price: 5700 },
  { date: '2022-12-30', price: 6474 },
  { date: '2023-04-21', price: 7577 },
  { date: '2023-10-27', price: 6885 },
  { date: '2023-12-29', price: 7543 },
  { date: '2024-06-07', price: 7521 },
  { date: '2024-12-31', price: 7380 },
]

// ── Apple ─────────────────────────────────────────────────────────────────────
const aaplWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 75.1 },
  { date: '2020-03-23', price: 57.2 },
  { date: '2020-09-02', price: 134.2 },
  { date: '2020-12-31', price: 132.7 },
  { date: '2021-01-25', price: 143.2 },
  { date: '2021-09-07', price: 156.7 },
  { date: '2021-12-31', price: 177.6 },
  { date: '2022-01-03', price: 182.0 },
  { date: '2022-06-17', price: 130.1 },
  { date: '2022-12-30', price: 130.0 },
  { date: '2023-07-14', price: 191.0 },
  { date: '2023-11-14', price: 188.0 },
  { date: '2023-12-29', price: 192.5 },
  { date: '2024-06-10', price: 207.2 },
  { date: '2024-12-31', price: 254.0 },
]

// ── Bitcoin ───────────────────────────────────────────────────────────────────
const btcWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 7200 },
  { date: '2020-03-13', price: 4800 },
  { date: '2020-12-31', price: 29000 },
  { date: '2021-04-14', price: 64000 },
  { date: '2021-07-20', price: 29300 },
  { date: '2021-11-10', price: 68000 },
  { date: '2022-06-18', price: 17600 },
  { date: '2022-11-21', price: 15500 },
  { date: '2023-01-14', price: 21000 },
  { date: '2023-11-14', price: 37200 },
  { date: '2024-01-11', price: 46500 },
  { date: '2024-03-14', price: 73000 },
  { date: '2024-09-10', price: 56500 },
  { date: '2024-11-06', price: 76400 },
  { date: '2024-12-31', price: 93000 },
]

// ── Tesla ─────────────────────────────────────────────────────────────────────
const tslaWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 27.2 },
  { date: '2020-03-18', price: 16.1 },
  { date: '2020-11-18', price: 154.0 },
  { date: '2021-01-26', price: 286.3 },
  { date: '2021-11-04', price: 410.0 },
  { date: '2022-12-30', price: 123.2 },
  { date: '2023-07-19', price: 293.3 },
  { date: '2023-12-29', price: 253.2 },
  { date: '2024-04-22', price: 147.1 },
  { date: '2024-11-06', price: 321.2 },
  { date: '2024-12-31', price: 403.8 },
]

// ── Gold ETF ──────────────────────────────────────────────────────────────────
const gldWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 145.7 },
  { date: '2020-08-06', price: 193.5 },
  { date: '2020-12-31', price: 174.1 },
  { date: '2021-12-31', price: 166.2 },
  { date: '2022-03-08', price: 191.4 },
  { date: '2022-10-03', price: 150.2 },
  { date: '2022-12-30', price: 161.0 },
  { date: '2023-12-29', price: 191.2 },
  { date: '2024-03-08', price: 200.0 },
  { date: '2024-10-18', price: 248.0 },
  { date: '2024-12-31', price: 240.0 },
]

// ── LVMH ──────────────────────────────────────────────────────────────────────
const lvmhWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 422.0 },
  { date: '2020-03-18', price: 285.0 },
  { date: '2021-12-31', price: 710.0 },
  { date: '2022-01-03', price: 735.0 },
  { date: '2022-09-30', price: 546.0 },
  { date: '2022-12-30', price: 680.5 },
  { date: '2023-04-21', price: 854.0 },
  { date: '2023-10-31', price: 626.0 },
  { date: '2023-12-29', price: 740.0 },
  { date: '2024-09-10', price: 620.0 },
  { date: '2024-12-31', price: 680.0 },
]

// ── Microsoft ─────────────────────────────────────────────────────────────────
const msftWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 160.2 },
  { date: '2020-03-23', price: 135.5 },
  { date: '2021-12-31', price: 336.3 },
  { date: '2022-12-30', price: 240.2 },
  { date: '2023-07-14', price: 355.0 },
  { date: '2023-11-14', price: 375.0 },
  { date: '2023-12-29', price: 375.5 },
  { date: '2024-07-05', price: 448.0 },
  { date: '2024-12-31', price: 424.0 },
]

// ── Energy ETF ────────────────────────────────────────────────────────────────
const xleWaypoints: Waypoint[] = [
  { date: '2020-01-02', price: 62.0 },
  { date: '2020-04-21', price: 31.5 },
  { date: '2020-12-31', price: 41.2 },
  { date: '2022-06-07', price: 91.2 },
  { date: '2022-07-14', price: 73.0 },
  { date: '2022-12-30', price: 86.5 },
  { date: '2023-12-29', price: 84.2 },
  { date: '2024-10-18', price: 95.0 },
  { date: '2024-12-31', price: 92.0 },
]

export const chartDataMap: Record<string, CandleData[]> = {
  SPX: generateCandles(spxWaypoints, 0.012, 1001),
  NDX: generateCandles(ndxWaypoints, 0.015, 1002),
  CAC: generateCandles(cacWaypoints, 0.013, 1003),
  AAPL: generateCandles(aaplWaypoints, 0.016, 1004),
  BTC: generateCandles(btcWaypoints, 0.04, 1005),
  TSLA: generateCandles(tslaWaypoints, 0.035, 1006),
  GLD: generateCandles(gldWaypoints, 0.008, 1007),
  MC: generateCandles(lvmhWaypoints, 0.014, 1008),
  MSFT: generateCandles(msftWaypoints, 0.015, 1009),
  XLE: generateCandles(xleWaypoints, 0.018, 1010),
}

export function filterByTimeframe(
  data: CandleData[],
  timeframe: string,
): CandleData[] {
  if (timeframe === 'ALL' || !data.length) return data
  const last = new Date(data[data.length - 1].time)
  const cutoff = new Date(last)
  switch (timeframe) {
    case '1M': cutoff.setMonth(cutoff.getMonth() - 1); break
    case '3M': cutoff.setMonth(cutoff.getMonth() - 3); break
    case '6M': cutoff.setMonth(cutoff.getMonth() - 6); break
    case '1Y': cutoff.setFullYear(cutoff.getFullYear() - 1); break
    case '3Y': cutoff.setFullYear(cutoff.getFullYear() - 3); break
    default: return data
  }
  const cutoffStr = formatDate(cutoff)
  return data.filter((c) => c.time >= cutoffStr)
}
