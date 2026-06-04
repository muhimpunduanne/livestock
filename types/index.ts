export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  close: number;
  sector: string;
  timestamp: number;
}

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorData {
  time: string;
  value: number | null;
}

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface FilterState {
  search: string;
  sector: string;
  minPrice: number | null;
  maxPrice: number | null;
  minVolume: number | null;
  sortBy: keyof Stock;
  sortDir: "asc" | "desc";
}

export interface WebSocketMessage {
  type: "price_update" | "connected" | "error";
  payload?: Partial<Stock>[];
  message?: string;
}

export type Sector =
  | "All"
  | "Technology"
  | "Healthcare"
  | "Finance"
  | "Energy"
  | "Consumer"
  | "Industrial"
  | "Materials"
  | "Utilities"
  | "Real Estate";
