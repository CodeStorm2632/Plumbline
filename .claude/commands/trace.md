---
description: 查看需求覆盖（哪些 FR 有屏/接口，哪些还没落地）
argument-hint: [可选 FR-id]
allowed-tools: Bash
---

运行全链覆盖报告；若给了 `$1` 则在结果里聚焦该 FR：

!`python tools/pipeline/coverage.py specs/prd/PRD-*.md --specs specs/ui --openapi specs/contract/openapi.json`
