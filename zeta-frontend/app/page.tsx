"use client"

import { useState } from "react"
import { TerminalHeader } from "@/components/terminal/header"
import { PerformanceDashboard } from "@/components/terminal/performance-dashboard"
import { NewsFlow } from "@/components/terminal/news-flow"
import { SignalLab } from "@/components/terminal/signal-lab"
import { BacktestCorrelation } from "@/components/terminal/backtest-correlation"
import { GeoIntelligence } from "@/components/terminal/geo-intelligence"
import { AltData } from "@/components/terminal/alt-data"
import { MicroRisk } from "@/components/terminal/micro-risk"
import { ThreeDCube } from "@/components/terminal/three-d-cube"
import { FinancialPress } from "@/components/terminal/financial-press"

export default function Terminal() {
  const [activeTab, setActiveTab] = useState("performance")

  const renderContent = () => {
    switch (activeTab) {
      case "performance":
        return <PerformanceDashboard />
      case "news-flow":
        return <NewsFlow />
      case "signal-lab":
        return <SignalLab />
      case "backtest-corr":
        return <BacktestCorrelation />
      case "geo-int":
        return <GeoIntelligence />
      case "alt-data":
        return <AltData />
      case "micro-risk":
        return <MicroRisk />
      case "3d-cube":
        return <ThreeDCube />
      case "financial-press":
        return <FinancialPress />
      default:
        return <PerformanceDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <TerminalHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="px-6 pb-8">
        {renderContent()}
      </main>
    </div>
  )
}
