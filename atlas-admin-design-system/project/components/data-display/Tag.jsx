import React from 'react'

/* Atlas Admin — Tag. Role/label chip, optionally removable. Subtle by default. */

const palette = {
  neutral: { bg: 'var(--neutral-subtle)', fg: 'var(--neutral-subtle-foreground)' },
  primary: { bg: 'var(--primary-muted)', fg: 'var(--primary)' },
  info: { bg: 'var(--info-subtle)', fg: 'var(--info-subtle-foreground)' },
  success: { bg: 'var(--success-subtle)', fg: 'var(--success-subtle-foreground)' },
  warning: { bg: 'var(--warning-subtle)', fg: 'var(--warning-subtle-foreground)' },
  danger: { bg: 'var(--destructive-subtle)', fg: 'var(--destructive-subtle-foreground)' },
}

export function Tag({ tone = 'neutral', onRemove, children, style, ...props }) {
  const p = palette[tone] || palette.neutral
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: onRemove ? '2px 4px 2px 8px' : '2px 8px',
      borderRadius: 'var(--radius-sm)', background: p.bg, color: p.fg,
      fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)',
      lineHeight: 1.4, whiteSpace: 'nowrap', ...style,
    }} {...props}>
      {children}
      {onRemove ? (
        <button type="button" onClick={onRemove} aria-label="移除" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '15px', height: '15px', padding: 0, border: 'none', borderRadius: 'var(--radius-xs)',
          background: 'transparent', color: 'currentColor', opacity: 0.7, cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, currentColor 18%, transparent)'; e.currentTarget.style.opacity = 1 }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = 0.7 }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
      ) : null}
    </span>
  )
}
