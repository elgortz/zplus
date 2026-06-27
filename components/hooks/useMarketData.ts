"use client";

import { useState, useEffect } from 'react';
import { getMarketDataAction } from '@/app/actions';

export function useMarketData() {
  const [marketInfo, setMarketInfo] = useState({ 
    data: [], 
    bids: [], 
    asks: [], 
    loading: true 
  });

  useEffect(() => {
    const fetchData = async () => {
      const result = await getMarketDataAction();
      if (result.success) {
        setMarketInfo({
          data: [{ 
            time: new Date().toISOString().split('T')[0], 
            open: result.price - 1, 
            high: result.price + 1, 
            low: result.price - 2, 
            close: result.price 
          }],
          bids: result.bids || [], // Default ke array kosong jika tidak ada
          asks: result.asks || [], // Default ke array kosong jika tidak ada
          loading: false
        });
      } else {
        setMarketInfo(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return marketInfo;
}