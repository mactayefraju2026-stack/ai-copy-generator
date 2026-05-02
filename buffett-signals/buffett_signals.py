#!/usr/bin/env python3
"""
Buffett Signals — Daily stock analysis script.
Runs Mon-Fri via GitHub Actions. No paid APIs required.
"""

import os
import sys
from datetime import datetime, date
import pandas as pd
import yfinance as yf

# ── Buffett buy-zone price levels ────────────────────────────────────────────
WATCHLIST = {
    "AMZN": {"name": "Amazon",    "iv": 199, "watch": 190, "starter": 165, "core": 149, "truck": 127, "trim": 249},
    "AAPL": {"name": "Apple",     "iv": 185, "watch": 176, "starter": 155, "core": 140, "truck": 119, "trim": 231},
    "MSFT": {"name": "Microsoft", "iv": 380, "watch": 361, "starter": 323, "core": 295, "truck": 251, "trim": 475},
    "KO":   {"name": "Coca-Cola", "iv": 62,  "watch": 59,  "starter": 52,  "core": 47,  "truck": 40,  "trim": 78},
}

# ── ANSI colors (stripped in CI if needed) ───────────────────────────────────
USE_COLOR = sys.stdout.isatty()

def color(text: str, code: str) -> str:
    return f"\033[{code}m{text}\033[0m" if USE_COLOR else text

GREEN  = lambda t: color(t, "32")
RED    = lambda t: color(t, "31")
YELLOW = lambda t: color(t, "33")
CYAN   = lambda t: color(t, "36")
BOLD   = lambda t: color(t, "1")
DIM    = lambda t: color(t, "2")

# ── Technical indicators (pure Python / pandas, no ta-lib) ───────────────────

def compute_rsi(closes: pd.Series, period: int = 14) -> float:
    delta = closes.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(period).mean().iloc[-1]
    avg_loss = loss.rolling(period).mean().iloc[-1]
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 2)

def compute_ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()

def compute_macd(closes: pd.Series):
    ema12 = compute_ema(closes, 12)
    ema26 = compute_ema(closes, 26)
    macd_line = ema12 - ema26
    signal_line = compute_ema(macd_line, 9)
    histogram = macd_line - signal_line
    return round(macd_line.iloc[-1], 4), round(signal_line.iloc[-1], 4), round(histogram.iloc[-1], 4)

def compute_ma(closes: pd.Series, period: int) -> float:
    if len(closes) < period:
        return float("nan")
    return round(closes.rolling(period).mean().iloc[-1], 2)

# ── Zone detection ────────────────────────────────────────────────────────────

def detect_zone(price: float, levels: dict) -> tuple[str, str]:
    """Return (zone_label, action_emoji)."""
    if price <= levels["truck"]:
        return "TRUCK LOAD", "🚛"
    if price <= levels["core"]:
        return "CORE BUY", "🟢"
    if price <= levels["starter"]:
        return "STARTER", "🔵"
    if price <= levels["watch"]:
        return "WATCH", "👀"
    if price <= levels["iv"]:
        return "IV LINE", "📏"
    if price >= levels["trim"]:
        return "TRIM", "✂️"
    return "HOLD", "⏸️"

# ── Per-stock analysis ────────────────────────────────────────────────────────

def analyze(ticker: str, levels: dict) -> dict:
    name = levels["name"]
    try:
        tk = yf.Ticker(ticker)
        hist = tk.history(period="1y", interval="1d", auto_adjust=True)
        if hist.empty or len(hist) < 30:
            return {"ticker": ticker, "name": name, "error": "Insufficient data"}

        closes = hist["Close"]
        price = round(float(closes.iloc[-1]), 2)
        prev_close = round(float(closes.iloc[-2]), 2)
        change_pct = round((price - prev_close) / prev_close * 100, 2)

        rsi = compute_rsi(closes)
        macd, macd_sig, macd_hist = compute_macd(closes)
        ma50 = compute_ma(closes, 50)
        ma200 = compute_ma(closes, 200)

        macd_direction = "bullish" if macd_hist > 0 else "bearish"
        ma_trend = "uptrend" if ma50 > ma200 else "downtrend" if ma50 < ma200 else "neutral"
        rsi_status = "oversold" if rsi < 30 else "overbought" if rsi > 70 else "neutral"

        zone, zone_emoji = detect_zone(price, levels)

        # Day-trade flag: high momentum + volume spike + bullish technicals
        volume_today = float(hist["Volume"].iloc[-1])
        avg_volume = float(hist["Volume"].rolling(10).mean().iloc[-1])
        vol_ratio = round(volume_today / avg_volume, 2) if avg_volume > 0 else 1.0

        day_trade = (
            vol_ratio >= 1.5
            and change_pct >= 1.0
            and rsi < 70
            and macd_direction == "bullish"
        )
        swing_trade = (
            macd_direction == "bullish"
            and rsi_status != "overbought"
            and ma_trend != "downtrend"
        )

        return {
            "ticker": ticker,
            "name": name,
            "price": price,
            "change_pct": change_pct,
            "rsi": rsi,
            "rsi_status": rsi_status,
            "macd": macd,
            "macd_signal": macd_sig,
            "macd_hist": macd_hist,
            "macd_direction": macd_direction,
            "ma50": ma50,
            "ma200": ma200,
            "ma_trend": ma_trend,
            "vol_ratio": vol_ratio,
            "zone": zone,
            "zone_emoji": zone_emoji,
            "day_trade": day_trade,
            "swing_trade": swing_trade,
            "levels": levels,
            "error": None,
        }
    except Exception as e:
        return {"ticker": ticker, "name": name, "error": str(e)}

# ── Report generation ─────────────────────────────────────────────────────────

def build_markdown(results: list, run_date: str) -> str:
    lines = [
        f"# Buffett Signals — {run_date}",
        "",
        f"*Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}*",
        "",
        "---",
        "",
    ]

    day_trades = [r for r in results if r.get("day_trade")]
    swings = [r for r in results if r.get("swing_trade") and not r.get("day_trade")]

    if day_trades:
        lines += ["## Day Trade Opportunities", ""]
        for r in day_trades:
            lines.append(f"- **{r['ticker']}** (${r['price']}) — Vol {r['vol_ratio']}x avg, +{r['change_pct']}%, RSI {r['rsi']}")
        lines.append("")

    if swings:
        lines += ["## Swing Trade Setups", ""]
        for r in swings:
            lines.append(f"- **{r['ticker']}** (${r['price']}) — MACD {r['macd_direction']}, {r['ma_trend']}, RSI {r['rsi']}")
        lines.append("")

    lines += ["## Full Analysis", "", "| Ticker | Price | Change | Zone | RSI | MACD | MA Trend | Vol Ratio |", "|--------|-------|--------|------|-----|------|----------|-----------|"]

    for r in results:
        if r.get("error"):
            lines.append(f"| {r['ticker']} | — | — | ERROR: {r['error']} | — | — | — | — |")
            continue
        chg = f"+{r['change_pct']}%" if r["change_pct"] >= 0 else f"{r['change_pct']}%"
        lines.append(
            f"| {r['ticker']} | ${r['price']} | {chg} | {r['zone_emoji']} {r['zone']} "
            f"| {r['rsi']} ({r['rsi_status']}) | {r['macd_direction']} | {r['ma_trend']} | {r['vol_ratio']}x |"
        )

    lines += ["", "---", ""]
    lines += ["## Buy-Zone Price Levels", "", "| Ticker | Trim | IV Line | Watch | Starter | Core Buy | Truck Load |", "|--------|------|---------|-------|---------|----------|------------|"]
    for r in results:
        if r.get("error"):
            continue
        lv = r["levels"]
        lines.append(f"| {r['ticker']} | ${lv['trim']} | ${lv['iv']} | ${lv['watch']} | ${lv['starter']} | ${lv['core']} | ${lv['truck']} |")

    lines += ["", "---", "", "*Not financial advice. Do your own research.*", ""]
    return "\n".join(lines)

# ── Terminal summary ──────────────────────────────────────────────────────────

def print_summary(results: list, run_date: str):
    print()
    print(BOLD(f"{'─'*60}"))
    print(BOLD(f"  Buffett Signals  ·  {run_date}"))
    print(BOLD(f"{'─'*60}"))

    for r in results:
        if r.get("error"):
            print(f"  {r['ticker']:5s}  {RED('ERROR: ' + r['error'])}")
            continue

        chg_str = f"+{r['change_pct']}%" if r["change_pct"] >= 0 else f"{r['change_pct']}%"
        chg_colored = GREEN(chg_str) if r["change_pct"] >= 0 else RED(chg_str)

        zone_str = f"{r['zone_emoji']} {r['zone']}"
        zone_colored = (
            GREEN(zone_str) if r["zone"] in ("TRUCK LOAD", "CORE BUY") else
            YELLOW(zone_str) if r["zone"] in ("STARTER", "WATCH", "IV LINE") else
            RED(zone_str) if r["zone"] == "TRIM" else
            DIM(zone_str)
        )

        macd_colored = GREEN(r["macd_direction"]) if r["macd_direction"] == "bullish" else RED(r["macd_direction"])

        dt_flag = GREEN("  ◀ DAY TRADE") if r["day_trade"] else ""
        sw_flag = CYAN("  ◀ SWING") if r["swing_trade"] and not r["day_trade"] else ""

        ticker_fmt = f"{r['ticker']:5s}"
        print(f"  {BOLD(ticker_fmt)}  ${r['price']:<8}  {chg_colored:<12}  {zone_colored:<22}  RSI {r['rsi']:<6}  MACD {macd_colored}{dt_flag}{sw_flag}")

    print(BOLD(f"{'─'*60}"))
    day_trades = [r["ticker"] for r in results if r.get("day_trade")]
    swings = [r["ticker"] for r in results if r.get("swing_trade") and not r.get("day_trade")]
    if day_trades:
        print(f"  {GREEN('Day Trade:')}  {', '.join(day_trades)}")
    if swings:
        print(f"  {CYAN('Swing:    ')}  {', '.join(swings)}")
    if not day_trades and not swings:
        print(f"  {DIM('No strong signals today — patience.')}")
    print()

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    run_date = date.today().strftime("%Y-%m-%d")
    print(DIM(f"Fetching data for {', '.join(WATCHLIST.keys())} …"))

    results = [analyze(ticker, levels) for ticker, levels in WATCHLIST.items()]

    print_summary(results, run_date)

    os.makedirs("reports", exist_ok=True)
    md = build_markdown(results, run_date)

    latest_path = "reports/latest_report.md"
    dated_path = f"reports/{run_date}.md"

    with open(latest_path, "w") as f:
        f.write(md)
    with open(dated_path, "w") as f:
        f.write(md)

    print(DIM(f"Reports saved: {latest_path}  ·  {dated_path}"))

if __name__ == "__main__":
    main()
