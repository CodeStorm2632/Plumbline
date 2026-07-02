/* Atlas Admin UI kit — LogsScreen. Login & operation logs with tabs + search. */
const L_NS = window.AtlasAdminDesignSystem_9d1c70;

function LogsScreen() {
  const { Card, DataTable, Badge, Button, Input, Select, Tabs, Pagination } = L_NS;
  const { Download, Search } = window;
  const Toolbar = window.KitToolbar, Field = window.KitField;
  const [tab, setTab] = React.useState('login');
  const D = window.ATLAS_DATA;

  const methodTone = { GET: 'neutral', POST: 'info', PUT: 'warning', DELETE: 'danger' };

  const loginCols = [
    { key: 'user', header: '账号', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{r.user}</span> },
    { key: 'ip', header: 'IP 地址', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.ip}</span> },
    { key: 'location', header: '登录地点', render: (r) => <span style={{ color: r.location === '境外' ? 'var(--destructive)' : 'var(--foreground)' }}>{r.location}</span> },
    { key: 'browser', header: '浏览器', render: (r) => <span style={{ color: 'var(--muted-foreground)' }}>{r.browser}</span> },
    { key: 'os', header: '系统', render: (r) => <span style={{ color: 'var(--muted-foreground)' }}>{r.os}</span> },
    { key: 'status', header: '结果', render: (r) => <Badge tone={r.status === 'success' ? 'success' : 'danger'} dot>{r.msg}</Badge> },
    { key: 'time', header: '登录时间', sortable: true, render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.time}</span> },
  ];
  const opCols = [
    { key: 'user', header: '操作人', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{r.user}</span> },
    { key: 'module', header: '模块', render: (r) => <span style={{ fontWeight: 500 }}>{r.module}</span> },
    { key: 'action', header: '操作', render: (r) => r.action },
    { key: 'method', header: '请求', render: (r) => <Badge tone={methodTone[r.method]} appearance="outline">{r.method}</Badge> },
    { key: 'code', header: '权限码', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--muted-foreground)' }}>{r.code}</span> },
    { key: 'ms', header: '耗时', align: 'right', sortable: true, render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: r.ms > 300 ? 'var(--warning-subtle-foreground)' : 'var(--muted-foreground)' }}>{r.ms}ms</span> },
    { key: 'status', header: '结果', render: (r) => <Badge tone={r.status === 'success' ? 'success' : 'danger'}>{r.status === 'success' ? '成功' : '失败'}</Badge> },
    { key: 'time', header: '时间', sortable: true, render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{r.time}</span> },
  ];

  return (
    <div>
      <Card>
        <div style={{ padding: '0 14px' }}>
          <Tabs value={tab} onChange={setTab} tabs={[{ value: 'login', label: '登录日志', count: 128 }, { value: 'oper', label: '操作日志', count: 542 }]} />
        </div>
        <div style={{ padding: '14px' }}>
          <Toolbar right={<Button variant="outline" size="sm"><Download size={15} />导出</Button>}>
            <Field label={tab === 'login' ? '账号' : '操作人'}><Input size="sm" placeholder="搜索账号" leading={<Search size={14} />} /></Field>
            <Field label="结果" w={120}><Select size="sm" placeholder="全部" options={[{value:'s',label:'成功'},{value:'f',label:'失败'}]} /></Field>
            <Field label="日期" w={150}><Input size="sm" placeholder="2026-06-30" /></Field>
            <Button size="sm">查询</Button>
            <Button variant="outline" size="sm">重置</Button>
          </Toolbar>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <DataTable columns={tab === 'login' ? loginCols : opCols} data={tab === 'login' ? D.LOGIN_LOGS : D.OP_LOGS} rowKey="id" zebra />
          </div>
          <div style={{ marginTop: '12px' }}>
            <Pagination page={1} pageSize={10} total={tab === 'login' ? 128 : 542} onPageChange={() => {}} onPageSizeChange={() => {}} />
          </div>
        </div>
      </Card>
    </div>
  );
}
window.LogsScreen = LogsScreen;
