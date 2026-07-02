**Select** — dropdown single-select; the workhorse for dictionary values, status filters, role pickers.

```jsx
<Select value={v} onChange={setV} placeholder="选择状态" options={[
  { value: 'active', label: '启用' },
  { value: 'disabled', label: '停用' },
]} />
```

Sizes `sm|md|lg`; set `invalid` for validation. Selected option shows an indigo check.
