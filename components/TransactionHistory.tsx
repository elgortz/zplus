"use client";

import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ConfirmedSignatureInfo } from "@solana/web3.js";

export default function TransactionHistory() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [history, setHistory] = useState<ConfirmedSignatureInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Mengambil 5 transaksi terakhir
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 5 });
        setHistory(signatures);
      } catch (error) {
        console.error("Gagal mengambil riwayat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [publicKey, connection]);

  return (
    <div className="rounded-md border border-[#1e2530] bg-[#12161c]">
      <h2 className="border-b border-[#1e2530] px-3 py-2 text-sm font-semibold text-gray-200">
        Riwayat Transaksi
      </h2>

      {!publicKey ? (
        <p className="px-3 py-4 text-xs text-gray-500">
          Hubungkan wallet untuk melihat riwayat transaksi Anda.
        </p>
      ) : loading ? (
        <p className="px-3 py-4 text-xs text-gray-500">Memuat...</p>
      ) : history.length === 0 ? (
        <p className="px-3 py-4 text-xs text-gray-500">Belum ada transaksi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] text-gray-500">
                <th className="px-3 py-1.5 font-normal">Waktu</th>
                <th className="px-3 py-1.5 font-normal">Signature</th>
                <th className="px-3 py-1.5 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((tx) => (
                <tr key={tx.signature} className="border-t border-[#1e2530] hover:bg-white/5">
                  <td className="px-3 py-2 tabular-nums text-gray-400">
                    {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString('id-ID') : '—'}
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-300">
                    <a
                      href={`https://solscan.io/tx/${tx.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {tx.signature.slice(0, 20)}…
                    </a>
                  </td>
                  <td className="px-3 py-2">
                    <span className={tx.err ? 'text-[#f6465d]' : 'text-[#12a86d]'}>
                      {tx.err ? '✕ gagal' : `✓ ${tx.confirmationStatus || 'confirmed'}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
