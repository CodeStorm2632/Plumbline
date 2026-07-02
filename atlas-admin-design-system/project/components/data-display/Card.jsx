import React from 'react'

/* Atlas Admin — Card + CardHeader/CardBody/CardFooter. Flat, low-radius surface. */

export function Card({ children, style, ...props }) {
  return (
    <div style={{
      background: 'var(--card)', color: 'var(--card-foreground)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden', ...style,
    }} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, actions, style, ...props }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
      padding: '14px 16px', borderBottom: '1px solid var(--border)', ...style,
    }} {...props}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {title != null ? <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)', letterSpacing: 'var(--tracking-tight)' }}>{title}</div> : null}
        {description != null ? <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{description}</div> : null}
      </div>
      {actions ? <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>{actions}</div> : null}
    </div>
  )
}

export function CardBody({ children, style, ...props }) {
  return <div style={{ padding: '16px', ...style }} {...props}>{children}</div>
}

export function CardFooter({ children, style, ...props }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--muted)', ...style }} {...props}>
      {children}
    </div>
  )
}
