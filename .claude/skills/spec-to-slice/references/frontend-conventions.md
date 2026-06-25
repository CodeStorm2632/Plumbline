# 前端约定（React19 + TanStack + Shadcn + orval）

## 1 契约由 orval 生成

- `orval.config.ts` 从 `../openapi/openapi.json` 生成类型 + TanStack Query hooks(client: react-query)+ 可选 Zod(client: zod)。
- mutator 指向 `src/lib/api/http.ts`(注入 baseURL 与认证头)。生成前可用手写 hooks 过渡,生成后替换。

## 2 http mutator

- 统一 `http<T>({url,method,params,data,signal})`:拼 query、注入 `Authorization`(生产 SM2-JWT;演示 `localStorage.token`)、非 2xx 抛错。

## 3 TanStack Query

- 读:`useQuery({queryKey:[...含筛选维度], queryFn})`,`staleTime` 适当;切换维度即失效重拉。
- 写:`useMutation`,**`onSuccess` 失效相关 query**(该实体明细 + 列表 + 审计),让重算结果自动回流。
- query key 约定:`["rankings", domain, version]`、`["evaluation", id]`、`["audit", id]`。

## 4 组件:Shadcn + TanStack Table

- 数据表/榜单用 `Table` + TanStack Table(排序/筛选/虚拟滚动);表单用 `Form` + react-hook-form + Zod;弹层 `Dialog`/`Sheet`;徽标 `Badge`;警示 `Alert`;留痕 `ScrollArea`;反馈 `Toaster`;加载 `Skeleton`。

## 5 状态必须齐全（落 SC §5）

每个数据界面覆盖:加载中(`Skeleton`)/ 错误(`Alert`+重试)/ 空(空态+引导)/ 无权限(隐藏写操作)/ 数据缺失或未确认(禁用下游)/ 业务否决态(destructive 降级)/ 成功(`Toaster`)。

## 6 校验:Zod 镜像后端

- 表单与 API 响应用 Zod 校验,字段与后端 Pydantic schema 对齐;可由 orval 生成 `.zod.ts` 替换手写。
- 写操作的必填项(如理由)前端 Zod 先校验,后端再校验(双保险)。

## 7 路由:TanStack Router

- `createFileRoute("/path")`;带参 `/review/$applicantId`,跳转用 `<Link to params>`。

> 完整实例化前端见 `references/worked-example.md`(hooks:useRankings 读 / useQcClaim 写并失效;页面 ReviewPage 覆盖 SC §5 七态)。外部 `eval-slice-*/frontend` 若存在可额外对照(非必需)。
