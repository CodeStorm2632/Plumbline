# 切片解剖 · 顺序 · 三门禁

## 一条垂直切片由哪些文件构成

```
SC-x 设计说明 + [FR-*]  ──┐
                          ├─ backend/app/models/      SQLModel 表模型(+ audit 表)
                          ├─ backend/app/schemas/     Pydantic 请求/响应(与表模型分离)
                          ├─ backend/migrations/      Alembic 版本化迁移
                          ├─ backend/app/services/    业务编排(读: select; 写: 写→审计→重算)
                          ├─ backend/app/api/routes/  路由(operation_id + x-trace + require_roles)
                          ├─ backend/app/core/        会话 + 认证(SM2-JWT/Redis seam) + 配置加载
                          ├─ openapi/openapi.json     FastAPI 导出的契约(orval 输入)
                          ├─ frontend/src/lib/api/     http mutator + 生成类型
                          ├─ frontend/src/features/x/  TanStack Query hooks + 页面(Shadcn) + Zod
                          └─ backend/tests/           pytest(TestClient + SQLite)
```

读类切片与写类切片的差异(决定服务层范式):

| | 读切片(样板见 worked-example) | 写切片(样板见 worked-example) |
|--|--------------------------|--------------------------|
| 服务 | `select` 聚合、排序、分页 | **写库 → 写审计(NFR-4)→ 触发重算 → 返回最新** |
| 校验 | 查询参数 | 必填理由、互斥、幂等(最后一次为准) |
| 前端 | `useQuery` | `useMutation` + 成功后 `invalidateQueries` |
| 测试 | 排序/筛选/空态 | 重算正确、留痕、422 必填、角色守卫 |

## 切片顺序建议(按依赖)

1. 领域纯模块(若有,如评分引擎)+ golden 测试——钉死输入/输出契约。
2. 读切片(评价/榜单):跑通"算→落→读"。
3. 写切片(复核台写操作):写→审计→重算。
4. 配置切片(标准配置工作台):产出领域配置(喂给纯模块)。
5. 校验切片(回测):对历史样本批量回放纯模块。

## 三门禁清单(每条切片必过)

**门禁 1 · 规格评审**
- [ ] 接口契约与 SC 数据绑定一致;`x-trace` 覆盖对应 `[FR-*]`(用 check_xtrace.py 校验)
- [ ] SQLModel 表模型与 API schema 分离(路由不返回表模型)
- [ ] 领域计算结果形态 = 纯模块契约(前后端同形)
- [ ] (写)必填理由、质检/互斥语义、幂等(最后一次为准)符合 SC §7/§8

**门禁 2 · 安全 CRITICAL 清零**
- [ ] 认证 = SM2-JWT 验签(tongsuopy)+ Redis token 白名单;每接口 `require_roles`
- [ ] 敏感字段密级管控/脱敏(NFR-3);查询无手拼 SQL
- [ ] (写)审计只增不改;敏感 payload 按密级处理
- [ ] 无注入/越权;错误不泄露内部细节

**门禁 3 · 部署**
- [ ] `alembic upgrade head` 在目标库可执行、可回滚;**未用 create_all**
- [ ] Traefik 路由 + HTTPS;环境变量(DATABASE_URL/REDIS_URL)注入;`/health` 就绪
- [ ] Sentry(可选);重算等重负载评估异步/队列
