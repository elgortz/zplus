"use client";

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

// CSS sekarang diatur melalui globals.css, jadi tidak perlu require di sini.

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // Jalur VIP pribadi Anda melalui Helius
    const endpoint = "https://mainnet.helius-rpc.com/?api-key=47e352bb-dcfa-4e21-b171-d7584cb83f2a";
    
    // Inisialisasi wallet Phantom
    const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};