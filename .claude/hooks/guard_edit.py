#!/usr/bin/env python3
"""PreToolUse(Write/Edit/MultiEdit) 守卫：保护"生成物/不可手改"文件。exit 2 阻断。"""
import json
import os
import sys

def deny(msg: str):
    print(f"[guard_edit] 已阻断：{msg}", file=sys.stderr)
    sys.exit(2)

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    fp = (data.get("tool_input") or {}).get("file_path", "") or ""
    p = fp.replace("\\", "/")

    if p.endswith("specs/contract/openapi.json"):
        deny("openapi.json 是后端导出的生成物。改后端路由再 `make openapi`，勿手改契约。")
    if "frontend/src/lib/api/generated/" in p:
        deny("该目录由 orval 从 openapi 生成。改契约后 `pnpm orval` 重生成，勿手改。")
    base = os.path.basename(p)
    if base == ".env":
        deny("禁止写入 .env（真实密钥）。示例值写到 .env.example。")
    if "backend/migrations/versions/" in p and os.path.exists(fp):
        deny("已存在的迁移文件不可手改（会破坏历史一致性）。请新建一条迁移。")
    sys.exit(0)

if __name__ == "__main__":
    main()
