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

function DollarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4v8M6 5.5h2.5a1.5 1.5 0 010 3H7a1.5 1.5 0 010 3H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrendIcon({ up }: { up: boolean }) {
  return up ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <polyline points="2,12 6,7 9,10 14,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="10,4 14,4 14,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <polyline points="2,4 6,9 9,6 14,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="10,12 14,12 14,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SignalIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M1 10a9 9 0 0114 0" stroke={active ? "currentColor" : "#4b5563"} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M4 12.5a5 5 0 018 0" stroke={active ? "currentColor" : "#4b5563"} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M7 15a2 2 0 012 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 8,
  fontSize: 12,
  color: "#d1d5db",
};

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
    {
      label: "Portfolio Value",
      value: `$${totalPortfolioValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      icon: <DollarIcon />,
      accentColor: "from-blue-500/20 to-transparent",
      iconColor: "text-blue-400",
    },
    {
      label: "Total P&L",
      value: `${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toFixed(0)}`,
      positive: totalPnl >= 0,
      icon: <TrendIcon up={totalPnl >= 0} />,
      accentColor: totalPnl >= 0 ? "from-emerald-500/20 to-transparent" : "from-red-500/20 to-transparent",
      iconColor: totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Instruments",
      value: stocks.length.toLocaleString(),
      icon: <GridIcon />,
      accentColor: "from-purple-500/20 to-transparent",
      iconColor: "text-purple-400",
    },
    {
      label: "Feed Status",
      value: isConnected ? "Live" : "Offline",
      positive: isConnected,
      icon: <SignalIcon active={isConnected} />,
      accentColor: isConnected ? "from-emerald-500/20 to-transparent" : "from-red-500/20 to-transparent",
      iconColor: isConnected ? "text-emerald-400" : "text-red-400",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Portfolio metrics and market overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative bg-gray-900 border border-gray-800/80 rounded-xl p-4 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accentColor} pointer-events-none`} />
            <div className="relative">
              <div className={`flex items-center gap-1.5 text-xs text-gray-500 mb-2 ${s.iconColor}`}>
                {s.icon}
                <span className="text-gray-500">{s.label}</span>
              </div>
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
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sector distribution */}
        <div className="bg-gray-900 border border-gray-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-100">Sector Distribution</h2>
            <span className="text-xs text-gray-600">{sectorBreakdown.length} sectors</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sectorBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={30}
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
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio P&L */}
        <div className="bg-gray-900 border border-gray-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-100">Portfolio P&L by Position</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${totalPnl >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={portfolio} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="symbol" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
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
          <div key={title} className="bg-gray-900 border border-gray-800/80 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-1 h-4 rounded-full ${positive ? "bg-emerald-400" : "bg-red-400"}`} />
              <h2 className="font-semibold text-gray-100">{title}</h2>
            </div>
            <div className="space-y-1">
              {items.map((s, i) => (
                <div
                  key={s.symbol}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-4 tabular-nums">{i + 1}</span>
                    <div>
                      <span className="font-mono font-bold text-sm text-gray-100">{s.symbol}</span>
                      <span className="text-xs text-gray-600 ml-2 hidden sm:inline">{s.name}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="font-mono text-sm text-gray-300">${s.price.toFixed(2)}</div>
                    <div
                      className={`text-xs font-semibold font-mono px-2 py-0.5 rounded-full min-w-[56px] text-center ${
                        positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}
                    >
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
