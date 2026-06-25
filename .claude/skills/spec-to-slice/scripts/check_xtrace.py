#!/usr/bin/env python3
"""
check_xtrace.py — 校验 OpenAPI 里每个 operation 的 x-trace 都能追溯到 PRD 的 [FR-*]/[NFR-*]。

用法：
    python check_xtrace.py <openapi.json> <prd.md>

退出码 0 = 全部可追溯；1 = 存在悬空引用；2 = 用法错误。
另会提示：哪些业务 operation 缺少 x-trace（建议补全）。
"""
import json
import re
import sys

ID_RE = re.compile(r"(?:FR|NFR)-[0-9.]+")


def prd_ids(path: str) -> set[str]:
    text = open(path, encoding="utf-8").read()
    return set(re.findall(r"\[((?:FR|NFR)-[0-9.]+)\]", text))


def main(argv: list[str]) -> int:
    if len(argv) < 3:
        print("用法：check_xtrace.py <openapi.json> <prd.md>")
        return 2
    spec = json.load(open(argv[1], encoding="utf-8"))
    valid = prd_ids(argv[2])

    referenced: set[str] = set()
    missing_xtrace: list[str] = []
    dangling: dict[str, list[str]] = {}

    for path, ops in spec.get("paths", {}).items():
        for method, op in ops.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            if path == "/health":
                continue
            xt = op.get("x-trace")
            label = f"{method.upper()} {path}"
            if not xt:
                missing_xtrace.append(label)
                continue
            ids = [i for i in xt if ID_RE.fullmatch(i)]
            referenced.update(ids)
            bad = [i for i in ids if i not in valid]
            if bad:
                dangling[label] = bad

    print(f"PRD 内 FR/NFR：{len(valid)} 个；OpenAPI 引用：{len(referenced)} 个")
    if missing_xtrace:
        print("⚠ 缺少 x-trace 的业务接口（建议补全）：")
        for m in missing_xtrace:
            print("   -", m)
    if dangling:
        print("✗ 悬空引用（PRD 中不存在）：")
        for label, bad in dangling.items():
            print(f"   - {label}: {', '.join(bad)}")
        print("---\nFAIL ✗ 存在悬空 x-trace")
        return 1
    print("---\nPASS ✓ 所有 x-trace 均可追溯到 PRD" + ("（但有接口缺 x-trace）" if missing_xtrace else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
