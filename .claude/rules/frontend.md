# 前端约定（React19 + TanStack）

- **请求统一走 `lib/api/http.ts`**（注入 Bearer、非 2xx 抛错、401 清 token）。
- **类型/hooks 由 orval 从 `specs/contract/openapi.json` 生成**到 `lib/api/generated/`，
  **绝不手改生成目录**；契约变了就 `make openapi` 后 `pnpm orval`。
- **页面必须覆盖七态**（对应 SC §5）：加载 / 错误(可重试) / 空 / 无权限(隐藏写操作) /
  缺失或未确认(标记+禁用) / 否决(降级展示) / 成功(反馈)。缺态视为未完成。
- **服务端状态用 TanStack Query**：读 `useQuery`，写 `useMutation` 且 `onSuccess` 失效相关 query。
  本地 UI 状态才用 `useState`。
- **校验用 Zod**；表格用 TanStack Table；组件优先 Shadcn/UI。
- **每个切片配 Vitest**（http 行为 + 关键状态）：见 @.claude/rules/testing.md。
