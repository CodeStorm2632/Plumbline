**Card** — the panel surface for tables, forms, and stat blocks.

```jsx
<Card>
  <CardHeader title="用户列表" description="共 128 条" actions={<Button size="sm">新增</Button>} />
  <CardBody>…</CardBody>
  <CardFooter><Button variant="outline">取消</Button><Button>保存</Button></CardFooter>
</Card>
```

Flat, 6px radius, hairline border + soft shadow. Footer is muted and right-aligned for actions.
