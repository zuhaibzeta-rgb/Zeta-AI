"use client"

const riskData = [
  { ticker: "AMD", sector: "Semiconductors", riskScore: 138.45, color: "#60A5FA" },
  { ticker: "AVGO", sector: "Semiconductors", riskScore: 112.34, color: "#60A5FA" },
  { ticker: "NVDA", sector: "Semiconductors", riskScore: 110.28, color: "#60A5FA" },
  { ticker: "AMAT", sector: "Semiconductors", riskScore: 108.92, color: "#60A5FA" },
  { ticker: "QCOM", sector: "Semiconductors", riskScore: 95.67, color: "#60A5FA" },
  { ticker: "ORCL", sector: "Technology", riskScore: 128.23, color: "#3B82F6" },
  { ticker: "INTU", sector: "Technology", riskScore: 105.45, color: "#3B82F6" },
  { ticker: "CRM", sector: "Technology", riskScore: 108.78, color: "#3B82F6" },
  { ticker: "TSLA", sector: "Consumer Discretionary", riskScore: 112.56, color: "#EF4444" },
  { ticker: "NFLX", sector: "Communication Services", riskScore: 108.34, color: "#EF4444" },
  { ticker: "META", sector: "Communication Services", riskScore: 106.89, color: "#EF4444" },
  { ticker: "ISRG", sector: "Healthcare", riskScore: 105.23, color: "#22C55E" },
]

const heatmapLevels = ["Bid 1", "Bid 2", "Mid", "Ask 1", "Ask 2"]
const heatmapIntensities = [0.5, 0.7, 0.8, 0.65, 0.55]

export function MicroRisk() {
  const maxRisk = Math.max(...riskData.map(d => d.riskScore))
  
  return (
    <div className="space-y-8">
      {/* Risk Breakdown */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Risk Breakdown</h2>
        
        <div className="card-premium p-6">
          <div className="flex items-end justify-between h-80 gap-2">
            {riskData.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full rounded-t-lg transition-all hover:brightness-110"
                  style={{ 
                    height: `${(item.riskScore / maxRisk) * 100}%`,
                    backgroundColor: item.color
                  }}
                />
                <span className="text-xs text-white/50 font-mono -rotate-45 origin-top-left translate-y-2">
                  {item.ticker}
                </span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-end gap-6 mt-8 pt-4 border-t border-white/[0.06]">
            <span className="text-xs text-white/40">Sector</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#60A5FA]" />
              <span className="text-xs text-white/60">Semiconductors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
              <span className="text-xs text-white/60">Technology</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#EF4444]" />
              <span className="text-xs text-white/60">Consumer/Comm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#22C55E]" />
              <span className="text-xs text-white/60">Healthcare</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Flow + Liquidity Heat Map */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Order Flow + Liquidity Heat Map</h2>
        
        <div className="card-premium p-6">
          <h4 className="text-white/70 text-sm mb-6">Order Flow / Liquidity Heat Map</h4>
          
          <div className="flex items-center gap-1 mb-4">
            <span className="text-xs text-white/40 w-16">Intensity</span>
            <div className="flex-1 flex gap-1">
              {heatmapLevels.map((level, i) => (
                <div 
                  key={level}
                  className="flex-1 h-24 rounded-lg flex items-end justify-center pb-2"
                  style={{ 
                    backgroundColor: `rgba(96, 165, 250, ${heatmapIntensities[i]})`
                  }}
                >
                  <span className="text-xs text-white/70">{level}</span>
                </div>
              ))}
            </div>
            
            {/* Intensity Scale */}
            <div className="w-8 h-24 ml-4 rounded-lg overflow-hidden flex flex-col">
              <div className="flex-1 bg-blue-500" />
              <div className="flex-1 bg-blue-400" />
              <div className="flex-1 bg-blue-300" />
              <div className="flex-1 bg-blue-200" />
            </div>
            <div className="flex flex-col justify-between h-24 text-xs text-white/40 ml-1">
              <span>0.8</span>
              <span>0.7</span>
              <span>0.6</span>
              <span>0.5</span>
            </div>
          </div>
          
          <p className="text-xs text-white/40 text-center">Level</p>
        </div>
      </div>
      
      {/* VaR / Drawdown / Sharpe */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">VaR / Drawdown / Sharpe</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card-premium p-6">
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">VaR 95%</span>
            <p className="text-3xl font-bold text-rose-400 font-mono">-3.09%</p>
          </div>
          <div className="card-premium p-6">
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Max Drawdown</span>
            <p className="text-3xl font-bold text-rose-400 font-mono">-22.99%</p>
          </div>
          <div className="card-premium p-6">
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Sharpe</span>
            <p className="text-3xl font-bold text-white font-mono">0.58</p>
          </div>
          <div className="card-premium p-6">
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Hit Rate</span>
            <p className="text-3xl font-bold text-emerald-400 font-mono">52.59%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
