"use client"

import { useState, useMemo } from "react"
import { Link2, Download, Search, Maximize2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

const correlationData = [
  { ticker1: "AAPL", ticker2: "AAPL", correlation: 1 },
  { ticker1: "TSLA", ticker2: "TSLA", correlation: 1 },
  { ticker1: "NVDA", ticker2: "NVDA", correlation: 1 },
  { ticker1: "MSFT", ticker2: "MSFT", correlation: 1 },
  { ticker1: "BRK-B", ticker2: "BRK-B", correlation: 1 },
  { ticker1: "META", ticker2: "META", correlation: 1 },
  { ticker1: "AVGO", ticker2: "AVGO", correlation: 1 },
  { ticker1: "LLY", ticker2: "LLY", correlation: 1 },
  { ticker1: "GOOGL", ticker2: "GOOGL", correlation: 1 },
  { ticker1: "AMZN", ticker2: "AMZN", correlation: 1 },
]

const backtestSignals = [
  { date: "2026-01-01", ticker: "AAPL", strategyReturn: 0.02, benchmarkReturn: 0.01, signal: "BUY" },
  { date: "2026-01-15", ticker: "MSFT", strategyReturn: 0.01, benchmarkReturn: 0.005, signal: "HOLD" },
  { date: "2026-02-01", ticker: "AMZN", strategyReturn: -0.01, benchmarkReturn: -0.02, signal: "SELL" },
]

const matrixTickers = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "BRK-B", "LLY", "AVGO"]

// Simulated correlation values
const correlationMatrix: number[][] = [
  [1, 0.06, 0.29, 0.18, 0.23, 0.24, 0.25, 0.26, 0.07, 0.34],
  [0.06, 1, 0.29, 0.36, 0.37, 0.08, -0.02, -0.10, 0.07, 0.33],
  [0.29, 0.29, 1, 0.57, 0.19, 0.25, 0.41, -0.24, 0.05, 0.69],
  [0.18, 0.36, 0.57, 1, 0.36, 0.28, 0.33, 0.05, -0.11, 0.42],
  [0.23, 0.37, 0.19, 0.36, 1, 0.52, 0.40, 0.14, -0.10, 0.20],
  [0.24, 0.08, 0.25, 0.28, 0.52, 1, 0.43, 0.06, 0.06, 0.21],
  [0.25, -0.02, 0.41, 0.33, 0.40, 0.43, 1, 0.04, -0.13, 0.32],
  [0.26, -0.10, -0.24, 0.05, 0.14, 0.06, 0.04, 1, 0.19, 0.07],
  [0.07, 0.07, 0.05, -0.11, -0.10, 0.06, -0.13, 0.19, 1, 0.00],
  [0.34, 0.33, 0.69, 0.42, 0.20, 0.21, 0.32, 0.07, 0.00, 1],
]

// Generate equity curve data
const equityCurveData = [
  { date: "Jan 4", strategy: 1.02, benchmark: 1.01 },
  { date: "Jan 7", strategy: 1.022, benchmark: 1.012 },
  { date: "Jan 10", strategy: 1.025, benchmark: 1.014 },
  { date: "Jan 13", strategy: 1.028, benchmark: 1.015 },
  { date: "Jan 16", strategy: 1.03, benchmark: 1.015 },
  { date: "Jan 19", strategy: 1.028, benchmark: 1.012 },
  { date: "Jan 22", strategy: 1.025, benchmark: 1.008 },
  { date: "Jan 25", strategy: 1.022, benchmark: 1.002 },
  { date: "Jan 28", strategy: 1.021, benchmark: 0.998 },
  { date: "Feb 1", strategy: 1.02, benchmark: 0.99 },
]

export function BacktestCorrelation() {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  
  const getCorrelationColor = (val: number, isHovered: boolean) => {
    const baseOpacity = isHovered ? 1 : 0.85
    if (val >= 0.8) return `rgba(30, 64, 175, ${baseOpacity})`
    if (val >= 0.6) return `rgba(37, 99, 235, ${baseOpacity})`
    if (val >= 0.4) return `rgba(59, 130, 246, ${baseOpacity})`
    if (val >= 0.2) return `rgba(96, 165, 250, ${baseOpacity})`
    if (val >= 0) return `rgba(147, 197, 253, ${baseOpacity * 0.6})`
    if (val >= -0.2) return `rgba(191, 219, 254, ${baseOpacity * 0.4})`
    return `rgba(219, 234, 254, ${baseOpacity * 0.3})`
  }
  
  const getSignalStyle = (signal: string) => {
    switch (signal) {
      case "BUY": return "badge-success"
      case "SELL": return "badge-destructive"
      default: return "badge-warning"
    }
  }
  
  // Get highlighted cells based on selected ticker
  const highlightedCells = useMemo(() => {
    if (!selectedTicker) return new Set<string>()
    const idx = matrixTickers.indexOf(selectedTicker)
    if (idx === -1) return new Set<string>()
    
    const cells = new Set<string>()
    for (let i = 0; i < matrixTickers.length; i++) {
      cells.add(`${idx}-${i}`)
      cells.add(`${i}-${idx}`)
    }
    return cells
  }, [selectedTicker])
  
  // Custom tooltip for equity curve
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1D]/95 border border-white/10 rounded-lg p-3 backdrop-blur-md">
          <p className="text-xs text-white/50 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between gap-4 text-xs">
              <span className={entry.dataKey === 'strategy' ? 'text-blue-400' : 'text-orange-400'}>
                {entry.dataKey === 'strategy' ? 'Strategy' : 'Benchmark'}
              </span>
              <span className="text-white font-mono">{entry.value.toFixed(4)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }
  
  return (
    <div className="space-y-8">
      {/* Correlation Matrix + Backtesting Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-gradient-warm">
          Correlation Matrix + Backtesting
        </h2>
        <Link2 className="w-4 h-4 text-white/30" />
      </div>
      
      {/* Return Correlation Matrix */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-medium">Return Correlation Matrix</h3>
          <p className="text-xs text-white/40">Hover for details, click ticker to highlight</p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Column headers */}
            <div className="flex items-center">
              <div className="w-16" />
              {matrixTickers.map((ticker) => (
                <div 
                  key={ticker} 
                  className={`w-16 text-center text-xs py-2 cursor-pointer transition-colors ${
                    selectedTicker === ticker ? 'text-amber-400 font-medium' : 'text-white/50 hover:text-white/70'
                  }`}
                  onClick={() => setSelectedTicker(selectedTicker === ticker ? null : ticker)}
                >
                  {ticker}
                </div>
              ))}
            </div>
            
            {/* Matrix rows */}
            {matrixTickers.map((rowTicker, rowIndex) => (
              <div key={rowTicker} className="flex items-center">
                <div 
                  className={`w-16 text-xs text-right pr-2 cursor-pointer transition-colors ${
                    selectedTicker === rowTicker ? 'text-amber-400 font-medium' : 'text-white/50 hover:text-white/70'
                  }`}
                  onClick={() => setSelectedTicker(selectedTicker === rowTicker ? null : rowTicker)}
                >
                  {rowTicker}
                </div>
                {matrixTickers.map((colTicker, colIndex) => {
                  const val = correlationMatrix[rowIndex][colIndex]
                  const cellKey = `${rowIndex}-${colIndex}`
                  const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex
                  const isHighlighted = highlightedCells.has(cellKey)
                  
                  return (
                    <div 
                      key={cellKey}
                      className={`w-16 h-10 flex items-center justify-center text-xs font-mono cursor-pointer transition-all relative ${
                        isHighlighted ? 'ring-1 ring-amber-400/50' : ''
                      }`}
                      style={{ 
                        backgroundColor: getCorrelationColor(val, isHovered || isHighlighted),
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        zIndex: isHovered ? 10 : 1,
                      }}
                      onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span className={`${isHovered ? 'text-white font-medium' : 'text-white/80'}`}>
                        {val.toFixed(2)}
                      </span>
                      
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#1A1A1D]/95 border border-white/10 rounded-lg p-2 backdrop-blur-md whitespace-nowrap z-20">
                          <p className="text-xs text-white font-medium">{rowTicker} vs {colTicker}</p>
                          <p className={`text-xs font-mono ${val >= 0.5 ? 'text-emerald-400' : val <= -0.2 ? 'text-rose-400' : 'text-amber-400'}`}>
                            Correlation: {val.toFixed(4)}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
            
            {/* Color scale legend */}
            <div className="flex items-center mt-4 ml-16">
              <div className="flex items-center gap-0.5">
                {[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((opacity, i) => (
                  <div 
                    key={i}
                    className="w-6 h-4 rounded-sm"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                  />
                ))}
              </div>
              <div className="flex gap-6 ml-4 text-xs text-white/40">
                <span>-0.2</span>
                <span>0</span>
                <span>0.4</span>
                <span>0.8</span>
                <span>1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Correlation Summary Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Correlation Summary</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Download className="w-4 h-4 text-white/40" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Search className="w-4 h-4 text-white/40" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Maximize2 className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>
        
        <div className="card-premium overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th className="text-left w-12">#</th>
                <th className="text-left">Ticker1</th>
                <th className="text-left">Ticker2</th>
                <th className="text-right">Correlation</th>
              </tr>
            </thead>
            <tbody>
              {correlationData.map((row, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] cursor-pointer transition-colors">
                  <td className="text-white/40 font-mono text-sm">{[0, 33, 22, 11, 77, 66, 99, 88, 55, 44][i]}</td>
                  <td className="text-white font-mono">{row.ticker1}</td>
                  <td className="text-white font-mono">{row.ticker2}</td>
                  <td className="text-right text-white font-mono">{row.correlation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Backtest Signals Table */}
      <div className="card-premium overflow-hidden">
        <table className="w-full table-premium">
          <thead>
            <tr>
              <th className="text-left w-12">#</th>
              <th className="text-left">date</th>
              <th className="text-left">ticker</th>
              <th className="text-right">strategy_return</th>
              <th className="text-right">benchmark_return</th>
              <th className="text-left">signal</th>
            </tr>
          </thead>
          <tbody>
            {backtestSignals.map((row, i) => (
              <tr key={i} className="group hover:bg-white/[0.02] cursor-pointer transition-colors">
                <td className="text-white/40 font-mono text-sm">{i}</td>
                <td className="text-white/70 font-mono text-sm">{row.date}</td>
                <td className="text-white font-mono font-medium">{row.ticker}</td>
                <td className={`text-right font-mono ${row.strategyReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {row.strategyReturn.toFixed(2)}
                </td>
                <td className={`text-right font-mono ${row.benchmarkReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {row.benchmarkReturn.toFixed(3)}
                </td>
                <td>
                  <span className={`${getSignalStyle(row.signal)} px-2 py-1 rounded-md text-xs font-medium`}>
                    {row.signal}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Equity Curve Backtest - Interactive with Recharts */}
      <div className="card-premium p-6">
        <h3 className="text-white font-medium mb-6">Equity Curve Backtest</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurveData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                domain={[0.98, 1.04]}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(val) => val.toFixed(2)}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={1} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
              <Line 
                type="monotone" 
                dataKey="strategy" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#F97316" 
                strokeWidth={2}
                dot={{ fill: '#F97316', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500 rounded-full" />
            <span className="text-xs text-white/60">Strategy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500 rounded-full" />
            <span className="text-xs text-white/60">Benchmark</span>
          </div>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/[0.06]">
          <div className="group cursor-pointer">
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2 group-hover:text-white/60 transition-colors">CAGR</span>
            <p className="text-2xl font-bold text-rose-400 font-mono">-0.84%</p>
          </div>
          <div className="group cursor-pointer">
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2 group-hover:text-white/60 transition-colors">Strategy End Value</span>
            <p className="text-2xl font-bold text-white font-mono">1.02</p>
          </div>
          <div className="group cursor-pointer">
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2 group-hover:text-white/60 transition-colors">Benchmark End Value</span>
            <p className="text-2xl font-bold text-white font-mono">0.99</p>
          </div>
        </div>
      </div>
    </div>
  )
}
