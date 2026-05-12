"use client";

import Link from "next/link";
import { useState } from "react";
import type { StockSignal } from "../api/analyze/types";

const APPROVED_TICKERS = [
  "AAPL", "MSFT", "JPM", "JNJ", "KO", "PG", "V", "MA", "BRK.B", "WMT",
  "GOOGL", "AMZN", "META", "NVDA", "TSM",
  "T", "VZ", "XOM", "PFE", "HD", "MCD",
];

function calcAllocation(signal: StockSignal) {
  const pct = signal.confidence * 100;
  const price = signal.components.analyst_sentiment?.current_price ?? 0;
  if (signal.recommendation !== "BUY" || pct < 60) {
    return {
      goNoGo: false as const,
      reason: pct < 60 ? "Score < 60 — NO TRADE" : `${signal.recommendation} signal — NO TRADE`,
    };
  }
  const maxAlloc = pct >= 80 ? 360 : 180;
  const shares = price > 0 ? Math.floor(maxAlloc / price) : 0;
  const totalCost = shares * price;
  return {
    goNoGo: true as const,
    maxAlloc,
    shares,
    totalCost,
    tier: pct >= 80 ? "HIGH" : "MEDIUM",
  };
}

function RSIBadge({ rsi }: { rsi: number | null }) {
  if (rsi === null) return null;
  if (rsi < 30)
    return (
      <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
        OVERSOLD ✓
      </span>
    );
  if (rsi > 70)
    return (
      <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
        OVERBOUGHT ⚠
      </span>
    );
  return (
    <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
      NEUTRAL
    </span>
  );
}

function SignalBadge({ rec }: { rec: string }) {
  if (rec === "BUY")
    return (
      <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white">
        BUY
      </span>
    );
  if (rec === "SELL")
    return (
      <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-500 text-white">
        SELL
      </span>
    );
  return (
    <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-400 text-black">
      HOLD
    </span>
  );
}

function StockCard({ signal }: { signal: StockSignal }) {
  const alloc = calcAllocation(signal);
  const pct = signal.confidence * 100;
  const sentiment = signal.components.analyst_sentiment;
  const momentum = signal.components.momentum;
  const market = signal.components.market_context;

  const borderClass =
    alloc.goNoGo && pct >= 80
      ? "border-green-500"
      : alloc.goNoGo
      ? "border-yellow-500"
      : "border-gray-300";

  return (
    <div className={`bg-white border-2 ${borderClass} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">
            {signal.ticker}
            <span className="ml-2 text-sm font-normal text-gray-500">
              {signal.company_name}
            </span>
          </h2>
          {signal.components.sector_performance?.sector_name && (
            <p className="text-xs text-gray-400 mt-0.5">
              {signal.components.sector_performance.sector_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SignalBadge rec={signal.recommendation} />
          <span className="text-sm text-gray-500">{pct.toFixed(0)}% conf</span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Confidence Score</span>
          <span>{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-500"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        {sentiment?.current_price != null && (
          <div>
            <span className="text-gray-500">Price</span>
            <p className="font-semibold">${sentiment.current_price.toFixed(2)}</p>
          </div>
        )}
        {sentiment?.price_target != null && (
          <div>
            <span className="text-gray-500">Analyst Target</span>
            <p className="font-semibold">
              ${sentiment.price_target.toFixed(2)}
              {sentiment.upside_pct != null && (
                <span className="ml-1 text-green-600 text-xs">
                  (+{sentiment.upside_pct.toFixed(1)}%)
                </span>
              )}
            </p>
          </div>
        )}
        {momentum?.rsi_14d != null && (
          <div>
            <span className="text-gray-500">RSI (14d)</span>
            <p className="font-semibold flex items-center">
              {momentum.rsi_14d.toFixed(1)}
              <RSIBadge rsi={momentum.rsi_14d} />
            </p>
          </div>
        )}
        {market?.vix_level != null && (
          <div>
            <span className="text-gray-500">VIX / Market</span>
            <p className="font-semibold">
              {market.vix_level.toFixed(1)}{" "}
              <span className="text-xs text-gray-500 capitalize">{market.market_regime}</span>
            </p>
          </div>
        )}
      </div>

      {/* THE POINT Allocation */}
      <div
        className={`rounded-lg p-3 mb-4 ${
          alloc.goNoGo
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              alloc.goNoGo
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {alloc.goNoGo ? "GO" : "NO-GO"}
          </span>
          <span className="text-xs font-semibold text-gray-700">
            THE POINT Allocation
          </span>
          {alloc.goNoGo && (
            <span className="text-xs text-gray-500">
              ({alloc.tier} confidence)
            </span>
          )}
        </div>
        {alloc.goNoGo ? (
          <p className="text-sm text-gray-700">
            Max ${alloc.maxAlloc} → <strong>{alloc.shares} share{alloc.shares !== 1 ? "s" : ""}</strong>{" "}
            @ ${(sentiment?.current_price ?? 0).toFixed(2)} ={" "}
            <strong>${alloc.totalCost.toFixed(2)}</strong>
          </p>
        ) : (
          <p className="text-sm text-red-700">{alloc.reason}</p>
        )}
      </div>

      {/* Supporting points */}
      {signal.supporting_points.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Signals
          </p>
          <ul className="space-y-1">
            {signal.supporting_points.slice(0, 3).map((pt, i) => (
              <li key={i} className="text-xs text-gray-700 flex gap-1">
                <span className="text-green-500 shrink-0">✓</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Caveats */}
      {signal.caveats.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Risks
          </p>
          <ul className="space-y-1">
            {signal.caveats.slice(0, 2).map((c, i) => (
              <li key={i} className="text-xs text-gray-500 flex gap-1">
                <span className="text-yellow-500 shrink-0">⚠</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-300 mt-3">
        {new Date(signal.timestamp).toLocaleString()}
      </p>
    </div>
  );
}

export default function StocksPage() {
  const [inputValue, setInputValue] = useState("");
  const [queuedTickers, setQueuedTickers] = useState<string[]>([]);
  const [results, setResults] = useState<StockSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTicker = () => {
    const t = inputValue.trim().toUpperCase().replace("BRK-B", "BRK.B");
    if (t && !queuedTickers.includes(t) && queuedTickers.length < 5) {
      setQueuedTickers((prev) => [...prev, t]);
    }
    setInputValue("");
  };

  const removeTicker = (t: string) =>
    setQueuedTickers((prev) => prev.filter((x) => x !== t));

  const analyze = async () => {
    if (queuedTickers.length === 0) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65000);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: queuedTickers }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed");
      } else {
        setResults(data.results ?? []);
      }
    } catch (err: unknown) {
      const e = err as Error;
      if (e.name === "AbortError") {
        setError("Request timed out. Try analyzing fewer tickers.");
      } else {
        setError(e.message ?? "Network error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Copy Generator
          </Link>
        </nav>

        <h1 className="text-3xl font-bold mb-1">THE POINT — Stock Analyzer</h1>
        <p className="text-gray-500 text-sm mb-6">
          Approved Blue Chip Universe Only · $900 Capital · NOT FINANCIAL ADVICE
        </p>

        {/* THE POINT Status Bar */}
        <div className="bg-black text-white rounded-lg p-4 mb-6 flex flex-wrap gap-4 text-sm">
          <span>
            💼 <strong>THE POINT:</strong> $900
          </span>
          <span>🔒 Cash Reserve: $270 (30%)</span>
          <span>⚡ Deployable: $630</span>
          <span className="text-green-400">High Conf (80%+): max $360/trade</span>
          <span className="text-yellow-400">Medium Conf (60-79%): max $180/trade</span>
        </div>

        {/* Ticker Input */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Select Tickers (max 5)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              list="approved-tickers"
              className="flex-1 border rounded p-2 text-sm"
              placeholder="Type ticker (e.g. AAPL, V, MCD)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTicker()}
            />
            <datalist id="approved-tickers">
              {APPROVED_TICKERS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <button
              onClick={addTicker}
              disabled={!inputValue.trim() || queuedTickers.length >= 5}
              className="px-4 py-2 bg-gray-800 text-white rounded text-sm disabled:opacity-40"
            >
              Add
            </button>
          </div>

          {/* Queued chips */}
          {queuedTickers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {queuedTickers.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {t}
                  <button
                    onClick={() => removeTicker(t)}
                    className="text-gray-400 hover:text-gray-700 ml-1"
                    aria-label={`Remove ${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            onClick={analyze}
            disabled={loading || queuedTickers.length === 0}
            className="w-full py-2.5 bg-black text-white rounded font-semibold disabled:opacity-40"
          >
            {loading ? "Analyzing… (may take 30–60s)" : "Analyze"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((signal) => (
              <StockCard key={signal.ticker} signal={signal} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
