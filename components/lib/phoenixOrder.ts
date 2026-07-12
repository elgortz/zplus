"use client";

import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as PhoenixSDK from '@ellipsis-labs/phoenix-sdk';
import {
  NATIVE_MINT,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createSyncNativeInstruction,
  createCloseAccountInstruction,
} from '@solana/spl-token';

// Market SOL/USDC resmi Phoenix di mainnet-beta (sama dengan app/actions.ts)
export const MARKET_ADDRESS = new PublicKey("4DoNfFBfF7UokCC2FQzriy7yHK6DY6NVdYpuekQ5pRgg");

export type OrderParams = {
  connection: Connection;
  trader: PublicKey;
  side: 'BUY' | 'SELL';
  price: number;      // harga limit dalam USDC per SOL
  amountSol: number;  // jumlah SOL
};

/**
 * Membangun transaksi order Immediate-or-Cancel (IOC) sungguhan ke Phoenix.
 *
 * IOC dieksekusi lewat instruksi swap sehingga tidak memerlukan seat di
 * market: order langsung dicocokkan dengan order book sampai harga limit,
 * dan sisa yang tidak terisi dibatalkan otomatis oleh program.
 *
 * Base token market ini adalah wrapped SOL, jadi transaksi juga mengurus
 * wrap/unwrap: saat SELL, SOL native dibungkus dulu ke ATA WSOL; di akhir
 * transaksi ATA WSOL selalu ditutup sehingga hasil (atau sisa) kembali
 * sebagai SOL native.
 */
export async function buildIocOrderTransaction({
  connection, trader, side, price, amountSol,
}: OrderParams): Promise<Transaction> {
  const client = await PhoenixSDK.Client.createWithMarketAddresses(connection, [MARKET_ADDRESS]);
  const marketState = client.marketStates.get(MARKET_ADDRESS.toBase58());
  if (!marketState) throw new Error("Market Phoenix tidak ditemukan");

  const quoteMint = marketState.data.header.quoteParams.mintKey;
  const wsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, trader);
  const usdcAta = getAssociatedTokenAddressSync(quoteMint, trader);

  const orderIx = marketState.getImmediateOrCancelOrderInstructionfromTemplate(trader, {
    side: side === 'BUY' ? PhoenixSDK.Side.Bid : PhoenixSDK.Side.Ask,
    priceAsFloat: price,
    sizeInBaseUnits: amountSol,
    sizeInQuoteUnits: 0,
    minBaseUnitsToFill: 0,
    minQuoteUnitsToFill: 0,
    selfTradeBehavior: PhoenixSDK.SelfTradeBehavior.Abort,
    clientOrderId: Date.now() % 2 ** 31,
    useOnlyDepositedFunds: false,
  });

  const tx = new Transaction();

  // ATA harus ada sebelum swap; idempotent = aman walau sudah ada
  tx.add(createAssociatedTokenAccountIdempotentInstruction(trader, wsolAta, trader, NATIVE_MINT));
  tx.add(createAssociatedTokenAccountIdempotentInstruction(trader, usdcAta, trader, quoteMint));

  if (side === 'SELL') {
    // Bungkus SOL native sejumlah order ke ATA WSOL
    tx.add(SystemProgram.transfer({
      fromPubkey: trader,
      toPubkey: wsolAta,
      lamports: Math.ceil(amountSol * LAMPORTS_PER_SOL),
    }));
    tx.add(createSyncNativeInstruction(wsolAta));
  }

  tx.add(orderIx);

  // Tutup ATA WSOL: hasil beli / sisa jual kembali sebagai SOL native + rent
  tx.add(createCloseAccountInstruction(wsolAta, trader, trader));

  return tx;
}
