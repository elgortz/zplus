import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
// 1. Tambahkan import Toaster
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOL/USDC Trading Terminal",
  description: "Terminal trading SOL/USDC dengan data live dari Phoenix di Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col">
        <WalletContextProvider>
          {children}
          {/* 2. Letakkan Toaster di sini agar muncul di atas segalanya */}
          <Toaster position="top-right" />
        </WalletContextProvider>
      </body>
    </html>
  );
}