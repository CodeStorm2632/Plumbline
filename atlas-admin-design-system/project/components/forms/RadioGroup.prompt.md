**RadioGroup** — pick one from a small set (e.g. account status, data scope).

```jsx
<RadioGroup value={v} onChange={setV} options={[
  { value: 'all', label: '全部数据' },
  { value: 'dept', label: '本部门' },
  { value: 'self', label: '仅本人' },
]} />
```

`direction="horizontal"` for inline layouts. For many options use Select instead.
