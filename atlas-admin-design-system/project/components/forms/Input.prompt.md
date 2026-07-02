**Input** — single-line text field; pair with `FormField` for label + error copy.

```jsx
<Input placeholder="请输入用户名" />
<Input leading={<SearchIcon />} placeholder="搜索" />
<Input invalid defaultValue="bad@" trailing={<AlertIcon />} />
```

Sizes `sm|md|lg`. Set `invalid` to show the error border + ring. Adornments (`leading`/`trailing`) sit inside the field, muted-foreground colored.
