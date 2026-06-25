---
description: 对当前改动做安全专项审查
allowed-tools: Read, Bash, Grep, Glob
---

调用 `security-reviewer` 子代理，对当前 `git diff` 做安全审查（国密用法、密钥硬编码、脱敏、审计、RBAC、登录链路），按风险分级输出结论。
