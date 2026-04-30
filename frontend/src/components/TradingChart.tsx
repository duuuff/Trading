import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  LineType,
  type IChartApi,
  type ISeriesApi,
  type AreaData,
  type Time,
  type SeriesMarker,
} from 'lightweight-charts';
import type { Candle, MarketEvent } from '../types';

interface Props {
  candles: Candle[];
  events: MarketEvent[];
  onEventClick: (event: MarketEvent) => void;
}

function candleToData(c: Candle): AreaData<Time> {
  return { time: c.time as Time, value: c.close };
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
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#07070f' },
        textColor: '#94a3b8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1e1e2e' },
        horzLines: { color: '#1e1e2e' },
      },
      crosshair: {
        vertLine: { color: '#6366f1', width: 1, style: 2, labelBackgroundColor: '#6366f1' },
        horzLine: { color: '#6366f1', width: 1, style: 2, labelBackgroundColor: '#6366f1' },
      },
      rightPriceScale: {
        borderColor: '#252535',
      },
      timeScale: {
        borderColor: '#252535',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addAreaSeries({
      lineColor: '#6366f1',
      topColor: 'rgba(99, 102, 241, 0.15)',
      bottomColor: 'rgba(59, 130, 246, 0.0)',
      lineWidth: 2,
      lineType: LineType.Curved,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#6366f1',
      crosshairMarkerBackgroundColor: '#07070f',
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
      if (!param.time || !param.point) return;
      const clickedMarker = events.find((e) => {
        const eTime = Math.floor(new Date(e.date).getTime() / 1000);
        return eTime === (param.time as number);
      });
      if (clickedMarker) onEventClick(clickedMarker);
    };

    chart.subscribeClick(handler);
    return () => chart.unsubscribeClick(handler);
  }, [events, onEventClick]);

  return <div ref={containerRef} className="w-full" style={{ height: 320 }} />;
}
