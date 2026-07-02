import React from 'react'

/* Atlas Admin — Textarea. Auto-inherits field styling; vertical resize only. */

export function Textarea({ invalid = false, disabled = false, rows = 4, style, ...props }) {
  const [focus, setFocus] = React.useState(false)
  const s = {
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--leading-snug)',
    color: 'var(--foreground)',
    background: 'var(--card)',
    border: '1px solid var(--input)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-xs)',
    padding: '8px 10px',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
    ...(invalid ? { borderColor: 'var(--destructive)' } : null),
    ...(focus && !invalid ? { borderColor: 'var(--ring)', boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)' } : null),
    ...(disabled ? { opacity: 0.55, pointerEvents: 'none', background: 'var(--muted)' } : null),
    ...style,
  }
  return (
    <textarea
      rows={rows}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onFocus={(e) => { setFocus(true); props.onFocus && props.onFocus(e) }}
      onBlur={(e) => { setFocus(false); props.onBlur && props.onBlur(e) }}
      {...props}
      style={s}
    />
  )
}
