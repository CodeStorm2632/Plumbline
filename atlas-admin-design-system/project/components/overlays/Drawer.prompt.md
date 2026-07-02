**Drawer** — side sheet for multi-field create/edit forms (more room than a Dialog).

```jsx
<Drawer open={open} onClose={close} title="新增用户" description="填写基础信息与角色"
  footer={<><Button variant="outline" onClick={close}>取消</Button><Button>保存</Button></>}>
  <FormField label="用户名" required><Input/></FormField>
  …
</Drawer>
```

`side` right (default) / left; `size` sm/md/lg. Use Dialog for short confirms, Drawer for full forms.
