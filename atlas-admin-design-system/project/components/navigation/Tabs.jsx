import React from 'react'

/* Atlas Admin — Tabs. Underline-style segmented navigation. */

export function Tabs({ tabs = [], value, onChange, style }) {
  return (
    <div role="tablist" style={{ display: 'flex', alignItems: 'center', gap: '2px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-sans)', ...style }}>
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button key={t.value} role="tab" aria-selected={active} onClick={() => !t.disabled && onChange && onChange(t.value)}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px', border: 'none', background: 'transparent', cursor: t.disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 'var(--text-sm)', fontWeight: active ? 'var(--font-semibold)' : 'var(--font-medium)',
              color: active ? 'var(--primary)' : t.disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
              opacity: t.disabled ? 0.5 : 1, marginBottom: '-1px',
              borderBottom: '2px solid ' + (active ? 'var(--primary)' : 'transparent'),
              transition: 'color var(--dur-fast), border-color var(--dur-fast)',
            }}
            onMouseEnter={(e) => { if (!active && !t.disabled) e.currentTarget.style.color = 'var(--primary)' }}
            onMouseLeave={(e) => { if (!active && !t.disabled) e.currentTarget.style.color = 'var(--foreground)' }}>
            {t.label}
            {t.count != null ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', background: 'var(--muted)', borderRadius: 'var(--radius-full)', padding: '0 6px', lineHeight: '16px' }}>{t.count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
