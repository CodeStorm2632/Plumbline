**DataTable** — the core surface of the scaffold. Columns are config; cells render via `render`.

```jsx
<DataTable
  columns={[
    { key: 'name', header: '用户名', sortable: true },
    { key: 'role', header: '角色', render: (r) => <Tag tone="primary">{r.role}</Tag> },
    { key: 'status', header: '状态', render: (r) => <Badge tone={r.on?'success':'neutral'} dot>{r.on?'启用':'停用'}</Badge> },
    { key: 'ops', header: '操作', align: 'right', render: (r) => <Button size="sm" variant="ghost">编辑</Button> },
  ]}
  data={rows}
  rowKey="id"
  zebra
  selectable
  selectedKeys={sel}
  onSelectionChange={setSel}
  sortKey={sk} sortDir={sd} onSort={(k,d)=>{setSk(k);setSd(d)}}
/>
```

Use `zebra` for wide read-only tables, per-row dividers (default) for editable ones. Pair with `Pagination`. Selecting rows surfaces a bulk-action bar (see UI kit). Use `dense` to fit more rows.
