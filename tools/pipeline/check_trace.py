#!/usr/bin/env python3
"""
check_trace.py — verify every [FR-*]/[NFR-*] referenced in UI design specs
exists in the source PRD. OQ refs are allowed (open questions are inherited).

Usage:
    python check_trace.py <prd.md> <spec1.md> [spec2.md ...]

Exit code 0 if all references resolve; 1 if any spec references an ID absent
from the PRD (a "dangling" reference).
"""

import glob
import os
import re
import sys

ID_RE = re.compile(r"\[(?:FR|NFR|OQ)-[0-9.]+\]")
FRNFR_RE = re.compile(r"\[(?:FR|NFR)-[0-9.]+\]")


def ids(path):
    with open(path, encoding="utf-8") as f:
        return set(ID_RE.findall(f.read()))


def main(argv):
    if len(argv) < 3:
        print("usage: check_trace.py <prd.md> <spec1.md> [spec2.md ...]")
        return 2
    prd_path, specs = argv[1], argv[2:]
    # 合法 ID 全集 = 与给定 PRD 同目录的所有 PRD-*.md 并集（支持多 PRD 共仓）。
    prd_dir = os.path.dirname(prd_path) or "."
    prd_files = sorted(glob.glob(os.path.join(prd_dir, "PRD-*.md"))) or [prd_path]
    prd_ids = set()
    for p in prd_files:
        prd_ids |= ids(p)

    ok = True
    for s in specs:
        refs = {i for i in ids(s) if FRNFR_RE.fullmatch(i)}  # only FR/NFR must exist
        missing = sorted(refs - prd_ids)
        tag = "OK " if not missing else "FAIL"
        print(f"[{tag}] {s}  引用 {len(refs)} 个 FR/NFR", end="")
        if missing:
            ok = False
            print(f"  → PRD 中缺失: {', '.join(missing)}")
        else:
            print("  → 全部可追溯")
    print("---")
    print("PASS ✓ 所有引用均可追溯到 PRD" if ok else "FAIL ✗ 存在悬空引用,请修正")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
