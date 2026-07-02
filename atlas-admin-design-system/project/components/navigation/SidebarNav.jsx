import React from 'react'

/* Atlas Admin — SidebarNav.
   Multi-level collapsible menu with grouped sections, active state,
   badges, and an icon-only collapsed mode. Icons are passed as nodes. */

function Chevron({ open }) {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ transition: 'transform var(--dur-fast)', transform: open ? 'rotate(90deg)' : 'none', flexShrink: 0 }}><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function Leaf({ item, active, collapsed, depth, onNavigate }) {
  const isActive = active === item.key
  return (
    <a href={item.url || '#'} title={collapsed ? item.title : undefined}
      onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(item.key, item) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none',
        height: '34px', padding: collapsed ? '0' : '0 8px', justifyContent: collapsed ? 'center' : 'flex-start',
        paddingLeft: collapsed ? 0 : (depth > 0 ? 8 + depth * 18 + 'px' : '8px'),
        borderRadius: 'var(--radius-md)', margin: '1px 0',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
        color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
        background: isActive ? 'var(--sidebar-primary)' : 'transparent',
        transition: 'background var(--dur-fast), color var(--dur-fast)',
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--sidebar-accent)' }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
      {item.icon ? <span style={{ display: 'inline-flex', width: '18px', height: '18px', flexShrink: 0, color: isActive ? 'inherit' : 'var(--muted-foreground)' }}>{item.icon}</span> : (depth > 0 && !collapsed ? <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', opacity: 0.4, flexShrink: 0 }} /> : null)}
      {!collapsed ? <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span> : null}
      {!collapsed && item.badge != null ? <span style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--font-semibold)', minWidth: '18px', textAlign: 'center', padding: '0 5px', lineHeight: '17px', borderRadius: 'var(--radius-full)', background: isActive ? 'color-mix(in oklch, white 25%, transparent)' : 'var(--primary-muted)', color: isActive ? 'inherit' : 'var(--primary)' }}>{item.badge}</span> : null}
    </a>
  )
}

function Branch({ item, active, collapsed, onNavigate, defaultOpen }) {
  const hasActiveChild = (item.items || []).some((c) => c.key === active)
  const [open, setOpen] = React.useState(defaultOpen || hasActiveChild)
  if (collapsed) {
    return <Leaf item={item} active={hasActiveChild ? item.key : active} collapsed onNavigate={onNavigate} depth={0} />
  }
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '9px', width: '100%', height: '34px', padding: '0 8px', margin: '1px 0',
          border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
          color: hasActiveChild ? 'var(--foreground)' : 'var(--sidebar-foreground)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sidebar-accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
        {item.icon ? <span style={{ display: 'inline-flex', width: '18px', height: '18px', flexShrink: 0, color: 'var(--muted-foreground)' }}>{item.icon}</span> : null}
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
        <span style={{ color: 'var(--muted-foreground)' }}><Chevron open={open} /></span>
      </button>
      {open ? (
        <div style={{ position: 'relative' }}>
          {(item.items || []).map((c) => <Leaf key={c.key} item={c} active={active} collapsed={false} depth={1} onNavigate={onNavigate} />)}
        </div>
      ) : null}
    </div>
  )
}

export function SidebarNav({ groups = [], active, onNavigate, collapsed = false, style }) {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: collapsed ? '8px 8px' : '8px 10px', ...style }}>
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.title && !collapsed ? <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-2xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--muted-foreground)', padding: '4px 8px 2px' }}>{g.title}</div> : null}
          {(g.items || []).map((item) => item.items
            ? <Branch key={item.key} item={item} active={active} collapsed={collapsed} onNavigate={onNavigate} defaultOpen={item.defaultOpen} />
            : <Leaf key={item.key} item={item} active={active} collapsed={collapsed} depth={0} onNavigate={onNavigate} />)}
        </div>
      ))}
    </nav>
  )
}
