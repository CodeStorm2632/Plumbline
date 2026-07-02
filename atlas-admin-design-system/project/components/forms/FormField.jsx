import React from 'react'

/* Atlas Admin — FormField. Label + control + help/error, with required marker. */

export function FormField({ label, required = false, error = null, help = null, htmlFor, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-sans)', ...style }}>
      {label != null ? (
        <label htmlFor={htmlFor} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--foreground)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          {required ? <span style={{ color: 'var(--destructive)', fontWeight: 'var(--font-semibold)' }}>*</span> : null}
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--destructive)' }}>{error}</span>
      ) : help ? (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{help}</span>
      ) : null}
    </div>
  )
}
