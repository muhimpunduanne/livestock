import { CandlestickData, IndicatorData } from "@/types";

function sma(values: number[], period: number): (number | null)[] {
  return values.map((_, i) => {
    if (i < period - 1) return null;
    const slice = values.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function ema(values: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let prev: number | null = null;
  values.forEach((v, i) => {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const init = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
      prev = init;
      result.push(init);
    } else {
      prev = v * k + prev! * (1 - k);
      result.push(prev);
    }
  });
  return result;
}

export function calcMA(data: CandlestickData[], period = 20): IndicatorData[] {
  const closes = data.map((d) => d.close);
  const values = sma(closes, period);
  return data.map((d, i) => ({ time: d.time, value: values[i] }));
}

export function calcEMA(data: CandlestickData[], period = 20): IndicatorData[] {
  const closes = data.map((d) => d.close);
  const values = ema(closes, period);
  return data.map((d, i) => ({ time: d.time, value: values[i] }));
}

export function calcRSI(data: CandlestickData[], period = 14): IndicatorData[] {
  const closes = data.map((d) => d.close);
  const result: IndicatorData[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      result.push({ time: data[i].time, value: null });
      continue;
    }
    const slice = closes.slice(i - period, i + 1);
    let gains = 0, losses = 0;
    for (let j = 1; j < slice.length; j++) {
      const diff = slice[j] - slice[j - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const rs = gains / (losses || 0.0001);
    result.push({ time: data[i].time, value: 100 - 100 / (1 + rs) });
  }
  return result;
}

export function calcMACD(
  data: CandlestickData[]
): { macd: IndicatorData[]; signal: IndicatorData[]; histogram: IndicatorData[] } {
  const closes = data.map((d) => d.close);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = closes.map((_, i) =>
    ema12[i] !== null && ema26[i] !== null ? ema12[i]! - ema26[i]! : null
  );
  const validMacd = macdLine.filter((v) => v !== null) as number[];
  const signalRaw = ema(validMacd, 9);

  let sigIdx = 0;
  const signal: IndicatorData[] = data.map((d, i) => {
    if (macdLine[i] === null) return { time: d.time, value: null };
    const v = signalRaw[sigIdx++] ?? null;
    return { time: d.time, value: v };
  });

  const macd: IndicatorData[] = data.map((d, i) => ({
    time: d.time,
    value: macdLine[i],
  }));

  const histogram: IndicatorData[] = data.map((d, i) => ({
    time: d.time,
    value:
      macd[i].value !== null && signal[i].value !== null
        ? macd[i].value! - signal[i].value!
        : null,
  }));

  return { macd, signal, histogram };
}

export function calcBollinger(
  data: CandlestickData[],
  period = 20,
  stdDevMultiplier = 2
): { upper: IndicatorData[]; middle: IndicatorData[]; lower: IndicatorData[] } {
  const closes = data.map((d) => d.close);
  const upper: IndicatorData[] = [];
  const middle: IndicatorData[] = [];
  const lower: IndicatorData[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push({ time: data[i].time, value: null });
      middle.push({ time: data[i].time, value: null });
      lower.push({ time: data[i].time, value: null });
      continue;
    }
    const slice = closes.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + (b - avg) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    upper.push({ time: data[i].time, value: avg + stdDevMultiplier * std });
    middle.push({ time: data[i].time, value: avg });
    lower.push({ time: data[i].time, value: avg - stdDevMultiplier * std });
  }

  return { upper, middle, lower };
}
