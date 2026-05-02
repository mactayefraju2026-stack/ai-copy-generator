# Buffett Signals

Automated weekday stock scanner that checks AMZN, AAPL, MSFT, and KO against Buffett-style buy-zone price levels.

Runs every weekday at 9:35 AM ET via GitHub Actions. Reports are committed to `reports/` automatically.

## Signals

| Signal | Meaning |
|---|---|
| **Day Trade** | Volume spike ≥1.5× avg + price +1%+ + RSI <70 + bullish MACD |
| **Swing Trade** | Bullish MACD + not overbought + not in downtrend |
| **Hold** | In a buy zone but no active entry signal |
| **Trim** | Price above trim level — consider reducing position |

## Buy Zones

| Ticker | Trim | IV Line | Watch | Starter | Core Buy | Truck Load |
|--------|------|---------|-------|---------|----------|------------|
| AMZN | $249 | $199 | $190 | $165 | $149 | $127 |
| AAPL | $231 | $185 | $176 | $155 | $140 | $119 |
| MSFT | $475 | $380 | $361 | $323 | $295 | $251 |
| KO   | $78  | $62  | $59  | $52  | $47  | $40  |

## Run locally

```bash
pip install -r requirements.txt
python buffett_signals.py
```

Reports are saved to `reports/latest_report.md` and `reports/YYYY-MM-DD.md`.

## Setup (one time)

1. Push this repo to GitHub
2. Go to **Actions** tab → click **Run workflow** to test immediately
3. From then on it runs automatically Mon–Fri at 9:35 AM ET

---
*Not financial advice. Do your own research.*
