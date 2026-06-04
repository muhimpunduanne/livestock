"use client";

import { useState, useEffect } from "react";
import { useStockStore } from "@/lib/store/useStockStore";
import { generateCandlestickData } from "@/lib/mock/generateStocks";
import CandlestickChart from "@/components/charts/CandlestickChart";
import { CandlestickData } from "@/types";

export default function AnalyticsPage() {
  const { stocks, selectedStock } = useStockStore();
  const [candleData, setCandleData] = useState<CandlestickData[]>([]);
  const [activeSymbol, setActiveSymbol] = useState<string>("");

  const stock = selectedStock ?? stocks[0];

  useEffect(() => {
    if (!stock) return;
    setActiveSymbol(stock.symbol);
    setCandleData(generateCandlestickData(stock.price, 90));
  }, [stock?.symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  const topMovers = [...stocks]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Candlestick charts with 5 technical overlays. Select a stock from the Screener.
        </p>
      </div>

      {candleData.length > 0 && (
        <CandlestickChart data={candleData} symbol={activeSymbol} />
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="font-medium text-gray-100 mb-3">Top Movers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topMovers.map((s) => (
            <div
              key={s.symbol}
              className="bg-gray-800/60 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-emerald-400 text-sm">
                  {s.symbol}
                </span>
                <span
                  className={`text-xs font-medium ${
                    s.changePercent >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {s.changePercent >= 0 ? "+" : ""}
                  {s.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-gray-400 text-xs mt-1 truncate">{s.name}</div>
              <div className="font-mono text-gray-100 text-sm mt-1">
                ${s.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
