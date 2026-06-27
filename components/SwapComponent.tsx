"use client";

import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";

// PENTING: Harus ada 'export default' agar tidak error
export default function SwapComponent() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState<string>("Siap untuk trading");

  const executeSwap = async () => {
    if (!publicKey) {
      alert("Hubungkan dompet Anda dulu!");
      return;
    }

    setStatus("Menghubungi Jupiter...");

    try {
      // Panggil API Jupiter Langsung (VPN akan menangani blokir ISP)
      const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000`;
      
      const response = await fetch(quoteUrl);
      if (!response.ok) throw new Error("Gagal mengambil harga (Quote)");

      const quoteResponse = await response.json();
      setStatus("Menyiapkan transaksi...");

      const swapRes = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: publicKey.toString(),
          wrapAndUnwrapSol: true,
        })
      });

      const swapData = await swapRes.json();
      if (!swapRes.ok) throw new Error("Gagal eksekusi transaksi");

      const transaction = VersionedTransaction.deserialize(Buffer.from(swapData.swapTransaction, 'base64'));
      const signature = await sendTransaction(transaction, connection);
      
      setStatus(`Sukses! Signature: ${signature.slice(0, 10)}...`);
      
    } catch (error: any) {
      console.error("Error Detail:", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ border: "2px solid #555", padding: "15px", borderRadius: "10px", backgroundColor: "#222" }}>
      <button 
        onClick={executeSwap} 
        style={{ background: "#14F195", padding: "12px", width: "100%", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
      >
        EKSEKUSI SWAP
      </button>
      <p style={{ marginTop: "10px", fontSize: "12px", color: "#ff8888" }}>{status}</p>
    </div>
  );
}