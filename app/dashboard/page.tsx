"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useStockStore } from "@/lib/store/useStockStore";

const PIE_COLORS = ["#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#f97316", "#84cc16", "#a78bfa", "#fb7185"];

export default function DashboardPage() {
  const { stocks, portfolio, isConnected } = useStockStore();

  const totalPortfolioValue = useMemo(
    () => portfolio.reduce((acc, p) => acc + p.currentPrice * p.shares, 0),
    [portfolio]
  );

  const totalPnl = useMemo(
    () => portfolio.reduce((acc, p) => acc + p.pnl, 0),
    [portfolio]
  );

  const sectorBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    stocks.forEach((s) => {
      map[s.sector] = (map[s.sector] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [stocks]);

  const gainers = [...stocks]
    .filter((s) => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const losers = [...stocks]
    .filter((s) => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  const stats = [
    { label: "Portfolio Value", value: `$${totalPortfolioValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total P&L", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`, positive: totalPnl >= 0 },
    { label: "Stocks Tracked", value: stocks.length.toLocaleString() },
    { label: "Status", value: isConnected ? "Live" : "Offline", positive: isConnected },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Portfolio metrics and market overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div
              className={`text-2xl font-bold font-mono ${
                s.positive === undefined
                  ? "text-gray-100"
                  : s.positive
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sector distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="font-medium text-gray-100 mb-4">Sector Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sectorBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
                fontSize={10}
              >
                {sectorBreakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio P&L */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="font-medium text-gray-100 mb-4">Portfolio P&L by Position</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={portfolio} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="symbol" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="pnl"
                radius={[4, 4, 0, 0]}
                fill="#10b981"
              >
                {portfolio.map((p, i) => (
                  <Cell key={i} fill={p.pnl >= 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gainers & Losers */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: "Top Gainers", items: gainers, positive: true },
          { title: "Top Losers", items: losers, positive: false },
        ].map(({ title, items, positive }) => (
          <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="font-medium text-gray-100 mb-3">{title}</h2>
            <div className="space-y-2">
              {items.map((s) => (
                <div key={s.symbol} className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
                  <div>
                    <span className="font-mono font-semibold text-sm text-gray-100">{s.symbol}</span>
                    <span className="text-xs text-gray-500 ml-2">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-gray-100">${s.price.toFixed(2)}</div>
                    <div className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
                      {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
