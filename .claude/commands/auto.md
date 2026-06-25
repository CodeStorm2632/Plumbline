---
description: 给一个需求，自动走完 SDD 全流程并自纠正到裁判全绿（遇 OQ/部署等闸口会停下）
argument-hint: <需求描述>
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

把下面的需求交给 `orchestrator` 子代理端到端自动实现，终止条件是 `bash tools/loop/verify.sh` 输出 DONE：

需求：$ARGUMENTS

遵守 CLAUDE.md 与 .claude/rules/*；遇到 [OQ-*] 待决口径或需要部署时停下并报告，不要自行决断。
