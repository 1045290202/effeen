---
description: 代码搜索必须先用 codegraph MCP，禁止跳过直接调用内置搜索工具
alwaysApply: true
enabled: true
updatedAt: 2026-06-15T16:00:00.000Z
---

# Codegraph 强制优先搜索规则

## 核心约束（MUST）

- **每次**需要查找代码（类/函数/变量/调用关系/模块结构）时，**必须首先调用** codegraph MCP 工具
- **禁止**在未调用 codegraph 的情况下直接使用 `search_codebase`、`search_symbol`、`grep_code`、`search_file` 等内置搜索工具
- 违反此规则等同于违反 always-on 规则

## 工具路由表（按场景选择）

| 场景                   | 首选工具                            | 说明                                          |
| ---------------------- | ----------------------------------- | --------------------------------------------- |
| 查找符号定义位置       | `codegraph_search`                  | 按名称快速定位，返回位置                      |
| 理解某个区域/流程/架构 | `codegraph_explore`                 | **主力工具**，返回源码+分组，一次调用通常够用 |
| 查看单个符号完整代码   | `codegraph_node` (includeCode=true) | explore 裁剪了代码体时用                      |
| 谁调用了 X             | `codegraph_callers`                 | 调用方列表                                    |
| X 调用了谁             | `codegraph_callees`                 | 被调用方列表                                  |
| 修改 X 的影响范围      | `codegraph_impact`                  | 重构前评估                                    |
| 查看项目文件结构       | `codegraph_files`                   | 比 glob 更快                                  |

## 回退协议（仅当以下条件满足时允许使用内置工具）

1. codegraph 返回**空结果**或**结果明显不相关**
2. 需要查看 codegraph 未索引的文件（如 `.json`、`.md`、资源文件）
3. 需要精确的**正则匹配**搜索文本内容（codegraph 不支持正则）
4. 回退时**必须**在回复中说明："codegraph 未找到相关信息，回退到 [工具名]"

## 禁止的反模式

- 直接用 `search_codebase` 搜索代码 → 应先 `codegraph_explore`
- 直接用 `search_symbol` 查符号 → 应先 `codegraph_search`
- 直接用 `grep_code` 搜函数名 → 应先 `codegraph_search`
- 并行调用 codegraph 和内置搜索工具 → 必须先 codegraph，等结果后再决定是否回退
