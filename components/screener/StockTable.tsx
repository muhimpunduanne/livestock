"use client";

import { useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useStockStore } from "@/lib/store/useStockStore";
import { Stock } from "@/types";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const fmtBig = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${fmt.format(n)}`;
};

const SECTOR_STYLE: Record<string, string> = {
  Technology:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Healthcare:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Finance:      "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Energy:       "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Consumer:     "bg-pink-500/15 text-pink-400 border-pink-500/20",
  Industrial:   "bg-slate-500/15 text-slate-300 border-slate-500/20",
  Materials:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Utilities:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  "Real Estate":"bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const columns: ColumnDef<Stock>[] = [
  {
    id: "symbol",
    accessorKey: "symbol",
    header: "Symbol",
    size: 90,
    cell: ({ getValue }) => (
      <span className="font-mono font-bold text-emerald-400 text-sm">
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    size: 200,
    cell: ({ getValue }) => (
      <span className="text-gray-300 truncate block max-w-[200px] text-sm">
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Price",
    size: 100,
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-100 text-sm">{fmtCurrency.format(getValue<number>())}</span>
    ),
  },
  {
    id: "change",
    accessorKey: "changePercent",
    header: "Change %",
    size: 110,
    cell: ({ getValue }) => {
      const v = getValue<number>();
      return (
        <span
          className={`inline-flex items-center gap-0.5 font-mono font-semibold text-sm px-1.5 py-0.5 rounded ${
            v >= 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {v >= 0 ? "▲" : "▼"} {Math.abs(v).toFixed(2)}%
        </span>
      );
    },
  },
  {
    id: "volume",
    accessorKey: "volume",
    header: "Volume",
    size: 120,
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-400 text-sm">{fmt.format(getValue<number>())}</span>
    ),
  },
  {
    id: "marketCap",
    accessorKey: "marketCap",
    header: "Mkt Cap",
    size: 120,
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-400 text-sm">{fmtBig(getValue<number>())}</span>
    ),
  },
  {
    id: "sector",
    accessorKey: "sector",
    header: "Sector",
    size: 140,
    cell: ({ getValue }) => {
      const v = getValue<string>();
      const style = SECTOR_STYLE[v] ?? "bg-gray-700/40 text-gray-300 border-gray-600/20";
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${style}`}>
          {v}
        </span>
      );
    },
  },
  {
    id: "high",
    accessorKey: "high",
    header: "High",
    size: 90,
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-400 text-sm">{fmtCurrency.format(getValue<number>())}</span>
    ),
  },
  {
    id: "low",
    accessorKey: "low",
    header: "Low",
    size: 90,
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-400 text-sm">{fmtCurrency.format(getValue<number>())}</span>
    ),
  },
];

const ROW_HEIGHT = 42;

export default function StockTable() {
  const { filteredStocks, setSelectedStock, selectedStock } = useStockStore();

  const table = useReactTable({
    data: filteredStocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const containerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalHeight - virtualRows[virtualRows.length - 1].end
      : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 flex items-center gap-2 text-xs text-gray-500 border-b border-gray-800/80 bg-gray-900/40">
        <span className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono font-medium">
          {filteredStocks.length.toLocaleString()}
        </span>
        <span>instruments</span>
        {selectedStock && (
          <span className="ml-auto text-emerald-500/70">
            Selected: <span className="font-mono text-emerald-400">{selectedStock.symbol}</span>
          </span>
        )}
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 z-10 shadow-sm">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-800">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    style={{ width: h.getSize() }}
                    className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: paddingTop }} />
              </tr>
            )}
            {virtualRows.map((vr) => {
              const row = rows[vr.index];
              const isSelected = selectedStock?.symbol === row.original.symbol;
              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedStock(row.original)}
                  className={`border-b border-gray-800/40 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-emerald-500/8 border-l-2 border-l-emerald-500"
                      : "hover:bg-gray-800/40"
                  }`}
                  style={{ height: ROW_HEIGHT }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-1 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: paddingBottom }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
