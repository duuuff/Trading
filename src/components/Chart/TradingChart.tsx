import { useEffect, useRef, useCallback } from 'react'
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type Time,
  type CandlestickData,
} from 'lightweight-charts'
import type { MarketEvent } from '../../types'
import { filterByTimeframe } from '../../data/chartData'
import type { CandleData, Timeframe } from '../../types'

interface TradingChartProps {
  data: CandleData[]
  events: MarketEvent[]
  timeframe: Timeframe
  onEventClick: (event: MarketEvent) => void
}

function nearestTradingDay(targetDate: string, data: CandleData[]): string | null {
  if (!data.length) return null
  const times = data.map((c) => c.time)
  if (times.includes(targetDate)) return targetDate
  const target = new Date(targetDate).getTime()
  let best = times[0]
  let bestDiff = Math.abs(new Date(times[0]).getTime() - target)
  for (const t of times) {
    const diff = Math.abs(new Date(t).getTime() - target)
    if (diff < bestDiff) {
      bestDiff = diff
      best = t
    }
  }
  return best
}

export function TradingChart({
  data,
  events,
  timeframe,
  onEventClick,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const eventsRef = useRef<MarketEvent[]>(events)
  eventsRef.current = events

  const filtered = filterByTimeframe(data, timeframe)

  const handleClick = useCallback(
    (param: { time?: Time }) => {
      if (!param.time) return
      const clickedTime = param.time as string
      const clickedMs = new Date(clickedTime).getTime()
      const WINDOW_MS = 8 * 24 * 60 * 60 * 1000

      // Find nearest event within window
      let nearest: MarketEvent | null = null
      let nearestDiff = Infinity
      for (const ev of eventsRef.current) {
        const diff = Math.abs(new Date(ev.date).getTime() - clickedMs)
        if (diff < WINDOW_MS && diff < nearestDiff) {
          nearestDiff = diff
          nearest = ev
        }
      }
      if (nearest) onEventClick(nearest)
    },
    [onEventClick],
  )

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: '#080D1A' },
        textColor: '#64748B',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1B2B4B' },
        horzLines: { color: '#1B2B4B' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#3B82F6', labelBackgroundColor: '#3B82F6' },
        horzLine: { color: '#3B82F6', labelBackgroundColor: '#3B82F6' },
      },
      rightPriceScale: {
        borderColor: '#1B2B4B',
        textColor: '#64748B',
      },
      timeScale: {
        borderColor: '#1B2B4B',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderDownColor: '#EF4444',
      borderUpColor: '#22C55E',
      wickDownColor: '#EF4444',
      wickUpColor: '#22C55E',
    })

    chartRef.current = chart
    seriesRef.current = candleSeries

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        chart.applyOptions({ width: entry.contentRect.width })
      }
    })
    resizeObserver.observe(containerRef.current)

    chart.subscribeClick(handleClick)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [handleClick])

  // Update data and markers when filtered data or events change
  useEffect(() => {
    const series = seriesRef.current
    if (!series || !filtered.length) return

    series.setData(filtered as CandlestickData<Time>[])

    // Build markers only for events within the displayed range
    const rangeStart = filtered[0].time
    const rangeEnd = filtered[filtered.length - 1].time

    const markers: SeriesMarker<Time>[] = []
    for (const ev of events) {
      if (ev.date < rangeStart || ev.date > rangeEnd) continue
      const snapDate = nearestTradingDay(ev.date, filtered)
      if (!snapDate) continue
      markers.push({
        time: snapDate as Time,
        position: ev.impact === 'negative' ? 'aboveBar' : 'belowBar',
        color:
          ev.impact === 'negative'
            ? '#EF4444'
            : ev.impact === 'positive'
              ? '#22C55E'
              : '#F59E0B',
        shape: ev.impact === 'negative' ? 'arrowDown' : 'arrowUp',
        text: ev.shortLabel,
        size: 1,
      })
    }

    // Sort markers by time (required by lightweight-charts)
    markers.sort((a, b) => (a.time as string).localeCompare(b.time as string))
    series.setMarkers(markers)

    chartRef.current?.timeScale().fitContent()
  }, [filtered, events])

  return <div ref={containerRef} className="w-full" style={{ height: 300 }} />
}
