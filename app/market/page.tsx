"use client";

import { useEffect, useState, useCallback } from "react";

interface StockSignal {
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

interface MarketSnapshot {
  timestamp: string;
  stocks: StockSignal[];
  sentiment: "BULLISH" | "BEARISH" | "MIXED";
  sentimentVerdict: string;
  error?: string;
}

const SIGNAL_STYLES = {
  BUY: {
    badge: "bg-emerald-500 text-white",
    border: "border-emerald-500/40",
    glow: "shadow-emerald-500/10",
    text: "text-emerald-400",
  },
  SELL: {
    badge: "bg-red-500 text-white",
    border: "border-red-500/40",
    glow: "shadow-red-500/10",
    text: "text-red-400",
  },
  HOLD: {
    badge: "bg-amber-500 text-black",
    border: "border-amber-500/40",
    glow: "shadow-amber-500/10",
    text: "text-amber-400",
  },
};

const SENTIMENT_STYLES = {
  BULLISH: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  BEARISH: "text-red-400 border-red-500/30 bg-red-500/10",
  MIXED: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtVol(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function RsiBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = value < 35 ? "bg-emerald-500" : value > 65 ? "bg-red-500" : "bg-amber-500";
  return (
    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
      <div className={`absolute left-0 top-0 h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: "35%" }} />
      <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: "65%" }} />
    </div>
  );
}

function StockCard({ stock }: { stock: StockSignal }) {
  const styles = SIGNAL_STYLES[stock.signal];
  const changePositive = stock.changePercent >= 0;

  return (
    <div className={`bg-white/5 border ${styles.border} rounded-2xl p-5 shadow-xl ${styles.glow} flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{stock.ticker}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.badge}`}>
              {stock.signal} {stock.confidence}%
            </span>
          </div>
          <p className="text-sm text-white/50 mt-0.5">{stock.name}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-white">${fmt(stock.currentPrice)}</div>
          <div className={`text-sm font-medium ${changePositive ? "text-emerald-400" : "text-red-400"}`}>
            {changePositive ? "+" : ""}{fmt(stock.changePercent, 2)}%
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="text-xs text-white/40 mb-1">RSI (14)</div>
          <div className={`text-base font-bold ${stock.rsi < 35 ? "text-emerald-400" : stock.rsi > 65 ? "text-red-400" : "text-white"}`}>
            {fmt(stock.rsi, 1)}
          </div>
          <RsiBar value={stock.rsi} />
        </div>
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="text-xs text-white/40 mb-1">MACD Hist</div>
          <div className={`text-base font-bold ${stock.macdHistogram >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {stock.macdHistogram >= 0 ? "+" : ""}{fmt(stock.macdHistogram, 3)}
          </div>
          <div className="text-xs text-white/30 mt-1">
            {stock.macdHistogram >= 0 ? "▲ Bullish" : "▼ Bearish"}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-2.5">
          <div className="text-xs text-white/40 mb-1">10d Mom</div>
          <div className={`text-base font-bold ${stock.momentum10d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {stock.momentum10d >= 0 ? "+" : ""}{fmt(stock.momentum10d, 1)}%
          </div>
          <div className="text-xs text-white/30 mt-1">
            Vol {fmtVol(stock.volume)} / {fmtVol(stock.avgVolume)} avg
          </div>
        </div>
      </div>

      {/* Entry range */}
      <div className={`rounded-xl border ${styles.border} px-4 py-2.5 flex items-center justify-between`}>
        <span className="text-xs text-white/50">Entry range</span>
        <span className={`text-sm font-semibold ${styles.text}`}>
          ${fmt(stock.entryRange.low)} – ${fmt(stock.entryRange.high)}
        </span>
      </div>

      {/* Reasoning */}
      <div>
        <div className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Signal reasoning</div>
        <p className="text-xs text-white/70 leading-relaxed">{stock.reasoning}</p>
      </div>

      {/* Risks */}
      <div>
        <div className="text-xs text-white/40 mb-1.5 uppercase tracking-wider">Key risks</div>
        <ul className="space-y-1">
          {stock.risks.map((r, i) => (
            <li key={i} className="flex gap-2 text-xs text-white/60">
              <span className="text-red-400 shrink-0 mt-px">▲</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MarketDashboard() {
  const [data, setData] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/market");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setCountdown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // countdown + auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          fetchData();
          return 60;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sentimentStyle = data ? SENTIMENT_STYLES[data.sentiment] : "";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Morning Market Signal</h1>
            <p className="text-xs text-white/40 mt-0.5">
              Real-time technical analysis · ABNB · COIN · AAPL · TSLA · NVDA
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <span className="text-xs text-white/30">
                Updated {new Date(data.timestamp).toLocaleTimeString()} · refresh in {countdown}s
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="text-xs bg-white/10 hover:bg-white/20 disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors"
            >
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Partial data error */}
        {data?.error && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-4 py-3 rounded-xl">
            Partial data: {data.error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 h-72 animate-pulse" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* Market sentiment */}
            <div className={`border rounded-2xl px-6 py-4 ${sentimentStyle}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs uppercase tracking-widest opacity-60 mb-1">Overall Market Conditions</div>
                  <div className="text-lg font-bold">{data.sentiment}</div>
                </div>
                <p className="text-sm opacity-80 max-w-xl">{data.sentimentVerdict}</p>
              </div>
            </div>

            {/* Stock grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.stocks.map((stock) => (
                <StockCard key={stock.ticker} stock={stock} />
              ))}
            </div>

            {/* Signal legend */}
            <div className="flex flex-wrap gap-4 text-xs text-white/40">
              <span><span className="text-emerald-400">RSI &lt; 35</span> = oversold (bullish)</span>
              <span><span className="text-red-400">RSI &gt; 65</span> = overbought (bearish)</span>
              <span><span className="text-emerald-400">MACD hist +</span> = bullish momentum</span>
              <span>Entry range = ±1–1.5% around current price</span>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-white/25 border-t border-white/10 pt-4 leading-relaxed">
              <strong className="text-white/40">Risk disclaimer:</strong> This dashboard displays algorithmic technical
              analysis for informational purposes only. Signals are based on RSI, MACD, and price momentum — not
              fundamental analysis, earnings, or macro data. Past indicator patterns do not guarantee future price
              movement. Day trading involves substantial risk of loss. This is not financial advice. Always trade with
              capital you can afford to lose and use stop-losses.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
