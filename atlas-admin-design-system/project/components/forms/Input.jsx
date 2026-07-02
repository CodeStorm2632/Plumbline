import React from 'react'

/* Atlas Admin — Input. Supports leading/trailing adornments, invalid state, sizes. */

const wrapBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  fontFamily: 'var(--font-sans)',
  background: 'var(--card)',
  border: '1px solid var(--input)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-xs)',
  transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
}

const sizeMap = {
  sm: { height: 'var(--control-h-sm)', padding: '0 8px', fontSize: 'var(--text-xs)' },
  md: { height: 'var(--control-h-md)', padding: '0 10px', fontSize: 'var(--text-sm)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 12px', fontSize: 'var(--text-base)' },
}

export function Input({
  size = 'md',
  invalid = false,
  disabled = false,
  leading = null,
  trailing = null,
  style,
  ...props
}) {
  const [focus, setFocus] = React.useState(false)
  const sz = sizeMap[size] || sizeMap.md
  const wrap = {
    ...wrapBase,
    height: sz.height,
    padding: sz.padding,
    ...(invalid ? { borderColor: 'var(--destructive)' } : null),
    ...(focus && !invalid ? { borderColor: 'var(--ring)', boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 35%, transparent)' } : null),
    ...(focus && invalid ? { boxShadow: '0 0 0 3px color-mix(in oklch, var(--destructive) 30%, transparent)' } : null),
    ...(disabled ? { opacity: 0.55, pointerEvents: 'none', background: 'var(--muted)' } : null),
    ...style,
  }
  const iconStyle = { display: 'inline-flex', color: 'var(--muted-foreground)', flexShrink: 0 }
  return (
    <span style={wrap}>
      {leading ? <span style={iconStyle}>{leading}</span> : null}
      <input
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onFocus={(e) => { setFocus(true); props.onFocus && props.onFocus(e) }}
        onBlur={(e) => { setFocus(false); props.onBlur && props.onBlur(e) }}
        {...props}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'var(--foreground)',
          fontFamily: 'inherit',
          fontSize: sz.fontSize,
          padding: 0,
        }}
      />
      {trailing ? <span style={iconStyle}>{trailing}</span> : null}
    </span>
  )
}
