---
description: 审查目标页面/组件的响应式与暗色模式
argument-hint: "[目标文件或目录]"
---

委托 `responsive-reviewer` 子代理审查目标：$1（页面/组件/目录）。

审查清单（见 `.claude/skills/responsive-ui` 与 `.claude/rules/responsive.md`）：
- 断点覆盖（移动优先，sm/md/lg 合理增强）
- 横向溢出（≥360px 无整页滚动；表格/图片/图表响应式）
- 触控目标（≥44px，间距）
- 表格窄屏（卡片或 overflow-x-auto）
- 暗色模式（关键元素 dark: 覆盖，对比度可读）
- 导航（移动端汉堡菜单，hover 不依赖触屏）
- 字号响应式

输出：问题清单（严重度 / 文件:行 / 问题 / 建议改法），不改代码。
