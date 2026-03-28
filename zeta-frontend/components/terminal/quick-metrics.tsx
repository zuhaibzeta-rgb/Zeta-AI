"use client"

import { Link2 } from "lucide-react"

interface QuickMetricsProps {
  ticker: string
}

const tickerData: Record<string, {
  sector: string
  marketCap: string
  pe: number
  riskLabel: string
}> = {
  AAPL: { sector: "Technology", marketCap: "$3656.84B", pe: 31.45, riskLabel: "Moderate" },
  NVDA: { sector: "Technology", marketCap: "$2145.32B", pe: 68.23, riskLabel: "High" },
  MSFT: { sector: "Technology", marketCap: "$3012.45B", pe: 35.82, riskLabel: "Moderate" },
  GOOGL: { sector: "Technology", marketCap: "$1892.56B", pe: 25.34, riskLabel: "Moderate" },
  AMZN: { sector: "Consumer Discretionary", marketCap: "$1923.45B", pe: 62.18, riskLabel: "Moderate" },
  META: { sector: "Technology", marketCap: "$1285.67B", pe: 28.92, riskLabel: "Moderate" },
  TSLA: { sector: "Consumer Discretionary", marketCap: "$568.92B", pe: 52.45, riskLabel: "Very High" },
  "BRK-B": { sector: "Financials", marketCap: "$892.34B", pe: 8.45, riskLabel: "Low" },
  LLY: { sector: "Healthcare", marketCap: "$745.23B", pe: 118.56, riskLabel: "Moderate" },
  AVGO: { sector: "Technology", marketCap: "$698.45B", pe: 45.67, riskLabel: "Moderate" },
}

const journalEntries = [
  { date: "2026-03-20", ticker: "AAPL", title: "Why this matters", body: "Long-term moat, stable demand, and improving sentiment." }
]

export function QuickMetrics({ ticker }: QuickMetricsProps) {
  const data = tickerData[ticker] || tickerData.AAPL
  
  return (
    <div className="space-y-8">
      {/* Quick Metrics */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Quick Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Sector</span>
            <p className="text-2xl font-bold text-white font-mono">{data.sector}</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Market Cap</span>
            <p className="text-2xl font-bold text-white font-mono">{data.marketCap}</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">P/E</span>
            <p className="text-2xl font-bold text-white font-mono">{data.pe.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Risk Label</span>
            <p className={`text-2xl font-bold font-mono ${
              data.riskLabel === "Low" ? "text-emerald-400" :
              data.riskLabel === "Moderate" ? "text-amber-400" :
              data.riskLabel === "High" ? "text-orange-400" :
              "text-rose-400"
            }`}>
              {data.riskLabel}
            </p>
          </div>
        </div>
      </div>
      
      {/* Ticker Journal */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xl font-semibold text-white">Ticker Journal</h3>
          <Link2 className="w-4 h-4 text-white/30" />
        </div>
        
        <div className="card-premium overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">date</th>
                <th className="text-left">ticker</th>
                <th className="text-left">title</th>
                <th className="text-left">body</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map((entry, i) => (
                <tr key={i}>
                  <td className="text-white/50 font-mono">{i}</td>
                  <td className="text-white/80 font-mono">{entry.date}</td>
                  <td className="text-white font-mono font-medium">{entry.ticker}</td>
                  <td className="text-white/80">{entry.title}</td>
                  <td className="text-white/60">{entry.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
