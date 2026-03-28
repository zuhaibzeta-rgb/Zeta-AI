"use client"

import { Globe2 } from "lucide-react"

const geoCategories = [
  { layer: "Conflicts", status: "Active Watch" },
  { layer: "Bases", status: "Stable" },
  { layer: "Hotspots", status: "Elevated" },
  { layer: "Nuclear", status: "Watch" },
  { layer: "Sanctions", status: "Moderate" },
  { layer: "Weather", status: "Dynamic" },
  { layer: "Economic", status: "Mixed" },
  { layer: "Waterways", status: "Flowing" },
  { layer: "Outages", status: "Localized" },
  { layer: "Military", status: "Active" },
  { layer: "Natural", status: "Event Risk" },
]

export function GeoIntelligence() {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active Watch":
      case "Active":
        return "text-rose-400"
      case "Elevated":
      case "Event Risk":
        return "text-orange-400"
      case "Watch":
      case "Dynamic":
        return "text-amber-400"
      case "Moderate":
      case "Mixed":
        return "text-yellow-400"
      case "Stable":
      case "Flowing":
      case "Localized":
        return "text-emerald-400"
      default:
        return "text-white/60"
    }
  }
  
  return (
    <div className="space-y-8">
      {/* World Monitor Section */}
      <div>
        <h2 className="text-xl font-semibold text-gradient-warm mb-4">
          Geopolitical Intelligence — World Monitor
        </h2>
        <p className="text-white/50 text-sm mb-6">
          Click the button below to open the World Monitor GitHub repo.
        </p>
        
        <a
          href="#"
          className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono text-sm hover:bg-emerald-500/30 transition-colors"
        >
          <Globe2 className="w-5 h-5" />
          Open World Monitor (GitHub)
        </a>
      </div>
      
      <div className="h-px bg-white/[0.06]" />
      
      {/* Geo Event Categories */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Geo Event Categories</h3>
        
        <div className="card-premium overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th className="text-left w-12">#</th>
                <th className="text-left">Layer</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {geoCategories.map((cat, i) => (
                <tr key={i} className="group">
                  <td className="text-white/40 font-mono text-sm">{i}</td>
                  <td className="text-white">{cat.layer}</td>
                  <td className={getStatusStyle(cat.status)}>{cat.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
