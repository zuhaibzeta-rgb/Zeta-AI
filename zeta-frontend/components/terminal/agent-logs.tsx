"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

const agents = [
  { name: "Jim Simons", expanded: false },
  { name: "George Soros", expanded: false },
  { name: "Ken Griffin", expanded: false },
  { name: "Warren Buffett", expanded: false },
  { name: "Carl Icahn", expanded: false },
  { name: "Peter Lynch", expanded: false },
  { name: "Ray Dalio", expanded: false },
  { name: "Benjamin Graham", expanded: false },
  { name: "Stan Druckenmiller", expanded: false },
  { name: "John Maynard Keynes", expanded: false },
]

export function AgentLogs() {
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set())
  
  const toggleAgent = (name: string) => {
    const newSet = new Set(expandedAgents)
    if (newSet.has(name)) {
      newSet.delete(name)
    } else {
      newSet.add(name)
    }
    setExpandedAgents(newSet)
  }
  
  return (
    <div className="space-y-4">
      <p className="text-white/50 text-sm leading-relaxed">
        Bayesian aggregation: P(A|o₁...oₙ) ≈ P(A)·ΠP(oᵢ|A) — each investor&apos;s opinion is weighted by their historical reliability matrix. Conflict score uses Dempster-Shafer theory: K = Σ m₁(A)·m₂(B) for disjoint A,B.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map((agent) => {
          const isExpanded = expandedAgents.has(agent.name)
          
          return (
            <button
              key={agent.name}
              onClick={() => toggleAgent(agent.name)}
              className="flex items-center gap-3 p-4 card-elevated hover:bg-white/[0.04] transition-colors text-left"
            >
              <ChevronRight 
                className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} 
              />
              <span className="text-white/80 text-sm">Agent Log: {agent.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
