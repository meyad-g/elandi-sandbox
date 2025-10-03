"use client"

import type React from "react"
import { useRef } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)


  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 relative overflow-hidden"
    >
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.003" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.2" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.05
                      0 1 0 0 0.08
                      0 0 1 0 0.15
                      0 0 0 0.8 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-20"
        colors={["#1e293b", "#0ea5e9", "#f8fafc", "#0f172a", "#0284c7"]}
        speed={0.08}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-15"
        colors={["#0f172a", "#f1f5f9", "#06b6d4", "#1e293b"]}
        speed={0.05}
      />

      {children}
    </div>
  )
}