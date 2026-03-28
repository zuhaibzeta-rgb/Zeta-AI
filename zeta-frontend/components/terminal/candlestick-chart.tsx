"use client"

import { useEffect, useRef, useMemo, useState, useCallback } from "react"

interface CandlestickChartProps {
  ticker: string
}

interface CandleData {
  date: Date
  open: number
  high: number
  low: number
  close: number
}

interface TooltipData {
  x: number
  y: number
  candle: CandleData
  index: number
}

// Generate mock OHLC data with seed for stability
function generateCandleData(ticker: string, days: number = 60): CandleData[] {
  const data: CandleData[] = []
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  let price = 250 + (seed % 50)
  const now = Date.now()
  
  for (let i = days; i >= 0; i--) {
    const open = price
    const volatility = 3 + ((seed + i) % 4)
    const seedRandom = Math.sin(seed * i * 0.1) * 0.5 + 0.5
    const change = (seedRandom - 0.5) * volatility
    const high = Math.max(open, open + change) + (seedRandom * 2)
    const low = Math.min(open, open + change) - (seedRandom * 2)
    const close = open + change
    
    data.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000),
      open,
      high,
      low,
      close,
    })
    
    price = close
  }
  
  return data
}

function calculateEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1)
  const result: (number | null)[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0)
      result.push(sum / period)
    } else {
      const prevEMA = result[i - 1]!
      result.push(data[i] * k + prevEMA * (1 - k))
    }
  }
  
  return result
}

export function CandlestickChart({ ticker }: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null)
  
  const data = useMemo(() => generateCandleData(ticker), [ticker])
  
  const padding = useMemo(() => ({ top: 20, right: 60, bottom: 30, left: 10 }), [])
  
  // Calculate price range
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    const prices = data.flatMap(d => [d.high, d.low])
    const min = Math.min(...prices) - 2
    const max = Math.max(...prices) + 2
    return { minPrice: min, maxPrice: max, priceRange: max - min }
  }, [data])
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const width = rect.width
    const height = rect.height
    const candleWidth = (width - padding.left - padding.right) / data.length
    
    // Find which candle is being hovered
    const candleIndex = Math.floor((x - padding.left) / candleWidth)
    
    if (candleIndex >= 0 && candleIndex < data.length) {
      const candle = data[candleIndex]
      const candleX = padding.left + candleIndex * candleWidth + candleWidth / 2
      
      setTooltip({
        x: candleX,
        y: y,
        candle,
        index: candleIndex,
      })
      setCrosshair({ x: candleX, y })
    } else {
      setTooltip(null)
      setCrosshair(null)
    }
  }, [data, padding])
  
  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
    setCrosshair(null)
  }, [])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    const width = rect.width
    const height = rect.height
    
    // Clear canvas
    ctx.fillStyle = "#141416"
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)"
    ctx.setLineDash([4, 4])
    ctx.lineWidth = 1
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (height - padding.top - padding.bottom) * (i / 5)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      
      // Price labels
      const price = maxPrice - (priceRange * i / 5)
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
      ctx.font = "11px Inter, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(price.toFixed(0), width - padding.right + 8, y + 4)
    }
    
    ctx.setLineDash([])
    
    // Draw candles
    const candleWidth = (width - padding.left - padding.right) / data.length
    const candleBodyWidth = Math.max(candleWidth * 0.7, 4)
    
    data.forEach((candle, i) => {
      const x = padding.left + i * candleWidth + candleWidth / 2
      const isUp = candle.close >= candle.open
      const isHovered = tooltip?.index === i
      
      const highY = padding.top + (1 - (candle.high - minPrice) / priceRange) * (height - padding.top - padding.bottom)
      const lowY = padding.top + (1 - (candle.low - minPrice) / priceRange) * (height - padding.top - padding.bottom)
      const openY = padding.top + (1 - (candle.open - minPrice) / priceRange) * (height - padding.top - padding.bottom)
      const closeY = padding.top + (1 - (candle.close - minPrice) / priceRange) * (height - padding.top - padding.bottom)
      
      // Highlight effect for hovered candle
      if (isHovered) {
        ctx.fillStyle = isUp ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"
        ctx.fillRect(x - candleWidth / 2, padding.top, candleWidth, height - padding.top - padding.bottom)
      }
      
      // Wick
      ctx.strokeStyle = isUp ? "#22C55E" : "#EF4444"
      ctx.lineWidth = isHovered ? 2 : 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()
      
      // Body
      ctx.fillStyle = isUp ? "#22C55E" : "#EF4444"
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.max(Math.abs(closeY - openY), 1)
      const bodyWidth = isHovered ? candleBodyWidth * 1.2 : candleBodyWidth
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight)
    })
    
    // Draw EMA lines
    const ema12 = calculateEMA(data.map(d => d.close), 12)
    const ema26 = calculateEMA(data.map(d => d.close), 26)
    
    // EMA 12 (cyan)
    ctx.strokeStyle = "rgba(34, 211, 238, 0.8)"
    ctx.lineWidth = 1.5
    ctx.setLineDash([])
    ctx.beginPath()
    ema12.forEach((val, i) => {
      if (val === null) return
      const x = padding.left + i * candleWidth + candleWidth / 2
      const y = padding.top + (1 - (val - minPrice) / priceRange) * (height - padding.top - padding.bottom)
      if (i === 0 || ema12[i - 1] === null) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
    
    // EMA 26 (pink)
    ctx.strokeStyle = "rgba(244, 114, 182, 0.8)"
    ctx.beginPath()
    ema26.forEach((val, i) => {
      if (val === null) return
      const x = padding.left + i * candleWidth + candleWidth / 2
      const y = padding.top + (1 - (val - minPrice) / priceRange) * (height - padding.top - padding.bottom)
      if (i === 0 || ema26[i - 1] === null) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
    
    // VWAP (dashed yellow)
    ctx.strokeStyle = "rgba(250, 204, 21, 0.8)"
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    const vwap = data.map(d => (d.high + d.low + d.close) / 3)
    vwap.forEach((val, i) => {
      const x = padding.left + i * candleWidth + candleWidth / 2
      const y = padding.top + (1 - (val - minPrice) / priceRange) * (height - padding.top - padding.bottom)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
    ctx.setLineDash([])
    
    // Draw crosshair
    if (crosshair) {
      ctx.strokeStyle = "rgba(245, 166, 35, 0.5)"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      
      // Vertical line
      ctx.beginPath()
      ctx.moveTo(crosshair.x, padding.top)
      ctx.lineTo(crosshair.x, height - padding.bottom)
      ctx.stroke()
      
      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(padding.left, crosshair.y)
      ctx.lineTo(width - padding.right, crosshair.y)
      ctx.stroke()
      
      ctx.setLineDash([])
    }
    
  }, [data, ticker, minPrice, maxPrice, priceRange, padding, tooltip, crosshair])
  
  return (
    <div className="card-premium overflow-hidden" ref={containerRef}>
      {/* Chart header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-500" />
            <span className="text-xs text-white/60">{ticker} Candles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-amber-400" />
            <span className="text-xs text-white/60">VWAP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-cyan-400" />
            <span className="text-xs text-white/60">EMA12</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-pink-400" />
            <span className="text-xs text-white/60">EMA26</span>
          </div>
        </div>
        
        {/* Time period selectors */}
        <div className="flex items-center gap-1">
          {["1D", "1W", "1M", "3M", "YTD", "1Y", "All"].map((period, i) => (
            <button
              key={period}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                i === 2 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      {/* Canvas */}
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="w-full h-[400px] cursor-crosshair"
          style={{ width: "100%", height: "400px" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Tooltip */}
        {tooltip && (
          <div 
            className="absolute pointer-events-none z-10 bg-[#1A1A1D]/95 border border-white/10 rounded-lg p-3 backdrop-blur-md min-w-[180px] shadow-xl"
            style={{ 
              left: Math.min(tooltip.x + 10, (containerRef.current?.offsetWidth || 400) - 200),
              top: Math.max(tooltip.y - 100, 10)
            }}
          >
            <p className="text-xs text-white/50 mb-2">
              {tooltip.candle.date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Open</span>
                <span className="text-white font-mono">${tooltip.candle.open.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">High</span>
                <span className="text-emerald-400 font-mono">${tooltip.candle.high.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Low</span>
                <span className="text-rose-400 font-mono">${tooltip.candle.low.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Close</span>
                <span className={`font-mono ${tooltip.candle.close >= tooltip.candle.open ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${tooltip.candle.close.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-white/10 pt-1.5 mt-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Change</span>
                  <span className={`font-mono ${tooltip.candle.close >= tooltip.candle.open ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tooltip.candle.close >= tooltip.candle.open ? '+' : ''}
                    {((tooltip.candle.close - tooltip.candle.open) / tooltip.candle.open * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
