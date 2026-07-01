---
description: 强制启用 caveman 省 token 模式（ultra 级别）
alwaysApply: true
enabled: true
updatedAt: 2026-06-15T06:00:00.000Z
provider:
---

# 强制 Caveman 模式

## 规则

- **每次对话的第一条回复**必须调用 Skill 工具：`skill: "caveman"`, `args: "ultra"`
- 整个对话期间保持 caveman ultra 模式，所有回复遵循 caveman 压缩风格
- 不得跳过、延迟或降级此规则
