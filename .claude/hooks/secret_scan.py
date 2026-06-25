#!/usr/bin/env python3
"""PostToolUse(Write/Edit) 扫描：拦截写入硬编码密钥。exit 2 把告警反馈给 Claude。"""
import json
import os
import re
import sys

PATTERNS = [
    (r"-----BEGIN (?:EC |RSA |)PRIVATE KEY-----", "硬编码私钥（PEM）"),
    (r"\bSM2_PRIVATE_KEY\s*[:=]\s*['\"]?[A-Za-z0-9+/=]{16,}", "硬编码 SM2 私钥"),
    (r"\bSM4_KEY\s*[:=]\s*['\"]?[A-Za-z0-9+/]{16,}", "硬编码 SM4 密钥"),
    (r"\b(?:aws_)?secret_access_key\s*[:=]\s*['\"][^'\"]{16,}", "硬编码 AWS 密钥"),
    (r"\bpassword\s*[:=]\s*['\"][^'\"]{6,}['\"]", "硬编码口令"),
]
# 允许的文件（示例/测试/种子里出现演示口令是正常的）
SKIP = ("example", "/tests/", "test_", "seed.py", ".md")

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    ti = data.get("tool_input") or {}
    fp = (ti.get("file_path", "") or "").replace("\\", "/")
    if any(s in fp.lower() for s in SKIP):
        sys.exit(0)
    content = ti.get("content") or ti.get("new_string") or ""
    hits = [m for pat, m in PATTERNS if re.search(pat, content, re.IGNORECASE)]
    if hits:
        print("[secret_scan] 疑似硬编码密钥：" + "；".join(hits)
              + f"（{os.path.basename(fp)}）。请改为从环境变量/KMS 注入。", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)

if __name__ == "__main__":
    main()
