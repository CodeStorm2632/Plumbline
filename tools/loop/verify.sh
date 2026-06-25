#!/usr/bin/env bash
# verify.sh —— 形式化"裁判"(verifier)：把"完成"定义成一条可确定判定的命令。
# done := 规格四关(strict) 全绿 + ID 锁无告警 + 后端 pytest 绿 + 前端 Vitest 绿。
# 输出：每项 ✅/❌ + 失败摘要（"观测清洗"，只喂可执行的差距，不灌原始噪声）。
# 退出：0 = 达成 done；非 0 = 未达成。供 Stop 钩子 / 外层循环 / CI 直接消费。
#
# 用法: tools/loop/verify.sh [--no-tests] [--no-strict]
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STRICT="--strict"; RUN_TESTS=1
for a in "$@"; do
  case "$a" in
    --no-tests) RUN_TESTS=0 ;;
    --no-strict) STRICT="" ;;
  esac
done

FAILS=()
run() { # $1=label  其余=命令
  local label="$1"; shift
  if "$@" >/tmp/verify.out 2>&1; then echo "✅ $label"
  else echo "❌ $label"; FAILS+=("$label"); tail -12 /tmp/verify.out | sed 's/^/      /'; fi
}

echo "── 裁判 verify ──"
run "规格四关${STRICT:+(strict)}" bash "$ROOT/tools/pipeline/pipeline_check.sh" "$ROOT" $STRICT
if ls "$ROOT"/specs/prd/PRD-*.md >/dev/null 2>&1 && [ -f "$ROOT/specs/requirements-lock.yaml" ]; then
  run "ID 锁" python3 "$ROOT/tools/pipeline/requirements_lock.py" check \
      $(ls "$ROOT"/specs/prd/PRD-*.md | head -1) --lock "$ROOT/specs/requirements-lock.yaml"
fi
if [ "$RUN_TESTS" = "1" ]; then
  if command -v uv >/dev/null 2>&1; then
    run "后端 pytest" bash -c "cd '$ROOT/backend' && uv run pytest -q"
  else echo "⏭ 后端 pytest（无 uv，跳过）"; fi
  if command -v pnpm >/dev/null 2>&1; then
    run "前端 Vitest" bash -c "cd '$ROOT/frontend' && pnpm test"
  else echo "⏭ 前端 Vitest（无 pnpm，跳过）"; fi
fi

echo "──────────────"
if [ ${#FAILS[@]} -eq 0 ]; then
  echo "DONE ✓ 达成完成定义"; exit 0
fi
echo "NOT-DONE ✗ 还差：${FAILS[*]}"; exit 1
