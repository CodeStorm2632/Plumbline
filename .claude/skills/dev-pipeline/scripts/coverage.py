#!/usr/bin/env python3
"""
coverage.py — requirement coverage across the whole SDD pipeline.

The per-stage checks (prd_lint / check_trace / check_xtrace) only catch
*dangling* references (an ID used downstream that doesn't exist upstream).
They cannot catch the opposite, more dangerous gap: a requirement that was
written but never designed into a screen or implemented as an endpoint.

This script reports, for every [FR-*] defined in the PRD:
    ✅  covered by >=1 screen AND >=1 endpoint
    🟠  has a screen but no endpoint yet (designed, not yet sliced)
    🔴  no screen at all (requirement未设计 — the real leak)
    ⚠   endpoint exists but no screen traces it (接口无对应屏设计)

NFRs are cross-cutting; reported separately, never gate.

Usage:
    python coverage.py <PRD.md> [--specs DIR|GLOB] [--openapi openapi.json] [--strict]

--strict  → exit 1 if any FR is 🔴 (use as an "approved" gate).
Exit: 0 ok / 1 strict failure / 2 usage.
"""
import argparse
import glob
import json
import os
import re
import sys

FR_RE = re.compile(r"\b(FR-[0-9]+(?:\.[0-9]+)*)")
NFR_RE = re.compile(r"\b(NFR-[0-9]+(?:\.[0-9]+)*)")
ID_RE = re.compile(r"\b((?:FR|NFR)-[0-9]+(?:\.[0-9]+)*)")
BRACKET_FR_RE = re.compile(r"\[(FR-[0-9]+(?:\.[0-9]+)*)\]")
BRACKET_NFR_RE = re.compile(r"\[(NFR-[0-9]+(?:\.[0-9]+)*)\]")
SCREEN_RE = re.compile(r"^\s*screen\s*:\s*(.+?)\s*$", re.MULTILINE)
SCREEN_ID_RE = re.compile(r"^\s*id\s*:\s*(.+?)\s*$", re.MULTILINE)


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def prd_universe(prd_path):
    # Defined requirements are always written bracketed, e.g. [FR-5.1.3].
    # Shorthand like "FR-5.1.x" in summaries is intentionally NOT counted.
    text = read(prd_path)
    return set(BRACKET_FR_RE.findall(text)), set(BRACKET_NFR_RE.findall(text))


def collect_specs(spec_arg):
    if not spec_arg:
        return []
    if os.path.isdir(spec_arg):
        return sorted(glob.glob(os.path.join(spec_arg, "**", "*.md"), recursive=True))
    return sorted(glob.glob(spec_arg))


def spec_label(text, path):
    m = SCREEN_RE.search(text)
    if m:
        return m.group(1).strip()
    m = SCREEN_ID_RE.search(text)
    if m:
        return m.group(1).strip()
    return os.path.basename(path)


def openapi_map(path):
    """fr/nfr id -> list of 'METHOD /path'"""
    spec = json.load(open(path, encoding="utf-8"))
    out = {}
    for p, ops in spec.get("paths", {}).items():
        for method, op in ops.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            for tid in op.get("x-trace", []) or []:
                if ID_RE.fullmatch(tid):
                    out.setdefault(tid, []).append(f"{method.upper()} {p}")
    return out


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("prd")
    ap.add_argument("--specs", default=None, help="目录或 glob，逐屏 SC-*.md")
    ap.add_argument("--openapi", default=None, help="openapi.json 路径")
    ap.add_argument("--strict", action="store_true", help="存在 🔴 时退出码 1")
    args = ap.parse_args(argv[1:])

    try:
        fr_all, nfr_all = prd_universe(args.prd)
    except OSError as e:
        print(f"cannot read PRD: {e}")
        return 2

    # screens: fr -> set(labels)
    fr_screens, nfr_screens = {}, {}
    spec_files = collect_specs(args.specs)
    for s in spec_files:
        t = read(s)
        lbl = spec_label(t, s)
        for fid in set(FR_RE.findall(t)):
            fr_screens.setdefault(fid, set()).add(lbl)
        for nid in set(NFR_RE.findall(t)):
            nfr_screens.setdefault(nid, set()).add(lbl)

    # endpoints: fr -> [ops]
    fr_eps, nfr_eps = {}, {}
    if args.openapi:
        try:
            m = openapi_map(args.openapi)
        except OSError as e:
            print(f"cannot read openapi: {e}")
            return 2
        for k, v in m.items():
            (nfr_eps if k.startswith("NFR") else fr_eps)[k] = v

    # classify FRs
    rows = []
    counts = {"✅": 0, "🟠": 0, "🔴": 0, "⚠": 0}
    def _key(x):
        return [int(n) for n in x[3:].split(".") if n.isdigit()]
    for fid in sorted(fr_all, key=_key):
        has_screen = fid in fr_screens
        has_ep = fid in fr_eps
        if has_screen and has_ep:
            st = "✅"
        elif has_screen and not has_ep:
            st = "🟠"
        elif not has_screen and has_ep:
            st = "⚠"
        else:
            st = "🔴"
        counts[st] += 1
        rows.append((st, fid, sorted(fr_screens.get(fid, [])), fr_eps.get(fid, [])))

    print(f"覆盖检查 · PRD={args.prd}")
    print(f"  屏文件 {len(spec_files)} 份；OpenAPI {'已载入' if args.openapi else '未提供'}")
    print(f"  FR 总数 {len(fr_all)}  →  ✅{counts['✅']}  🟠{counts['🟠']}  🔴{counts['🔴']}  ⚠{counts['⚠']}")
    print("  ─────────────────────────────────────────────")
    for st, fid, scr, eps in rows:
        detail = []
        if scr:
            detail.append("屏:" + "/".join(scr))
        if eps:
            detail.append("接口:" + ",".join(eps))
        if not detail:
            detail.append("无屏、无接口")
        print(f"   {st} {fid:<12} {' · '.join(detail)}")

    if nfr_all:
        print("  ── NFR（横切，不计入 FR 门禁）──")
        for nid in sorted(nfr_all):
            scr = sorted(nfr_screens.get(nid, []))
            eps = nfr_eps.get(nid, [])
            tag = "✅" if (scr or eps) else "·"
            bits = (["屏:" + "/".join(scr)] if scr else []) + (["接口:" + ",".join(eps)] if eps else [])
            print(f"   {tag} {nid:<10} {' · '.join(bits) or '未被引用'}")

    print("  ─────────────────────────────────────────────")
    legend = "✅有屏有接口  🟠有屏无接口(待切片)  🔴无屏(需求未设计)  ⚠有接口无屏"
    print("  " + legend)
    if counts["🔴"]:
        print(f"  ⚠ 有 {counts['🔴']} 条 FR 尚无对应屏（🔴）——approved 前应清零。")
        if args.strict:
            print("FAIL ✗ --strict：存在未设计的需求。")
            return 1
    else:
        print("  ✓ 所有 FR 至少已设计到屏。")
    print("DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
