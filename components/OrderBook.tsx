export default function OrderBook({ bids, asks }: { bids: any[], asks: any[] }) {
  return (
    <div className="bg-[#131722] p-4 rounded-lg text-white w-64 border border-gray-800">
      <h2 className="font-bold mb-2">Order Book</h2>
      
      {/* Tambahkan (bids || []) untuk keamanan */}
      <div className="text-red-400 text-sm">
        {(asks || []).map((a, i) => (
          <div key={i} className="flex justify-between">
            <span>{a.price}</span>
            <span>{a.size}</span>
          </div>
        ))}
      </div>
      
      <div className="my-2 border-t border-gray-700"></div>
      
      <div className="text-green-400 text-sm">
        {(bids || []).map((b, i) => (
          <div key={i} className="flex justify-between">
            <span>{b.price}</span>
            <span>{b.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}