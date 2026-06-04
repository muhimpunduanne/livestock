import { create } from "zustand";
import { Stock, FilterState, PortfolioPosition } from "@/types";

interface StockStore {
  stocks: Stock[];
  filteredStocks: Stock[];
  selectedStock: Stock | null;
  filters: FilterState;
  portfolio: PortfolioPosition[];
  isConnected: boolean;
  lastUpdated: number | null;

  setStocks: (stocks: Stock[]) => void;
  updateStockPrice: (updates: Partial<Stock>[]) => void;
  setSelectedStock: (stock: Stock | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  applyFilters: () => void;
  setConnected: (connected: boolean) => void;
  setPortfolio: (portfolio: PortfolioPosition[]) => void;
}

const defaultFilters: FilterState = {
  search: "",
  sector: "All",
  minPrice: null,
  maxPrice: null,
  minVolume: null,
  sortBy: "marketCap",
  sortDir: "desc",
};

function filterAndSort(stocks: Stock[], filters: FilterState): Stock[] {
  const start = performance.now();

  let result = stocks;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
  }

  if (filters.sector && filters.sector !== "All") {
    result = result.filter((s) => s.sector === filters.sector);
  }

  if (filters.minPrice !== null) {
    result = result.filter((s) => s.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== null) {
    result = result.filter((s) => s.price <= filters.maxPrice!);
  }

  if (filters.minVolume !== null) {
    result = result.filter((s) => s.volume >= filters.minVolume!);
  }

  result = [...result].sort((a, b) => {
    const av = a[filters.sortBy] as number;
    const bv = b[filters.sortBy] as number;
    return filters.sortDir === "asc" ? av - bv : bv - av;
  });

  const elapsed = performance.now() - start;
  if (elapsed > 200) {
    console.warn(`Filter took ${elapsed.toFixed(1)}ms — exceeds 200ms target`);
  }

  return result;
}

export const useStockStore = create<StockStore>((set, get) => ({
  stocks: [],
  filteredStocks: [],
  selectedStock: null,
  filters: defaultFilters,
  portfolio: [],
  isConnected: false,
  lastUpdated: null,

  setStocks: (stocks) => {
    set({ stocks, lastUpdated: Date.now() });
    get().applyFilters();
  },

  updateStockPrice: (updates) => {
    set((state) => {
      const map = new Map(updates.map((u) => [u.symbol, u]));
      const stocks = state.stocks.map((s) => {
        const update = map.get(s.symbol);
        return update ? { ...s, ...update, timestamp: Date.now() } : s;
      });
      return { stocks, lastUpdated: Date.now() };
    });
    get().applyFilters();
  },

  setSelectedStock: (stock) => set({ selectedStock: stock }),

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { stocks, filters } = get();
    set({ filteredStocks: filterAndSort(stocks, filters) });
  },

  setConnected: (connected) => set({ isConnected: connected }),

  setPortfolio: (portfolio) => set({ portfolio }),
}));
