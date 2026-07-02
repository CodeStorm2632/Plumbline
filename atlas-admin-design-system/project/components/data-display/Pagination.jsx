import React from 'react'

/* Atlas Admin — Pagination. Page size + page navigation with total count. */

function PageBtn({ children, active, disabled, onClick, aria }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={aria} aria-current={active ? 'page' : undefined}
      style={{
        minWidth: '30px', height: '30px', padding: '0 6px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: active ? 'var(--font-semibold)' : 'var(--font-medium)',
        color: active ? 'var(--primary-foreground)' : disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
        background: active ? 'var(--primary)' : 'var(--card)',
        border: '1px solid ' + (active ? 'var(--primary)' : 'var(--border-strong)'),
        borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-fast), border-color var(--dur-fast)',
      }}
      onMouseEnter={(e) => { if (!active && !disabled) e.currentTarget.style.background = 'var(--accent)' }}
      onMouseLeave={(e) => { if (!active && !disabled) e.currentTarget.style.background = 'var(--card)' }}>
      {children}
    </button>
  )
}

function pageList(page, total) {
  const pages = []
  const push = (p) => pages.push(p)
  if (total <= 7) { for (let i = 1; i <= total; i++) push(i); return pages }
  push(1)
  if (page > 3) push('…')
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) push(i)
  if (page < total - 2) push('…')
  push(total)
  return pages
}

export function Pagination({ page = 1, pageSize = 10, total = 0, pageSizeOptions = [10, 20, 50], onPageChange, onPageSizeChange, style }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', ...style }}>
      <div>共 <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-medium)' }}>{total}</span> 条，第 {from}-{to} 条</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>每页</span>
          <select value={pageSize} onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            style={{ height: '30px', padding: '0 6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'inherit', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
            {pageSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <PageBtn disabled={page <= 1} onClick={() => onPageChange && onPageChange(page - 1)} aria="上一页">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </PageBtn>
          {pageList(page, totalPages).map((p, i) => p === '…'
            ? <span key={'e' + i} style={{ minWidth: '20px', textAlign: 'center' }}>…</span>
            : <PageBtn key={p} active={p === page} onClick={() => onPageChange && onPageChange(p)}>{p}</PageBtn>)}
          <PageBtn disabled={page >= totalPages} onClick={() => onPageChange && onPageChange(page + 1)} aria="下一页">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </PageBtn>
        </div>
      </div>
    </div>
  )
}
