**Dialog** — centered modal for confirmations and short forms.

```jsx
<Dialog open={open} onClose={close} title="删除用户" size="sm"
  footer={<><Button variant="outline" onClick={close}>取消</Button><Button variant="destructive">确认删除</Button></>}>
  确定要删除用户「张伟」吗？此操作不可撤销。
</Dialog>
```

Closes on overlay click and Esc. Use `sm` for confirms, `md`/`lg` for forms. For long/multi-section forms prefer Drawer.
