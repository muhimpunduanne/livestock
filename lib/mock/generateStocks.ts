import { Stock, CandlestickData, PortfolioPosition, Sector } from "@/types";

const SECTORS: Exclude<Sector, "All">[] = [
  "Technology", "Healthcare", "Finance", "Energy",
  "Consumer", "Industrial", "Materials", "Utilities", "Real Estate",
];

const STOCK_TEMPLATES = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "XOM", name: "ExxonMobil Corp.", sector: "Energy" },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateSymbol(index: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const len = Math.floor(rand(3, 5));
  let s = "";
  for (let i = 0; i < len; i++) {
    s += letters[Math.floor(rand(0, 26))];
  }
  return s + index;
}

export function generateMockStocks(count: number = 5000): Stock[] {
  const stocks: Stock[] = [];

  for (let i = 0; i < count; i++) {
    const template = STOCK_TEMPLATES[i % STOCK_TEMPLATES.length];
    const base = rand(5, 2000);
    const open = base * rand(0.98, 1.02);
    const close = open * rand(0.97, 1.03);
    const high = Math.max(open, close) * rand(1.001, 1.02);
    const low = Math.min(open, close) * rand(0.98, 0.999);
    const change = close - open;

    stocks.push({
      id: `stock-${i}`,
      symbol: i < STOCK_TEMPLATES.length ? template.symbol : generateSymbol(i),
      name: i < STOCK_TEMPLATES.length ? template.name : `Company ${i} Inc.`,
      sector: i < STOCK_TEMPLATES.length
        ? (template.sector as Exclude<Sector, "All">)
        : SECTORS[i % SECTORS.length],
      price: close,
      open,
      close,
      high,
      low,
      change,
      changePercent: (change / open) * 100,
      volume: Math.floor(rand(100_000, 50_000_000)),
      marketCap: close * Math.floor(rand(1_000_000, 10_000_000_000)),
      timestamp: Date.now(),
    });
  }

  return stocks;
}

export function generateCandlestickData(
  basePrice: number,
  days: number = 90
): CandlestickData[] {
  const data: CandlestickData[] = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const open = price;
    const change = (Math.random() - 0.48) * price * 0.03;
    const close = Math.max(0.01, open + change);
    const high = Math.max(open, close) * rand(1.001, 1.015);
    const low = Math.min(open, close) * rand(0.985, 0.999);
    const volume = Math.floor(rand(500_000, 20_000_000));

    data.push({
      time: date.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    price = close;
  }

  return data;
}

export function generateMockPortfolio(stocks: Stock[]): PortfolioPosition[] {
  const picks = stocks.slice(0, 10);
  return picks.map((s) => {
    const shares = Math.floor(rand(10, 500));
    const avgCost = s.price * rand(0.8, 1.2);
    const pnl = (s.price - avgCost) * shares;
    return {
      symbol: s.symbol,
      shares,
      avgCost: parseFloat(avgCost.toFixed(2)),
      currentPrice: s.price,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercent: parseFloat(((pnl / (avgCost * shares)) * 100).toFixed(2)),
    };
  });
}
