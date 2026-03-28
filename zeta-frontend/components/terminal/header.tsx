"use client"

import { 
  BarChart3, 
  Globe2, 
  Box, 
  Activity, 
  Database, 
  GitBranch, 
  Newspaper,
  FlaskConical,
  Building2,
  ChevronRight,
  Github
} from "lucide-react"

const tabs = [
  { id: "performance", label: "PERFORMANCE", icon: BarChart3 },
  { id: "geo-int", label: "GEO-INT", icon: Globe2 },
  { id: "3d-cube", label: "3D CUBE", icon: Box },
  { id: "micro-risk", label: "MICRO + RISK", icon: Activity },
  { id: "alt-data", label: "ALT DATA", icon: Database },
  { id: "backtest-corr", label: "BACKTEST + CORR", icon: GitBranch },
  { id: "news-flow", label: "NEWS + FLOW", icon: Newspaper },
  { id: "signal-lab", label: "SIGNAL LAB", icon: FlaskConical },
  { id: "financial-press", label: "FINANCIAL PRESS", icon: Building2 },
]

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TerminalHeader({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="w-full px-6 pt-8 pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronRight className="w-5 h-5 text-white/50" />
        </button>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm font-medium">Fork</span>
          <a 
            href="#" 
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Github className="w-5 h-5 text-white/70" />
          </a>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          <span className="text-gradient-warm">ZETA.AI</span>
          <span className="text-white/90"> | GLOBAL COMMAND TERMINAL</span>
        </h1>
        <p className="text-white/50 text-base leading-relaxed max-w-2xl">
          Local terminal for market snapshots, multi-agent debate, geopolitics, risk, alt-data, and backtesting.
        </p>
      </div>

      {/* Premium Tab Navigation */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                whitespace-nowrap transition-all duration-200 ease-out
                ${isActive 
                  ? "bg-gradient-to-b from-[rgba(245,166,35,0.2)] to-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.3)] text-[#F5A623] shadow-[0_0_20px_rgba(245,166,35,0.15)]" 
                  : "bg-white/[0.03] border border-white/[0.06] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white/90"
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#F5A623]" : "text-white/50"}`} />
              {tab.label}
            </button>
          )
        })}
        
        {/* Scroll indicator */}
        <div className="flex-shrink-0 w-8 h-full bg-gradient-to-l from-[#0A0A0B] to-transparent pointer-events-none absolute right-0" />
      </nav>
    </header>
  )
}
