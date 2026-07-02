import React from 'react'

/* Atlas Admin — Button
   Variants: default (indigo), secondary, outline, ghost, destructive, link
   Sizes: sm, md, lg, icon. Compact heights for dense admin UIs. */

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--font-sans)',
  fontWeight: 'var(--font-medium)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid transparent',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
  outline: 'none',
}

const sizes = {
  sm: { height: 'var(--control-h-sm)', padding: '0 10px', fontSize: 'var(--text-xs)', gap: '4px' },
  md: { height: 'var(--control-h-md)', padding: '0 14px', fontSize: 'var(--text-base)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 20px', fontSize: 'var(--text-md)' },
  icon: { height: 'var(--control-h-md)', width: 'var(--control-h-md)', padding: 0 },
  'icon-sm': { height: 'var(--control-h-sm)', width: 'var(--control-h-sm)', padding: 0 },
}

const variants = {
  default: {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    boxShadow: 'var(--shadow-xs)',
    '--hover-bg': 'var(--primary-hover)',
  },
  secondary: {
    background: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    borderColor: 'var(--border)',
    '--hover-bg': 'var(--accent)',
  },
  outline: {
    background: 'var(--card)',
    color: 'var(--foreground)',
    borderColor: 'var(--border-strong)',
    boxShadow: 'var(--shadow-xs)',
    '--hover-bg': 'var(--accent)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--foreground)',
    '--hover-bg': 'var(--accent)',
  },
  destructive: {
    background: 'var(--destructive)',
    color: 'var(--destructive-foreground)',
    boxShadow: 'var(--shadow-xs)',
    '--hover-bg': 'color-mix(in oklch, var(--destructive) 88%, black)',
  },
  link: {
    background: 'transparent',
    color: 'var(--primary)',
    textUnderlineOffset: '3px',
    padding: 0,
    height: 'auto',
  },
}

export function Button({
  variant = 'default',
  size = 'md',
  disabled = false,
  type = 'button',
  style,
  children,
  ...props
}) {
  const [hover, setHover] = React.useState(false)
  const v = variants[variant] || variants.default
  const s = { ...base, ...(sizes[size] || sizes.md), ...v }
  if (v['--hover-bg']) delete s['--hover-bg']
  const merged = {
    ...s,
    ...(hover && !disabled && v['--hover-bg'] ? { background: v['--hover-bg'] } : null),
    ...(hover && !disabled && variant === 'link' ? { textDecoration: 'underline' } : null),
    ...(disabled ? { opacity: 0.5, pointerEvents: 'none' } : null),
    ...style,
  }
  return (
    <button
      type={type}
      disabled={disabled}
      style={merged}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--ring) 40%, transparent)')}
      onBlur={(e) => (e.currentTarget.style.boxShadow = s.boxShadow || 'none')}
      {...props}
    >
      {children}
    </button>
  )
}
