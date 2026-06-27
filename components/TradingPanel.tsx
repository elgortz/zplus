"use client";

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
// 1. Tambahkan import toast
import { toast } from 'react-hot-toast';

export default function TradingPanel() {
  const [price, setPrice] = useState('150.00');
  const [amount, setAmount] = useState('0.1');
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleTransaction = async (type: 'BUY' | 'SELL') => {
    if (!publicKey) {
      toast.error("Harap hubungkan wallet Anda terlebih dahulu!"); // Toast error
      return;
    }

    try {
      // Notifikasi saat proses dimulai
      toast.loading(`Memproses order ${type}...`);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: Number(amount) * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      
      // Notifikasi sukses (menghapus loading sebelumnya)
      toast.dismiss(); 
      toast.success(`Transaksi ${type} berhasil!`);
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
    <div className="bg-[#131722] p-4 rounded-lg text-white w-64 border border-gray-800">
      <h2 className="font-bold mb-4">Place Order</h2>
      
      {/* Input Price */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">Price (USDC)</label>
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-gray-800 p-2 rounded text-white border border-gray-700"
        />
      </div>

      {/* Input Amount */}
      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-1">Amount (SOL)</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-gray-800 p-2 rounded text-white border border-gray-700"
        />
      </div>

      {/* Tombol Action */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => handleTransaction('BUY')}
          className="bg-green-600 hover:bg-green-700 p-2 rounded font-bold text-sm transition"
        >
          BUY
        </button>
        <button 
          onClick={() => handleTransaction('SELL')}
          className="bg-red-600 hover:bg-red-700 p-2 rounded font-bold text-sm transition"
        >
          SELL
        </button>
      </div>
    </div>
  );
}