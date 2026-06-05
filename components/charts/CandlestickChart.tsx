"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CandlestickData } from "@/types";
import { Stock } from "@/types";
import { calcMA, calcEMA, calcRSI, calcMACD, calcBollinger } from "@/lib/indicators";

interface Props {
  data: CandlestickData[];
  symbol: string;
  stock?: Stock;
}

type Overlay = "MA" | "EMA" | "RSI" | "MACD" | "BB";

const OVERLAY_COLORS: Record<Overlay, string> = {
  MA: "#f59e0b",
  EMA: "#8b5cf6",
  RSI: "#06b6d4",
  MACD: "#ec4899",
  BB: "#10b981",
};

const OVERLAY_LABELS: Record<Overlay, string> = {
  MA: "MA(20)",
  EMA: "EMA(20)",
  RSI: "RSI(14)",
  MACD: "MACD",
  BB: "Bollinger",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 8,
  fontSize: 12,
  color: "#d1d5db",
};

export default function CandlestickChart({ data, symbol, stock }: Props) {
  const [activeOverlays, setActiveOverlays] = useState<Set<Overlay>>(
    new Set<Overlay>(["MA", "BB"])
  );

  const toggleOverlay = (o: Overlay) => {
    setActiveOverlays((prev) => {
      const next = new Set(prev);
      if (next.has(o)) { next.delete(o); } else { next.add(o); }
      return next;
    });
  };

  const chartData = useMemo(() => {
    const ma = calcMA(data, 20);
    const ema = calcEMA(data, 20);
    const rsi = calcRSI(data, 14);
    const { macd, signal } = calcMACD(data);
    const bb = calcBollinger(data, 20);

    return data.map((d, i) => ({
      ...d,
      candleColor: d.close >= d.open ? "#10b981" : "#ef4444",
      barHigh: d.high,
      barLow: d.low,
      bodyHigh: Math.max(d.open, d.close),
      bodyLow: Math.min(d.open, d.close),
      ma: ma[i].value,
      ema: ema[i].value,
      rsi: rsi[i].value,
      macd: macd[i].value,
      macdSignal: signal[i].value,
      bbUpper: bb.upper[i].value,
      bbMiddle: bb.middle[i].value,
      bbLower: bb.lower[i].value,
    }));
  }, [data]);

  const overlays: Overlay[] = ["MA", "EMA", "RSI", "MACD", "BB"];

  const priceChange = stock ? stock.changePercent : null;
  const isUp = priceChange !== null && priceChange >= 0;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800/80 overflow-hidden">
      {/* Chart header */}
      <div className="px-5 py-4 border-b border-gray-800/60 flex flex-wrap items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg text-gray-100">{symbol}</span>
            {priceChange !== null && (
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded-full font-mono ${
                  isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                }`}
              >
                {isUp ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">90-day candlestick</div>
        </div>

        {stock && (
          <div className="flex items-center gap-5 text-xs ml-2">
            <div>
              <div className="text-gray-600 mb-0.5">Price</div>
              <div className="font-mono text-gray-200 font-medium">${stock.price.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-0.5">High</div>
              <div className="font-mono text-emerald-400 font-medium">${stock.high.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-0.5">Low</div>
              <div className="font-mono text-red-400 font-medium">${stock.low.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-0.5">Volume</div>
              <div className="font-mono text-gray-400 font-medium">
                {stock.volume >= 1e6 ? `${(stock.volume / 1e6).toFixed(1)}M` : stock.volume.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <div className="ml-auto flex flex-wrap gap-2">
          {overlays.map((o) => (
            <button
              key={o}
              onClick={() => toggleOverlay(o)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-150 ${
                activeOverlays.has(o)
                  ? "border-transparent text-gray-950"
                  : "border-gray-700/60 text-gray-500 hover:text-gray-300 hover:border-gray-500"
              }`}
              style={activeOverlays.has(o) ? { backgroundColor: OVERLAY_COLORS[o] } : {}}
              title={OVERLAY_LABELS[o]}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={14}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={60}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#9ca3af" }}
            />

            <Bar dataKey="barHigh" fill="transparent" stroke="transparent" />
            <Bar dataKey="bodyHigh" fill="#10b981" stroke="none" barSize={4} />

            {activeOverlays.has("BB") && (
              <>
                <Line type="monotone" dataKey="bbUpper" stroke={OVERLAY_COLORS.BB} strokeWidth={1} dot={false} strokeDasharray="4 2" name="BB Upper" />
                <Line type="monotone" dataKey="bbMiddle" stroke={OVERLAY_COLORS.BB} strokeWidth={1} dot={false} opacity={0.5} name="BB Mid" />
                <Line type="monotone" dataKey="bbLower" stroke={OVERLAY_COLORS.BB} strokeWidth={1} dot={false} strokeDasharray="4 2" name="BB Lower" />
              </>
            )}
            {activeOverlays.has("MA") && (
              <Line type="monotone" dataKey="ma" stroke={OVERLAY_COLORS.MA} strokeWidth={1.5} dot={false} name="MA(20)" />
            )}
            {activeOverlays.has("EMA") && (
              <Line type="monotone" dataKey="ema" stroke={OVERLAY_COLORS.EMA} strokeWidth={1.5} dot={false} name="EMA(20)" />
            )}
            {activeOverlays.has("RSI") && (
              <Line type="monotone" dataKey="rsi" stroke={OVERLAY_COLORS.RSI} strokeWidth={1.5} dot={false} name="RSI(14)" yAxisId="rsi" />
            )}
            {activeOverlays.has("MACD") && (
              <>
                <Line type="monotone" dataKey="macd" stroke={OVERLAY_COLORS.MACD} strokeWidth={1.5} dot={false} name="MACD" yAxisId="macd" />
                <Line type="monotone" dataKey="macdSignal" stroke="#f97316" strokeWidth={1} dot={false} strokeDasharray="3 2" name="Signal" yAxisId="macd" />
              </>
            )}

            {(activeOverlays.has("RSI") || activeOverlays.has("MACD")) && (
              <YAxis yAxisId="rsi" orientation="right" domain={[0, 100]} hide />
            )}
            {activeOverlays.has("MACD") && (
              <YAxis yAxisId="macd" orientation="right" hide />
            )}

            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 8 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
