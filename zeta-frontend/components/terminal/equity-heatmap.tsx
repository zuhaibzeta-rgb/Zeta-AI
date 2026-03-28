"use client"

import { useState } from "react"

interface HeatmapCell {
  ticker: string
  profitability: number
  isPositive: boolean
  marketCap: number
  price: number
  change24h: number
}

const heatmapData: HeatmapCell[] = [
  { ticker: "AAPL", profitability: 50.4, isPositive: true, marketCap: 3656.84, price: 248.8, change24h: 1.24 },
  { ticker: "NVDA", profitability: 46.4, isPositive: false, marketCap: 2145.32, price: 875.4, change24h: -2.15 },
  { ticker: "AMZN", profitability: 48.8, isPositive: false, marketCap: 1923.45, price: 184.3, change24h: -0.82 },
  { ticker: "META", profitability: 45.6, isPositive: false, marketCap: 1285.67, price: 505.6, change24h: -1.43 },
  { ticker: "LLY", profitability: 52.8, isPositive: true, marketCap: 892.34, price: 785.2, change24h: 2.67 },
  { ticker: "MSFT", profitability: 45.6, isPositive: false, marketCap: 3012.45, price: 415.2, change24h: -0.56 },
  { ticker: "TSLA", profitability: 49.6, isPositive: false, marketCap: 568.92, price: 178.9, change24h: -3.24 },
  { ticker: "GOOGL", profitability: 49.6, isPositive: false, marketCap: 1892.56, price: 152.8, change24h: -0.92 },
  { ticker: "BRK-B", profitability: 51.2, isPositive: true, marketCap: 892.34, price: 412.5, change24h: 0.45 },
  { ticker: "AVGO", profitability: 44.0, isPositive: false, marketCap: 712.45, price: 168.3, change24h: -1.87 },
]

interface EquityHeatmapProps {
  selectedAsset: string
  onAssetSelect: (ticker: string) => void
}

export function EquityHeatmap({ selectedAsset, onAssetSelect }: EquityHeatmapProps) {
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null)
  
  const hoveredCell = heatmapData.find(c => c.ticker === hoveredTicker)
  
  return (
    <div className="card-premium p-1 relative">
      <div className="mb-3 px-4 pt-4 flex items-center justify-between">
        <span className="text-xs text-white/40 uppercase tracking-wider">Market</span>
        {hoveredCell && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/60">
              <span className="text-white font-medium">{hoveredCell.ticker}</span> | ${hoveredCell.price}
            </span>
            <span className={hoveredCell.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {hoveredCell.change24h >= 0 ? '+' : ''}{hoveredCell.change24h.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-1 p-1">
        {heatmapData.map((cell) => {
          const isSelected = cell.ticker === selectedAsset
          const isHovered = cell.ticker === hoveredTicker
          
          // Calculate size based on market cap for visual weight
          const maxCap = Math.max(...heatmapData.map(d => d.marketCap))
          const sizeRatio = 0.7 + (cell.marketCap / maxCap) * 0.3
          
          return (
            <button
              key={cell.ticker}
              onClick={() => onAssetSelect(cell.ticker)}
              onMouseEnter={() => setHoveredTicker(cell.ticker)}
              onMouseLeave={() => setHoveredTicker(null)}
              className={`
                relative h-28 rounded-lg transition-all duration-200 overflow-hidden
                ${cell.isPositive 
                  ? "bg-gradient-to-br from-emerald-500/80 to-emerald-600/80" 
                  : "bg-gradient-to-br from-rose-500/80 to-rose-600/80"
                }
                ${isSelected ? "ring-2 ring-amber-400/50 ring-offset-2 ring-offset-[#0A0A0B]" : ""}
                ${isHovered ? "brightness-125 scale-[1.02] z-10" : "hover:brightness-110"}
              `}
              style={{
                boxShadow: isHovered 
                  ? cell.isPositive 
                    ? '0 0 30px rgba(34, 197, 94, 0.3)' 
                    : '0 0 30px rgba(239, 68, 68, 0.3)'
                  : 'none'
              }}
            >
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Pulse effect on hover */}
              {isHovered && (
                <div className="absolute inset-0 animate-pulse bg-white/5" />
              )}
              
              <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-white font-semibold text-sm">
                    {cell.ticker}
                  </span>
                  {isHovered && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      cell.change24h >= 0 
                        ? 'bg-emerald-500/30 text-emerald-100' 
                        : 'bg-rose-500/30 text-rose-100'
                    }`}>
                      {cell.change24h >= 0 ? '+' : ''}{cell.change24h}%
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-white/90 text-xs font-medium block">
                    {cell.profitability}%
                  </span>
                  {isHovered && (
                    <span className="text-white/60 text-[10px]">
                      ${cell.marketCap.toFixed(0)}B
                    </span>
                  )}
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Quick stats bar */}
      <div className="px-4 pb-4 pt-2 flex items-center justify-between text-xs border-t border-white/[0.04] mt-2">
        <div className="flex items-center gap-4">
          <span className="text-white/40">
            Gainers: <span className="text-emerald-400 font-medium">{heatmapData.filter(d => d.isPositive).length}</span>
          </span>
          <span className="text-white/40">
            Losers: <span className="text-rose-400 font-medium">{heatmapData.filter(d => !d.isPositive).length}</span>
          </span>
        </div>
        <span className="text-white/30">Click to select</span>
      </div>
    </div>
  )
}
