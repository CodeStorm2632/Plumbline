import React from 'react'

/* Atlas Admin — Alert. Inline contextual message with semantic tone. */

const map = {
  info: { fg: 'var(--info-subtle-foreground)', bg: 'var(--info-subtle)', line: 'var(--info)', icon: 'info' },
  success: { fg: 'var(--success-subtle-foreground)', bg: 'var(--success-subtle)', line: 'var(--success)', icon: 'check' },
  warning: { fg: 'var(--warning-subtle-foreground)', bg: 'var(--warning-subtle)', line: 'var(--warning)', icon: 'warn' },
  danger: { fg: 'var(--destructive-subtle-foreground)', bg: 'var(--destructive-subtle)', line: 'var(--destructive)', icon: 'x' },
}

function Glyph({ kind }) {
  const p = { width: 16, height: 16, viewBox: '0 0 20 20', fill: 'none', style: { flexShrink: 0, marginTop: '1px' } }
  if (kind === 'check') return <svg {...p}><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 10l2.2 2.2L13.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if (kind === 'warn') return <svg {...p}><path d="M10 3l7 13H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 8.5v3.5M10 14h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  if (kind === 'x') return <svg {...p}><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  return <svg {...p}><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 9v4M10 6.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
}

export function Alert({ tone = 'info', title, children, onClose, style }) {
  const t = map[tone] || map.info
  return (
    <div role="alert" style={{
      display: 'flex', gap: '10px', padding: '11px 12px',
      background: t.bg, color: t.fg, border: '1px solid color-mix(in oklch, ' + t.line + ' 30%, transparent)',
      borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', ...style,
    }}>
      <span style={{ color: t.line }}><Glyph kind={t.icon} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title != null ? <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: children ? '2px' : 0 }}>{title}</div> : null}
        {children != null ? <div style={{ fontSize: 'var(--text-sm)', color: 'color-mix(in oklch, ' + t.fg + ' 88%, transparent)', lineHeight: 'var(--leading-snug)' }}>{children}</div> : null}
      </div>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="关闭" style={{ border: 'none', background: 'transparent', color: 'currentColor', opacity: 0.6, cursor: 'pointer', padding: '2px', height: 'fit-content' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      ) : null}
    </div>
  )
}
