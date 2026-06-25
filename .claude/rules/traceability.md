# 追溯约定

- ID 在 `specs/prd/PRD-*.md` 定义：`[FR-<模块>.<序>]` / `[NFR-<序>]` / `[OQ-<序>]`，**只增不改、不重排**。
- 下游**只能引用**已有 ID：UI 说明 frontmatter `traces_to:[FR-*]`；接口 `openapi_extra={"x-trace":[FR-...]}`。
- 缺需求 → 回 PRD 追新 ID（`make gen-lock` 登记），再回下游引用。不在代码里"隐式新增需求"。
- 提交前 `make check`：四关查"悬空"(引用不存在的 ID) + "漏做"(FR 没有屏/接口)。
- 改 PRD 后 `make check-lock`：捕捉 ID 被删/回收/重编号。
