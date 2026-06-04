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
import { calcMA, calcEMA, calcRSI, calcMACD, calcBollinger } from "@/lib/indicators";

interface Props {
  data: CandlestickData[];
  symbol: string;
}

type Overlay = "MA" | "EMA" | "RSI" | "MACD" | "BB";

const OVERLAY_COLORS: Record<Overlay, string> = {
  MA: "#f59e0b",
  EMA: "#8b5cf6",
  RSI: "#06b6d4",
  MACD: "#ec4899",
  BB: "#10b981",
};

export default function CandlestickChart({ data, symbol }: Props) {
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

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-100">{symbol} — 90 Day Chart</h3>
        <div className="flex gap-2">
          {overlays.map((o) => (
            <button
              key={o}
              onClick={() => toggleOverlay(o)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                activeOverlays.has(o)
                  ? "border-transparent text-gray-900"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
              style={
                activeOverlays.has(o)
                  ? { backgroundColor: OVERLAY_COLORS[o] }
                  : {}
              }
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            interval={14}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#9ca3af" }}
          />

          {/* Candle wicks */}
          <Bar dataKey="barHigh" fill="transparent" stroke="transparent" />

          {/* Candle bodies using close-open range */}
          <Bar
            dataKey="bodyHigh"
            fill="#10b981"
            stroke="none"
            barSize={4}
          />

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

          <Legend
            wrapperStyle={{ fontSize: 11, color: "#9ca3af" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
