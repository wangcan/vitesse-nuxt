---
description: 脚手架新建一个页面
argument-hint: "[路由路径，如 about 或 docs/guide] [页面用途]"
---

为新页面创建文件：`app/pages/$1`（补全为 `.vue`，含必要父目录）。

要求：
- `<script setup lang="ts">`，`definePageMeta({ layout: 'default' })`（按用途选 default/home）。
- 移动优先响应式 + 暗色覆盖（遵循 `.claude/rules/responsive.md`）。
- 样式用 UnoCSS 原子类 + attributify；图标 `i-carbon-xxx`。
- 异步内容用 `<ClientOnly><Suspense #fallback>…</Suspense></ClientOnly>`；数据用 `useFetch`/`useAsyncData`。
- 禁用 `any`，严格类型。

用途说明：$2

完成后：跑 `pnpm typecheck` 与 `pnpm lint`，汇报文件路径与路由地址。
