#!/usr/bin/env bash
# render_prd.sh — render a Markdown PRD (source of truth) to html / docx / pdf.
# The .md stays the single source of truth; this only produces deliverables.
#
# Usage:
#   bash render_prd.sh <PRD.md> [html|docx|pdf|all]   # default: all
#
# Outputs land next to the input (same basename). Frontmatter is rendered as a
# small metadata block. CJK-safe: pdf = md->docx (pandoc) -> pdf (LibreOffice).
#
# Deps: pandoc (html, docx). pdf additionally needs LibreOffice, found via
# `soffice`/`libreoffice` on PATH or the public docx skill's soffice.py wrapper.
#
# For a premium docx (cover page, auto TOC, zebra tables), use scripts/docx_builder.js
# instead — but drive it from the SAME markdown content, do not fork a second source.

set -euo pipefail

SRC="${1:?usage: render_prd.sh <PRD.md> [html|docx|pdf|all]}"
TARGET="${2:-all}"
[ -f "$SRC" ] || { echo "not found: $SRC" >&2; exit 1; }

DIR="$(cd "$(dirname "$SRC")" && pwd)"
BASE="$(basename "${SRC%.*}")"
OUT="$DIR/$BASE"
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

command -v pandoc >/dev/null 2>&1 || { echo "pandoc not found — install pandoc to render" >&2; exit 1; }

# locate CSS (next to script, or ../assets), else write a fallback
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
CSSEOF
fi

find_soffice() {
  if command -v soffice >/dev/null 2>&1; then echo "soffice"; return; fi
  if command -v libreoffice >/dev/null 2>&1; then echo "libreoffice"; return; fi
  for p in /mnt/skills/public/docx/scripts/office/soffice.py; do
    [ -f "$p" ] && { echo "python3 $p"; return; }
  done
  echo ""
}

render_html() {
  pandoc "$SRC" -f markdown -t html5 --standalone --toc --metadata title="$BASE" \
    -c "$CSS" --embed-resources -o "$OUT.html"
  echo "  ✓ $OUT.html"
}
render_docx() {
  pandoc "$SRC" -f markdown -t docx --toc -o "$OUT.docx"
  echo "  ✓ $OUT.docx"
}
render_pdf() {
  # md -> docx (pandoc) -> pdf (LibreOffice) is the CJK-safe path.
  pandoc "$SRC" -f markdown -t docx --toc -o "$OUT.docx"
  local SOFFICE; SOFFICE="$(find_soffice)"
  if [ -z "$SOFFICE" ]; then
    echo "  ! LibreOffice not found; produced $OUT.docx only (open in Word to export pdf)" >&2
    return
  fi
  $SOFFICE --headless --convert-to pdf --outdir "$DIR" "$OUT.docx" >/dev/null 2>&1 || true
  [ -f "$OUT.pdf" ] && echo "  ✓ $OUT.pdf" || echo "  ! pdf conversion failed; have $OUT.docx" >&2
}

echo "rendering $SRC → $TARGET"
case "$TARGET" in
  html) render_html ;;
  docx) render_docx ;;
  pdf)  render_pdf ;;
  all)  render_html; render_docx; render_pdf ;;
  *) echo "unknown target: $TARGET (use html|docx|pdf|all)" >&2; exit 2 ;;
esac
echo "done. Source of truth remains: $SRC"
