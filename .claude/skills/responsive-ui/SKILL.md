---
name: responsive-ui
description: 响应式 UI 模式参考（移动优先、断点、触控目标、表格窄屏、暗色覆盖）。当构建可视页面/组件、做响应式适配、或 /responsive-audit 时加载。
---

# responsive-ui — 响应式 UI 模式

本站同时支持 PC 与移动端，所有可视页面移动优先。

## 断点（UnoCSS presetWind4）

| 断点 | 宽度 | 用途 |
| --- | --- | --- |
| 默认 | <640 | 移动端基线，先写 |
| `sm:` | 640 | 大手机/小平板 |
| `md:` | 768 | 平板 |
| `lg:` | 1024 | 桌面 |
| `xl:` | 1280 | 大桌面 |

写法：`text-sm sm:text-base md:text-lg`、`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`。

## 触控目标
- 可点击元素 ≥ 44×44px：`min-h-11 min-w-11`。
- 移动端按钮间距 `gap-2` 起步，避免误触。

## 避免横向滚动
- 容器 `max-w-* mx-auto`；图片/图表 `w-full max-w-full`。
- 表格窄屏：转卡片，或 `overflow-x-auto` + `<div text-xs op50>← 横向滚动 →</div>` 提示。
- 不在固定宽容器里放 `whitespace-nowrap` 长内容。

## 导航（PC + 移动）
- PC：横向菜单，hover 展开下级；子菜单向右展开不溢出（`right-0` 兜底）。
- 移动：汉堡菜单（方形四杠，高对比色），只展示一级；点击展开下级，避免 hover。
- 当前菜单高亮：`bg-teal-600 text-white`（PC 与移动都明显）。

## 暗色模式
- `classSuffix: ''`，`html.dark` 触发；用 `dark:` 变体覆盖关键元素。
- 长文 `prose dark:prose-invert`；卡片 `bg-white dark:bg-dark-9` 等成对类。
- 自测：切暗色后对比度可读，无纯黑文字压在深色背景。

## 自测三档视口
- ≥360px（小手机）：无溢出、无错位、触控可达。
- 768px（平板）：网格合理重排。
- 1024px（桌面）：布局稳定，无大块空白。

## 常见反模式
- 只写桌面样式再 `@media` 缩小（应反向，移动优先）。
- `hover:` 菜单在移动端依赖（触屏无 hover）。
- 写死 `width: 800px`（用 `w-full max-w-[800px]`）。
- 暗色只改 body 背景，组件仍白底。
