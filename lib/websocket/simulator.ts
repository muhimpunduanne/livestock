import { Stock, WebSocketMessage } from "@/types";

type MessageHandler = (msg: WebSocketMessage) => void;

class StockWebSocketSimulator {
  private handlers: Set<MessageHandler> = new Set();
  private interval: ReturnType<typeof setInterval> | null = null;
  private stocks: Stock[] = [];
  private connected = false;

  connect(stocks: Stock[], onMessage: MessageHandler) {
    this.stocks = stocks;
    this.handlers.add(onMessage);

    if (!this.connected) {
      this.connected = true;
      onMessage({ type: "connected", message: "WebSocket connected" });
      this.startStreaming();
    }

    return () => this.disconnect(onMessage);
  }

  private startStreaming() {
    // Push batched price updates every 500ms to simulate live feed
    this.interval = setInterval(() => {
      const batchSize = Math.floor(Math.random() * 50) + 20;
      const shuffled = [...this.stocks].sort(() => Math.random() - 0.5);
      const batch = shuffled.slice(0, batchSize);

      const updates = batch.map((stock) => {
        const delta = (Math.random() - 0.495) * stock.price * 0.004;
        const newPrice = Math.max(0.01, stock.price + delta);
        const change = newPrice - stock.open;
        const changePercent = (change / stock.open) * 100;
        const volumeSpike = Math.floor(Math.random() * 10000);

        // Keep internal state up to date
        stock.price = newPrice;
        stock.change = change;
        stock.changePercent = changePercent;
        stock.volume += volumeSpike;
        if (newPrice > stock.high) stock.high = newPrice;
        if (newPrice < stock.low) stock.low = newPrice;

        return {
          symbol: stock.symbol,
          price: newPrice,
          change,
          changePercent,
          volume: stock.volume,
          high: stock.high,
          low: stock.low,
        };
      });

      const msg: WebSocketMessage = { type: "price_update", payload: updates };
      this.handlers.forEach((h) => h(msg));
    }, 500);
  }

  updateStocks(stocks: Stock[]) {
    this.stocks = stocks;
  }

  disconnect(handler?: MessageHandler) {
    if (handler) {
      this.handlers.delete(handler);
    }
    if (this.handlers.size === 0) {
      this.connected = false;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  }
}

// Singleton so all consumers share one streaming loop
export const wsSimulator = new StockWebSocketSimulator();
