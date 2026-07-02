import React from 'react'

/* Atlas Admin — Checkbox. Supports checked + indeterminate (for tree parents). */

export function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  label = null,
  id,
  style,
  ...props
}) {
  const on = checked || indeterminate
  const box = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    flexShrink: 0,
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid ' + (on ? 'var(--primary)' : 'var(--border-strong)'),
    background: on ? 'var(--primary)' : 'var(--card)',
    color: 'var(--primary-foreground)',
    transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
  const wrap = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    color: 'var(--foreground)',
    userSelect: 'none',
    ...style,
  }
  return (
    <label style={wrap}>
      <span
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange && onChange(!checked)}
        onKeyDown={(e) => { if (!disabled && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); onChange && onChange(!checked) } }}
        style={box}
        {...props}
      >
        {indeterminate ? (
          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="4.25" width="7" height="1.5" rx="0.75" fill="currentColor" /></svg>
        ) : checked ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2 5 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : null}
      </span>
      {label != null ? <span>{label}</span> : null}
    </label>
  )
}
