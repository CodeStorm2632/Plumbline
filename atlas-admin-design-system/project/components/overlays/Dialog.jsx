import React from 'react'

/* Atlas Admin — Dialog. Centered modal for confirmations and compact forms. */

const sizes = { sm: '400px', md: '520px', lg: '680px' }

export function Dialog({ open, onClose, title, description, footer, size = 'md', children, closeOnOverlay = true, style }) {
  React.useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={() => closeOnOverlay && onClose && onClose()}
        style={{ position: 'absolute', inset: 0, background: 'oklch(0.2 0.03 262 / 0.45)', backdropFilter: 'blur(1px)', animation: 'atlas-fade var(--dur-med) var(--ease-standard)' }} />
      <div role="dialog" aria-modal="true"
        style={{
          position: 'relative', width: '100%', maxWidth: sizes[size] || sizes.md, maxHeight: '86vh',
          display: 'flex', flexDirection: 'column', background: 'var(--popover)', color: 'var(--popover-foreground)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
          animation: 'atlas-pop var(--dur-med) var(--ease-out)', overflow: 'hidden', fontFamily: 'var(--font-sans)', ...style,
        }}>
        <style>{'@keyframes atlas-fade{from{opacity:0}to{opacity:1}}@keyframes atlas-pop{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:none}}'}</style>
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
        <div style={{ padding: '18px', overflowY: 'auto', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>{children}</div>
        {footer ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--muted)' }}>{footer}</div> : null}
      </div>
    </div>
  )
}
