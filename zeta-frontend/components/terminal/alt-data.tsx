"use client"

import { useState } from "react"
import { ChevronDown, Link2 } from "lucide-react"

const altDataEntries = [
  { date: "2026-03-20", source: "satellite", asset: "AAPL", signal: "parking_lot", value: 0.71 },
  { date: "2026-03-20", source: "web", asset: "AAPL", signal: "traffic", value: 0.64 },
  { date: "2026-03-20", source: "satellite", asset: "AMZN", signal: "parking_lot", value: 0.83 },
  { date: "2026-03-20", source: "web", asset: "AMZN", signal: "traffic", value: 0.79 },
  { date: "2026-03-20", source: "esg", asset: "MSFT", signal: "emissions", value: 0.52 },
  { date: "2026-03-20", source: "retail", asset: "WMT", signal: "footfall", value: 0.68 },
  { date: "2026-03-20", source: "shipping", asset: "TSLA", signal: "port_congestion", value: 0.44 },
]

const periodOptions = ["1mo", "3mo", "6mo", "1yr", "All"]

export function AltData() {
  const [period, setPeriod] = useState("3mo")
  
  const getSourceStyle = (source: string) => {
    switch (source) {
      case "satellite": return "text-blue-400"
      case "web": return "text-purple-400"
      case "esg": return "text-emerald-400"
      case "retail": return "text-amber-400"
      case "shipping": return "text-cyan-400"
      default: return "text-white/60"
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Alternative Data Integration */}
      <div>
        <h2 className="text-xl font-semibold text-gradient-warm mb-6">
          Alternative Data Integration
        </h2>
        
        <div className="card-premium overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th className="text-left w-12">#</th>
                <th className="text-left">date</th>
                <th className="text-left">source</th>
                <th className="text-left">asset</th>
                <th className="text-left">signal</th>
                <th className="text-right">value</th>
              </tr>
            </thead>
            <tbody>
              {altDataEntries.map((entry, i) => (
                <tr key={i} className="group">
                  <td className="text-white/40 font-mono text-sm">{i}</td>
                  <td className="text-white/70 font-mono text-sm">{entry.date}</td>
                  <td className={getSourceStyle(entry.source)}>{entry.source}</td>
                  <td className="text-white font-mono font-medium">{entry.asset}</td>
                  <td className="text-white/70">{entry.signal}</td>
                  <td className="text-right text-white font-mono">{entry.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Alternative Data Trends */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-white">Alternative Data Trends (Live via yFinance)</h3>
          <Link2 className="w-4 h-4 text-white/30" />
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs text-white/40 uppercase tracking-wider">Period</span>
          <div className="relative">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 pr-10 text-white text-sm min-w-[120px] focus:outline-none focus:border-[rgba(245,166,35,0.5)] focus:ring-2 focus:ring-[rgba(245,166,35,0.1)] transition-all cursor-pointer"
            >
              {periodOptions.map(opt => (
                <option key={opt} value={opt} className="bg-[#1A1A1D]">{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>
        
        {/* Trend Chart Placeholder */}
        <div className="card-premium p-6">
          <h4 className="text-white/70 text-sm mb-4">Alternative Data Asset Trends (Normalized Close Price via yFinance)</h4>
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Simulated multi-line chart */}
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line 
                    key={i}
                    x1="0" 
                    y1={i * 50} 
                    x2="400" 
                    y2={i * 50} 
                    stroke="rgba(255,255,255,0.04)" 
                    strokeDasharray="4 4"
                  />
                ))}
                
                {/* Line 1 - AAPL */}
                <path
                  d="M 0 150 Q 50 140 100 130 T 200 100 T 300 80 T 400 60"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2"
                />
                
                {/* Line 2 - AMZN */}
                <path
                  d="M 0 160 Q 50 155 100 140 T 200 120 T 300 90 T 400 70"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2"
                />
                
                {/* Line 3 - MSFT */}
                <path
                  d="M 0 140 Q 50 145 100 150 T 200 140 T 300 120 T 400 100"
                  fill="none"
                  stroke="#F472B6"
                  strokeWidth="2"
                />
              </svg>
              
              {/* Legend */}
              <div className="absolute bottom-0 left-0 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-blue-400" />
                  <span className="text-xs text-white/50">AAPL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-emerald-400" />
                  <span className="text-xs text-white/50">AMZN</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-pink-400" />
                  <span className="text-xs text-white/50">MSFT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
