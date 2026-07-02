**Badge** — the colored status label used across tables and logs.

```jsx
<Badge tone="success" dot>启用</Badge>
<Badge tone="neutral" dot>停用</Badge>
<Badge tone="danger" appearance="solid">失败</Badge>
<Badge tone="info" appearance="outline">登录</Badge>
```

`tone`: neutral / primary / success / warning / danger / info.
`appearance`: soft (default, tinted) / solid / outline. Use `dot` for on/off status. Keep tone mapping consistent: success=启用/成功, neutral=停用, danger=失败/删除, warning=待处理.
