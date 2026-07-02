**SidebarNav** — the left menu; grouped sections, collapsible parents, active highlight, badges.

```jsx
<SidebarNav active="users" onNavigate={go} groups={[
  { title: '总览', items: [{ key: 'dash', title: '仪表盘', icon: <DashIcon/>, url: '#' }] },
  { title: '系统管理', items: [
    { key: 'sys', title: '权限', icon: <ShieldIcon/>, defaultOpen: true, items: [
      { key: 'users', title: '用户管理', url: '#', badge: 12 },
      { key: 'roles', title: '角色管理', url: '#' },
      { key: 'menus', title: '菜单管理', url: '#' },
    ]},
  ]},
]} />
```

Active leaf fills indigo. Pass `collapsed` for the icon-only rail. Provide Lucide icon nodes for top-level items.
