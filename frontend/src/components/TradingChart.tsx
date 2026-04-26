import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  type SeriesMarker,
} from 'lightweight-charts';
import type { Candle, MarketEvent } from '../types';

interface Props {
  candles: Candle[];
  events: MarketEvent[];
  onEventClick: (event: MarketEvent) => void;
}

function candleToData(c: Candle): CandlestickData<Time> {
  return {
    time: c.time as Time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  };
}

function eventToMarker(e: MarketEvent): SeriesMarker<Time> {
  const date = new Date(e.date);
  const time = Math.floor(date.getTime() / 1000) as Time;
  const colorMap = { bullish: '#10b981', bearish: '#ef4444', neutral: '#94a3b8' };
  const shapeMap = { bullish: 'arrowUp', bearish: 'arrowDown', neutral: 'circle' } as const;
  return {
    time,
    position: e.impact === 'bullish' ? 'belowBar' : e.impact === 'bearish' ? 'aboveBar' : 'inBar',
    color: colorMap[e.impact],
    shape: shapeMap[e.impact],
    text: '',
    id: String(e.id),
  };
}

export default function TradingChart({ candles, events, onEventClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; candle: Candle } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a24' },
        textColor: '#94a3b8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#2a2a3a' },
        horzLines: { color: '#2a2a3a' },
      },
      crosshair: {
        vertLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
        horzLine: { color: '#3b82f6', width: 1, style: 2, labelBackgroundColor: '#3b82f6' },
      },
      rightPriceScale: {
        borderColor: '#2a2a3a',
      },
      timeScale: {
        borderColor: '#2a2a3a',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    const data = candles.map(candleToData).sort((a, b) => (a.time as number) - (b.time as number));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  useEffect(() => {
    if (!seriesRef.current) return;
    const markers = events
      .map(eventToMarker)
      .sort((a, b) => (a.time as number) - (b.time as number));
    seriesRef.current.setMarkers(markers);
  }, [events]);

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;

    const handler = (param: { time?: Time; point?: { x: number; y: number } }) => {
      if (!param.time || !param.point) {
        setTooltip(null);
        return;
      }

      const clickedMarker = events.find((e) => {
        const eTime = Math.floor(new Date(e.date).getTime() / 1000);
        return eTime === (param.time as number);
      });

      if (clickedMarker) {
        onEventClick(clickedMarker);
      }
    };

    chart.subscribeClick(handler);
    return () => chart.unsubscribeClick(handler);
  }, [events, onEventClick]);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full" style={{ height: 320 }} />
      {tooltip && (
        <div
          className="absolute z-10 pointer-events-none bg-card border border-border rounded-lg p-2 text-xs shadow-lg"
          style={{ left: tooltip.x + 8, top: tooltip.y - 40 }}
        >
          <p className="font-mono text-success">O {tooltip.candle.open}</p>
          <p className="font-mono text-success">H {tooltip.candle.high}</p>
          <p className="font-mono text-danger">L {tooltip.candle.low}</p>
          <p className="font-mono text-text-primary">C {tooltip.candle.close}</p>
        </div>
      )}
    </div>
  );
}
