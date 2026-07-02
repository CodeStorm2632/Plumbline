import React from 'react'

/* Atlas Admin — PermissionTree.
   Expandable checkbox tree with parent→child cascade and indeterminate
   parents. Powers role → menu/button permission assignment.
   Controlled via checkedKeys + onChange (returns the full next key list). */

function collectKeys(node, acc) {
  acc.push(node.key)
  ;(node.children || []).forEach((c) => collectKeys(c, acc))
  return acc
}

function CheckBox({ state, onClick }) {
  const on = state === 'checked' || state === 'indeterminate'
  return (
    <span role="checkbox" aria-checked={state === 'indeterminate' ? 'mixed' : state === 'checked'} tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onClick() } }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', flexShrink: 0,
        borderRadius: 'var(--radius-sm)', border: '1.5px solid ' + (on ? 'var(--primary)' : 'var(--border-strong)'),
        background: on ? 'var(--primary)' : 'var(--card)', color: 'var(--primary-foreground)', cursor: 'pointer',
        transition: 'background var(--dur-fast), border-color var(--dur-fast)',
      }}>
      {state === 'indeterminate' ? <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="4.25" width="7" height="1.5" rx="0.75" fill="currentColor"/></svg>
        : state === 'checked' ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2 5 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : null}
    </span>
  )
}

function TreeNode({ node, depth, checkedSet, expandedSet, onToggleCheck, onToggleExpand }) {
  const children = node.children || []
  const hasChildren = children.length > 0
  const expanded = expandedSet.has(node.key)
  // derive state
  let state = 'unchecked'
  if (hasChildren) {
    const all = collectKeys(node, []).filter((k) => k !== node.key)
    const checkedCount = all.filter((k) => checkedSet.has(k)).length
    if (checkedCount === 0) state = checkedSet.has(node.key) ? 'checked' : 'unchecked'
    else if (checkedCount === all.length) state = 'checked'
    else state = 'indeterminate'
  } else {
    state = checkedSet.has(node.key) ? 'checked' : 'unchecked'
  }
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '7px', height: '32px',
        paddingLeft: 6 + depth * 20 + 'px', paddingRight: '6px', borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--foreground)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
        <span onClick={() => hasChildren && onToggleExpand(node.key)} style={{ display: 'inline-flex', width: '14px', height: '14px', alignItems: 'center', justifyContent: 'center', cursor: hasChildren ? 'pointer' : 'default', color: 'var(--muted-foreground)', flexShrink: 0 }}>
          {hasChildren ? <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform var(--dur-fast)' }}><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> : null}
        </span>
        <CheckBox state={state} onClick={() => onToggleCheck(node)} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'default' }} onClick={() => hasChildren && onToggleExpand(node.key)}>
          {node.label}
          {node.code ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '1px 5px', borderRadius: 'var(--radius-xs)' }}>{node.code}</span> : null}
          {node.type === 'button' ? <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--info-subtle-foreground)', background: 'var(--info-subtle)', padding: '0 5px', borderRadius: 'var(--radius-xs)' }}>按钮</span> : null}
        </span>
      </div>
      {hasChildren && expanded ? <div>{children.map((c) => <TreeNode key={c.key} node={c} depth={depth + 1} checkedSet={checkedSet} expandedSet={expandedSet} onToggleCheck={onToggleCheck} onToggleExpand={onToggleExpand} />)}</div> : null}
    </div>
  )
}

export function PermissionTree({ nodes = [], checkedKeys = [], onChange, defaultExpandAll = true, style }) {
  const checkedSet = React.useMemo(() => new Set(checkedKeys), [checkedKeys])
  const [expandedSet, setExpanded] = React.useState(() => {
    const s = new Set()
    if (defaultExpandAll) { const walk = (n) => { if (n.children) { s.add(n.key); n.children.forEach(walk) } }; nodes.forEach(walk) }
    return s
  })
  const onToggleExpand = (key) => setExpanded((prev) => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s })
  const onToggleCheck = (node) => {
    const keys = collectKeys(node, [])
    const all = keys.filter((k) => k !== node.key || !node.children)
    const isFullyChecked = keys.every((k) => checkedSet.has(k))
    const next = new Set(checkedSet)
    if (isFullyChecked) keys.forEach((k) => next.delete(k))
    else keys.forEach((k) => next.add(k))
    onChange && onChange([...next])
  }
  return (
    <div style={{ fontFamily: 'var(--font-sans)', ...style }}>
      {nodes.map((n) => <TreeNode key={n.key} node={n} depth={0} checkedSet={checkedSet} expandedSet={expandedSet} onToggleCheck={onToggleCheck} onToggleExpand={onToggleExpand} />)}
    </div>
  )
}
