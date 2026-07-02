import React from 'react'

/* Atlas Admin — Select. Lightweight custom dropdown (styled trigger + popover). */

export function Select({
  value,
  onChange,
  options = [],
  placeholder = '请选择',
  size = 'md',
  disabled = false,
  invalid = false,
  style,
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const selected = options.find((o) => o.value === value)
  const heights = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' }
  const fonts = { sm: 'var(--text-xs)', md: 'var(--text-sm)', lg: 'var(--text-base)' }
  const trigger = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
    width: '100%', height: heights[size], padding: '0 10px',
    fontFamily: 'var(--font-sans)', fontSize: fonts[size],
    color: selected ? 'var(--foreground)' : 'var(--muted-foreground)',
    background: 'var(--card)',
    border: '1px solid ' + (invalid ? 'var(--destructive)' : open ? 'var(--ring)' : 'var(--input)'),
    borderRadius: 'var(--radius-md)', boxShadow: open ? '0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)' : 'var(--shadow-xs)',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
    transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
  }
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', ...style }}>
      <button type="button" disabled={disabled} onClick={() => setOpen((o) => !o)} style={trigger} aria-haspopup="listbox" aria-expanded={open}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected ? selected.label : placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--muted-foreground)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open ? (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 40,
          background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-popover)', padding: '4px', maxHeight: '240px', overflowY: 'auto',
        }}>
          {options.map((o) => {
            const sel = o.value === value
            return (
              <div
                key={o.value}
                role="option"
                aria-selected={sel}
                onClick={() => { if (!o.disabled) { onChange && onChange(o.value); setOpen(false) } }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = sel ? 'var(--primary-muted)' : 'transparent')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                  padding: '7px 8px', borderRadius: 'var(--radius-sm)', cursor: o.disabled ? 'not-allowed' : 'pointer',
                  fontSize: 'var(--text-sm)', color: 'var(--foreground)', opacity: o.disabled ? 0.5 : 1,
                  background: sel ? 'var(--primary-muted)' : 'transparent',
                }}
              >
                <span>{o.label}</span>
                {sel ? <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--primary)' }}><path d="M2.5 6.2 5 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
