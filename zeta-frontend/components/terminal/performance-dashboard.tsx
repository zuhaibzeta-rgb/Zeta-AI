"use client"

import { useState } from "react"
import { ChevronDown, Link2 } from "lucide-react"
import { EquityHeatmap } from "./equity-heatmap"
import { CandlestickChart } from "./candlestick-chart"
import { TradePanel } from "./trade-panel"
import { BayesianResults } from "./bayesian-results"
import { AgentLogs } from "./agent-logs"
import { QuickMetrics } from "./quick-metrics"

const universeOptions = ["Top 10", "Top 25", "S&P 100", "Custom"]
const assetOptions = ["AAPL", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "BRK-B", "LLY", "AVGO"]
const actionOptions = ["Hold", "Buy", "Sell", "Watch"]

export function PerformanceDashboard() {
  const [universe, setUniverse] = useState("Top 10")
  const [selectedAsset, setSelectedAsset] = useState("AAPL")
  const [actionMode, setActionMode] = useState("Hold")
  const [allocation, setAllocation] = useState(10)

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gradient-warm">
          Global Equity Heatmap
        </h2>
        <p className="text-white/40 text-sm">
          Select a stock from the dropdown — the chart, debate, trade panel, and risk scores update to match.
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider">Universe</label>
          <div className="relative">
            <select 
              value={universe}
              onChange={(e) => setUniverse(e.target.value)}
              className="appearance-none bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 pr-10 text-white text-sm min-w-[140px] focus:outline-none focus:border-[rgba(245,166,35,0.5)] focus:ring-2 focus:ring-[rgba(245,166,35,0.1)] transition-all cursor-pointer"
            >
              {universeOptions.map(opt => (
                <option key={opt} value={opt} className="bg-[#1A1A1D]">{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider">Selected asset</label>
          <div className="relative">
            <select 
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="appearance-none bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 pr-10 text-white text-sm min-w-[140px] focus:outline-none focus:border-[rgba(245,166,35,0.5)] focus:ring-2 focus:ring-[rgba(245,166,35,0.1)] transition-all cursor-pointer"
            >
              {assetOptions.map(opt => (
                <option key={opt} value={opt} className="bg-[#1A1A1D]">{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider">Action mode</label>
          <div className="relative">
            <select 
              value={actionMode}
              onChange={(e) => setActionMode(e.target.value)}
              className="appearance-none bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 pr-10 text-white text-sm min-w-[140px] focus:outline-none focus:border-[rgba(245,166,35,0.5)] focus:ring-2 focus:ring-[rgba(245,166,35,0.1)] transition-all cursor-pointer"
            >
              {actionOptions.map(opt => (
                <option key={opt} value={opt} className="bg-[#1A1A1D]">{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Allocation % <span className="text-[#F5A623] font-medium ml-2">{allocation}</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={allocation}
            onChange={(e) => setAllocation(Number(e.target.value))}
            className="w-[180px] h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F5A623] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(245,166,35,0.5)]"
          />
        </div>
      </div>

      {/* Equity Heatmap */}
      <EquityHeatmap selectedAsset={selectedAsset} onAssetSelect={setSelectedAsset} />

      {/* Chart + Trade Panel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <CandlestickChart ticker={selectedAsset} />
        <TradePanel ticker={selectedAsset} />
      </div>

      {/* Bayesian Aggregation Results */}
      <BayesianResults ticker={selectedAsset} />

      {/* Agent Logs */}
      <AgentLogs />

      {/* Quick Metrics */}
      <QuickMetrics ticker={selectedAsset} />
    </div>
  )
}
