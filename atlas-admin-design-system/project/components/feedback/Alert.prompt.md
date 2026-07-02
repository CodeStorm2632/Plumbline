**Alert** — inline message tied to a form or panel (e.g. account-locked warning, save result).

```jsx
<Alert tone="warning" title="账户已锁定">连续 5 次密码错误，请 15 分钟后重试。</Alert>
<Alert tone="danger" title="保存失败" onClose={dismiss} />
```

Tones: info / success / warning / danger, each with a matching icon. For transient confirmations use Toast instead.
