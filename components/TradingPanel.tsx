"use client";

import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { buildIocOrderTransaction } from './lib/phoenixOrder';

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

  const [submitting, setSubmitting] = useState(false);

  const handleTransaction = async () => {
    if (!publicKey) {
      toast.error("Harap hubungkan wallet Anda terlebih dahulu!");
      return;
    }

    const priceNum = Number(price);
    const amountNum = Number(amount);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Harga tidak valid.");
      return;
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Jumlah tidak valid.");
      return;
    }

    setSubmitting(true);
    try {
      toast.loading(`Mengirim order ${side === 'BUY' ? 'beli' : 'jual'} ke Phoenix...`);

      // Order IOC sungguhan: dieksekusi langsung terhadap order book
      // sampai harga limit; sisanya dibatalkan otomatis.
      const transaction = await buildIocOrderTransaction({
        connection,
        trader: publicKey,
        side,
        price: priceNum,
        amountSol: amountNum,
      });

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      toast.dismiss();
      toast.success(
        (t) => (
          <span>
            Order {side === 'BUY' ? 'beli' : 'jual'} terkirim!{' '}
            <a
              href={`https://solscan.io/tx/${signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              onClick={() => toast.dismiss(t.id)}
            >
              Lihat di Solscan
            </a>
          </span>
        ),
        { duration: 8000 }
      );
      console.log("Signature:", signature);

    } catch (error: any) {
      toast.dismiss();
      console.error(error);
      // Menangani error jika user membatalkan di Phantom
      if (error.code === 4001 || error.name === 'WalletSendTransactionError') {
        toast.error("Transaksi dibatalkan atau ditolak wallet.");
      } else if (String(error.message || '').includes('insufficient')) {
        toast.error("Saldo tidak cukup untuk order ini.");
      } else {
        toast.error("Order gagal. Periksa saldo dan coba lagi.");
      }
    } finally {
      setSubmitting(false);
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
          disabled={submitting}
          className="rounded p-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {submitting ? 'Mengirim...' : side === 'BUY' ? 'Beli SOL' : 'Jual SOL'}
        </button>

        <p className="text-[10px] leading-relaxed text-gray-600">
          Order dikirim sebagai <em>immediate-or-cancel</em> ke market Phoenix:
          dieksekusi langsung sampai harga limit Anda, sisanya dibatalkan otomatis.
        </p>
      </div>
    </div>
  );
}
