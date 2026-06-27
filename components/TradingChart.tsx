"use client";

import { useEffect, useRef } from 'react';
import { useMarketData } from './hooks/useMarketData';

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null); // Menyimpan instance chart agar tidak terbuat ulang
  const seriesRef = useRef<any>(null);
  const { data, loading } = useMarketData();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. Inisialisasi Chart HANYA SEKALI
    if (!chartRef.current) {
      import('lightweight-charts').then(({ createChart }) => {
        chartRef.current = createChart(chartContainerRef.current!, {
          width: chartContainerRef.current!.clientWidth,
          height: 350,
          layout: { background: { color: '#131722' }, textColor: '#d1d5db' },
        });

        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
        });
      });
    }

    // 2. Update Data jika chart sudah siap
    if (seriesRef.current && data.length > 0) {
      // Pastikan semua data adalah angka valid (mencegah 'Value is undefined')
      const sanitizedData = data.map((d) => ({
        time: d.time,
        open: Number(d.open) || 0,
        high: Number(d.high) || 0,
        low: Number(d.low) || 0,
        close: Number(d.close) || 0,
      }));
      
      seriesRef.current.setData(sanitizedData);
    }
  }, [data]); // useEffect ini jalan setiap kali 'data' berubah

  return (
    <div className="p-4 bg-[#131722] rounded-lg">
      {loading && data.length === 0 ? (
        <p className="text-white">Memuat data dari Blockchain...</p>
      ) : (
        <div ref={chartContainerRef} className="w-full h-[350px]" />
      )}
    </div>
  );
}