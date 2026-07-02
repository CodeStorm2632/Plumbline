**Checkbox** — boolean selection; `indeterminate` for partially-selected tree parents.

```jsx
<Checkbox checked={v} onChange={setV} label="记住我" />
<Checkbox indeterminate label="用户管理" />
```

`onChange(nextChecked)`. Use `indeterminate` on permission-tree parent nodes whose children are partly selected.
