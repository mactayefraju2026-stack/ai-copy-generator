/**
 * Morning Market Signal — Weekday 9:00 AM scheduler
 *
 * Usage:
 *   node scripts/market-cron.mjs
 *
 * Keep this running alongside `npm run dev` (or `npm start`).
 * At 9:00 AM Mon–Fri it fetches the dashboard data and logs a
 * summary to the terminal, then opens the dashboard in your browser.
 *
 * Requires the Next.js server to be running on PORT (default 3000).
 */

import cron from "node-cron";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const PORT = process.env.PORT ?? "3000";
const DASHBOARD_URL = `http://localhost:${PORT}/market`;
const API_URL = `http://localhost:${PORT}/api/market`;

const SIGNAL_ICONS = { BUY: "🟢", HOLD: "🟡", SELL: "🔴" };
const SENTIMENT_ICONS = { BULLISH: "📈", BEARISH: "📉", MIXED: "↔️" };

async function openBrowser(url) {
  const platform = process.platform;
  const cmd =
    platform === "darwin"
      ? `open "${url}"`
      : platform === "win32"
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;
  try {
    await execAsync(cmd);
  } catch {
    // non-fatal — browser open is best-effort
  }
}

async function runMorningSignal() {
  const now = new Date().toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  console.log("\n" + "─".repeat(60));
  console.log(`  MORNING MARKET SIGNAL  —  ${now}`);
  console.log("─".repeat(60));

  let snapshot;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} — is the Next.js server running?`);
    snapshot = await res.json();
  } catch (err) {
    console.error(`\n  ✗ Could not fetch market data: ${err.message}`);
    console.error(`  Make sure the Next.js server is running: npm run dev\n`);
    return;
  }

  const icon = SENTIMENT_ICONS[snapshot.sentiment] ?? "•";
  console.log(`\n  ${icon} Market: ${snapshot.sentiment}  —  ${snapshot.sentimentVerdict}\n`);

  for (const s of snapshot.stocks) {
    const sigIcon = SIGNAL_ICONS[s.signal] ?? "•";
    const chg = s.changePercent >= 0 ? `+${s.changePercent.toFixed(2)}%` : `${s.changePercent.toFixed(2)}%`;
    console.log(
      `  ${sigIcon} ${s.ticker.padEnd(5)}  $${s.currentPrice.toFixed(2).padStart(8)} (${chg.padStart(7)})` +
      `   RSI ${s.rsi.toFixed(1).padStart(5)}   ${s.signal} ${s.confidence}%`
    );
    console.log(`        Entry: $${s.entryRange.low.toFixed(2)} – $${s.entryRange.high.toFixed(2)}`);
    console.log(`        ${s.reasoning}`);
    console.log();
  }

  console.log("─".repeat(60));
  console.log(`  Dashboard: ${DASHBOARD_URL}`);
  console.log("─".repeat(60) + "\n");

  await openBrowser(DASHBOARD_URL);
}

// Schedule: 9:00 AM every weekday (Mon–Fri)
cron.schedule("0 9 * * 1-5", runMorningSignal, { timezone: "America/New_York" });

console.log("Morning Market Signal cron is running.");
console.log("Scheduled: 9:00 AM ET, Monday–Friday.");
console.log(`Dashboard will open at: ${DASHBOARD_URL}`);
console.log('Press Ctrl+C to stop.\n');

// Also run immediately on start if --now flag is passed
if (process.argv.includes("--now")) {
  console.log("--now flag detected, running analysis immediately…\n");
  runMorningSignal();
}
