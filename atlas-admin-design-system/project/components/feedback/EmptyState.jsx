import React from 'react'

/* Atlas Admin — EmptyState. No-data / no-results placeholder. */

export function EmptyState({ title = '暂无数据', description, icon, action, style }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 20px', gap: '4px', fontFamily: 'var(--font-sans)', ...style,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '44px', height: '44px', borderRadius: 'var(--radius-full)',
        background: 'var(--muted)', color: 'var(--muted-foreground)', marginBottom: '8px',
      }}>
        {icon || (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7l1.5 12a2 2 0 002 2h9a2 2 0 002-2L20 7M4 7h16M4 7l1-3h14l1 3M9 11v6M15 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)' }}>{title}</div>
      {description != null ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', maxWidth: '280px' }}>{description}</div> : null}
      {action ? <div style={{ marginTop: '12px' }}>{action}</div> : null}
    </div>
  )
}
