import YahooFinanceClass from "yahoo-finance2";
import { RSI, MACD } from "technicalindicators";

// yahoo-finance2 v3 exports a class as its default
const YF = YahooFinanceClass as unknown as new (opts?: object) => {
  historical: (
    symbol: string,
    opts: { period1: string; period2?: string; interval?: string }
  ) => Promise<Array<{ date: Date; close: number; adjClose?: number; volume: number }>>;
  quote: (symbol: string) => Promise<{
    regularMarketPrice: number;
    regularMarketPreviousClose: number;
    regularMarketChangePercent: number;
    regularMarketVolume: number;
    averageDailyVolume3Month: number;
    shortName?: string;
  }>;
};

const yf = new YF({ suppressNotices: ["ripHistorical", "yahooSurvey"] });

export interface StockSignal {
  ticker: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  momentum10d: number;
  volume: number;
  avgVolume: number;
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  entryRange: { low: number; high: number };
  reasoning: string;
  risks: string[];
}

export interface MarketSnapshot {
  timestamp: string;
  stocks: StockSignal[];
  sentiment: "BULLISH" | "BEARISH" | "MIXED";
  sentimentVerdict: string;
  error?: string;
}

const TICKER_META: Record<string, { name: string; risks: string[] }> = {
  ABNB: {
    name: "Airbnb",
    risks: [
      "Travel demand sensitive to macro slowdown and consumer spending cuts",
      "Regulatory crackdowns on short-term rentals in major cities (NYC, Barcelona)",
    ],
  },
  COIN: {
    name: "Coinbase",
    risks: [
      "Crypto market can gap 10–20%+ intraday — extreme volatility risk",
      "Ongoing SEC scrutiny and potential enforcement actions on exchange listings",
    ],
  },
  AAPL: {
    name: "Apple",
    risks: [
      "China revenue (~20% of sales) exposed to tariff escalation and demand risk",
      "iPhone upgrade cycle dependency — near-term units miss could drag stock",
    ],
  },
  TSLA: {
    name: "Tesla",
    risks: [
      "CEO distraction risk and brand sentiment headwinds in key European markets",
      "Intensifying EV competition from BYD, GM, and legacy OEMs on price/range",
    ],
  },
  NVDA: {
    name: "NVIDIA",
    risks: [
      "AI datacenter capex cycle risk — any deceleration signals could gap stock down",
      "U.S. export restrictions on H100/B200 chips to China markets limit upside",
    ],
  },
};

function buildSignal(
  rsi: number,
  macd: number,
  macdSig: number,
  histogram: number,
  momentum: number
): { signal: "BUY" | "HOLD" | "SELL"; confidence: number; reasoning: string } {
  let bullish = 0;
  let bearish = 0;
  const parts: string[] = [];

  // RSI
  if (rsi < 35) {
    bullish++;
    parts.push(`RSI oversold at ${rsi.toFixed(1)}`);
  } else if (rsi > 65) {
    bearish++;
    parts.push(`RSI overbought at ${rsi.toFixed(1)}`);
  } else {
    parts.push(`RSI neutral at ${rsi.toFixed(1)}`);
  }

  // MACD
  if (macd > macdSig && histogram > 0) {
    bullish++;
    parts.push("MACD bullish crossover");
  } else if (macd < macdSig && histogram < 0) {
    bearish++;
    parts.push("MACD bearish crossover");
  } else {
    parts.push("MACD mixed");
  }

  // 10-day momentum
  if (momentum > 2) {
    bullish++;
    parts.push(`10d momentum +${momentum.toFixed(1)}%`);
  } else if (momentum < -2) {
    bearish++;
    parts.push(`10d momentum ${momentum.toFixed(1)}%`);
  } else {
    parts.push(`10d momentum ${momentum.toFixed(1)}% (flat)`);
  }

  let signal: "BUY" | "HOLD" | "SELL";
  let confidence: number;

  if (bullish === 3) {
    signal = "BUY";
    confidence = 85;
  } else if (bullish === 2 && bearish === 0) {
    signal = "BUY";
    confidence = 68;
  } else if (bullish === 2 && bearish === 1) {
    signal = "BUY";
    confidence = 55;
  } else if (bearish === 3) {
    signal = "SELL";
    confidence = 85;
  } else if (bearish === 2 && bullish === 0) {
    signal = "SELL";
    confidence = 68;
  } else if (bearish === 2 && bullish === 1) {
    signal = "SELL";
    confidence = 55;
  } else {
    signal = "HOLD";
    confidence = 50;
  }

  return { signal, confidence, reasoning: parts.join(" · ") };
}

async function analyzeOne(ticker: string): Promise<StockSignal> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 120);

  const [history, quote] = await Promise.all([
    yf.historical(ticker, {
      period1: start.toISOString().split("T")[0],
      period2: end.toISOString().split("T")[0],
      interval: "1d",
    }),
    yf.quote(ticker),
  ]);

  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const closes = sorted.map((d) => d.adjClose ?? d.close);

  const rsiValues = RSI.calculate({ values: closes, period: 14 });
  const macdValues = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  const rsi = rsiValues.at(-1) ?? 50;
  const latestMacd = macdValues.at(-1) ?? { MACD: 0, signal: 0, histogram: 0 };

  const price10dAgo = closes.at(-11) ?? closes.at(-1) ?? 1;
  const currentClose = closes.at(-1) ?? 1;
  const momentum10d = ((currentClose - price10dAgo) / price10dAgo) * 100;

  const { signal, confidence, reasoning } = buildSignal(
    rsi,
    latestMacd.MACD ?? 0,
    latestMacd.signal ?? 0,
    latestMacd.histogram ?? 0,
    momentum10d
  );

  const price = quote.regularMarketPrice;
  const entryRange =
    signal === "BUY"
      ? { low: price * 0.986, high: price * 1.005 }
      : signal === "SELL"
        ? { low: price * 0.995, high: price * 1.014 }
        : { low: price * 0.99, high: price * 1.01 };

  const recentVolumes = sorted.slice(-20).map((d) => d.volume);
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;

  const meta = TICKER_META[ticker] ?? { name: ticker, risks: ["Market and sector risks apply"] };

  return {
    ticker,
    name: quote.shortName ?? meta.name,
    currentPrice: quote.regularMarketPrice,
    previousClose: quote.regularMarketPreviousClose,
    changePercent: quote.regularMarketChangePercent,
    rsi,
    macd: latestMacd.MACD ?? 0,
    macdSignal: latestMacd.signal ?? 0,
    macdHistogram: latestMacd.histogram ?? 0,
    momentum10d,
    volume: quote.regularMarketVolume,
    avgVolume,
    signal,
    confidence,
    entryRange,
    reasoning,
    risks: meta.risks,
  };
}

export async function runMarketAnalysis(tickers: string[]): Promise<MarketSnapshot> {
  const results = await Promise.allSettled(tickers.map(analyzeOne));

  const stocks: StockSignal[] = [];
  const errors: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      stocks.push(r.value);
    } else {
      errors.push(`${tickers[i]}: ${(r.reason as Error).message}`);
    }
  }

  const buys = stocks.filter((s) => s.signal === "BUY").length;
  const sells = stocks.filter((s) => s.signal === "SELL").length;

  let sentiment: "BULLISH" | "BEARISH" | "MIXED";
  let sentimentVerdict: string;

  if (buys >= 3) {
    sentiment = "BULLISH";
    sentimentVerdict = `${buys}/${stocks.length} names showing buy signals — selective long bias today.`;
  } else if (sells >= 3) {
    sentiment = "BEARISH";
    sentimentVerdict = `${sells}/${stocks.length} names under sell pressure — consider sitting out or shorting.`;
  } else {
    sentiment = "MIXED";
    sentimentVerdict = `Mixed tape: ${buys} buy, ${stocks.length - buys - sells} hold, ${sells} sell. Trade selectively with tight stops.`;
  }

  return {
    timestamp: new Date().toISOString(),
    stocks,
    sentiment,
    sentimentVerdict,
    error: errors.length ? errors.join("; ") : undefined,
  };
}
