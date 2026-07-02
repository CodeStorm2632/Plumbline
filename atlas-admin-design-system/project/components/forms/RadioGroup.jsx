import React from 'react'

/* Atlas Admin — RadioGroup. Single-select from a small option set. */

export function RadioGroup({ value, onChange, options = [], name, direction = 'vertical', disabled = false, style }) {
  const wrap = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: direction === 'horizontal' ? '16px' : '10px',
    fontFamily: 'var(--font-sans)',
    ...style,
  }
  return (
    <div role="radiogroup" style={wrap}>
      {options.map((opt) => {
        const selected = opt.value === value
        const dis = disabled || opt.disabled
        return (
          <label key={opt.value} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.5 : 1, fontSize: 'var(--text-sm)', color: 'var(--foreground)', userSelect: 'none' }}>
            <span
              role="radio"
              aria-checked={selected}
              tabIndex={dis ? -1 : 0}
              onClick={() => !dis && onChange && onChange(opt.value)}
              onKeyDown={(e) => { if (!dis && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); onChange && onChange(opt.value) } }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '16px', height: '16px', borderRadius: 'var(--radius-full)',
                border: '1.5px solid ' + (selected ? 'var(--primary)' : 'var(--border-strong)'),
                background: 'var(--card)', flexShrink: 0,
                transition: 'border-color var(--dur-fast) var(--ease-standard)',
              }}
            >
              {selected ? <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--primary)' }} /> : null}
            </span>
            <span>{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}
