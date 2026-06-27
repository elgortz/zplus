"use client";

import TradingChart from '@/components/TradingChart';
import OrderBook from '@/components/OrderBook';
import { useMarketData } from '@/components/hooks/useMarketData';
import { ClientWalletButton } from '@/components/ClientWalletButton';
// 1. Import komponen baru
import TradingPanel from '@/components/TradingPanel';

export default function DashboardPage() {
  const { bids, asks } = useMarketData(); 
  
  return (
    <main className="min-h-screen bg-gray-900 p-10">
      
      <header className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-lg">
        <h1 className="text-white text-xl font-bold">SOL/USDC Trading Terminal</h1>
        <ClientWalletButton />
      </header>

      <div className="flex gap-4">
        <div className="flex-1">
          <TradingChart />
        </div>
        
        {/* 2. Susun panel di samping Order Book */}
        <div className="flex flex-col gap-4">
          <TradingPanel />
          <OrderBook bids={bids} asks={asks} />
        </div>
      </div>
      
    </main>
  );
}