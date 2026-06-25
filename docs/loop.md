# Loop Engineering 在 Plumbline 的落地（提需求→自动执行）

2026 年那波讨论把要点说透了：从 prompt → context → harness → **loop** 一路演进，核心是
「**别再逐条 prompt agent，去设计那个替你 prompt agent 的循环**」。而一个循环可靠与否，
几乎只取决于**反馈的保真度**——「没有高保真反馈的循环只是昂贵的幻觉」。

## 为什么 Plumbline 是好底座

一个能跑一小时不失控的循环需要四样，Plumbline 都已具备：

| 循环要素 | Plumbline 对应 |
|----------|----------------|
| **可验证的终止条件**（而非"代码看起来不错"） | `tools/loop/verify.sh`：规格四关(strict)+ID锁+pytest+Vitest 全绿 = `DONE` |
| **触达真实环境的工具** | 文件/终端/uv·pnpm/测试器/类型检查/git + 三棒 skills |
| **高保真反馈（裁判=燃料）** | 四道关卡确定性、可执行、给"还差什么"的可消除摘要 |
| **上下文管理 + 护栏** | hooks 强制、settings 权限、`[OQ-*]`/部署人审闸口 |

## 两层循环

- **内层（一个会话内）**：`/auto <需求>` 或 `orchestrator` 子代理 observe→act→verify 自纠正；
  `Stop` 钩子 `gate_on_stop.py` 不绿不让收尾。适合**交互式**让 Claude 一口气做完。
- **外层（跨会话的无头 harness）**：`tools/loop/auto_build.sh` 反复 `claude -p`，每轮把**当前裁判反馈**
  作为状态注入（不是只重复原始目标），直到 `verify.sh` 绿或触发边界。适合 **CI/无人值守**。

## 有界自治（把自治"框住"，不是放飞）

`auto_build.sh` 内置全部公认护栏：
- **硬迭代上限** `MAX_ITERS`（默认 6）；**预算上限** `MAX_BUDGET`（`--max-budget-usd`）；
  **单轮动作上限** `MAX_TURNS`（`--max-turns`）。
- **无进展熔断**：连续两轮裁判反馈完全相同 → 停，交人工。
- **人审闸口（不可逾越）**：遇 `[OQ-*]` 待决口径立即停报；不手改生成物；**绝不部署**。
- 终止只认裁判 `DONE`，不认 agent 自我感觉。

## 用法

```bash
# 交互（推荐先用这个观察）：在 Claude Code 里
/auto 把申报榜单做成可导出 CSV

# 无头（本地/CI 无人值守）：
make auto REQ="把申报榜单做成可导出 CSV"
#   等价 bash tools/loop/auto_build.sh "...";  可调 MAX_ITERS/MAX_TURNS/MAX_BUDGET/PERMISSION

# 只看裁判当前态：
make verify
```

CI：`auto-build.yml`（手动/issue 触发）在分支上跑外层循环，**只开 PR、不合并、不部署**；
合并仍需人工 + code/security review，上线仍走 `cd.yml` 的环境审批门。需要 `ANTHROPIC_API_KEY` secret。

## 边界（诚实地说）

循环擅长把"机械上能判定对错"的事做到绿；**判断仍归人**：需求是否抓对、`[OQ-*]` 口径、
安全签发、生产上线。Plumbline 的做法是把这些做成**硬停点**，让自治在"可验证"的地盘里跑满，
在"需判断"的边界上停手。裁判越强，能安全自治的范围越大——所以持续把 verify.sh 做厚
（更多测试、契约校验、e2e）就是在扩大自动化的边界。
