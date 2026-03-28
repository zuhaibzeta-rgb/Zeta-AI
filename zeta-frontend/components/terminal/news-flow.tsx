"use client"

import { useState } from "react"
import { ChevronDown, Download, Search, Maximize2, RefreshCw, Link2 } from "lucide-react"

const newsData = [
  { date: "2026-03-20", source: "reuters", title: "Rates decision monitoring", topic: "macro", sentiment: "neutral" },
  { date: "2026-03-20", source: "bloomberg", title: "Earnings season watch", topic: "earnings", sentiment: "positive" },
  { date: "2026-03-20", source: "wire", title: "Geopolitical escalation tracker", topic: "geo", sentiment: "negative" },
  { date: "2026-03-20", source: "desk", title: "Liquidity regime scan", topic: "liquidity", sentiment: "neutral" },
]

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

export function NewsFlow() {
  const [publication, setPublication] = useState("Wall Street Journal")
  
  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-emerald-400"
      case "negative": return "text-rose-400"
      default: return "text-white/60"
    }
  }
  
  return (
    <div className="space-y-8">
      {/* News Aggregator + Event Flow */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gradient-warm">
            News Aggregator + Event Flow
          </h2>
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
                <th className="text-left">date</th>
                <th className="text-left">source</th>
                <th className="text-left">title</th>
                <th className="text-left">topic</th>
                <th className="text-left">sentiment</th>
              </tr>
            </thead>
            <tbody>
              {newsData.map((item, i) => (
                <tr key={i} className="group">
                  <td className="text-white/40 font-mono text-sm">{i}</td>
                  <td className="text-white/70 font-mono text-sm">{item.date}</td>
                  <td className="text-white/80">{item.source}</td>
                  <td className="text-white">{item.title}</td>
                  <td>
                    <span className="badge-neutral px-2 py-1 rounded-md text-xs">
                      {item.topic}
                    </span>
                  </td>
                  <td className={getSentimentStyle(item.sentiment)}>{item.sentiment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* News Volume / Sentiment Chart */}
      <div className="card-premium p-6">
        <h4 className="text-white font-medium mb-6">News Volume / Sentiment</h4>
        <div className="flex items-end justify-around h-48 gap-4">
          {[0.95, 0.92, 0.88, 0.72, 0.68].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={`w-full rounded-t-lg ${i === 4 ? "bg-rose-400/80" : "bg-blue-400/80"}`}
                style={{ height: `${val * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Financial Press - Live Headlines */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gradient-warm">
            Financial Press — Live Headlines
          </h2>
        </div>
        <p className="text-white/50 text-sm mb-4">
          Live RSS headlines from global financial publications. Click any headline to read the full article.
        </p>
        
        {/* Publication Selector */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs text-white/40 uppercase tracking-wider">Select publication</span>
          <div className="relative flex-1 max-w-md">
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
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/80 text-sm hover:bg-white/[0.08] transition-colors mb-6">
          <RefreshCw className="w-4 h-4" />
          Refresh Headlines
        </button>
        
        {/* Headlines List */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📰</span>
            <h3 className="text-xl font-semibold text-white">{publication} — Latest Headlines</h3>
          </div>
          
          {headlines.map((headline, i) => (
            <div 
              key={i}
              className="card-elevated p-4 hover:bg-white/[0.04] transition-colors cursor-pointer border-l-2 border-amber-500/50"
            >
              <p className="text-amber-400 font-mono text-sm mb-1">{headline.title}</p>
              <p className="text-white/40 text-xs font-mono">{headline.date}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* All Publications */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xl font-semibold text-white">All Publications</h3>
          <Link2 className="w-4 h-4 text-white/30" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {publications.map((pub) => (
            <a
              key={pub.name}
              href="#"
              className={`flex items-center gap-2 text-sm ${pub.color} hover:underline`}
            >
              <span>→</span>
              <span>{pub.icon}</span>
              <span className="font-mono underline">{pub.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
