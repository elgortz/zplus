"use client";

import { useEffect, useRef, useState } from 'react';
import { getMarketDataAction } from '@/app/actions';

export type Candle = {
  time: number; // UTCTimestamp (detik)
  open: number;
  high: number;
  low: number;
  close: number;
};

export type OrderLevel = {
  price: number;
  size: number;
};

type MarketInfo = {
  data: Candle[];
  bids: OrderLevel[];
  asks: OrderLevel[];
  lastPrice: number | null;
  prevPrice: number | null;
  loading: boolean;
};

const CANDLE_INTERVAL = 60; // 1 candle per menit
const MAX_CANDLES = 180;

export function useMarketData() {
  const [marketInfo, setMarketInfo] = useState<MarketInfo>({
    data: [],
    bids: [],
    asks: [],
    lastPrice: null,
    prevPrice: null,
    loading: true
  });
  const candlesRef = useRef<Candle[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const result = await getMarketDataAction();
      if (cancelled || !result.success) {
        if (!cancelled) setMarketInfo(prev => ({ ...prev, loading: false }));
        return;
      }

      // Harga tengah dari bid/ask terbaik; candle dibangun dari sampel polling
      const bestBid = result.bids[0]?.price;
      const bestAsk = result.asks[0]?.price;
      const mid = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : result.price;

      const bucket = Math.floor(Date.now() / 1000 / CANDLE_INTERVAL) * CANDLE_INTERVAL;
      const candles = candlesRef.current;
      const last = candles[candles.length - 1];
      if (last && last.time === bucket) {
        last.high = Math.max(last.high, mid);
        last.low = Math.min(last.low, mid);
        last.close = mid;
      } else {
        candles.push({ time: bucket, open: mid, high: mid, low: mid, close: mid });
        if (candles.length > MAX_CANDLES) candles.shift();
      }

      setMarketInfo(prev => ({
        data: [...candles],
        bids: result.bids || [],
        asks: result.asks || [],
        lastPrice: mid,
        prevPrice: prev.lastPrice,
        loading: false
      }));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return marketInfo;
}
