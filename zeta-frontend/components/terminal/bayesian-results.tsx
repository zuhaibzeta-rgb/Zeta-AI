"use client"

import { CheckCircle2, AlertTriangle, CheckSquare } from "lucide-react"

interface BayesianResultsProps {
  ticker: string
}

export function BayesianResults({ ticker }: BayesianResultsProps) {
  return (
    <div className="space-y-6">
      {/* Debate Status */}
      <div className="card-premium p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-white/80">Debate Concluded</span>
        </div>
      </div>
      
      {/* Final Verdict */}
      <div className="card-premium p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          FINAL SENIOR PARTNER VERDICT: {ticker}
        </h3>
        
        {/* Warning Alert */}
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <p className="text-rose-300 text-sm">
              JUDGE OFFLINE: Failed to connect to Ollama. Please check that Ollama is downloaded, running and accessible.{" "}
              <a href="https://ollama.com/download" className="text-rose-400 underline hover:text-rose-300">
                https://ollama.com/download
              </a>
            </p>
          </div>
        </div>
        
        {/* Success Alert */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-300 text-sm">
            Bayesian Signal: <span className="font-mono font-semibold">+0.000</span> | MAP Action: <span className="font-semibold">HOLD</span> | Confidence: <span className="font-mono">100.0%</span> | Allocation hint: <span className="font-mono">10%</span>
          </p>
        </div>
      </div>
      
      {/* Bayesian Aggregation Results */}
      <div className="card-premium p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <span className="text-2xl">🧮</span>
          Bayesian Aggregation Results
        </h3>
        
        {/* Probability Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">P(BUY)</span>
            <p className="text-3xl font-bold text-white font-mono">0.0%</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">P(HOLD)</span>
            <p className="text-3xl font-bold text-amber-400 font-mono">100.0%</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">P(SELL)</span>
            <p className="text-3xl font-bold text-white font-mono">0.0%</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Bayesian Signal</span>
            <p className="text-3xl font-bold text-white font-mono">+0.000</p>
          </div>
        </div>
        
        {/* Decision Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">MAP Decision</span>
            <p className="text-4xl font-bold text-amber-400 font-mono">HOLD</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Confidence</span>
            <p className="text-4xl font-bold text-white font-mono">100.0%</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase tracking-wider block mb-2">Conflict Score (D-S K)</span>
            <p className="text-4xl font-bold text-white font-mono">0.000</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-emerald-400">↑</span>
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-mono">Low Conflict</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bayesian Posterior Distribution Chart */}
      <div className="card-premium p-6">
        <h4 className="text-white/70 text-sm mb-4">Bayesian Posterior Distribution P(Action | All Opinions)</h4>
        <div className="h-48 flex items-end justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 bg-emerald-500/20 rounded-t-lg" style={{ height: "8px" }} />
            <span className="text-xs text-white/50">BUY</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 bg-amber-400 rounded-t-lg" style={{ height: "160px" }} />
            <span className="text-xs text-white/50">HOLD</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 bg-rose-500/20 rounded-t-lg" style={{ height: "8px" }} />
            <span className="text-xs text-white/50">SELL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
