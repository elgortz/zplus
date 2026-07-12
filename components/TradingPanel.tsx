"use client";

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'react-hot-toast';

const UP = '#12a86d';
const DOWN = '#f6465d';

export default function TradingPanel({ lastPrice }: { lastPrice: number | null }) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('0.1');

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // Prefill harga dengan harga pasar begitu tersedia (sekali saja)
  useEffect(() => {
    if (price === '' && lastPrice !== null) setPrice(lastPrice.toFixed(3));
  }, [lastPrice, price]);

  const total = Number(price) * Number(amount);
  const accent = side === 'BUY' ? UP : DOWN;

  const handleTransaction = async () => {
    if (!publicKey) {
      toast.error("Harap hubungkan wallet Anda terlebih dahulu!");
      return;
    }

    try {
      toast.loading(`Memproses order ${side}...`);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: Number(amount) * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);

      toast.dismiss();
      toast.success(`Transaksi ${side} berhasil!`);
      console.log("Signature:", signature);

    } catch (error: any) {
      toast.dismiss();
      console.error(error);
      // Menangani error jika user membatalkan di Phantom
      if (error.code === 4001) {
        toast.error("Transaksi dibatalkan oleh pengguna.");
      } else {
        toast.error("Transaksi gagal.");
      }
    }
  };

  return (
    <div className="flex flex-col rounded-md border border-[#1e2530] bg-[#12161c]">
      {/* Tab Buy / Sell */}
      <div className="grid grid-cols-2 border-b border-[#1e2530] text-sm font-semibold">
        <button
          onClick={() => setSide('BUY')}
          className={`py-2.5 transition ${side === 'BUY' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          style={side === 'BUY' ? { backgroundColor: UP } : undefined}
        >
          Beli
        </button>
        <button
          onClick={() => setSide('SELL')}
          className={`py-2.5 transition ${side === 'SELL' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          style={side === 'SELL' ? { backgroundColor: DOWN } : undefined}
        >
          Jual
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[11px] text-gray-500">Harga (USDC)</label>
            {lastPrice !== null && (
              <button
                onClick={() => setPrice(lastPrice.toFixed(3))}
                className="text-[11px] text-gray-400 underline decoration-dotted hover:text-gray-200"
              >
                Pakai harga pasar
              </button>
            )}
          </div>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded border border-[#2b3442] bg-[#0b0e11] p-2 text-sm tabular-nums text-white outline-none focus:border-gray-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] text-gray-500">Jumlah (SOL)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded border border-[#2b3442] bg-[#0b0e11] p-2 text-sm tabular-nums text-white outline-none focus:border-gray-500"
          />
        </div>

        <div className="flex justify-between text-[11px] text-gray-500">
          <span>Total</span>
          <span className="tabular-nums text-gray-300">
            {Number.isFinite(total) ? total.toFixed(3) : '—'} USDC
          </span>
        </div>

        <button
          onClick={handleTransaction}
          className="rounded p-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          {side === 'BUY' ? 'Beli SOL' : 'Jual SOL'}
        </button>
      </div>
    </div>
  );
}
