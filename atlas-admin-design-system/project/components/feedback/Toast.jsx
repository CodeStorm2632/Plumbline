import React from 'react'

/* Atlas Admin — Toast. Transient notification (presentational). */

const map = {
  info: 'var(--info)', success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--destructive)',
}

export function Toast({ tone = 'success', title, description, onClose, style }) {
  const c = map[tone] || map.success
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px', width: '320px', maxWidth: '92vw',
      padding: '12px 12px 12px 14px', background: 'var(--popover)', color: 'var(--popover-foreground)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-popover)',
      fontFamily: 'var(--font-sans)', position: 'relative', overflow: 'hidden', ...style,
    }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: c }} />
      <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: c, marginTop: '5px', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title != null ? <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>{title}</div> : null}
        {description != null ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '2px', lineHeight: 'var(--leading-snug)' }}>{description}</div> : null}
      </div>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="关闭" style={{ border: 'none', background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '2px' }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      ) : null}
    </div>
  )
}
