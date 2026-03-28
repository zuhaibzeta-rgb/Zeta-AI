"use client"

interface TradePanelProps {
  ticker: string
}

const mockData: Record<string, {
  price: number
  profitability: number
  beta: number
  volatility: number
  momentum: number
  riskScore: number
}> = {
  AAPL: { price: 248.8, profitability: 50.4, beta: 1.12, volatility: 23.5, momentum: 0.042, riskScore: 65 },
  NVDA: { price: 875.4, profitability: 46.4, beta: 1.85, volatility: 42.1, momentum: 0.128, riskScore: 82 },
  MSFT: { price: 415.2, profitability: 45.6, beta: 0.95, volatility: 21.3, momentum: 0.031, riskScore: 58 },
  GOOGL: { price: 152.8, profitability: 49.6, beta: 1.08, volatility: 25.8, momentum: 0.055, riskScore: 62 },
  AMZN: { price: 184.3, profitability: 48.8, beta: 1.22, volatility: 28.4, momentum: 0.067, riskScore: 68 },
  META: { price: 505.6, profitability: 45.6, beta: 1.35, volatility: 32.1, momentum: 0.089, riskScore: 72 },
  TSLA: { price: 178.9, profitability: 49.6, beta: 2.05, volatility: 52.3, momentum: -0.032, riskScore: 88 },
  "BRK-B": { price: 412.5, profitability: 51.2, beta: 0.82, volatility: 18.2, momentum: 0.018, riskScore: 42 },
  LLY: { price: 785.2, profitability: 52.8, beta: 0.65, volatility: 24.6, momentum: 0.095, riskScore: 55 },
  AVGO: { price: 168.4, profitability: 44.0, beta: 1.28, volatility: 31.8, momentum: 0.072, riskScore: 70 },
}

export function TradePanel({ ticker }: TradePanelProps) {
  const data = mockData[ticker] || mockData.AAPL

  return (
    <div className="card-premium p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Trade Panel</h3>
      
      {/* Ticker */}
      <div className="space-y-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Ticker</span>
        <p className="text-3xl font-bold text-white font-mono">{ticker}</p>
      </div>
      
      {/* Price */}
      <div className="space-y-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Price</span>
        <p className="text-3xl font-bold text-white font-mono">${data.price.toFixed(1)}</p>
      </div>
      
      {/* Profitability */}
      <div className="space-y-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Profitability</span>
        <p className={`text-3xl font-bold font-mono ${data.profitability >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
          {data.profitability}%
        </p>
      </div>
      
      {/* Beta */}
      <div className="space-y-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Beta</span>
        <p className="text-3xl font-bold text-white font-mono">{data.beta.toFixed(2)}</p>
      </div>
      
      {/* Volatility */}
      <div className="space-y-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Volatility</span>
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold text-white font-mono">{data.volatility}%</p>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 rounded-full transition-all"
              style={{ width: `${Math.min(data.volatility * 1.5, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Momentum */}
      <div className="space-y-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Momentum</span>
        <p className={`text-2xl font-bold font-mono ${data.momentum >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
          {data.momentum >= 0 ? "+" : ""}{data.momentum.toFixed(3)}
        </p>
      </div>
      
      {/* Risk Score */}
      <div className="space-y-2">
        <span className="text-xs text-white/40 uppercase tracking-wider">Risk Score</span>
        <div className="flex items-center gap-3">
          <p className={`text-2xl font-bold font-mono ${
            data.riskScore < 50 ? "text-emerald-400" : 
            data.riskScore < 70 ? "text-amber-400" : "text-rose-400"
          }`}>
            {data.riskScore}
          </p>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                data.riskScore < 50 ? "bg-emerald-400" : 
                data.riskScore < 70 ? "bg-amber-400" : "bg-rose-400"
              }`}
              style={{ width: `${data.riskScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
