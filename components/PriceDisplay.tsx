"use client";

import React, { useState, useEffect } from "react";

export default function PriceDisplay() {
  const [price, setPrice] = useState<string>("Memuat...");

  const fetchPrice = async () => {
    // 1. Coba Jupiter API dulu (Standar Industri Solana)
    try {
      const jupRes = await fetch("https://price.jup.ag/v6/price?ids=SOL");
      if (jupRes.ok) {
        const data = await jupRes.json();
        if (data.data?.SOL?.price) {
          setPrice(`$${data.data.SOL.price.toFixed(2)}`);
          return; // Berhasil, keluar dari fungsi
        }
      }
    } catch (e) {
      console.warn("Jupiter API Gagal, mencoba fallback ke CoinGecko...");
    }

    // 2. Jika Jupiter Gagal, coba CoinGecko (Backup)
    try {
      const cgRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      if (cgRes.ok) {
        const data = await cgRes.json();
        if (data.solana?.usd) {
          setPrice(`$${data.solana.usd.toFixed(2)}`);
          return;
        }
      }
    } catch (e) {
      console.error("Kedua API Gagal:", e);
      setPrice("Gagal (Cek Koneksi)");
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
        textAlign: "center", 
        fontSize: "20px", 
        fontWeight: "bold", 
        color: "#14F195",
        background: "#1a1a1a",
        padding: "10px",
        borderRadius: "8px"
    }}>
      Harga SOL: {price}
    </div>
  );
}