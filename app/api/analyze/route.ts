import { execFile } from 'child_process'
import { promisify } from 'util'
import type { StockSignal } from './types'

const execFileAsync = promisify(execFile)

const UV_PATH = '/root/.local/bin/uv'
const SCRIPT_PATH =
  '/home/user/ai-copy-generator/.agents/skills/stock-analysis/scripts/analyze_stock.py'

const APPROVED_TICKERS = new Set([
  'AAPL', 'MSFT', 'JPM', 'JNJ', 'KO', 'PG', 'V', 'MA', 'BRK.B', 'WMT',
  'GOOGL', 'AMZN', 'META', 'NVDA', 'TSM',
  'T', 'VZ', 'XOM', 'PFE', 'HD', 'MCD',
])

export async function POST(request: Request): Promise<Response> {
  let body: { tickers?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tickers } = body

  if (!Array.isArray(tickers) || tickers.length === 0) {
    return Response.json({ error: 'tickers must be a non-empty array' }, { status: 400 })
  }
  if (tickers.length > 5) {
    return Response.json({ error: 'Maximum 5 tickers per request' }, { status: 400 })
  }

  const normalized = tickers.map((t: unknown) =>
    String(t).toUpperCase().replace('BRK-B', 'BRK.B')
  )
  const invalid = normalized.find((t) => !APPROVED_TICKERS.has(t))
  if (invalid) {
    return Response.json(
      { error: `${invalid} is not in the approved Blue Chip universe` },
      { status: 400 }
    )
  }

  try {
    const { stdout } = await execFileAsync(
      UV_PATH,
      ['run', SCRIPT_PATH, ...normalized, '--output', 'json'],
      {
        timeout: 60000,
        maxBuffer: 5 * 1024 * 1024,
        env: { ...process.env },
      }
    )

    const parsed = JSON.parse(stdout)
    const results: StockSignal[] = Array.isArray(parsed) ? parsed : [parsed]
    return Response.json({ results })
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { killed?: boolean; stderr?: string }
    if (e.killed || e.code === 'ETIMEDOUT') {
      return Response.json({ error: 'Analysis timed out. Try fewer tickers.' }, { status: 504 })
    }
    if (e.code === 'ENOENT') {
      return Response.json({ error: 'Analysis runtime not found' }, { status: 500 })
    }
    if (e.message?.includes('maxBuffer')) {
      return Response.json({ error: 'Analysis output too large' }, { status: 502 })
    }
    const detail = e.stderr?.trim() || e.message || 'Unknown error'
    return Response.json({ error: detail }, { status: 500 })
  }
}
