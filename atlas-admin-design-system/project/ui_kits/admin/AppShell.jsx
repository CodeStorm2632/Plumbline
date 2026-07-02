/* Atlas Admin UI kit — AppShell. Sidebar + header + screen routing. */
const S_NS = window.AtlasAdminDesignSystem_9d1c70;

function AppShell({ onLogout }) {
  const { SidebarNav, Breadcrumb, Input, Avatar, Button, Badge, Tooltip } = S_NS;
  const { LayoutDashboard, Users, ShieldCheck, ListTree, Database, ScrollText, Search, Bell, Sun, Moon, PanelLeft, LogOut, ChevronDown } = window;
  const [active, setActive] = React.useState('users');
  const [collapsed, setCollapsed] = React.useState(false);
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const groups = [
    { title: '总览', items: [{ key: 'dash', title: '仪表盘', icon: <LayoutDashboard size={18} />, url: '#' }] },
    { title: '系统管理', items: [
      { key: 'sys', title: '权限管理', icon: <ShieldCheck size={18} />, defaultOpen: true, items: [
        { key: 'users', title: '用户管理', url: '#', badge: 128 },
        { key: 'roles', title: '角色管理', url: '#' },
        { key: 'menus', title: '菜单管理', url: '#' },
      ]},
      { key: 'basic', title: '基础数据', icon: <Database size={18} />, defaultOpen: true, items: [
        { key: 'dict', title: '字典管理', url: '#' },
      ]},
    ]},
    { title: '监控', items: [
      { key: 'logs', title: '日志管理', icon: <ScrollText size={18} />, url: '#' },
    ]},
  ];

  const meta = {
    dash: { title: '仪表盘', crumbs: ['仪表盘'] },
    users: { title: '用户管理', crumbs: ['系统管理', '用户管理'] },
    roles: { title: '角色管理', crumbs: ['系统管理', '角色管理'] },
    menus: { title: '菜单管理', crumbs: ['系统管理', '菜单管理'] },
    dict: { title: '字典管理', crumbs: ['基础数据', '字典管理'] },
    logs: { title: '日志管理', crumbs: ['监控', '日志管理'] },
  };
  const cur = meta[active] || meta.users;

  const Screen = {
    users: window.UsersScreen, roles: window.RolesScreen, menus: window.MenusScreen,
    dict: window.DictScreen, logs: window.LogsScreen, dash: window.UsersScreen,
  }[active] || window.UsersScreen;

  const sideW = collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <aside style={{ width: sideW, flexShrink: 0, background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', transition: 'width var(--dur-med) var(--ease-standard)' }}>
        <div style={{ height: 'var(--header-h)', display: 'flex', alignItems: 'center', gap: '9px', padding: collapsed ? '0' : '0 16px', justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
          <img src="../../assets/logo-mark.svg" width="28" height="28" alt="" />
          {!collapsed ? <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>Atlas Admin</span> : null}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarNav groups={groups} active={active} collapsed={collapsed} onNavigate={(k) => setActive(k)} />
        </div>
        <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: collapsed ? '8px' : '10px 12px', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <Avatar name="张伟" size="sm" />
          {!collapsed ? (
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>张伟</div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--muted-foreground)' }}>系统管理员</div>
            </div>
          ) : null}
          {!collapsed ? <Tooltip label="退出登录"><Button variant="ghost" size="icon-sm" onClick={onLogout}><LogOut size={16} /></Button></Tooltip> : null}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 'var(--header-h)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '0 20px', background: 'color-mix(in oklch, var(--card) 88%, transparent)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30, backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button variant="ghost" size="icon-sm" onClick={() => setCollapsed((c) => !c)}><PanelLeft size={18} /></Button>
            <Breadcrumb items={cur.crumbs.map((c, i) => i === cur.crumbs.length - 1 ? { label: c } : { label: c, href: '#' })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '220px' }}><Input size="sm" placeholder="全局搜索…" leading={<Search size={14} />} /></div>
            <Tooltip label={dark ? '浅色模式' : '深色模式'}><Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</Button></Tooltip>
            <div style={{ position: 'relative' }}>
              <Button variant="ghost" size="icon"><Bell size={18} /></Button>
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--destructive)', border: '1.5px solid var(--card)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', paddingLeft: '6px', cursor: 'pointer' }}>
              <Avatar name="张伟" size="sm" />
              <ChevronDown size={15} style={{ color: 'var(--muted-foreground)' }} />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>{cur.title}</h1>
          </div>
          <Screen />
        </main>
      </div>
    </div>
  );
}
window.AppShell = AppShell;
