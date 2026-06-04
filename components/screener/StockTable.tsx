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

const columns: ColumnDef<Stock>[] = [
  {
    id: "symbol",
    accessorKey: "symbol",
    header: "Symbol",
    size: 90,
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-emerald-400">
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
      <span className="text-gray-300 truncate block max-w-[200px]">
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
      <span className="font-mono">{fmtCurrency.format(getValue<number>())}</span>
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
        <span className={`font-mono font-medium ${v >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {v >= 0 ? "+" : ""}
          {v.toFixed(2)}%
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
      <span className="font-mono text-gray-400">{fmt.format(getValue<number>())}</span>
    ),
  },
  {
    id: "marketCap",
    accessorKey: "marketCap",
    header: "Market Cap",
    size: 120,
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-400">{fmtBig(getValue<number>())}</span>
    ),
  },
  {
    id: "sector",
    accessorKey: "sector",
    header: "Sector",
    size: 130,
    cell: ({ getValue }) => (
      <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300">
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: "high",
    accessorKey: "high",
    header: "High",
    size: 90,
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-400">{fmtCurrency.format(getValue<number>())}</span>
    ),
  },
  {
    id: "low",
    accessorKey: "low",
    header: "Low",
    size: 90,
    cell: ({ getValue }) => (
      <span className="font-mono text-gray-400">{fmtCurrency.format(getValue<number>())}</span>
    ),
  },
];

const ROW_HEIGHT = 40;

export default function StockTable() {
  const { filteredStocks, setSelectedStock } = useStockStore();

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
      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
        {filteredStocks.length.toLocaleString()} stocks
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-800">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    style={{ width: h.getSize() }}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedStock(row.original)}
                  className="border-b border-gray-800/50 hover:bg-gray-800/40 cursor-pointer transition-colors"
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
