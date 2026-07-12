"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// API key publik Onramper (pk_prod_...). Diisi lewat environment variable di
// Vercel: Settings -> Environment Variables -> NEXT_PUBLIC_ONRAMPER_API_KEY.
const ONRAMPER_API_KEY = process.env.NEXT_PUBLIC_ONRAMPER_API_KEY;

function buildWidgetUrl(walletAddress: string | null) {
  const params = new URLSearchParams({
    apiKey: ONRAMPER_API_KEY ?? '',
    mode: 'buy',
    defaultCrypto: 'sol',
    defaultFiat: 'idr',
    themeName: 'dark',
  });
  if (walletAddress) params.set('wallets', `sol:${walletAddress}`);
  return `https://buy.onramper.com?${params.toString()}`;
}

export default function OnRampModal() {
  const [open, setOpen] = useState(false);
  const { publicKey } = useWallet();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-[#2b3442] px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:bg-white/5"
      >
        💳 Beli pakai Rupiah
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-[440px] overflow-hidden rounded-lg border border-[#1e2530] bg-[#12161c]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1e2530] px-4 py-2.5">
              <h2 className="text-sm font-semibold text-gray-200">
                Beli crypto dengan Rupiah
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-200"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            {ONRAMPER_API_KEY ? (
              <iframe
                src={buildWidgetUrl(publicKey ? publicKey.toBase58() : null)}
                title="Onramper"
                height="630"
                className="w-full border-0"
                allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
              />
            ) : (
              <div className="space-y-3 p-4 text-sm leading-relaxed text-gray-300">
                <p>
                  Fitur pembelian dengan Rupiah (transfer bank, e-wallet, dan
                  metode lokal lain) disediakan oleh <strong>Onramper</strong>,
                  agregator on-ramp berlisensi, dan belum aktif karena API key
                  belum dipasang.
                </p>
                <p className="text-gray-400">Cara mengaktifkannya (untuk pemilik situs):</p>
                <ol className="list-decimal space-y-1 pl-5 text-gray-400">
                  <li>
                    Daftar di{' '}
                    <a
                      href="https://onramper.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 underline"
                    >
                      onramper.com
                    </a>{' '}
                    dan ambil API key publik (pk_prod_...).
                  </li>
                  <li>
                    Di Vercel: Settings → Environment Variables, tambahkan{' '}
                    <code className="rounded bg-[#1e2530] px-1 py-0.5 text-xs">
                      NEXT_PUBLIC_ONRAMPER_API_KEY
                    </code>
                    .
                  </li>
                  <li>Deploy ulang. Tombol ini langsung menampilkan widget pembayaran.</li>
                </ol>
                <p className="text-xs text-gray-500">
                  Metode pembayaran yang tampil (transfer bank, QRIS, e-wallet)
                  tergantung dukungan masing-masing penyedia di balik Onramper
                  untuk pengguna di Indonesia.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
