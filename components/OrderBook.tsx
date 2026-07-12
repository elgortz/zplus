import type { OrderLevel } from './hooks/useMarketData';

const UP = '#12a86d';
const DOWN = '#f6465d';

function cumulate(levels: OrderLevel[]) {
  let running = 0;
  return levels.map(l => {
    running += l.size;
    return { ...l, total: running };
  });
}

function Row({
  price, size, total, maxTotal, color,
}: { price: number; size: number; total: number; maxTotal: number; color: string }) {
  const depth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  return (
    <div className="relative grid grid-cols-3 px-3 py-[3px] text-xs tabular-nums hover:bg-white/5">
      <div
        className="absolute inset-y-0 right-0 opacity-15"
        style={{ width: `${depth}%`, backgroundColor: color }}
      />
      <span style={{ color }}>{price.toFixed(3)}</span>
      <span className="text-right text-gray-300">{size.toFixed(3)}</span>
      <span className="text-right text-gray-500">{total.toFixed(3)}</span>
    </div>
  );
}

export default function OrderBook({
  bids, asks, lastPrice, prevPrice,
}: {
  bids: OrderLevel[];
  asks: OrderLevel[];
  lastPrice: number | null;
  prevPrice: number | null;
}) {
  const cumBids = cumulate(bids || []);
  const cumAsks = cumulate(asks || []);
  const maxTotal = Math.max(
    cumBids[cumBids.length - 1]?.total ?? 0,
    cumAsks[cumAsks.length - 1]?.total ?? 0,
  );

  const bestBid = bids?.[0]?.price;
  const bestAsk = asks?.[0]?.price;
  const spread = bestBid && bestAsk ? bestAsk - bestBid : null;

  const up = prevPrice !== null && lastPrice !== null && lastPrice >= prevPrice;
  const lastColor = up ? UP : DOWN;

  return (
    <div className="flex h-full flex-col rounded-md border border-[#1e2530] bg-[#12161c]">
      <h2 className="border-b border-[#1e2530] px-3 py-2 text-sm font-semibold text-gray-200">
        Order Book
      </h2>

      <div className="grid grid-cols-3 px-3 py-1.5 text-[11px] text-gray-500">
        <span>Harga (USDC)</span>
        <span className="text-right">Jumlah (SOL)</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks: ask terbaik paling dekat dengan baris harga tengah */}
      <div className="flex flex-col-reverse">
        {cumAsks.map((a, i) => (
          <Row key={`a${i}`} {...a} maxTotal={maxTotal} color={DOWN} />
        ))}
      </div>

      <div className="flex items-baseline justify-between border-y border-[#1e2530] px-3 py-2">
        <span className="text-lg font-bold tabular-nums" style={{ color: lastColor }}>
          {lastPrice !== null ? lastPrice.toFixed(3) : '—'} {lastPrice !== null && (up ? '▲' : '▼')}
        </span>
        <span className="text-[11px] text-gray-500">
          Spread {spread !== null ? spread.toFixed(3) : '—'}
        </span>
      </div>

      <div>
        {cumBids.map((b, i) => (
          <Row key={`b${i}`} {...b} maxTotal={maxTotal} color={UP} />
        ))}
      </div>
    </div>
  );
}
