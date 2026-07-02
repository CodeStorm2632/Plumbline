/* Atlas Admin UI kit — RolesScreen. Role table + permission-assignment drawer. */
const R_NS = window.AtlasAdminDesignSystem_9d1c70;

function RolesScreen() {
  const { Card, DataTable, Badge, Tag, Button, Input, Drawer, PermissionTree, FormField, Switch, Tooltip } = R_NS;
  const { Plus, Search, Pencil, Trash, ShieldCheck } = window;
  const Toolbar = window.KitToolbar, Field = window.KitField;
  const [roles, setRoles] = React.useState(window.ATLAS_DATA.ROLES);
  const [assign, setAssign] = React.useState(null);
  const [checked, setChecked] = React.useState(['user:list','user:add','role:list','log:login','log:oper']);

  const cols = [
    { key: 'name', header: '角色名称', sortable: true, render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Tag tone={r.tone}>{r.name}</Tag>
      </div>) },
    { key: 'code', header: '权限字符', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.code}</span> },
    { key: 'users', header: '用户数', align: 'right', sortable: true, render: (r) => <span style={{ fontWeight: 500 }}>{r.users}</span> },
    { key: 'perms', header: '权限数', align: 'right', render: (r) => <span style={{ color: 'var(--muted-foreground)' }}>{r.perms}</span> },
    { key: 'remark', header: '说明', render: (r) => <span style={{ color: 'var(--muted-foreground)' }}>{r.remark}</span> },
    { key: 'status', header: '状态', render: (r) => <Badge tone={r.status ? 'success' : 'neutral'} dot>{r.status ? '启用' : '停用'}</Badge> },
    { key: 'ops', header: '操作', align: 'right', width: 150, render: (r) => (
      <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
        <Tooltip label="分配权限"><Button variant="ghost" size="icon-sm" onClick={() => setAssign(r)}><ShieldCheck size={15} /></Button></Tooltip>
        <Tooltip label="编辑"><Button variant="ghost" size="icon-sm"><Pencil size={15} /></Button></Tooltip>
        <Tooltip label="删除"><Button variant="ghost" size="icon-sm" style={{ color: 'var(--destructive)' }}><Trash size={15} /></Button></Tooltip>
      </div>) },
  ];

  return (
    <div>
      <Toolbar right={<Button size="sm"><Plus size={15} />新增角色</Button>}>
        <Field label="角色名称"><Input size="sm" placeholder="搜索角色" leading={<Search size={14} />} /></Field>
        <Button size="sm">查询</Button>
        <Button variant="outline" size="sm">重置</Button>
      </Toolbar>

      <Card>
        <DataTable columns={cols} data={roles} rowKey="id" />
      </Card>

      <Drawer open={!!assign} onClose={() => setAssign(null)} size="md" title={assign ? `分配权限 · ${assign.name}` : '分配权限'} description="勾选该角色可访问的菜单与按钮权限"
        footer={<>
          <span style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>已选 {checked.length} 项</span>
          <R_NS.Button variant="outline" onClick={() => setAssign(null)}>取消</R_NS.Button>
          <R_NS.Button onClick={() => setAssign(null)}>保存权限</R_NS.Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="角色名称"><Input defaultValue={assign ? assign.name : ''} /></FormField>
            <FormField label="权限字符"><Input defaultValue={assign ? assign.code : ''} /></FormField>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--foreground)', marginBottom: '8px' }}>菜单 / 按钮权限</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              <PermissionTree nodes={window.ATLAS_DATA.PERM_TREE} checkedKeys={checked} onChange={setChecked} />
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
window.RolesScreen = RolesScreen;
