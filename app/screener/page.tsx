"use client";

import { useEffect } from "react";
import { useStockStore } from "@/lib/store/useStockStore";
import { generateMockStocks, generateMockPortfolio } from "@/lib/mock/generateStocks";
import { wsSimulator } from "@/lib/websocket/simulator";
import FilterBar from "@/components/screener/FilterBar";
import StockTable from "@/components/screener/StockTable";
import { WebSocketMessage } from "@/types";

export default function ScreenerPage() {
  const { setStocks, updateStockPrice, setConnected, setPortfolio } = useStockStore();

  useEffect(() => {
    const stocks = generateMockStocks(5000);
    setStocks(stocks);
    setPortfolio(generateMockPortfolio(stocks));

    const handler = (msg: WebSocketMessage) => {
      if (msg.type === "connected") setConnected(true);
      if (msg.type === "price_update" && msg.payload) {
        updateStockPrice(msg.payload);
      }
    };

    const unsub = wsSimulator.connect(stocks, handler);
    return () => {
      unsub();
      setConnected(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Stock Screener</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Real-time streaming across 5,000+ instruments
        </p>
      </div>
      <FilterBar />
      <div className="flex-1 overflow-hidden">
        <StockTable />
      </div>
    </div>
  );
}
