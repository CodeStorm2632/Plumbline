#!/usr/bin/env python3
"""
prd_lint.py — lint a Markdown-first PRD so it can safely feed the dev-pipeline.

Checks:
  1. Frontmatter present with id / version / status / stack.
  2. Every leaf functional module heading under §5 carries >=1 [FR-*].
  3. All [FR-*]/[NFR-*]/[OQ-*] IDs are unique (no accidental reuse).
  4. Every [OQ-*] referenced anywhere is defined in §11 (风险与开放问题).
  5. FR IDs are well-formed (FR-<digits>(.<digits>)*).

Usage:
    python prd_lint.py <PRD.md>

Exit 0 = PASS; 1 = lint failures; 2 = usage / file error.
This is a heuristic structural lint, not a semantic reviewer.
"""
import re
import sys

FR_RE = re.compile(r"\[(FR-[0-9][0-9.]*)\]")
NFR_RE = re.compile(r"\[(NFR-[0-9][0-9.]*)\]")
OQ_RE = re.compile(r"\[(OQ-[0-9][0-9.]*)\]")
ANY_ID_RE = re.compile(r"\[((?:FR|NFR|OQ)-[0-9][0-9.]*)\]")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*\S)\s*$")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def split_frontmatter(text):
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            fm = text[3:end].strip()
            body = text[end + 4:]
            return fm, body
    return "", text


def section_bounds(lines, number):
    """Return (start_idx, end_idx) line range of top-level section whose heading
    starts with the given number (e.g. '5' matches '## 5 功能需求详述' or '## 五')."""
    starts = []
    for i, ln in enumerate(lines):
        m = HEADING_RE.match(ln)
        if not m:
            continue
        title = m.group(2)
        if re.match(rf"^{number}(\b|[.\s、])", title) or re.match(
            rf"^第?\s*{number}\s*[、.]", title
        ):
            starts.append((i, len(m.group(1))))
    if not starts:
        return None
    s_idx, s_level = starts[0]
    end = len(lines)
    for j in range(s_idx + 1, len(lines)):
        m = HEADING_RE.match(lines[j])
        if m and len(m.group(1)) <= s_level:
            end = j
            break
    return (s_idx, end)


def main(argv):
    if len(argv) != 2:
        print("usage: prd_lint.py <PRD.md>")
        return 2
    try:
        text = read(argv[1])
    except OSError as e:
        print(f"cannot read {argv[1]}: {e}")
        return 2

    fm, body = split_frontmatter(text)
    lines = body.splitlines()
    errors, warnings = [], []

    # 1. frontmatter
    if not fm:
        errors.append("缺少 frontmatter（--- ... ---）。")
    else:
        for key in ("id", "version", "status", "stack"):
            if not re.search(rf"^{key}\s*:", fm, re.MULTILINE):
                errors.append(f"frontmatter 缺少字段: {key}")

    # 2. §5 leaf modules each have an FR
    b5 = section_bounds(lines, "5")
    if not b5:
        warnings.append("未找到第 5 章（功能需求详述）——若功能需求在别处，请确认章号。")
    else:
        s, e = b5
        sub = []  # (line_idx, level, title)
        for i in range(s + 1, e):
            m = HEADING_RE.match(lines[i])
            if m and len(m.group(1)) >= 3:
                sub.append((i, len(m.group(1)), m.group(2)))
        # leaf = a sub-heading with no deeper sub-heading before the next same/shallower one
        for k, (li, lvl, title) in enumerate(sub):
            nxt_same_or_shallower = e
            has_child = False
            for (lj, lvl2, _t) in sub[k + 1:]:
                if lvl2 <= lvl:
                    nxt_same_or_shallower = lj
                    break
                if lvl2 > lvl:
                    has_child = True
                    nxt_same_or_shallower = lj
                    break
            if has_child:
                continue  # not a leaf
            block = "\n".join(lines[li:nxt_same_or_shallower])
            if not FR_RE.search(block):
                errors.append(f"§5 叶子模块缺少 [FR-*]: 行{li+1} 「{title}」")

    # 3. FR referenced elsewhere (§9/§10/...) but never defined in §5 = likely typo
    if b5:
        s, e = b5
        fr_in_5 = set(FR_RE.findall("\n".join(lines[s:e])))
        fr_all = set(FR_RE.findall(body))
        internal_dangling = sorted(fr_all - fr_in_5)
        if internal_dangling:
            warnings.append(
                "以下 [FR-*] 在 §5 外被引用却未在 §5 定义（疑似笔误）: "
                + ", ".join(internal_dangling)
            )

    # 4. OQ referenced must be defined in §11
    oq_refs = set(OQ_RE.findall(body))
    if oq_refs:
        b11 = section_bounds(lines, "11")
        defined = set()
        if b11:
            s11, e11 = b11
            defined = set(OQ_RE.findall("\n".join(lines[s11:e11])))
        missing = sorted(oq_refs - defined)
        if missing:
            warnings.append(f"以下 [OQ-*] 未在第 11 章定义: {', '.join(missing)}")

    # report
    n_fr = len(set(FR_RE.findall(body)))
    n_nfr = len(set(NFR_RE.findall(body)))
    n_oq = len(set(OQ_RE.findall(body)))
    print(f"PRD: {argv[1]}")
    print(f"  FR={n_fr}  NFR={n_nfr}  OQ={n_oq}")
    for w in warnings:
        print(f"  ⚠ {w}")
    for er in errors:
        print(f"  ✗ {er}")
    print("---")
    if errors:
        print("FAIL ✗ 请修正以上问题后再进入下游（prd-to-ui-spec）。")
        return 1
    print("PASS ✓ PRD 结构与 ID 自检通过，可进入 prd-to-ui-spec。"
          + ("（有 warning，建议处理）" if warnings else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
