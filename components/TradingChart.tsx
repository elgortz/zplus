"use client";

import { useEffect, useRef } from 'react';
import type { Candle } from './hooks/useMarketData';

const UP = '#12a86d';
const DOWN = '#f6465d';

export default function TradingChart({ data, loading }: { data: Candle[]; loading: boolean }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null); // Menyimpan instance chart agar tidak terbuat ulang
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Inisialisasi Chart HANYA SEKALI
    if (!chartRef.current) {
      import('lightweight-charts').then(({ createChart, CandlestickSeries, ColorType }) => {
        if (!chartContainerRef.current) return;
        const chart = createChart(chartContainerRef.current, {
          autoSize: true,
          layout: {
            background: { type: ColorType.Solid, color: '#12161c' },
            textColor: '#8a94a6',
          },
          grid: {
            vertLines: { color: '#1e2530' },
            horzLines: { color: '#1e2530' },
          },
          timeScale: {
            borderColor: '#1e2530',
            timeVisible: true,
            secondsVisible: false,
          },
          rightPriceScale: { borderColor: '#1e2530' },
        });

        seriesRef.current = chart.addSeries(CandlestickSeries, {
          upColor: UP,
          downColor: DOWN,
          borderUpColor: UP,
          borderDownColor: DOWN,
          wickUpColor: UP,
          wickDownColor: DOWN,
        });
        chartRef.current = chart;
      });
    }

    // 2. Update Data jika chart sudah siap
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  useEffect(() => () => {
    chartRef.current?.remove();
    chartRef.current = null;
    seriesRef.current = null;
  }, []);

  return (
    <div className="relative h-full min-h-[420px]">
      {loading && data.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          Memuat data dari blockchain...
        </p>
      )}
      <div ref={chartContainerRef} className="h-full w-full" />
    </div>
  );
}
