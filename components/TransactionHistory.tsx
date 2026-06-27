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

  if (!publicKey) return null;

  return (
    <div style={{ marginTop: "20px", width: "100%", maxWidth: "400px", color: "white" }}>
      <h3 style={{ textAlign: "center" }}>Riwayat Transaksi Terakhir:</h3>
      {loading ? (
        <p style={{ textAlign: "center" }}>Memuat...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {history.map((tx) => (
            <li key={tx.signature} style={{ background: "#222", padding: "10px", margin: "5px 0", borderRadius: "5px", fontSize: "12px", wordBreak: "break-all" }}>
              <strong>Status:</strong> {tx.confirmationStatus || "confirmed"}<br/>
              <strong>Signature:</strong> {tx.signature.slice(0, 20)}...
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}