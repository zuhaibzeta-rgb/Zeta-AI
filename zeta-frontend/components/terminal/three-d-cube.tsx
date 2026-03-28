"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, Line } from "@react-three/drei"
import { useRef, useState, useMemo, Suspense } from "react"
import * as THREE from "three"

interface DataPoint {
  ticker: string
  x: number  // Price USD
  y: number  // Market Cap Billions
  z: number  // Profitability %
  color: string
}

const cubeData: DataPoint[] = [
  { ticker: "NVDA", x: 875, y: 4200, z: 52, color: "#22C55E" },
  { ticker: "AAPL", x: 248, y: 3800, z: 50, color: "#22C55E" },
  { ticker: "GOOGL", x: 152, y: 3500, z: 48, color: "#22C55E" },
  { ticker: "MSFT", x: 415, y: 3400, z: 49, color: "#22C55E" },
  { ticker: "AMZN", x: 184, y: 2800, z: 47, color: "#22C55E" },
  { ticker: "AVGO", x: 168, y: 2500, z: 46, color: "#F59E0B" },
  { ticker: "ORCL", x: 120, y: 2450, z: 46, color: "#EF4444" },
  { ticker: "META", x: 505, y: 2100, z: 46, color: "#22C55E" },
  { ticker: "TSLA", x: 178, y: 1800, z: 45, color: "#22C55E" },
  { ticker: "V", x: 270, y: 1700, z: 46, color: "#22C55E" },
  { ticker: "HD", x: 380, y: 1500, z: 44, color: "#22C55E" },
  { ticker: "BRK-B", x: 412, y: 1400, z: 44, color: "#22C55E" },
  { ticker: "NFLX", x: 620, y: 1350, z: 44, color: "#EF4444" },
  { ticker: "PG", x: 165, y: 1300, z: 44, color: "#22C55E" },
  { ticker: "COST", x: 780, y: 1200, z: 52, color: "#22C55E" },
  { ticker: "LLY", x: 785, y: 600, z: 52, color: "#22C55E" },
  { ticker: "MA", x: 470, y: 300, z: 42, color: "#22C55E" },
  { ticker: "AMAT", x: 180, y: 150, z: 42, color: "#22C55E" },
  { ticker: "INTU", x: 620, y: 180, z: 42, color: "#22C55E" },
  { ticker: "ISRG", x: 450, y: 170, z: 42, color: "#22C55E" },
]

const dispersionData = [
  { ticker: "NVDA", price: 875.40, marketCap: 2145.32, beta: 1.85, profitability: 46.4 },
  { ticker: "AAPL", price: 248.80, marketCap: 3656.84, beta: 1.12, profitability: 50.4 },
  { ticker: "MSFT", price: 415.20, marketCap: 3012.45, beta: 0.95, profitability: 45.6 },
  { ticker: "GOOGL", price: 152.80, marketCap: 1892.56, beta: 1.08, profitability: 49.6 },
  { ticker: "AMZN", price: 184.30, marketCap: 1923.45, beta: 1.22, profitability: 48.8 },
  { ticker: "META", price: 505.60, marketCap: 1285.67, beta: 1.35, profitability: 45.6 },
  { ticker: "TSLA", price: 178.90, marketCap: 568.92, beta: 2.05, profitability: 49.6 },
  { ticker: "BRK-B", price: 412.50, marketCap: 892.34, beta: 0.82, profitability: 51.2 },
]

// Interactive data point sphere
function DataPointSphere({ 
  point, 
  position, 
  onSelect 
}: { 
  point: DataPoint
  position: [number, number, number]
  onSelect: (ticker: string | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulse effect when hovered
      const scale = hovered ? 1.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2 : 1
      meshRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <group position={position}>
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial 
          color={point.color} 
          transparent 
          opacity={hovered ? 0.4 : 0.2} 
        />
      </mesh>
      
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onSelect(point.ticker) }}
        onPointerOut={() => { setHovered(false); onSelect(null) }}
      >
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial 
          color={point.color} 
          emissive={point.color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>
      
      {/* Label */}
      <Html
        position={[0, 0.25, 0]}
        center
        style={{
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.2s',
        }}
      >
        <div className={`text-xs font-mono px-1.5 py-0.5 rounded ${hovered ? 'bg-white/20 text-white' : 'text-white/60'}`}>
          {point.ticker}
        </div>
      </Html>
      
      {/* Detailed tooltip on hover */}
      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-[#1A1A1D]/95 border border-white/10 rounded-lg p-3 min-w-[160px] backdrop-blur-md">
            <p className="text-white font-semibold text-sm mb-2">{point.ticker}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Price</span>
                <span className="text-white font-mono">${point.x}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Market Cap</span>
                <span className="text-white font-mono">${point.y}B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Profitability</span>
                <span className="text-emerald-400 font-mono">{point.z}%</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Grid and axis lines
function AxisGrid() {
  const gridSize = 4
  const gridDivisions = 8
  
  return (
    <group>
      {/* Ground plane grid */}
      <gridHelper 
        args={[gridSize, gridDivisions, "#ffffff10", "#ffffff08"]} 
        position={[0, -2, 0]}
        rotation={[0, 0, 0]}
      />
      
      {/* Back plane grid */}
      <gridHelper 
        args={[gridSize, gridDivisions, "#ffffff08", "#ffffff05"]} 
        position={[0, 0, -2]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      
      {/* Side plane grid */}
      <gridHelper 
        args={[gridSize, gridDivisions, "#ffffff08", "#ffffff05"]} 
        position={[-2, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
      
      {/* X Axis - Price */}
      <Line
        points={[[-2, -2, 2], [2, -2, 2]]}
        color="#F5A623"
        lineWidth={2}
      />
      <Html position={[0, -2.5, 2.5]} center>
        <span className="text-[#F5A623] text-xs font-medium whitespace-nowrap">Price (USD)</span>
      </Html>
      
      {/* Y Axis - Market Cap */}
      <Line
        points={[[-2, -2, 2], [-2, 2, 2]]}
        color="#22C55E"
        lineWidth={2}
      />
      <Html position={[-2.5, 0, 2.5]} center>
        <span className="text-emerald-400 text-xs font-medium whitespace-nowrap -rotate-90 block">Market Cap (B)</span>
      </Html>
      
      {/* Z Axis - Profitability */}
      <Line
        points={[[-2, -2, 2], [-2, -2, -2]]}
        color="#60A5FA"
        lineWidth={2}
      />
      <Html position={[-2.5, -2.5, 0]} center>
        <span className="text-blue-400 text-xs font-medium whitespace-nowrap">Profitability (%)</span>
      </Html>
    </group>
  )
}

// Auto rotation controller
function AutoRotate({ enabled }: { enabled: boolean }) {
  const { camera } = useThree()
  
  useFrame((state) => {
    if (enabled) {
      const angle = state.clock.elapsedTime * 0.1
      camera.position.x = Math.sin(angle) * 6
      camera.position.z = Math.cos(angle) * 6
      camera.lookAt(0, 0, 0)
    }
  })
  
  return null
}

// Main scene content
function SceneContent({ selectedTicker, onSelect, autoRotate }: { 
  selectedTicker: string | null
  onSelect: (ticker: string | null) => void
  autoRotate: boolean
}) {
  const normalizedData = useMemo(() => {
    const maxX = Math.max(...cubeData.map(d => d.x))
    const maxY = Math.max(...cubeData.map(d => d.y))
    const minZ = Math.min(...cubeData.map(d => d.z))
    const maxZ = Math.max(...cubeData.map(d => d.z))
    
    return cubeData.map(point => ({
      ...point,
      normalizedPos: [
        (point.x / maxX) * 3.5 - 1.75,
        (point.y / maxY) * 3.5 - 1.75,
        ((point.z - minZ) / (maxZ - minZ)) * 3.5 - 1.75,
      ] as [number, number, number]
    }))
  }, [])
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#F5A623" />
      
      <AxisGrid />
      
      {normalizedData.map((point) => (
        <DataPointSphere
          key={point.ticker}
          point={point}
          position={point.normalizedPos}
          onSelect={onSelect}
        />
      ))}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        autoRotate={false}
      />
      
      <AutoRotate enabled={autoRotate} />
      
      {/* Dark ambient background - no environment preset to avoid grass/ground textures */}
      <color attach="background" args={['#0A0A0B']} />
    </>
  )
}

export function ThreeDCube() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gradient-warm mb-2">
            3D Risk-Alpha Hypercube
          </h2>
          <p className="text-white/50 text-sm">
            Interactive 3D visualization. Drag to rotate, scroll to zoom, hover for details.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              autoRotate 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
            }`}
          >
            {autoRotate ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF'}
          </button>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div className="card-premium overflow-hidden relative" style={{ height: '600px' }}>
        <Canvas
          camera={{ position: [5, 3, 5], fov: 50 }}
          style={{ background: '#0A0A0B' }}
        >
          <Suspense fallback={null}>
            <SceneContent 
              selectedTicker={selectedTicker} 
              onSelect={setSelectedTicker}
              autoRotate={autoRotate}
            />
          </Suspense>
        </Canvas>
        
        {/* Color Scale Legend */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-[#141416]/90 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10">
          <div className="h-24 w-3 rounded-full overflow-hidden flex flex-col">
            <div className="flex-1 bg-emerald-400" />
            <div className="flex-1 bg-yellow-400" />
            <div className="flex-1 bg-orange-400" />
            <div className="flex-1 bg-rose-400" />
          </div>
          <div className="flex flex-col justify-between h-24 text-xs text-white/50">
            <span>54%</span>
            <span>50%</span>
            <span>46%</span>
            <span>42%</span>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="absolute top-4 left-4 text-xs text-white/40 bg-[#141416]/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/5">
          <p>Drag to rotate | Scroll to zoom | Hover for details</p>
        </div>
      </div>
      
      {/* Dispersion Table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Dispersion Table</h3>
        
        <div className="card-premium overflow-hidden">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th className="text-left">Ticker</th>
                <th className="text-right">Price</th>
                <th className="text-right">Market Cap (B)</th>
                <th className="text-right">Beta</th>
                <th className="text-right">Profitability %</th>
              </tr>
            </thead>
            <tbody>
              {dispersionData.map((row, i) => (
                <tr 
                  key={i} 
                  className={`group cursor-pointer transition-colors ${
                    selectedTicker === row.ticker ? 'bg-amber-500/10' : ''
                  }`}
                  onMouseEnter={() => setSelectedTicker(row.ticker)}
                  onMouseLeave={() => setSelectedTicker(null)}
                >
                  <td className="text-white font-mono font-medium">{row.ticker}</td>
                  <td className="text-right text-white/80 font-mono">${row.price.toFixed(2)}</td>
                  <td className="text-right text-white/80 font-mono">${row.marketCap.toFixed(2)}B</td>
                  <td className="text-right text-white/80 font-mono">{row.beta.toFixed(2)}</td>
                  <td className={`text-right font-mono ${row.profitability >= 50 ? "text-emerald-400" : "text-amber-400"}`}>
                    {row.profitability}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
