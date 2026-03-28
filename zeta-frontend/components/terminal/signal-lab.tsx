"use client"

import { useState } from "react"

interface SliderConfig {
  label: string
  value: number
  min: number
  max: number
  step: number
}

const signalTableData = [
  { ticker: "WMT", momentum: -0.0395, risk: 0.3105, score: 0.2777, action: "HOLD", sector: "Consumer Staples" },
  { ticker: "TMUS", momentum: -0.0289, risk: 0.2839, score: 0.2619, action: "HOLD", sector: "Communication Services" },
  { ticker: "COST", momentum: -0.0266, risk: 0.2896, score: 0.2534, action: "HOLD", sector: "Consumer Staples" },
  { ticker: "BRK-B", momentum: -0.0722, risk: 0.2255, score: 0.2151, action: "HOLD", sector: "Financials" },
  { ticker: "MA", momentum: -0.0637, risk: 0.3101, score: 0.1983, action: "HOLD", sector: "Financials" },
  { ticker: "AAPL", momentum: -0.0582, risk: 0.3222, score: 0.1836, action: "HOLD", sector: "Technology" },
  { ticker: "JPM", momentum: -0.0581, risk: 0.3439, score: 0.1768, action: "HOLD", sector: "Financials" },
  { ticker: "PG", momentum: -0.1465, risk: 0.2234, score: 0.1568, action: "HOLD", sector: "Consumer Staples" },
  { ticker: "BAC", momentum: -0.0574, risk: 0.36, score: 0.1503, action: "HOLD", sector: "Financials" },
  { ticker: "V", momentum: -0.0769, risk: 0.2966, score: 0.1171, action: "HOLD", sector: "Financials" },
]

const customStrategyData = [
  { ticker: "WMT", score: 0.28 },
  { ticker: "TMUS", score: 0.26 },
  { ticker: "COST", score: 0.25 },
  { ticker: "BRK-B", score: 0.22 },
  { ticker: "MA", score: 0.20 },
  { ticker: "AAPL", score: 0.18 },
  { ticker: "JPM", score: 0.18 },
  { ticker: "PG", score: 0.16 },
  { ticker: "BAC", score: 0.15 },
  { ticker: "V", score: 0.11 },
  { ticker: "TXN", score: 0.08 },
  { ticker: "NFLX", score: 0.07 },
  { ticker: "INTU", score: 0.06 },
  { ticker: "HD", score: 0.05 },
  { ticker: "LLY", score: 0.04 },
]

export function SignalLab() {
  const [sliders, setSliders] = useState<SliderConfig[]>([
    { label: "Profitability weight", value: 1.00, min: 0, max: 2, step: 0.01 },
    { label: "Risk weight", value: 0.70, min: 0, max: 2, step: 0.01 },
    { label: "Momentum weight", value: 0.80, min: 0, max: 2, step: 0.01 },
    { label: "Z-score weight", value: 0.40, min: 0, max: 2, step: 0.01 },
  ])
  
  const updateSlider = (index: number, value: number) => {
    const newSliders = [...sliders]
    newSliders[index].value = value
    setSliders(newSliders)
  }
  
  const maxScore = Math.max(...customStrategyData.map(d => d.score))
  
  return (
    <div className="space-y-8">
      {/* Signal Lab Header */}
      <div>
        <h2 className="text-xl font-semibold text-gradient-warm mb-2">
          Signal Lab
        </h2>
        <p className="text-white/50 text-sm">
          Use this area to test custom score formulas and strategy rules.
        </p>
      </div>
      
      {/* Weight Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {sliders.map((slider, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase tracking-wider">{slider.label}</span>
              <span className="text-sm text-[#F5A623] font-mono font-medium">{slider.value.toFixed(2)}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={slider.value}
                onChange={(e) => updateSlider(i, parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F5A623] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(245,166,35,0.5)]"
              />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#F5A623] to-[#F97316] rounded-full pointer-events-none"
                style={{ width: `${(slider.value / slider.max) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/30">
              <span>{slider.min.toFixed(2)}</span>
              <span>{slider.max.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Signal Table */}
      <div className="card-premium overflow-hidden">
        <table className="w-full table-premium">
          <thead>
            <tr>
              <th className="text-left w-12">#</th>
              <th className="text-left">Ticker</th>
              <th className="text-right">Momentum</th>
              <th className="text-right">Risk</th>
              <th className="text-right">Score</th>
              <th className="text-left">Action</th>
              <th className="text-left">Sector</th>
            </tr>
          </thead>
          <tbody>
            {signalTableData.map((row, i) => (
              <tr key={i} className="group">
                <td className="text-white/40 font-mono text-sm">{i + 21 - i * 3}</td>
                <td className="text-white font-mono font-medium">{row.ticker}</td>
                <td className={`text-right font-mono ${row.momentum < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {row.momentum.toFixed(4)}
                </td>
                <td className="text-right text-white/80 font-mono">{row.risk.toFixed(4)}</td>
                <td className="text-right text-white font-mono">{row.score.toFixed(4)}</td>
                <td>
                  <span className="badge-warning px-2 py-1 rounded-md text-xs font-medium">
                    {row.action}
                  </span>
                </td>
                <td className="text-white/60">{row.sector}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Custom Strategy Scores Chart */}
      <div className="card-premium p-6">
        <h3 className="text-white font-medium mb-6">Custom Strategy Scores</h3>
        
        <div className="flex items-end justify-between h-64 gap-1">
          {customStrategyData.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-blue-400/80 rounded-t-lg transition-all hover:bg-blue-400"
                style={{ height: `${(item.score / maxScore) * 100}%` }}
              />
              <span className="text-xs text-white/40 font-mono -rotate-45 origin-top-left translate-y-2 whitespace-nowrap">
                {item.ticker}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <span className="text-xs text-white/60">Action: HOLD</span>
        </div>
      </div>
      
      {/* Signal Formula Notes */}
      <div className="card-premium p-6">
        <h3 className="text-white font-medium mb-4">Signal Formula Notes</h3>
        <ul className="space-y-2 text-white/70 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-white/40">•</span>
            Profitability contributes to long bias
          </li>
          <li className="flex items-start gap-2">
            <span className="text-white/40">•</span>
            Risk and beta reduce score
          </li>
          <li className="flex items-start gap-2">
            <span className="text-white/40">•</span>
            Momentum improves score
          </li>
          <li className="flex items-start gap-2">
            <span className="text-white/40">•</span>
            Z-score can detect stretched moves
          </li>
        </ul>
      </div>
    </div>
  )
}
