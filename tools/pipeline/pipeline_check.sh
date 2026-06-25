#!/usr/bin/env bash
# pipeline_check.sh — run all four SDD gates over a project in one shot.
#
#   ①→②  prd_lint.py        (prd-writer)      frontmatter / §5 每叶子有 FR / 无内部悬空
#   ②→③  check_trace.py     (prd-to-ui-spec)  SC 引用的 FR/NFR 都在 PRD
#   ③验收 check_xtrace.py    (spec-to-slice)   接口 x-trace 都在 PRD
#   全链  coverage.py        (dev-pipeline)    每条 FR 是否落到屏/接口（查漏做）
#
# 只跑「当前已存在产物」对应的关卡：没出 SC 就跳过 ②，没出 openapi 就跳过 ③。
# 任一已运行的关卡失败 → 整体失败（exit 1）。
#
# Usage:
#   bash pipeline_check.sh <project_dir> [--skills-dir DIR] [--strict]
#
# 路径约定（canonical 布局）：
#   <project>/prd/PRD-*.md  ui-spec/SC-*.md  openapi/openapi.json
#
# 找各棒脚本的顺序：--skills-dir > $SKILLS_DIR > 本脚本所在的 dev-pipeline 的同级目录。

set -uo pipefail

PROJECT="${1:?usage: pipeline_check.sh <project_dir> [--skills-dir DIR] [--strict]}"
shift || true
SKILLS_DIR="${SKILLS_DIR:-}"
STRICT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --skills-dir) SKILLS_DIR="$2"; shift 2 ;;
    --strict) STRICT="--strict"; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -d "$PROJECT" ] || { echo "project dir not found: $PROJECT" >&2; exit 2; }

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# dev-pipeline/ 的父目录通常就是 skills 根（prd-writer/ 等是它的同级）
[ -z "$SKILLS_DIR" ] && SKILLS_DIR="$(cd "$SELF_DIR/../.." && pwd)"

# 解析某棒的脚本路径：先按 skills-dir/<skill>/scripts/<name>，找不到再全局 find 一次。
resolve() { # $1=skill $2=script
  # 1) colocated：扁平仓库里六个脚本同目录（tools/dev-pipeline/scripts/）
  [ -f "$SELF_DIR/$2" ] && { echo "$SELF_DIR/$2"; return; }
  # 2) sibling skill 布局：<skills>/<skill>/scripts/<script>
  local p="$SKILLS_DIR/$1/scripts/$2"
  [ -f "$p" ] && { echo "$p"; return; }
  # 3) 兜底全局查找
  p="$(find "$SKILLS_DIR" -path "*/scripts/$2" 2>/dev/null | head -1)"
  echo "$p"
}
PRD_LINT="$(resolve prd-writer prd_lint.py)"
CHECK_TRACE="$(resolve prd-to-ui-spec check_trace.py)"
CHECK_XTRACE="$(resolve spec-to-slice check_xtrace.py)"
COVERAGE="$SELF_DIR/coverage.py"

# 定位产物（同时支持 specs/ 分组布局与根级扁平布局，自动择优）
# 多 PRD：收齐全部 PRD-*.md（prd_lint/coverage 逐份跑，trace/xtrace 取并集）。
PRD_DIR="$PROJECT/specs/prd"; [ -d "$PRD_DIR" ] || PRD_DIR="$PROJECT/prd"
PRDS=(); while IFS= read -r f; do PRDS+=("$f"); done < <(ls "$PRD_DIR"/PRD-*.md 2>/dev/null | sort)
PRD="${PRDS[0]:-}"
SPEC_DIR="$PROJECT/specs/ui"; [ -d "$SPEC_DIR" ] || SPEC_DIR="$PROJECT/ui-spec"
SPECS=$(ls "$SPEC_DIR"/SC-*.md 2>/dev/null)
OPENAPI="$PROJECT/specs/contract/openapi.json"; [ -f "$OPENAPI" ] || OPENAPI="$PROJECT/openapi/openapi.json"

[ -n "$PRD" ] || { echo "✗ 未找到 $PRD_DIR/PRD-*.md" >&2; exit 2; }

bar() { printf '─%.0s' {1..52}; echo; }
PASS=0; FAIL=0; SKIP=0
run_gate() { # $1=label $2..=command
  local label="$1"; shift
  echo; bar; echo "▶ $label"; bar
  if [ ! -x "$1" ] && ! command -v "$1" >/dev/null 2>&1; then :; fi
  "$@"
  local rc=$?
  if [ $rc -eq 0 ]; then echo "  ✅ PASS: $label"; PASS=$((PASS+1));
  else echo "  ❌ FAIL: $label (rc=$rc)"; FAIL=$((FAIL+1)); fi
  return $rc
}

echo "项目: $PROJECT"
echo "PRD : ${PRDS[*]}"
echo "技能脚本根: $SKILLS_DIR"

# ① prd_lint（逐份 PRD）
if [ -n "$PRD_LINT" ]; then
  for prd in "${PRDS[@]}"; do
    run_gate "①→② prd_lint $(basename "$prd")" python3 "$PRD_LINT" "$prd"
  done
else echo; echo "⚠ 跳过 ①：未找到 prd-writer/scripts/prd_lint.py"; SKIP=$((SKIP+1)); fi

# ② check_trace（有 SC 才跑；check_trace 内部对同目录 PRD-*.md 取并集）
if [ -n "$SPECS" ]; then
  if [ -n "$CHECK_TRACE" ]; then
    # shellcheck disable=SC2086
    run_gate "②→③ check_trace" python3 "$CHECK_TRACE" "$PRD" $SPECS
  else echo; echo "⚠ 跳过 ②：未找到 prd-to-ui-spec/scripts/check_trace.py"; SKIP=$((SKIP+1)); fi
else echo; echo "⏭ 跳过 ②：$SPEC_DIR 下暂无 SC-*.md（还没出屏）"; SKIP=$((SKIP+1)); fi

# ③ check_xtrace（有 openapi 才跑；传入全部 PRD 取并集合法 ID）
if [ -f "$OPENAPI" ]; then
  if [ -n "$CHECK_XTRACE" ]; then
    run_gate "③验收 check_xtrace" python3 "$CHECK_XTRACE" "$OPENAPI" "${PRDS[@]}"
  else echo; echo "⚠ 跳过 ③：未找到 spec-to-slice/scripts/check_xtrace.py"; SKIP=$((SKIP+1)); fi
else echo; echo "⏭ 跳过 ③：$OPENAPI 不存在（还没切片导出契约）"; SKIP=$((SKIP+1)); fi

# 全链 coverage（逐份 PRD，各报各的 FR；传入已有的 specs/openapi）
for prd in "${PRDS[@]}"; do
  COV_ARGS=("$prd")
  [ -n "$SPECS" ] && COV_ARGS+=(--specs "$SPEC_DIR")
  [ -f "$OPENAPI" ] && COV_ARGS+=(--openapi "$OPENAPI")
  [ -n "$STRICT" ] && COV_ARGS+=("$STRICT")
  run_gate "全链 coverage $(basename "$prd")" python3 "$COVERAGE" "${COV_ARGS[@]}"
done

echo; bar
echo "汇总: ✅$PASS  ❌$FAIL  ⏭/⚠$SKIP"
if [ $FAIL -gt 0 ]; then echo "PIPELINE FAIL ✗"; exit 1; fi
echo "PIPELINE OK ✓（已运行的关卡全部通过）"
