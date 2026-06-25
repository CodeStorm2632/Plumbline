#!/usr/bin/env python3
"""SessionStart —— 把项目当前态注入上下文（stdout 会成为 Claude 的上下文）。"""
import glob
import os
import subprocess
import sys

def main():
    root = os.environ.get("CLAUDE_PROJECT_DIR") or "."
    lines = ["## Plumbline 项目状态（自动注入）"]
    # 现有切片
    feats = sorted(os.path.basename(d) for d in glob.glob(os.path.join(root, "backend/app/features/*"))
                   if os.path.isdir(d) and not os.path.basename(d).startswith("__"))
    if feats:
        lines.append("已有后端切片：" + "、".join(feats))
    # 覆盖率一行
    cov = os.path.join(root, "tools/pipeline/coverage.py")
    prd = glob.glob(os.path.join(root, "specs/prd/PRD-*.md"))
    if os.path.exists(cov) and prd:
        try:
            r = subprocess.run(["python3", cov, prd[0], "--specs",
                                os.path.join(root, "specs/ui"), "--openapi",
                                os.path.join(root, "specs/contract/openapi.json")],
                               capture_output=True, text=True, timeout=30)
            for ln in r.stdout.splitlines():
                if "FR 总数" in ln:
                    lines.append("需求覆盖：" + ln.strip())
        except Exception:
            pass
    lines.append("提醒：规格驱动 + 垂直切片 + 安全默认 + 追溯不断；收尾前四关须绿。详见 CLAUDE.md。")
    print("\n".join(lines))
    sys.exit(0)

if __name__ == "__main__":
    main()
