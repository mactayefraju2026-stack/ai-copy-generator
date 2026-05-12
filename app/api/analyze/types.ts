export interface StockSignal {
  ticker: string
  company_name: string
  recommendation: 'BUY' | 'HOLD' | 'SELL'
  confidence: number // 0.0–1.0
  final_score: number // -1.0–1.0
  supporting_points: string[]
  caveats: string[]
  timestamp: string
  disclaimer?: string
  components: {
    momentum?: {
      rsi_14d: number | null
      rsi_status: string
      near_52w_high: boolean
      near_52w_low: boolean
      volume_ratio: number | null
      score: number
    }
    analyst_sentiment?: {
      price_target: number | null
      current_price: number | null
      upside_pct: number | null
      consensus_rating: string | null
      num_analysts: number | null
      score: number | null
    }
    market_context?: {
      vix_level: number
      vix_status: string
      market_regime: string
      risk_off_detected: boolean
    }
    sentiment_analysis?: {
      short_interest_pct: number | null
      insider_net_value: number | null
      fear_greed_value: number | null
      fear_greed_status: string | null
    }
    sector_performance?: {
      sector_name: string
      relative_strength: number
    }
    [key: string]: unknown
  }
}

export interface AnalyzeRequest {
  tickers: string[]
}

export interface AnalyzeResponse {
  results: StockSignal[]
  error?: string
}
