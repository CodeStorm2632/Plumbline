**Tabs** — underline tabs to switch views inside one page.

```jsx
<Tabs value={tab} onChange={setTab} tabs={[
  { value: 'login', label: '登录日志', count: 128 },
  { value: 'op', label: '操作日志', count: 542 },
]} />
```

Active tab is indigo with a 2px underline. Optional `count` badge per tab.
