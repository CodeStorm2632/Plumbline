# Claude Code 配置说明（让生成的代码符合企业级规范）

把项目规范做成 Claude Code 能**自动加载并强制执行**的配置，分五层：技能(skills)、记忆(rules)、子代理(agents)、
命令(commands)、钩子(hooks)。前四层"引导"，钩子"强制"。

## 0. 技能 Skills（自动触发的方法论）

`.claude/skills/<name>/SKILL.md`（项目级、入库、Claude 按 description 自动加载，可捆绑脚本/references，
按需读取＝渐进披露，不占常驻上下文）。本仓内置四个：`prd-writer` / `prd-to-ui-spec` /
`spec-to-slice` / `dev-pipeline`（三棒流水线 + 编排）。`/skills` 列出，`/reload-skills` 热更新。

分工：**rules** 常驻规范（每轮都在）；**skills** 让 Claude 自动判断"该用哪套方法论"再加载，重在
"怎么做某类工作"+ 捆绑脚本；**commands** 你主动 `/slice` 触发；**agents** 隔离上下文的专才；**hooks** 强制拦截。

## 1. 记忆 / 规则（引导）

- `CLAUDE.md`：会话启动自动加载的项目记忆，列五条铁律 + 常用命令，并用 `@.claude/rules/*.md` 按需引入细则。
- `.claude/rules/*.md`：模块化规范——architecture / backend / frontend / security / traceability / testing / workflow。
  改规范只动这些文件，CLAUDE.md 保持精简。

## 2. 子代理（隔离上下文的专才）

`.claude/agents/*.md`（frontmatter 是**系统提示**，不是用户提示）：
- `slice-implementer`：按规范实现一个垂直切片（前后端+测试）。
- `code-reviewer` / `security-reviewer`：只读审查 diff，分别管通用规范与安全。
- `test-author`：补齐/修复测试到全绿。
用法：直接说"用 slice-implementer 实现 review 屏"，或在命令里委派。子代理在独立上下文跑，不污染主线。

## 3. 命令（封装常用流程）

`.claude/commands/*.md`，斜杠触发：
- `/slice <feature>` 走完整切片流程；`/new-slice <feature>` 建空骨架；
- `/check` 跑全部关卡+测试；`/security-review` 安全审查；`/trace [FR]` 看覆盖。

## 4. 钩子（强制执行，exit 2 阻断）

配置在 `.claude/settings.json` 的 `hooks`，脚本在 `.claude/hooks/`（纯 Python，读 stdin JSON）：

| 事件 | 脚本 | 作用 |
|------|------|------|
| PreToolUse·Bash | guard_bash.py | 拦危险命令：rm -rf 根/家目录、force push、`--no-verify`、pip(强制uv)、读/回显 .env 与国密密钥、curl\|sh、DROP/downgrade base |
| PreToolUse·Write/Edit | guard_edit.py | 拦改"生成物/不可改"：openapi.json、orval 生成目录、.env、已存在的迁移文件 |
| PostToolUse·Write/Edit | secret_scan.py | 扫硬编码密钥/口令（示例/测试/seed 豁免），命中即反馈返工 |
| PostToolUse·Write/Edit | format_lint.py | 自动 ruff format/check（.py）、tsc 类型检查（.ts/tsx）；工具缺失优雅跳过；lint 不过反馈让其自修 |
| **Stop** | **gate_on_stop.py** | **自纠正循环**：想收尾时先跑四道规格关卡，红则 exit 2 让其继续修，绿才放行（`stop_hook_active` 防死循环） |
| SessionStart | session_start.py | 把项目当前态（已有切片、需求覆盖、铁律提醒）注入上下文 |

> 钩子对**子代理的工具调用同样生效**，安全门是递归的，子代理绕不过去。

## "loop"（自纠正循环）怎么运转

这套配置形成一个闭环：写代码 → PostToolUse 即时格式化/查密钥/lint 反馈 → Claude 据反馈自修 →
想结束时 **Stop 钩子跑四关，不绿不让停** → 继续修直到绿。
配合 `code-reviewer`/`security-reviewer` 子代理在收尾前审 diff，质量在"完成"前就被兜住。

需要更强的循环（比如 Stop 时连 `make test-all` 一起跑），把 `gate_on_stop.py` 里的命令换成
`pipeline_check.sh + pytest + vitest` 即可——但注意会变慢，按团队节奏取舍。

## 个人覆盖

`.claude/settings.local.json`（已 gitignore）放个人偏好；`~/.claude/settings.json` 放全局。
团队共享的规范全部在已入库的 `.claude/`（settings.json、hooks、agents、commands、rules）+ `CLAUDE.md`。

## 验证

仓库内每个钩子都用样例 stdin 跑过：危险命令/改生成物/硬编码密钥正确阻断(exit 2)，
正常操作放行(exit 0)，Stop 在关卡绿时放行、`stop_hook_active` 时不死循环。
