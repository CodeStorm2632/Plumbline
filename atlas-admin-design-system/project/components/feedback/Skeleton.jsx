import React from 'react'

/* Atlas Admin — Skeleton. Loading placeholder with shimmer. */

export function Skeleton({ width = '100%', height = 14, radius = 'var(--radius-sm)', circle = false, style }) {
  const size = circle ? (typeof height === 'number' ? height + 'px' : height) : undefined
  return (
    <span style={{
      display: 'inline-block',
      width: circle ? size : (typeof width === 'number' ? width + 'px' : width),
      height: typeof height === 'number' ? height + 'px' : height,
      borderRadius: circle ? 'var(--radius-full)' : radius,
      background: 'linear-gradient(90deg, var(--muted) 0%, color-mix(in oklch, var(--muted) 55%, var(--card)) 50%, var(--muted) 100%)',
      backgroundSize: '200% 100%',
      animation: 'atlas-shimmer 1.3s ease-in-out infinite',
      ...style,
    }}>
      <style>{'@keyframes atlas-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}'}</style>
    </span>
  )
}
