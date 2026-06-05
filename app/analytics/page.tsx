"use client";

import { useState, useEffect } from "react";
import { useStockStore } from "@/lib/store/useStockStore";
import { generateCandlestickData } from "@/lib/mock/generateStocks";
import CandlestickChart from "@/components/charts/CandlestickChart";
import { CandlestickData } from "@/types";

export default function AnalyticsPage() {
  const { stocks, selectedStock, setSelectedStock } = useStockStore();
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Candlestick charts with 5 technical overlays — select a stock below or from the Screener.
          </p>
        </div>
        {stock && (
          <div className="text-right hidden sm:block">
            <div className="font-mono font-bold text-lg text-gray-100">{stock.symbol}</div>
            <div className="text-xs text-gray-500">{stock.name}</div>
          </div>
        )}
      </div>

      {candleData.length > 0 && (
        <CandlestickChart data={candleData} symbol={activeSymbol} stock={stock} />
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-100">Top Movers</h2>
          <span className="text-xs text-gray-600">Click to view chart</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topMovers.map((s) => {
            const isActive = s.symbol === activeSymbol;
            const isGainer = s.changePercent >= 0;
            return (
              <button
                key={s.symbol}
                onClick={() => setSelectedStock(s)}
                className={`text-left rounded-xl p-3.5 border transition-all duration-150 ${
                  isActive
                    ? "bg-gray-800 border-emerald-500/40 ring-1 ring-emerald-500/20"
                    : "bg-gray-800/40 border-gray-700/40 hover:bg-gray-800/80 hover:border-gray-600/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-sm text-gray-100">
                    {s.symbol}
                  </span>
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      isGainer
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {isGainer ? "+" : ""}{s.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="text-gray-500 text-xs truncate mb-1.5">{s.name}</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gray-200">${s.price.toFixed(2)}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full"
                        style={{
                          height: `${8 + Math.random() * 10}px`,
                          background: isGainer ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
