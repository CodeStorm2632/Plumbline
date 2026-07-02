import React from 'react'

/* Atlas Admin — Badge / status label.
   tone: neutral | primary | success | warning | danger | info
   appearance: soft (tinted, default) | solid | outline
   Optional leading status dot. */

const tones = {
  neutral: { solidBg: 'var(--muted-foreground)', softBg: 'var(--neutral-subtle)', softFg: 'var(--neutral-subtle-foreground)', line: 'var(--border-strong)', dot: 'var(--muted-foreground)' },
  primary: { solidBg: 'var(--primary)', softBg: 'var(--primary-muted)', softFg: 'var(--primary)', line: 'var(--primary)', dot: 'var(--primary)' },
  success: { solidBg: 'var(--success)', softBg: 'var(--success-subtle)', softFg: 'var(--success-subtle-foreground)', line: 'var(--success)', dot: 'var(--success)' },
  warning: { solidBg: 'var(--warning)', softBg: 'var(--warning-subtle)', softFg: 'var(--warning-subtle-foreground)', line: 'var(--warning)', dot: 'var(--warning)' },
  danger: { solidBg: 'var(--destructive)', softBg: 'var(--destructive-subtle)', softFg: 'var(--destructive-subtle-foreground)', line: 'var(--destructive)', dot: 'var(--destructive)' },
  info: { solidBg: 'var(--info)', softBg: 'var(--info-subtle)', softFg: 'var(--info-subtle-foreground)', line: 'var(--info)', dot: 'var(--info)' },
}

export function Badge({ tone = 'neutral', appearance = 'soft', dot = false, children, style, ...props }) {
  const t = tones[tone] || tones.neutral
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '2px 8px', borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)',
    lineHeight: 1.4, whiteSpace: 'nowrap', border: '1px solid transparent',
  }
  const look =
    appearance === 'solid' ? { background: t.solidBg, color: tone === 'warning' ? 'var(--warning-foreground)' : '#fff' }
    : appearance === 'outline' ? { background: 'transparent', color: t.softFg, borderColor: t.line }
    : { background: t.softBg, color: t.softFg }
  return (
    <span style={{ ...base, ...look, ...style }} {...props}>
      {dot ? <span style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', background: appearance === 'solid' ? 'currentColor' : t.dot, flexShrink: 0 }} /> : null}
      {children}
    </span>
  )
}
