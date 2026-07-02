import React from 'react'

/* Atlas Admin — Drawer. Side sheet for longer create/edit forms. */

const widths = { sm: '360px', md: '460px', lg: '600px' }

export function Drawer({ open, onClose, title, description, footer, side = 'right', size = 'md', children, style }) {
  React.useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  const isRight = side === 'right'
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'oklch(0.2 0.03 262 / 0.45)', animation: 'atlas-fade var(--dur-med) var(--ease-standard)' }} />
      <div role="dialog" aria-modal="true"
        style={{
          position: 'absolute', top: 0, bottom: 0, [isRight ? 'right' : 'left']: 0,
          width: '100%', maxWidth: widths[size] || widths.md,
          display: 'flex', flexDirection: 'column', background: 'var(--popover)', color: 'var(--popover-foreground)',
          borderLeft: isRight ? '1px solid var(--border)' : 'none', borderRight: isRight ? 'none' : '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)', animation: (isRight ? 'atlas-slide-r' : 'atlas-slide-l') + ' var(--dur-slow) var(--ease-out)',
          fontFamily: 'var(--font-sans)', ...style,
        }}>
        <style>{'@keyframes atlas-fade{from{opacity:0}to{opacity:1}}@keyframes atlas-slide-r{from{transform:translateX(100%)}to{transform:none}}@keyframes atlas-slide-l{from{transform:translateX(-100%)}to{transform:none}}'}</style>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {title != null ? <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-tight)' }}>{title}</div> : null}
            {description != null ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{description}</div> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="关闭" style={{ border: 'none', background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)', margin: '-2px -4px 0 0' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, padding: '18px', overflowY: 'auto', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>{children}</div>
        {footer ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--muted)' }}>{footer}</div> : null}
      </div>
    </div>
  )
}
