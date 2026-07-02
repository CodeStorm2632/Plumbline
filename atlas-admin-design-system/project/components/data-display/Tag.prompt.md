**Tag** — role/permission chips and multi-select tokens.

```jsx
<Tag tone="primary">系统管理员</Tag>
<Tag tone="info" onRemove={() => remove(id)}>审计员</Tag>
```

Smaller radius than Badge (chip feel). Assign one tone per role family for scannability. Add `onRemove` for editable token lists.
