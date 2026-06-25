#!/usr/bin/env python3
"""
requirements_lock.py — 为 PRD 的 [FR-*]/[NFR-*] 维护一份 append-only 登记表，
并在重生成 PRD 后比对，捕捉「ID 被删 / 被回收 / 被重编号」——追溯失效的根因。

子命令：
  gen   <PRD.md> [--lock requirements-lock.yaml] [--update-summary]
        从 PRD 生成/更新 lock。已有 ID 的 since 保留(append-only)；新 ID 记当前 version。
        默认不覆盖已有 summary；加 --update-summary 才同步最新摘要。

  check <PRD.md> [--lock requirements-lock.yaml]
        比对 PRD 与 lock：
          ✗ 被删/回收 (lock 有、PRD 无)            → 告警, exit 1
          + 新增 (PRD 有、lock 无)                  → 提示, 跑 gen 登记
          ~ 摘要漂移 (同 ID 描述大变)               → 警告(疑似换义/重编号)
        对每个被删 ID, 在新增 ID 中按摘要相似度找「疑似被重编号为 X」。

lock 形如(无需 PyYAML, 本脚本自解析)：
  FR-5.1.3: {since: v1.0, summary: "可解释计分明细"}

退出码: 0 正常 / 1 存在被删ID(告警) / 2 用法。
"""
import argparse
import difflib
import os
import re
import sys

BRACKET_RE = re.compile(r"\[((?:FR|NFR)-[0-9]+(?:\.[0-9]+)*)\]")
VERSION_RE = re.compile(r"^\s*version\s*:\s*(\S+)\s*$", re.MULTILINE)
LOCK_LINE_RE = re.compile(
    r'^\s*((?:FR|NFR)-[0-9.]+)\s*:\s*\{(.*)\}\s*$'
)
SINCE_RE = re.compile(r"since\s*:\s*([^,}\s]+)")
SUMMARY_Q_RE = re.compile(r'summary\s*:\s*"(.*?)"\s*$')


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def prd_version(text):
    # version 在 frontmatter；取第一处即可
    m = VERSION_RE.search(text)
    return m.group(1).strip() if m else "v?"


def clean_line(s, the_id):
    s = s.replace(f"[{the_id}]", " ")
    s = re.sub(r"\[(?:FR|NFR|OQ)-[0-9.]+\]", " ", s)   # 去掉同行其他 ID
    s = re.sub(r"[`*#>|\-]", " ", s)                    # 去 markdown 噪声
    s = re.sub(r"^\s*[0-9.]+\s*", "", s)               # 去行首编号 "5.1.3 "
    s = re.sub(r"\s+", " ", s).strip(" 。:：")
    return s


def prd_defs(text):
    """返回 {id: summary}：每个 bracketed 定义取其所在行清洗后最长的一条。"""
    lines = text.splitlines()
    by_id = {}
    for ln in lines:
        for mid in set(BRACKET_RE.findall(ln)):
            cand = clean_line(ln, mid)
            if len(cand) > len(by_id.get(mid, "")):
                by_id[mid] = cand
    # 截断摘要
    return {k: (v[:48] if v else k) for k, v in by_id.items()}


def load_lock(path):
    out = {}
    if not os.path.exists(path):
        return out
    for ln in read(path).splitlines():
        m = LOCK_LINE_RE.match(ln)
        if not m:
            continue
        rid, body = m.group(1), m.group(2)
        since = (SINCE_RE.search(body) or [None, "v?"])[1] if SINCE_RE.search(body) else "v?"
        sm = SUMMARY_Q_RE.search(body)
        summary = sm.group(1) if sm else ""
        out[rid] = {"since": since, "summary": summary}
    return out


def fr_key(x):
    return (0 if x.startswith("FR") else 1, [int(n) for n in re.findall(r"\d+", x)])


def write_lock(path, lock):
    lines = ["# requirements-lock.yaml — append-only ID 登记（由 requirements_lock.py 维护）"]
    for rid in sorted(lock, key=fr_key):
        e = lock[rid]
        sm = e["summary"].replace('"', "'")
        lines.append(f'{rid}: {{since: {e["since"]}, summary: "{sm}"}}')
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def cmd_gen(args):
    text = read(args.prd)
    ver = prd_version(text)
    defs = prd_defs(text)
    lock = load_lock(args.lock)
    added, updated = [], []
    for rid, summary in defs.items():
        if rid not in lock:
            lock[rid] = {"since": ver, "summary": summary}
            added.append(rid)
        else:
            if args.update_summary and lock[rid]["summary"] != summary:
                lock[rid]["summary"] = summary
                updated.append(rid)
            elif not lock[rid]["summary"]:
                lock[rid]["summary"] = summary
    write_lock(args.lock, lock)
    print(f"lock 写入: {args.lock}  (PRD version={ver})")
    print(f"  新登记 {len(added)} 条" + (f": {', '.join(sorted(added, key=fr_key))}" if added else ""))
    if updated:
        print(f"  更新摘要 {len(updated)} 条: {', '.join(sorted(updated, key=fr_key))}")
    print(f"  lock 现有 {len(lock)} 条")
    return 0


def cmd_check(args):
    if not os.path.exists(args.lock):
        print(f"✗ 找不到 lock: {args.lock} —— 先跑 `gen` 建立基线。")
        return 2
    text = read(args.prd)
    defs = prd_defs(text)
    lock = load_lock(args.lock)
    prd_ids, lock_ids = set(defs), set(lock)

    removed = sorted(lock_ids - prd_ids, key=fr_key)   # 告警
    added = sorted(prd_ids - lock_ids, key=fr_key)     # 提示
    kept = prd_ids & lock_ids

    print(f"比对: PRD={len(prd_ids)} 条  lock={len(lock_ids)} 条")

    # 摘要漂移
    drift = []
    for rid in sorted(kept, key=fr_key):
        old, new = lock[rid]["summary"], defs[rid]
        if old and new and difflib.SequenceMatcher(None, old, new).ratio() < 0.5:
            drift.append((rid, old, new))

    if removed:
        print("✗ 被删/回收的 ID（违反 append-only，下游 trace 会悬空）：")
        for rid in removed:
            hint = ""
            # 在新增里找疑似重编号目标（摘要相似）
            best, score = None, 0.0
            for nid in added:
                r = difflib.SequenceMatcher(None, lock[rid]["summary"], defs[nid]).ratio()
                if r > score:
                    best, score = nid, r
            if best and score >= 0.6:
                hint = f"  → 疑似被重编号为 {best}（摘要相似 {score:.0%}）"
            print(f"   - {rid}  「{lock[rid]['summary']}」{hint}")

    if added:
        print("+ 新增 ID（跑 `gen` 登记即可，非错误）：")
        for rid in added:
            print(f"   - {rid}  「{defs[rid]}」")

    if drift:
        print("~ 摘要漂移（同 ID 描述大变，疑似换义/重编号，请人工确认）：")
        for rid, old, new in drift:
            print(f"   - {rid}: 「{old}」 → 「{new}」")

    print("---")
    if removed:
        print("ALARM ✗ 存在被删/回收 ID。若是有意废弃，请保留旧号并标注废弃，不要回收。")
        return 1
    msg = "PASS ✓ 无 ID 被删/回收"
    if added:
        msg += "（有新增待登记）"
    if drift:
        msg += "（有摘要漂移待确认）"
    print(msg)
    return 0


def main(argv):
    ap = argparse.ArgumentParser(description="PRD 需求 ID 登记与稳定性比对")
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("gen", help="从 PRD 生成/更新 lock")
    g.add_argument("prd")
    g.add_argument("--lock", default="requirements-lock.yaml")
    g.add_argument("--update-summary", action="store_true")
    g.set_defaults(func=cmd_gen)
    c = sub.add_parser("check", help="比对 PRD 与 lock")
    c.add_argument("prd")
    c.add_argument("--lock", default="requirements-lock.yaml")
    c.set_defaults(func=cmd_check)
    args = ap.parse_args(argv[1:])
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main(sys.argv))
