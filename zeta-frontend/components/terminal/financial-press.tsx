"use client"

import { useState } from "react"
import { ChevronDown, RefreshCw, Link2 } from "lucide-react"

const headlines = [
  { title: "Stocks Sink in Broad AI Rout Sparked by China's DeepSeek", date: "Mon, 27 Jan 2025 14:26:00 -0500" },
  { title: "Comex Gold, Silver Settle Lower", date: "Mon, 27 Jan 2025 14:01:00 -0500" },
  { title: "DeepSeek Won't Sink U.S. AI Titans", date: "Mon, 27 Jan 2025 13:12:00 -0500" },
  { title: "Financial Services Roundup: Market Talk", date: "Mon, 27 Jan 2025 12:27:00 -0500" },
  { title: "Arabica Coffee Prices Hit Record on U.S., Colombia Tariff Spat", date: "Mon, 27 Jan 2025 12:20:00 -0500" },
  { title: "Swiss franc, Japanese yen Rise as DeepSeek News Boosts Safe Havens", date: "Mon, 27 Jan 2025 09:55:00 -0500" },
  { title: "Natural Gas Falls on Shifting Weather Forecasts", date: "Mon, 27 Jan 2025 09:05:00 -0500" },
  { title: "Building-Products Distributor QXO Launches Hostile Bid for Beacon", date: "Mon, 27 Jan 2025 08:28:00 -0500" },
]

const publications = [
  { name: "Wall Street Journal", icon: "📰", color: "text-white" },
  { name: "Financial Times", icon: "🗞️", color: "text-pink-300" },
  { name: "Reuters Business", icon: "🟠", color: "text-orange-400" },
  { name: "Bloomberg Markets", icon: "🔷", color: "text-blue-400" },
  { name: "Economic Times Markets", icon: "📊", color: "text-cyan-400" },
  { name: "India Today Business", icon: "🇮🇳", color: "text-green-400" },
  { name: "Business Times", icon: "🇸🇬", color: "text-red-400" },
  { name: "Nikkei Asia", icon: "🇯🇵", color: "text-rose-400" },
]

export function FinancialPress() {
  const [publication, setPublication] = useState("Wall Street Journal")
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gradient-warm mb-2">
          Financial Press — Live Headlines
        </h2>
        <p className="text-white/50 text-sm">
          Live RSS headlines from global financial publications. Click any headline to read the full article.
        </p>
      </div>
      
      {/* Publication Selector */}
      <div className="flex flex-col gap-4">
        <span className="text-xs text-white/40 uppercase tracking-wider">Select publication</span>
        <div className="relative max-w-md">
          <select 
            value={publication}
            onChange={(e) => setPublication(e.target.value)}
            className="w-full appearance-none bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-[rgba(245,166,35,0.5)] focus:ring-2 focus:ring-[rgba(245,166,35,0.1)] transition-all cursor-pointer"
          >
            {publications.map(pub => (
              <option key={pub.name} value={pub.name} className="bg-[#1A1A1D]">{pub.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        </div>
        
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/80 text-sm hover:bg-white/[0.08] transition-colors w-fit">
          <RefreshCw className="w-4 h-4" />
          Refresh Headlines
        </button>
      </div>
      
      {/* Headlines List */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📰</span>
          <h3 className="text-xl font-semibold text-white">{publication} — Latest Headlines</h3>
        </div>
        
        <div className="space-y-1">
          {headlines.map((headline, i) => (
            <div 
              key={i}
              className="card-elevated p-4 hover:bg-white/[0.04] transition-colors cursor-pointer border-l-2 border-amber-500/50 group"
            >
              <p className="text-amber-400 font-mono text-sm mb-1 group-hover:text-amber-300 transition-colors">
                {headline.title}
              </p>
              <p className="text-white/40 text-xs font-mono">{headline.date}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* All Publications */}
      <div className="pt-8 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xl font-semibold text-white">All Publications</h3>
          <Link2 className="w-4 h-4 text-white/30" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {publications.map((pub) => (
            <a
              key={pub.name}
              href="#"
              className={`flex items-center gap-2 text-sm ${pub.color} hover:underline transition-colors`}
            >
              <span className="text-white/40">→</span>
              <span>{pub.icon}</span>
              <span className="font-mono underline">{pub.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
