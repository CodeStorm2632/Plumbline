/* Atlas Admin UI kit — UsersScreen. Filters, table, bulk actions, drawer, delete dialog. */
const U_NS = window.AtlasAdminDesignSystem_9d1c70;

function Toolbar({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>{children}</div>
      <div style={{ display: 'flex', gap: '8px' }}>{right}</div>
    </div>
  );
}
function Field({ label, children, w = 160 }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: w }}><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontWeight: 500 }}>{label}</span>{children}</div>;
}
window.KitToolbar = Toolbar; window.KitField = Field;

function UsersScreen() {
  const { Card, DataTable, Pagination, Badge, Tag, Avatar, Button, Input, Select, Switch, Drawer, Dialog, FormField, Tooltip } = U_NS;
  const { Plus, Download, Search, Pencil, Trash, KeyRound, X } = window;
  const [data, setData] = React.useState(window.ATLAS_DATA.USERS);
  const [sel, setSel] = React.useState([]);
  const [sortKey, setSortKey] = React.useState('id');
  const [sortDir, setSortDir] = React.useState('asc');
  const [drawer, setDrawer] = React.useState(null); // 'new' | user
  const [del, setDel] = React.useState(null);
  const [page, setPage] = React.useState(1);

  const cols = [
    { key: 'name', header: '用户', sortable: true, render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
        <Avatar name={r.name} size="sm" />
        <div style={{ lineHeight: 1.2 }}><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted-foreground)' }}>{r.username}</div></div>
      </div>) },
    { key: 'dept', header: '部门', render: (r) => <span style={{ color: 'var(--muted-foreground)' }}>{r.dept}</span> },
    { key: 'role', header: '角色', render: (r) => <Tag tone={r.roleTone}>{r.role}</Tag> },
    { key: 'phone', header: '手机号', render: (r) => <span className="atlas-mono" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{r.phone}</span> },
    { key: 'status', header: '状态', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Switch size="sm" checked={r.status} onChange={(v) => setData((d) => d.map((x) => x.id === r.id ? { ...x, status: v } : x))} />
        <Badge tone={r.status ? 'success' : 'neutral'} dot>{r.status ? '启用' : '停用'}</Badge>
      </div>) },
    { key: 'last', header: '最近登录', sortable: true, render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.last}</span> },
    { key: 'ops', header: '操作', align: 'right', width: 130, render: (r) => (
      <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
        <Tooltip label="编辑"><Button variant="ghost" size="icon-sm" onClick={() => setDrawer(r)}><Pencil size={15} /></Button></Tooltip>
        <Tooltip label="重置密码"><Button variant="ghost" size="icon-sm"><KeyRound size={15} /></Button></Tooltip>
        <Tooltip label="删除"><Button variant="ghost" size="icon-sm" onClick={() => setDel(r)} style={{ color: 'var(--destructive)' }}><Trash size={15} /></Button></Tooltip>
      </div>) },
  ];

  const sorted = [...data].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
  });

  return (
    <div>
      <Toolbar right={<>
        <Button variant="outline" size="sm"><Download size={15} />导出</Button>
        <Button size="sm" onClick={() => setDrawer('new')}><Plus size={15} />新增用户</Button>
      </>}>
        <Field label="用户名"><Input size="sm" placeholder="搜索姓名/账号" leading={<Search size={14} />} /></Field>
        <Field label="角色" w={140}><Select size="sm" placeholder="全部角色" options={[{value:'admin',label:'系统管理员'},{value:'audit',label:'审计员'},{value:'op',label:'运营'}]} /></Field>
        <Field label="状态" w={120}><Select size="sm" placeholder="全部" options={[{value:'1',label:'启用'},{value:'0',label:'停用'}]} /></Field>
        <Button size="sm">查询</Button>
        <Button variant="outline" size="sm">重置</Button>
      </Toolbar>

      <Card>
        {sel.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'var(--primary-muted)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)', fontWeight: 500 }}>已选择 {sel.length} 项</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" size="sm">批量停用</Button>
              <Button variant="destructive" size="sm">批量删除</Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setSel([])}><X size={15} /></Button>
            </div>
          </div>
        ) : null}
        <DataTable columns={cols} data={sorted} rowKey="id" zebra selectable selectedKeys={sel} onSelectionChange={setSel}
          sortKey={sortKey} sortDir={sortDir} onSort={(k, d) => { setSortKey(k); setSortDir(d); }} />
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
          <Pagination page={page} pageSize={10} total={128} onPageChange={setPage} onPageSizeChange={() => {}} />
        </div>
      </Card>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer === 'new' ? '新增用户' : '编辑用户'} description="账户信息与角色分配"
        footer={<><U_NS.Button variant="outline" onClick={() => setDrawer(null)}>取消</U_NS.Button><U_NS.Button onClick={() => setDrawer(null)}>保存</U_NS.Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <FormField label="登录账号" required><Input defaultValue={drawer !== 'new' && drawer ? drawer.username : ''} placeholder="小写字母/数字" /></FormField>
          <FormField label="姓名" required><Input defaultValue={drawer !== 'new' && drawer ? drawer.name : ''} placeholder="真实姓名" /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="部门" required><Select placeholder="选择部门" options={[{value:'tech',label:'技术部'},{value:'ops',label:'运营部'},{value:'risk',label:'风控部'}]} /></FormField>
            <FormField label="角色" required><Select placeholder="选择角色" options={[{value:'admin',label:'系统管理员'},{value:'audit',label:'审计员'},{value:'op',label:'运营'}]} /></FormField>
          </div>
          <FormField label="手机号" help="用于接收安全通知，将加密存储"><Input placeholder="选填" /></FormField>
          <FormField label="账户状态"><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Switch checked onChange={()=>{}} /><span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>启用后用户方可登录</span></div></FormField>
        </div>
      </Drawer>

      <Dialog open={!!del} onClose={() => setDel(null)} size="sm" title="删除用户"
        footer={<><U_NS.Button variant="outline" onClick={() => setDel(null)}>取消</U_NS.Button><U_NS.Button variant="destructive" onClick={() => { setData((d) => d.filter((x) => x.id !== del.id)); setDel(null); }}>确认删除</U_NS.Button></>}>
        确定要删除用户「{del ? del.name : ''}」吗？该操作将记录到操作日志，且不可撤销。
      </Dialog>
    </div>
  );
}
window.UsersScreen = UsersScreen;
