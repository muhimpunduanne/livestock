"use client";

import { useStockStore } from "@/lib/store/useStockStore";
import { Sector } from "@/types";

const SECTORS: Sector[] = [
  "All", "Technology", "Healthcare", "Finance", "Energy",
  "Consumer", "Industrial", "Materials", "Utilities", "Real Estate",
];

export default function FilterBar() {
  const { filters, setFilters } = useStockStore();

  return (
    <div className="flex flex-wrap gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800">
      <input
        type="text"
        placeholder="Search symbol or name..."
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-56"
      />

      <select
        value={filters.sector}
        onChange={(e) => setFilters({ sector: e.target.value as Sector })}
        className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
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
        className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-28"
      />

      <input
        type="number"
        placeholder="Max price"
        onChange={(e) =>
          setFilters({ maxPrice: e.target.value ? Number(e.target.value) : null })
        }
        className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-28"
      />

      <input
        type="number"
        placeholder="Min volume"
        onChange={(e) =>
          setFilters({ minVolume: e.target.value ? Number(e.target.value) : null })
        }
        className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-32"
      />

      <select
        value={`${filters.sortBy}-${filters.sortDir}`}
        onChange={(e) => {
          const [sortBy, sortDir] = e.target.value.split("-") as [keyof import("@/types").Stock, "asc" | "desc"];
          setFilters({ sortBy, sortDir });
        }}
        className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
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
