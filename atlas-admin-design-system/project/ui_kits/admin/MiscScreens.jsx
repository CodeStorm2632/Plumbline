/* Atlas Admin UI kit — MenusScreen (menu tree) + DictScreen (dictionary). */
const M_NS = window.AtlasAdminDesignSystem_9d1c70;

function MenusScreen() {
  const { Card, Badge, Button, Switch, Tooltip } = M_NS;
  const { Plus, Pencil, Trash, ChevronRight, ChevronDown, LayoutDashboard, ShieldCheck, ScrollText } = window;
  const Toolbar = window.KitToolbar;
  const [expanded, setExpanded] = React.useState({ system: true, monitor: true });
  const tree = window.ATLAS_DATA.MENU_TREE;
  const typeBadge = { dir: <Badge tone="neutral">目录</Badge>, menu: <Badge tone="info" appearance="outline">菜单</Badge> };
  const icons = { dash: LayoutDashboard, system: ShieldCheck, monitor: ScrollText };

  const rows = [];
  tree.forEach((n) => {
    const IconC = icons[n.key];
    rows.push({ ...n, depth: 0, IconC });
    if (n.children && expanded[n.key]) n.children.forEach((c) => rows.push({ ...c, depth: 1 }));
  });

  return (
    <div>
      <Toolbar right={<Button size="sm"><Plus size={15} />新增菜单</Button>}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>后台菜单与权限码维护，支持多级目录</span>
      </Toolbar>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
          <thead>
            <tr>
              {['菜单名称', '类型', '权限码', '路由', '状态', '操作'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 5 ? 'right' : 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--muted-foreground)', padding: '0 14px', height: '38px', background: 'var(--muted)', borderBottom: '1px solid var(--border)', letterSpacing: 'var(--tracking-wide)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '0 14px', height: 'var(--row-h)', fontSize: 'var(--text-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: r.depth * 22 + 'px' }}>
                    {r.children ? (
                      <span onClick={() => setExpanded((e) => ({ ...e, [r.key]: !e[r.key] }))} style={{ cursor: 'pointer', display: 'inline-flex', color: 'var(--muted-foreground)' }}>
                        {expanded[r.key] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </span>
                    ) : <span style={{ width: '15px', display: 'inline-block' }} />}
                    {r.IconC ? <span style={{ color: 'var(--muted-foreground)', display: 'inline-flex' }}><r.IconC size={16} /></span> : null}
                    <span style={{ fontWeight: r.depth === 0 ? 600 : 400 }}>{r.label}</span>
                  </div>
                </td>
                <td style={{ padding: '0 14px' }}>{typeBadge[r.type]}</td>
                <td style={{ padding: '0 14px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.code}</span></td>
                <td style={{ padding: '0 14px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.path || '—'}</span></td>
                <td style={{ padding: '0 14px' }}><Switch size="sm" checked onChange={() => {}} /></td>
                <td style={{ padding: '0 14px' }}>
                  <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
                    <Tooltip label="编辑"><Button variant="ghost" size="icon-sm"><Pencil size={15} /></Button></Tooltip>
                    <Tooltip label="删除"><Button variant="ghost" size="icon-sm" style={{ color: 'var(--destructive)' }}><Trash size={15} /></Button></Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DictScreen() {
  const { Card, DataTable, Badge, Button, Input, Tag, Tooltip } = M_NS;
  const { Plus, Search, Pencil, Trash } = window;
  const Toolbar = window.KitToolbar, Field = window.KitField;
  const cols = [
    { key: 'label', header: '字典名称', sortable: true, render: (r) => <span style={{ fontWeight: 500 }}>{r.label}</span> },
    { key: 'code', header: '字典类型', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.code}</span> },
    { key: 'items', header: '数据项', align: 'right', render: (r) => <Tag tone="neutral">{r.items} 项</Tag> },
    { key: 'remark', header: '取值', render: (r) => <span style={{ color: 'var(--muted-foreground)' }}>{r.remark}</span> },
    { key: 'status', header: '状态', render: (r) => <Badge tone={r.status ? 'success' : 'neutral'} dot>{r.status ? '启用' : '停用'}</Badge> },
    { key: 'ops', header: '操作', align: 'right', width: 110, render: () => (
      <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
        <Tooltip label="编辑"><Button variant="ghost" size="icon-sm"><Pencil size={15} /></Button></Tooltip>
        <Tooltip label="删除"><Button variant="ghost" size="icon-sm" style={{ color: 'var(--destructive)' }}><Trash size={15} /></Button></Tooltip>
      </div>) },
  ];
  return (
    <div>
      <Toolbar right={<Button size="sm"><Plus size={15} />新增字典</Button>}>
        <Field label="字典名称"><Input size="sm" placeholder="搜索字典" leading={<Search size={14} />} /></Field>
        <Button size="sm">查询</Button>
        <Button variant="outline" size="sm">重置</Button>
      </Toolbar>
      <Card><DataTable columns={cols} data={window.ATLAS_DATA.DICTS} rowKey="id" zebra /></Card>
    </div>
  );
}
window.MenusScreen = MenusScreen;
window.DictScreen = DictScreen;
