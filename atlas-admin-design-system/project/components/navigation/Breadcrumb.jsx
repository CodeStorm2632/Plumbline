import React from 'react'

/* Atlas Admin — Breadcrumb. Location trail; last item is current page. */

export function Breadcrumb({ items = [], style }) {
  return (
    <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', ...style }}>
      {items.map((it, i) => {
        const last = i === items.length - 1
        return (
          <React.Fragment key={i}>
            {last ? (
              <span aria-current="page" style={{ color: 'var(--foreground)', fontWeight: 'var(--font-medium)' }}>{it.label}</span>
            ) : (
              <a href={it.href || '#'} onClick={it.onClick} style={{ color: 'var(--muted-foreground)', textDecoration: 'none', cursor: 'pointer' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}>{it.label}</a>
            )}
            {!last ? <span style={{ color: 'var(--border-strong)' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span> : null}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
