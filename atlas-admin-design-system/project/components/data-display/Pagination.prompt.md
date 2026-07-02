**Pagination** — sits under a DataTable; shows total, range, page-size select, page buttons.

```jsx
<Pagination page={p} pageSize={ps} total={128}
  onPageChange={setP} onPageSizeChange={setPs} />
```

Collapses to ellipsis past 7 pages. Current page fills indigo. Chinese count copy ("共 N 条") is built in.
