#!/usr/bin/env python3
"""PreToolUse(Bash) 守卫：阻断危险/违规命令。exit 2 = 阻断并把原因反馈给 Claude。"""
import json
import re
import sys

def deny(msg: str):
    print(f"[guard_bash] 已阻断：{msg}", file=sys.stderr)
    sys.exit(2)

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    cmd = (data.get("tool_input") or {}).get("command", "") or ""
    c = cmd.lower()

    # 毁灭性
    if (re.search(r"\brm\s+-[rf]+\b", c) and re.search(r"\s(/|~|\$home|\*)(\s|$)", c)) or ":(){" in c:
        deny("毁灭性删除命令（rm -rf 指向根/家目录/通配）。请指明确切的相对子路径。")
    if "chmod -r 777" in c:
        deny("chmod -R 777 不符合最小权限。请用精确权限。")
    if re.search(r"\bgit\s+push\b.*(--force|-f)\b", c) and "--force-with-lease" not in c:
        deny("禁止 git push --force。需要时用 --force-with-lease，且不要推 main。")
    if "--no-verify" in c:
        deny("禁止 --no-verify 绕过校验钩子（pre-commit/规格关卡是强制的）。")

    # 包管理纪律
    if re.search(r"\bpip\s+install\b", c):
        deny("本项目后端用 uv：请用 `uv add <pkg>` 或 `uv sync`，勿用 pip install。")
    if re.search(r"\bnpm\s+install\b", c) or re.search(r"\byarn\s+add\b", c):
        deny("前端用 pnpm：请用 `pnpm add` / `pnpm install`。")

    # 密钥/敏感
    if re.search(r"\b(cat|less|head|tail)\s+[^|&;]*\.env\b", c) and ".env.example" not in c:
        deny("禁止读取 .env（含国密私钥等）。需要变量名参考 .env.example。")
    if re.search(r"\becho\s+\$?(sm2_private_key|sm4_key|sm2_public_key)", c):
        deny("禁止回显国密密钥。")
    if "curl" in c and re.search(r"\|\s*(sh|bash)\b", c):
        deny("禁止 curl|sh 直接执行远程脚本。")

    # 数据库/迁移误操作
    if re.search(r"\balembic\s+downgrade\s+base\b", c):
        deny("禁止 downgrade base（清库）。迁移只增不回退到底。")
    if "drop table" in c or "drop database" in c:
        deny("禁止裸 DROP。结构变更走 Alembic 迁移。")

    sys.exit(0)

if __name__ == "__main__":
    main()
