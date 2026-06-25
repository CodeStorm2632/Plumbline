#!/usr/bin/env bash
# render.sh — render a Markdown PRD to html / docx / pdf
# Source of truth stays .md; this produces deliverables on demand.
#
# Usage:
#   bash render.sh <prd.md> [html|docx|pdf|all]   # default: all
#
# Output files land next to the input (same basename).
#
# Deps: pandoc (html, docx). PDF = md->docx (pandoc) -> pdf (LibreOffice),
# which is CJK-safe. LibreOffice is found via `soffice`/`libreoffice` on
# PATH, or the public docx skill's soffice.py wrapper if present.

set -euo pipefail

SRC="${1:?usage: render.sh <prd.md> [html|docx|pdf|all]}"
TARGET="${2:-all}"
[ -f "$SRC" ] || { echo "not found: $SRC" >&2; exit 1; }

DIR="$(cd "$(dirname "$SRC")" && pwd)"
BASE="$(basename "${SRC%.*}")"
OUT="$DIR/$BASE"
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# locate a CSS file (next to script, or ../assets), else write a fallback
CSS=""
for c in "$SELF_DIR/prd.css" "$SELF_DIR/../assets/prd.css"; do
  [ -f "$c" ] && CSS="$c" && break
done
if [ -z "$CSS" ]; then
  CSS="$(mktemp /tmp/prd-XXXX.css)"
  cat > "$CSS" <<'CSSEOF'
body{font-family:"Segoe UI","Microsoft YaHei","PingFang SC",DengXian,sans-serif;
  max-width:860px;margin:2.5rem auto;padding:0 1.5rem;line-height:1.7;color:#222}
h1{color:#1F3864;border-bottom:2px solid #2E5496;padding-bottom:.3rem;margin-top:2rem}
h2{color:#2E5496;margin-top:1.6rem}h3{color:#333}
table{border-collapse:collapse;width:100%;margin:1rem 0}
th,td{border:1px solid #bbb;padding:.45rem .7rem;text-align:left;vertical-align:top}
th{background:#1F3864;color:#fff}tr:nth-child(even) td{background:#EDF2F9}
code,pre{background:#F2F4F7;border-radius:4px}
pre{padding:.8rem 1rem;overflow:auto}code{padding:.1rem .3rem}
blockquote{border-left:3px solid #2E5496;margin:0;padding-left:1rem;color:#555}
CSSEOF
fi

find_soffice() {
  if command -v soffice >/dev/null 2>&1; then echo "soffice"; return; fi
  if command -v libreoffice >/dev/null 2>&1; then echo "libreoffice"; return; fi
  if [ -f /mnt/skills/public/docx/scripts/office/soffice.py ]; then
    echo "python /mnt/skills/public/docx/scripts/office/soffice.py"; return; fi
  echo ""; 
}

render_html() {
  pandoc "$SRC" -f gfm -t html -s --embed-resources --css "$CSS" \
    --metadata title="$BASE" -o "$OUT.html"
  echo "→ $OUT.html"
}
render_docx() {
  local ref=""
  for r in "$SELF_DIR/reference.docx" "$SELF_DIR/../assets/reference.docx"; do
    [ -f "$r" ] && ref="--reference-doc=$r" && break
  done
  pandoc "$SRC" -f gfm -t docx $ref -o "$OUT.docx"
  echo "→ $OUT.docx"
}
render_pdf() {
  [ -f "$OUT.docx" ] || render_docx
  local so; so="$(find_soffice)"
  [ -n "$so" ] || { echo "LibreOffice not found; cannot make PDF (html/docx still produced)" >&2; return 1; }
  ( cd "$DIR" && $so --headless --convert-to pdf "$OUT.docx" >/dev/null 2>&1 )
  echo "→ $OUT.pdf"
}

case "$TARGET" in
  html) render_html ;;
  docx) render_docx ;;
  pdf)  render_pdf ;;
  all)  render_html; render_docx; render_pdf ;;
  *) echo "unknown target: $TARGET (use html|docx|pdf|all)" >&2; exit 1 ;;
esac
