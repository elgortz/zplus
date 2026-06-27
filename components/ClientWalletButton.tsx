"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export const ClientWalletButton = () => {
  const [mounted, setMounted] = useState(false);

  // useEffect hanya berjalan di sisi browser (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Jika belum di-mount, render kotak kosong (loading) untuk mencegah error
  if (!mounted) {
    return <div className="h-10 w-32 bg-gray-700 animate-pulse rounded" />;
  }

  return <WalletMultiButton />;
};