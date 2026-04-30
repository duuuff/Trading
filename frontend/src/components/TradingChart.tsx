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
import { useTheme } from '../hooks/useTheme';
import type { Candle, MarketEvent } from '../types';

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

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
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const bg         = cssVar('--chart-bg');
    const grid       = cssVar('--chart-grid');
    const borderCol  = cssVar('--chart-border');
    const textCol    = cssVar('--chart-text');
    const line       = cssVar('--chart-line');
    const areaTop    = cssVar('--chart-area-top');
    const areaBot    = cssVar('--chart-area-bottom');
    const crosshair  = cssVar('--chart-crosshair');

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bg },
        textColor: textCol,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      crosshair: {
        vertLine: { color: crosshair, width: 1, style: 2, labelBackgroundColor: crosshair },
        horzLine: { color: crosshair, width: 1, style: 2, labelBackgroundColor: crosshair },
      },
      rightPriceScale: { borderColor: borderCol },
      timeScale: { borderColor: borderCol, timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addAreaSeries({
      lineColor: line,
      topColor: areaTop,
      bottomColor: areaBot,
      lineWidth: 2,
      lineType: LineType.Curved,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: line,
      crosshairMarkerBackgroundColor: bg,
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
    if (!chartRef.current || !seriesRef.current) return;
    const bg        = cssVar('--chart-bg');
    const grid      = cssVar('--chart-grid');
    const borderCol = cssVar('--chart-border');
    const textCol   = cssVar('--chart-text');
    const line      = cssVar('--chart-line');
    const areaTop   = cssVar('--chart-area-top');
    const areaBot   = cssVar('--chart-area-bottom');
    const crosshair = cssVar('--chart-crosshair');
    chartRef.current.applyOptions({
      layout: { background: { type: ColorType.Solid, color: bg }, textColor: textCol },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      crosshair: {
        vertLine: { color: crosshair, labelBackgroundColor: crosshair },
        horzLine: { color: crosshair, labelBackgroundColor: crosshair },
      },
      rightPriceScale: { borderColor: borderCol },
      timeScale: { borderColor: borderCol },
    });
    seriesRef.current.applyOptions({
      lineColor: line,
      topColor: areaTop,
      bottomColor: areaBot,
      crosshairMarkerBorderColor: line,
      crosshairMarkerBackgroundColor: bg,
    });
  }, [theme]);

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
