**PermissionTree** — the role→permission assignment control; checkbox tree with cascade + indeterminate parents.

```jsx
<PermissionTree
  checkedKeys={keys}
  onChange={setKeys}
  nodes={[
    { key: 'user', label: '用户管理', code: 'system:user', children: [
      { key: 'user:list', label: '查询', code: 'system:user:list', type: 'button' },
      { key: 'user:add', label: '新增', code: 'system:user:add', type: 'button' },
    ]},
  ]}
/>
```

Checking a parent selects all descendants; partial selection shows an indeterminate parent. Menu nodes nest; `type:'button'` leaves get a 按钮 tag. `code` renders as a mono permission-key chip.
