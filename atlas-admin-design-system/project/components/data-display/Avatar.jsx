import React from 'react'

/* Atlas Admin — Avatar. Initials fallback with deterministic tint; optional image + status. */

const tints = [
  ['var(--primary-muted)', 'var(--primary)'],
  ['var(--info-subtle)', 'var(--info-subtle-foreground)'],
  ['var(--success-subtle)', 'var(--success-subtle-foreground)'],
  ['var(--warning-subtle)', 'var(--warning-subtle-foreground)'],
]
const sizeMap = { sm: 24, md: 32, lg: 40 }

export function Avatar({ src, name = '', size = 'md', shape = 'circle', style, ...props }) {
  const px = sizeMap[size] || size
  const initials = name.trim().slice(0, 2).toUpperCase()
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  const [bg, fg] = tints[hash % tints.length]
  const box = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: px + 'px', height: px + 'px', flexShrink: 0, overflow: 'hidden',
    borderRadius: shape === 'square' ? 'var(--radius-md)' : 'var(--radius-full)',
    background: bg, color: fg, fontFamily: 'var(--font-sans)', fontWeight: 'var(--font-semibold)',
    fontSize: Math.round(px * 0.4) + 'px', userSelect: 'none', ...style,
  }
  return (
    <span style={box} {...props}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials || '?'}
    </span>
  )
}
