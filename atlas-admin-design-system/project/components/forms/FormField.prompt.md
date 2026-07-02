**FormField** — label + required marker + control + help/error, the standard form row.

```jsx
<FormField label="用户名" required error={err} htmlFor="username">
  <Input id="username" invalid={!!err} />
</FormField>
```

`required` shows a red `*`; passing `error` overrides `help` and turns the message destructive.
