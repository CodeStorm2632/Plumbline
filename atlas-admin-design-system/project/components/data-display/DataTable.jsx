import React from 'react'

/* Atlas Admin — DataTable.
   Config-driven table: sortable headers, zebra/divider rows, row selection,
   sticky header, dense mode. The core surface of the admin scaffold. */

function SortIcon({ dir }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 0, marginLeft: '2px' }}>
      <svg width="8" height="6" viewBox="0 0 8 6" style={{ marginBottom: '1px' }}><path d="M4 0l3 4H1z" fill={dir === 'asc' ? 'var(--primary)' : 'var(--border-strong)'} /></svg>
      <svg width="8" height="6" viewBox="0 0 8 6"><path d="M4 6L1 2h6z" fill={dir === 'desc' ? 'var(--primary)' : 'var(--border-strong)'} /></svg>
    </span>
  )
}

export function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  zebra = false,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sortKey,
  sortDir,
  onSort,
  dense = false,
  stickyHeader = false,
  emptyText = '暂无数据',
  style,
}) {
  const getKey = (row, i) => (typeof rowKey === 'function' ? rowKey(row) : row[rowKey] ?? i)
  const allKeys = data.map(getKey)
  const allChecked = allKeys.length > 0 && allKeys.every((k) => selectedKeys.includes(k))
  const someChecked = selectedKeys.length > 0 && !allChecked
  const toggleAll = () => onSelectionChange && onSelectionChange(allChecked ? [] : allKeys)
  const toggleRow = (k) => onSelectionChange && onSelectionChange(selectedKeys.includes(k) ? selectedKeys.filter((x) => x !== k) : [...selectedKeys, k])

  const rowH = dense ? 'var(--row-h-dense)' : 'var(--row-h)'
  const cellPad = dense ? '0 12px' : '0 14px'

  const th = {
    textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-semibold)', color: 'var(--muted-foreground)',
    letterSpacing: 'var(--tracking-wide)', textTransform: 'none',
    padding: cellPad, height: '38px', whiteSpace: 'nowrap',
    background: 'var(--muted)', borderBottom: '1px solid var(--border)',
    position: stickyHeader ? 'sticky' : 'static', top: 0, zIndex: 2,
  }
  const td = {
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--foreground)',
    padding: cellPad, height: rowH, verticalAlign: 'middle',
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
        <thead>
          <tr>
            {selectable ? (
              <th style={{ ...th, width: '40px', paddingRight: 0 }}>
                <CheckboxCell checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
              </th>
            ) : null}
            {columns.map((col) => {
              const active = sortKey === col.key
              return (
                <th key={col.key} style={{ ...th, width: col.width, textAlign: col.align || 'left', cursor: col.sortable ? 'pointer' : 'default', color: active ? 'var(--foreground)' : th.color }}
                    onClick={() => col.sortable && onSort && onSort(col.key, active && sortDir === 'asc' ? 'desc' : 'asc')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }}>
                    {col.header}
                    {col.sortable ? <SortIcon dir={active ? sortDir : null} /> : null}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length + (selectable ? 1 : 0)} style={{ ...td, textAlign: 'center', color: 'var(--muted-foreground)', height: '96px' }}>{emptyText}</td></tr>
          ) : data.map((row, i) => {
            const k = getKey(row, i)
            const isSel = selectedKeys.includes(k)
            const zebraBg = zebra && i % 2 === 1 ? 'var(--muted)' : 'transparent'
            return (
              <tr key={k}
                  style={{
                    background: isSel ? 'var(--primary-muted)' : zebraBg,
                    borderBottom: zebra ? 'none' : '1px solid var(--border)',
                    transition: 'background var(--dur-fast) var(--ease-standard)',
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'var(--accent)' }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = zebraBg }}>
                {selectable ? <td style={{ ...td, paddingRight: 0 }}><CheckboxCell checked={isSel} onChange={() => toggleRow(k)} /></td> : null}
                {columns.map((col) => (
                  <td key={col.key} style={{ ...td, textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* internal — avoids hard dependency on Checkbox import order */
function CheckboxCell({ checked, indeterminate, onChange }) {
  const on = checked || indeterminate
  return (
    <span role="checkbox" aria-checked={indeterminate ? 'mixed' : checked} tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onChange && onChange() }}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange && onChange() } }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px',
        borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + (on ? 'var(--primary)' : 'var(--border-strong)'),
        background: on ? 'var(--primary)' : 'var(--card)', color: 'var(--primary-foreground)', cursor: 'pointer',
      }}>
      {indeterminate ? <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="4.25" width="7" height="1.5" rx="0.75" fill="currentColor"/></svg>
        : checked ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2 5 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : null}
    </span>
  )
}
