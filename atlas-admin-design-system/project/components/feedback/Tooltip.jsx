import React from 'react'

/* Atlas Admin — Tooltip. Hover/focus label; lightweight CSS positioning. */

export function Tooltip({ label, side = 'top', children, style }) {
  const [open, setOpen] = React.useState(false)
  const pos = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '6px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '6px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '6px' },
  }
  return (
    <span style={{ position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children}
      {open && label ? (
        <span role="tooltip" style={{
          position: 'absolute', zIndex: 60, ...pos[side], whiteSpace: 'nowrap',
          padding: '4px 8px', borderRadius: 'var(--radius-sm)',
          background: 'var(--foreground)', color: 'var(--background)',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)',
          boxShadow: 'var(--shadow-md)', pointerEvents: 'none',
        }}>{label}</span>
      ) : null}
    </span>
  )
}
