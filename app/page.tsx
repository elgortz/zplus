"use client";

import TradingChart from '@/components/TradingChart';
import OrderBook from '@/components/OrderBook';
import TradingPanel from '@/components/TradingPanel';
import TransactionHistory from '@/components/TransactionHistory';
import { useMarketData } from '@/components/hooks/useMarketData';
import { ClientWalletButton } from '@/components/ClientWalletButton';
import OnRampModal from '@/components/OnRampModal';

const UP = '#12a86d';
const DOWN = '#f6465d';

export default function DashboardPage() {
  // Satu sumber data untuk seluruh halaman (satu polling saja)
  const { data, bids, asks, lastPrice, prevPrice, loading } = useMarketData();

  const bestBid = bids[0]?.price;
  const bestAsk = asks[0]?.price;
  const up = prevPrice !== null && lastPrice !== null && lastPrice >= prevPrice;

  return (
    <main className="flex min-h-screen flex-col bg-[#0b0e11] text-gray-200">

      {/* Bar navigasi atas */}
      <header className="flex items-center justify-between border-b border-[#1e2530] px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">Z+</span>
          <span className="text-sm font-semibold">SOL/USDC</span>
          <span className="rounded bg-[#1e2530] px-1.5 py-0.5 text-[10px] text-gray-400">
            Phoenix · Solana
          </span>
        </div>
        <div className="flex items-center gap-2">
          <OnRampModal />
          <ClientWalletButton />
        </div>
      </header>

      {/* Strip ticker */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-1 border-b border-[#1e2530] px-4 py-2">
        <span
          className="text-xl font-bold tabular-nums"
          style={{ color: lastPrice !== null ? (up ? UP : DOWN) : undefined }}
        >
          {lastPrice !== null ? lastPrice.toFixed(3) : '—'}
        </span>
        <div className="text-xs">
          <div className="text-gray-500">Bid terbaik</div>
          <div className="tabular-nums" style={{ color: UP }}>
            {bestBid !== undefined ? bestBid.toFixed(3) : '—'}
          </div>
        </div>
        <div className="text-xs">
          <div className="text-gray-500">Ask terbaik</div>
          <div className="tabular-nums" style={{ color: DOWN }}>
            {bestAsk !== undefined ? bestAsk.toFixed(3) : '—'}
          </div>
        </div>
        <div className="text-xs">
          <div className="text-gray-500">Spread</div>
          <div className="tabular-nums text-gray-300">
            {bestBid !== undefined && bestAsk !== undefined ? (bestAsk - bestBid).toFixed(3) : '—'}
          </div>
        </div>
        {!loading && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: UP }} />
            Data live · refresh 5 detik
          </span>
        )}
      </div>

      {/* Area trading utama */}
      <div className="flex flex-1 flex-col gap-2 p-2 lg:flex-row">
        <div className="min-h-[420px] flex-1 overflow-hidden rounded-md border border-[#1e2530] bg-[#12161c]">
          <TradingChart data={data} loading={loading} />
        </div>

        <div className="w-full shrink-0 lg:w-[300px]">
          <OrderBook bids={bids} asks={asks} lastPrice={lastPrice} prevPrice={prevPrice} />
        </div>

        <div className="w-full shrink-0 lg:w-[280px]">
          <TradingPanel lastPrice={lastPrice} />
        </div>
      </div>

      {/* Riwayat transaksi */}
      <div className="p-2 pt-0">
        <TransactionHistory />
      </div>

    </main>
  );
}
