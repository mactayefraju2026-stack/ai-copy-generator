"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockSignal } from "./api/stocks/analyze/route";

const DEFAULT_WATCHLIST = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "META", "GOOGL", "SPY"];

const SIGNAL_CONFIG = {
  DAY_TRADE: { label: "Day Trade", color: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200" },
  SWING_TRADE: { label: "Swing Trade", color: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  HOLD: { label: "Hold", color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  AVOID: { label: "Avoid", color: "bg-red-400", text: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const TREND_ICON = { up: "↑", down: "↓", sideways: "→" };
const MACD_ICON = { bullish: "▲", bearish: "▼", neutral: "—" };

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 70 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-600 w-8 text-right">{value}%</span>
    </div>
  );
}

function StockCard({ stock }: { stock: StockSignal }) {
  const sig = SIGNAL_CONFIG[stock.signal];
  const isPositive = stock.priceChangePct >= 0;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-xl p-4 ${sig.bg} transition-all`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{stock.ticker}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${sig.color}`}>
              {sig.label}
            </span>
          </div>
          <div className="text-sm text-gray-500 truncate max-w-[180px]">{stock.name}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">${stock.price.toFixed(2)}</div>
          <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}{stock.priceChange.toFixed(2)} ({isPositive ? "+" : ""}{stock.priceChangePct.toFixed(2)}%)
          </div>
        </div>
      </div>

      {stock.error ? (
        <p className="mt-2 text-sm text-red-600">Error: {stock.error}</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-gray-500">RSI</div>
              <div className={`font-bold text-sm ${stock.rsi < 30 ? "text-blue-600" : stock.rsi > 70 ? "text-red-600" : "text-gray-800"}`}>
                {stock.rsi.toFixed(1)}
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-gray-500">MACD</div>
              <div className={`font-bold text-sm ${stock.macdSignal === "bullish" ? "text-green-600" : stock.macdSignal === "bearish" ? "text-red-600" : "text-gray-600"}`}>
                {MACD_ICON[stock.macdSignal]} {stock.macdSignal}
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-gray-500">Trend</div>
              <div className={`font-bold text-sm ${stock.trend === "up" ? "text-green-600" : stock.trend === "down" ? "text-red-600" : "text-gray-600"}`}>
                {TREND_ICON[stock.trend]} {stock.trend}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">Confidence</div>
            <ConfidenceBar value={stock.confidence} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-gray-500">Vol Ratio</div>
              <div className={`font-semibold ${stock.volumeRatio >= 1.5 ? "text-green-600" : stock.volumeRatio < 0.7 ? "text-red-600" : "text-gray-800"}`}>
                {stock.volumeRatio.toFixed(2)}x
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <div className="text-gray-500">Stop Loss</div>
              <div className="font-semibold text-red-600">${stock.stopLoss}</div>
            </div>
          </div>

          <div className="mt-2 bg-white/60 rounded-lg p-2 text-xs flex justify-between">
            <div>
              <span className="text-gray-500">Target: </span>
              <span className="font-semibold text-green-600">${stock.targetPrice}</span>
            </div>
            <div>
              <span className="text-gray-500">Upside: </span>
              <span className="font-semibold text-green-600">
                +{(((stock.targetPrice - stock.price) / stock.price) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-800 underline"
          >
            {expanded ? "Hide reasons" : `Show ${stock.reasons.length} reasons`}
          </button>

          {expanded && stock.reasons.length > 0 && (
            <ul className="mt-2 space-y-1">
              {stock.reasons.map((r, i) => (
                <li key={i} className="text-xs text-gray-700 flex gap-1">
                  <span className="text-gray-400">•</span> {r}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

type SortKey = "signal" | "confidence" | "priceChangePct" | "volumeRatio" | "rsi";

const SIGNAL_ORDER = { DAY_TRADE: 0, SWING_TRADE: 1, HOLD: 2, AVOID: 3 };

export default function Home() {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<StockSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("signal");
  const [filterSignal, setFilterSignal] = useState<string>("ALL");

  useEffect(() => {
    const saved = localStorage.getItem("stock-watchlist");
    if (saved) {
      try { setWatchlist(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveWatchlist = (list: string[]) => {
    setWatchlist(list);
    localStorage.setItem("stock-watchlist", JSON.stringify(list));
  };

  const addTicker = () => {
    const tickers = input.toUpperCase().split(/[\s,]+/).filter(Boolean);
    const updated = [...new Set([...watchlist, ...tickers])];
    saveWatchlist(updated);
    setInput("");
  };

  const removeTicker = (ticker: string) => {
    saveWatchlist(watchlist.filter((t) => t !== ticker));
  };

  const runScan = useCallback(async () => {
    if (watchlist.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stocks/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: watchlist }),
      });
      const data = await res.json() as { results?: StockSignal[]; error?: string; timestamp?: string };
      if (data.error) throw new Error(data.error);
      setResults(data.results ?? []);
      setLastScanned(data.timestamp ?? new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  const sortedFiltered = results
    .filter((r) => filterSignal === "ALL" || r.signal === filterSignal)
    .sort((a, b) => {
      if (sortBy === "signal") return SIGNAL_ORDER[a.signal] - SIGNAL_ORDER[b.signal];
      if (sortBy === "confidence") return b.confidence - a.confidence;
      if (sortBy === "priceChangePct") return b.priceChangePct - a.priceChangePct;
      if (sortBy === "volumeRatio") return b.volumeRatio - a.volumeRatio;
      if (sortBy === "rsi") return a.rsi - b.rsi;
      return 0;
    });

  const summary = results.reduce(
    (acc, r) => { acc[r.signal] = (acc[r.signal] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Stock Daily Scanner</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Daily market research — find day trade, swing trade, or hold opportunities.
          </p>
          {lastScanned && (
            <p className="text-xs text-gray-500 mt-1">
              Last scan: {new Date(lastScanned).toLocaleString()}
            </p>
          )}
        </div>

        {/* Watchlist Manager */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Watchlist ({watchlist.length})</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {watchlist.map((t) => (
              <span key={t} className="flex items-center gap-1 bg-gray-800 text-gray-200 text-xs px-2.5 py-1 rounded-full">
                {t}
                <button onClick={() => removeTicker(t)} className="text-gray-500 hover:text-red-400 ml-0.5">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
              placeholder="Add tickers (e.g. AAPL, TSLA)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTicker()}
            />
            <button
              onClick={addTicker}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={runScan}
          disabled={loading || watchlist.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl mb-6 transition-colors"
        >
          {loading ? "Scanning market data…" : "Run Daily Scan"}
        </button>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Summary Bar */}
        {results.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(["DAY_TRADE", "SWING_TRADE", "HOLD", "AVOID"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSignal(filterSignal === s ? "ALL" : s)}
                className={`rounded-xl p-3 text-center border transition-all ${
                  filterSignal === s
                    ? SIGNAL_CONFIG[s].bg + " border-current"
                    : "bg-gray-900 border-gray-800 hover:bg-gray-800"
                }`}
              >
                <div className={`text-xl font-bold ${SIGNAL_CONFIG[s].text}`}>{summary[s] ?? 0}</div>
                <div className="text-xs text-gray-400 mt-0.5">{SIGNAL_CONFIG[s].label}</div>
              </button>
            ))}
          </div>
        )}

        {/* Sort Controls */}
        {results.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-gray-500">Sort by:</span>
            {(["signal", "confidence", "priceChangePct", "volumeRatio", "rsi"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  sortBy === k
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                {k === "priceChangePct" ? "% Change" : k === "volumeRatio" ? "Volume" : k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
            {filterSignal !== "ALL" && (
              <button
                onClick={() => setFilterSignal("ALL")}
                className="text-xs px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white ml-auto"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* Results Grid */}
        {sortedFiltered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedFiltered.map((stock) => (
              <StockCard key={stock.ticker} stock={stock} />
            ))}
          </div>
        )}

        {results.length > 0 && sortedFiltered.length === 0 && (
          <p className="text-center text-gray-500 py-12">No stocks match this filter.</p>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-600">
            <div className="text-5xl mb-4">📈</div>
            <p className="text-lg">Add tickers to your watchlist and run a scan.</p>
            <p className="text-sm mt-2">Signals: Day Trade · Swing Trade · Hold · Avoid</p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-10 border-t border-gray-800 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-semibold text-gray-400 mb-2">Signal Guide</p>
            <ul className="space-y-1">
              <li><span className="text-green-500 font-bold">Day Trade</span> — High volume + momentum + bullish MACD. Buy and sell same day.</li>
              <li><span className="text-blue-500 font-bold">Swing Trade</span> — Bullish setup, hold days to weeks.</li>
              <li><span className="text-yellow-500 font-bold">Hold</span> — Positive bias but not ideal for active trading.</li>
              <li><span className="text-red-400 font-bold">Avoid</span> — Weak signals or downtrend. Stay out.</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-400 mb-2">Indicators Used</p>
            <ul className="space-y-1">
              <li><span className="text-white">RSI</span> — Relative Strength Index (14-period). Under 30 = oversold, over 70 = overbought.</li>
              <li><span className="text-white">MACD</span> — Moving Average Convergence/Divergence. Bullish when histogram positive.</li>
              <li><span className="text-white">Volume Ratio</span> — Today&apos;s volume vs 10-day average. 2x+ = strong conviction.</li>
              <li><span className="text-white">Trend</span> — SMA5 vs SMA20 comparison.</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          For educational purposes only. Not financial advice. Always do your own research.
        </p>
      </div>
    </main>
  );
}
