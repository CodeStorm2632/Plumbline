#!/usr/bin/env bash
# auto_build.sh —— 外层自治循环（loop engineering 的"外层/Outer Loop"）。
# 给一个需求，反复用 `claude -p` 驱动 Claude Code 干活，每轮用"裁判"verify.sh 校验，
# 直到裁判全绿或触发边界。这是"设计一个 prompt 你的循环，而不是逐条 prompt"的落地。
#
# 用法:
#   tools/loop/auto_build.sh "把申报榜单做成可导出 CSV"
#   tools/loop/auto_build.sh --file specs/requests/req-123.md
#
# 有界自治（env 可调）：
#   MAX_ITERS=6        最大迭代数（硬上限）
#   MAX_TURNS=40       单次 claude -p 的最大动作数
#   MAX_BUDGET=5       单次预算上限（美元）
#   PERMISSION=acceptEdits   权限模式（CI 锁死可用 dontAsk + 扩 allow 名单）
#
# 人审闸口（硬约束，写进每轮提示）：不解决 [OQ-*]（遇到即停报告）、不改生成物、不部署。
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# —— 取需求 ——
if [ "${1:-}" = "--file" ]; then REQ="$(cat "${2:?need file}")"; else REQ="${1:?用法: auto_build.sh \"需求\" | --file <path>}"; fi

MAX_ITERS="${MAX_ITERS:-6}"; MAX_TURNS="${MAX_TURNS:-40}"; MAX_BUDGET="${MAX_BUDGET:-5}"
PERMISSION="${PERMISSION:-acceptEdits}"
command -v claude >/dev/null 2>&1 || { echo "需要安装 Claude Code CLI（npm i -g @anthropic-ai/claude-code）"; exit 3; }

mkdir -p .loop
LOG=".loop/run-$(date +%Y%m%d-%H%M%S).log"
GOAL="按 Plumbline 规范实现需求并让裁判（tools/loop/verify.sh）全绿。
铁律：遵守 CLAUDE.md 与 .claude/rules/*；垂直切片；不手改生成物（openapi.json / orval 目录）；
写操作走审计；接口带 x-trace；补 pytest+Vitest。
人审闸口：若需要新增 PRD 没有的需求只能追加 [FR-*] 不可改旧号；遇到 [OQ-*] 待决口径**立即停止并报告**，不要替人拍板；**绝不执行部署**。
需求：${REQ}"

prev_digest=""
echo "▶ auto_build 启动 | 迭代上限 $MAX_ITERS | 日志 $LOG"
for ((i=1; i<=MAX_ITERS; i++)); do
  echo "──────── 迭代 $i/$MAX_ITERS ────────" | tee -a "$LOG"

  # 1) 先看裁判当前态（每轮带"当前状态"而非只带原始目标 —— loop 关键原则）
  verdict="$(bash tools/loop/verify.sh 2>&1 || true)"
  if echo "$verdict" | grep -q '^DONE'; then
    echo "✓ 裁判已绿，于第 $i 轮达成。" | tee -a "$LOG"; exit 0
  fi

  # 2) 无进展熔断（连续两轮裁判反馈完全相同 → 停，交人工）
  digest="$(printf '%s' "$verdict" | sha1sum | cut -d' ' -f1)"
  if [ "$i" -gt 1 ] && [ "$digest" = "$prev_digest" ]; then
    echo "✗ 连续两轮无进展，熔断退出，请人工接手（见 $LOG）。" | tee -a "$LOG"; exit 4
  fi
  prev_digest="$digest"

  # 3) 状态承载的提示 → 驱动一轮工作
  PROMPT="${GOAL}

当前裁判反馈（请逐条消除，只做让裁判转绿所需的最小改动）：
${verdict}

完成本轮改动后停手；外层会再次运行裁判。若遇到 [OQ-*] 待决或需要部署，立即停止并说明原因。"

  claude -p "$PROMPT" \
    --permission-mode "$PERMISSION" \
    --max-turns "$MAX_TURNS" \
    ${MAX_BUDGET:+--max-budget-usd "$MAX_BUDGET"} \
    --output-format stream-json --verbose 2>&1 | tee -a "$LOG" || true
done

# 末轮兜底判定
if bash tools/loop/verify.sh >/dev/null 2>&1; then
  echo "✓ 末轮裁判达成。"; exit 0
fi
echo "✗ 达到最大迭代 $MAX_ITERS 仍未全绿，请人工接手（见 $LOG）。" | tee -a "$LOG"
exit 5
