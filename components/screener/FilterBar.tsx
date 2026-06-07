"use client";

import { useStockStore } from "@/lib/store/useStockStore";
import { Sector } from "@/types";

const SECTORS: Sector[] = [
  "All", "Technology", "Healthcare", "Finance", "Energy",
  "Consumer", "Industrial", "Materials", "Utilities", "Real Estate",
];

function SearchIcon() {
  return (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const inputCls = "bg-gray-800/80 border border-gray-700/60 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500/70 focus:bg-gray-800 transition-colors";
const selectCls = `${inputCls} px-3 py-1.5 cursor-pointer`;

export default function FilterBar() {
  const { filters, setFilters } = useStockStore();

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 bg-gray-900/60 border-b border-gray-800/80 backdrop-blur-sm">
      <div className="relative">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search symbol or name…"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className={`${inputCls} pl-8 pr-3 py-1.4 w-56`}
        />
      </div>

      <div className="w-px h-5 bg-gray-700/60" />

      <select
        value={filters.sector}
        onChange={(e) => setFilters({ sector: e.target.value as Sector })}
        className={selectCls}
      >
        {SECTORS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Min price"
        onChange={(e) =>
          setFilters({ minPrice: e.target.value ? Number(e.target.value) : null })
        }
        className={`${inputCls} px-3 py-1.5 w-28`}
      />

      <input
        type="number"
        placeholder="Max price"
        onChange={(e) =>
          setFilters({ maxPrice: e.target.value ? Number(e.target.value) : null })
        }
        className={`${inputCls} px-3 py-1.5 w-28`}
      />

      <input
        type="number"
        placeholder="Min volume"
        onChange={(e) =>
          setFilters({ minVolume: e.target.value ? Number(e.target.value) : null })
        }
        className={`${inputCls} px-3 py-1.5 w-32`}
      />

      <div className="w-px h-5 bg-gray-700/60" />

      <select
        value={`${filters.sortBy}-${filters.sortDir}`}
        onChange={(e) => {
          const [sortBy, sortDir] = e.target.value.split("-") as [keyof import("@/types").Stock, "asc" | "desc"];
          setFilters({ sortBy, sortDir });
        }}
        className={selectCls}
      >
        <option value="marketCap-desc">Market Cap ↓</option>
        <option value="marketCap-asc">Market Cap ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="price-asc">Price ↑</option>
        <option value="changePercent-desc">Change % ↓</option>
        <option value="changePercent-asc">Change % ↑</option>
        <option value="volume-desc">Volume ↓</option>
        <option value="volume-asc">Volume ↑</option>
      </select>
    </div>
  );
}
