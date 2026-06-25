#!/usr/bin/env python3
"""Stop hook —— 自纠正循环：Claude 想收尾时，先跑四道规格关卡；不过就 exit 2
让它继续修，直到绿。用 stop_hook_active 防死循环（第二次进入即放行）。"""
import json
import os
import subprocess
import sys

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    if data.get("stop_hook_active"):     # 已在 stop-hook 续跑中 → 放行，避免死循环
        sys.exit(0)
    root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or "."
    script = os.path.join(root, "tools", "pipeline", "pipeline_check.sh")
    if not os.path.exists(script):
        sys.exit(0)
    try:
        r = subprocess.run(["bash", script, root], capture_output=True, text=True, timeout=120)
    except Exception:
        sys.exit(0)
    if r.returncode != 0:
        tail = (r.stdout + r.stderr).strip().splitlines()[-25:]
        print("[gate_on_stop] 规格关卡未通过，请修复后再结束：\n" + "\n".join(tail)
              + "\n（提示：改了代码记得 `make openapi` 同步契约、补/跑测试）", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)

if __name__ == "__main__":
    main()
