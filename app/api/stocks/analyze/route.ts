import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export interface StockSignal {
  ticker: string;
  name: string;
  price: number;
  priceChange: number;
  priceChangePct: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number;
  rsi: number;
  macdSignal: "bullish" | "bearish" | "neutral";
  trend: "up" | "down" | "sideways";
  signal: "DAY_TRADE" | "SWING_TRADE" | "HOLD" | "AVOID";
  confidence: number;
  reasons: string[];
  stopLoss: number;
  targetPrice: number;
  error?: string;
}

function computeRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function computeEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = values[0];
  ema.push(prev);
  for (let i = 1; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    ema.push(prev);
  }
  return ema;
}

function computeMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
  if (closes.length < 26) return { macd: 0, signal: 0, histogram: 0 };
  const ema12 = computeEMA(closes, 12);
  const ema26 = computeEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = computeEMA(macdLine.slice(-9), 9);
  const macd = macdLine[macdLine.length - 1];
  const sig = signalLine[signalLine.length - 1];
  return { macd, signal: sig, histogram: macd - sig };
}

function analyzeStock(
  ticker: string,
  quote: { regularMarketPrice?: number; regularMarketChange?: number; regularMarketChangePercent?: number; regularMarketVolume?: number; averageDailyVolume10Day?: number; regularMarketDayHigh?: number; regularMarketDayLow?: number; fiftyTwoWeekHigh?: number; fiftyTwoWeekLow?: number; shortName?: string; longName?: string },
  closes: number[],
  volumes: number[]
): StockSignal {
  const price = quote.regularMarketPrice ?? 0;
  const priceChange = quote.regularMarketChange ?? 0;
  const priceChangePct = quote.regularMarketChangePercent ?? 0;
  const volume = quote.regularMarketVolume ?? 0;
  const avgVolume = quote.averageDailyVolume10Day ?? volume;
  const volumeRatio = avgVolume > 0 ? volume / avgVolume : 1;
  const name = quote.shortName ?? quote.longName ?? ticker;

  const rsi = computeRSI(closes);
  const { macd, signal: macdSig, histogram } = computeMACD(closes);

  const macdSignal: "bullish" | "bearish" | "neutral" =
    histogram > 0 && macd > macdSig ? "bullish" : histogram < 0 ? "bearish" : "neutral";

  // Trend: compare 5-day vs 20-day avg
  const sma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
  const trend: "up" | "down" | "sideways" =
    sma5 > sma20 * 1.01 ? "up" : sma5 < sma20 * 0.99 ? "down" : "sideways";

  const reasons: string[] = [];
  let score = 0;

  // Volume analysis
  if (volumeRatio >= 2.0) {
    reasons.push(`High volume spike (${volumeRatio.toFixed(1)}x average)`);
    score += 3;
  } else if (volumeRatio >= 1.5) {
    reasons.push(`Above-average volume (${volumeRatio.toFixed(1)}x)`);
    score += 1;
  } else if (volumeRatio < 0.7) {
    reasons.push("Low volume — weak conviction");
    score -= 2;
  }

  // RSI analysis
  if (rsi < 30) {
    reasons.push(`RSI oversold (${rsi.toFixed(0)}) — potential reversal`);
    score += 2;
  } else if (rsi > 70) {
    reasons.push(`RSI overbought (${rsi.toFixed(0)}) — caution`);
    score -= 1;
  } else if (rsi >= 40 && rsi <= 65) {
    reasons.push(`RSI healthy range (${rsi.toFixed(0)})`);
    score += 1;
  }

  // Price momentum
  if (priceChangePct >= 2) {
    reasons.push(`Strong upward momentum (+${priceChangePct.toFixed(2)}%)`);
    score += 2;
  } else if (priceChangePct <= -2) {
    reasons.push(`Sharp decline (${priceChangePct.toFixed(2)}%) — risky for day trade`);
    score -= 1;
  } else if (priceChangePct > 0) {
    reasons.push(`Mild positive move (+${priceChangePct.toFixed(2)}%)`);
    score += 1;
  }

  // MACD
  if (macdSignal === "bullish") {
    reasons.push("MACD bullish crossover");
    score += 2;
  } else if (macdSignal === "bearish") {
    reasons.push("MACD bearish — downward pressure");
    score -= 1;
  }

  // Trend
  if (trend === "up") {
    reasons.push("Short-term uptrend (SMA5 > SMA20)");
    score += 2;
  } else if (trend === "down") {
    reasons.push("Downtrend — wait for reversal");
    score -= 2;
  }

  // Determine signal
  let signal: StockSignal["signal"];
  const isDayTradeable = volumeRatio >= 1.5 && priceChangePct >= 1 && rsi < 70 && macdSignal === "bullish";
  const isSwingTradeable = (rsi < 40 || macdSignal === "bullish") && trend !== "down" && volumeRatio > 0.8;

  if (isDayTradeable && score >= 6) {
    signal = "DAY_TRADE";
  } else if (isSwingTradeable && score >= 3) {
    signal = "SWING_TRADE";
  } else if (score >= 2 && trend !== "down") {
    signal = "HOLD";
  } else {
    signal = "AVOID";
  }

  // Confidence 0-100
  const confidence = Math.min(100, Math.max(0, score * 10 + 40));

  // Stop loss: 2% below current price (day trade) or 5% (swing/hold)
  const slPct = signal === "DAY_TRADE" ? 0.02 : 0.05;
  const stopLoss = parseFloat((price * (1 - slPct)).toFixed(2));

  // Target: 3% (day trade) or 10% (swing/hold)
  const tgtPct = signal === "DAY_TRADE" ? 0.03 : 0.1;
  const targetPrice = parseFloat((price * (1 + tgtPct)).toFixed(2));

  return {
    ticker: ticker.toUpperCase(),
    name,
    price,
    priceChange,
    priceChangePct,
    volume,
    avgVolume,
    volumeRatio,
    rsi,
    macdSignal,
    trend,
    signal,
    confidence,
    reasons,
    stopLoss,
    targetPrice,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { tickers } = await req.json() as { tickers: string[] };

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ error: "Provide a non-empty tickers array" }, { status: 400 });
    }

    const results: StockSignal[] = await Promise.all(
      tickers.slice(0, 20).map(async (ticker) => {
        try {
          const [quote, historyRaw] = await Promise.all([
            yahooFinance.quote(ticker),
            yahooFinance.historical(ticker, {
              period1: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              interval: "1d",
            }),
          ]);

          const history = historyRaw as Array<{ close: number; volume: number }>;
          const closes = history.map((h) => h.close).filter(Boolean) as number[];
          const volumes = history.map((h) => h.volume).filter(Boolean) as number[];

          return analyzeStock(ticker, quote as Parameters<typeof analyzeStock>[1], closes, volumes);
        } catch (err) {
          return {
            ticker: ticker.toUpperCase(),
            name: ticker,
            price: 0,
            priceChange: 0,
            priceChangePct: 0,
            volume: 0,
            avgVolume: 0,
            volumeRatio: 0,
            rsi: 50,
            macdSignal: "neutral" as const,
            trend: "sideways" as const,
            signal: "AVOID" as const,
            confidence: 0,
            reasons: [],
            stopLoss: 0,
            targetPrice: 0,
            error: err instanceof Error ? err.message : "Failed to fetch data",
          };
        }
      })
    );

    return NextResponse.json({ results, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
