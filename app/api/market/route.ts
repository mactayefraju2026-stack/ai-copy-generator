import { NextResponse } from "next/server";
import { runMarketAnalysis } from "@/lib/market-analysis";

const TICKERS = ["ABNB", "COIN", "AAPL", "TSLA", "NVDA"];

export async function GET() {
  try {
    const snapshot = await runMarketAnalysis(TICKERS);
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
