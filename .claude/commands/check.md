---
description: 跑全部质量关卡并汇总（四道规格关卡 + 前后端测试 + ID 锁）
allowed-tools: Bash
---

依次执行并汇总结果（哪绿哪红、红的给出修复指引）：

!`make check`
!`make check-lock`
!`make test-all`
