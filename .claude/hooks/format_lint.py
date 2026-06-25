#!/usr/bin/env python3
"""PostToolUse(Write/Edit) 自动格式化 + lint。工具缺失则优雅跳过。
对 .py：ruff format + ruff check；对 .ts/.tsx：tsc 类型检查（若装了）。
lint 不通过 → exit 2，把问题反馈给 Claude 自行修复（自纠正循环的一环）。"""
import json
import os
import shutil
import subprocess
import sys

def run(cmd, cwd=None):
    try:
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=60)
        return r.returncode, (r.stdout + r.stderr)
    except Exception as e:
        return 0, f"(skip: {e})"

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    fp = (data.get("tool_input") or {}).get("file_path", "") or ""
    if not fp or not os.path.exists(fp):
        sys.exit(0)
    ext = os.path.splitext(fp)[1]

    if ext == ".py" and shutil.which("ruff"):
        run(["ruff", "format", fp])
        run(["ruff", "check", "--fix", fp])
        code, out = run(["ruff", "check", fp])
        if code != 0:
            print("[format_lint] ruff 仍有未修复问题：\n" + out, file=sys.stderr)
            sys.exit(2)

    elif ext in (".ts", ".tsx"):
        fe = _find_frontend_root(fp)
        if fe and os.path.exists(os.path.join(fe, "node_modules", ".bin", "tsc")):
            code, out = run(["node_modules/.bin/tsc", "--noEmit"], cwd=fe)
            if code != 0:
                print("[format_lint] tsc 类型检查失败：\n" + out[-2000:], file=sys.stderr)
                sys.exit(2)
    sys.exit(0)

def _find_frontend_root(fp: str):
    d = os.path.dirname(os.path.abspath(fp))
    while d and d != "/":
        if os.path.basename(d) == "frontend":
            return d
        d = os.path.dirname(d)
    return None

if __name__ == "__main__":
    main()
