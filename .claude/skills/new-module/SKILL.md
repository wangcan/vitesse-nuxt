---
name: new-module
description: 脚手架新建一个完整功能模块（页面+组件+composable+store+类型+服务端接口）。当用户要"新增模块""搭建 XX 模块""/new-module"时加载。遵循 .claude/rules/module-structure.md 的七件套流程。
---

# new-module — 模块脚手架

在本 Nuxt 4 项目中端到端新建一个功能模块。模块名用 kebab-case，目录与路由前缀一致。

## 七件套（按顺序建）

1. **类型** `app/types/<module>.ts` — 先定数据形状（Book/Chapter/Item/Row…），驱动后续所有代码。
2. **composable** `app/composables/use<Module>*.ts` — 抽逻辑（数据获取、筛选、状态动作），自动导入。
3. **store**（可选）`app/stores/<module>.ts` — 仅跨页/持久状态才建；Pinia setup 风格 `defineStore('<module>', () => {...})`，末尾加 `import.meta.hot.accept(acceptHMRUpdate(...))`。
4. **服务端接口**（可选）`server/api/<module>/*.get.ts` / `.post.ts` — Nitro 自动路由 `/api/<module>/*`，返回类型前后端共享。
5. **组件** `app/components/<module>/` — 按功能分子目录；自动导入，子目录=命名空间前缀。
6. **页面** `app/pages/<module>/index.vue` / `[id].vue` / `[...all].vue` — `definePageMeta({ layout })` 指定布局。
7. **阅读类**额外复用 `prose` + 字号/主题 composable（见 `reader-page` 技能）。

## 约定 Checklist

- [ ] 数据获取用 `useFetch`/`useAsyncData`（SSR 友好），不在 setup 顶层直接 `fetch`。
- [ ] 客户端内容用 `<ClientOnly><Suspense #fallback>…</Suspense></ClientOnly>`。
- [ ] 跨组件状态 `useState('key', () => init)`；跨页/持久用 Pinia。
- [ ] 移动优先：先移动端样式，`sm:`/`md:`/`lg:` 增强；触控目标 ≥ 44px（`min-h-11 min-w-11`）。
- [ ] 暗色模式：关键可视元素都有 `dark:` 覆盖。
- [ ] 表格/图片/图表响应式宽度，无整页横向滚动。
- [ ] `<script setup lang="ts">`；`defineProps<T>()` / `defineEmits<T>()`；禁用 `any`。
- [ ] 图标用 `i-carbon-xxx` / `i-twemoji-xxx`；复用 `btn`/`icon-btn` 快捷类。
- [ ] `pnpm typecheck` + `pnpm lint` 零报错。

## 产出汇报格式

```
模块名: <module>
路由: /<module>、/<module>/:id、…
目录树:（新建文件列表）
数据流: 接口 → useFetch → composable/store → 组件 → 页面
响应式/暗色: 自测结论
```

数据来源未指定时，先用 `app/constants/` 或模块内示例数据占位，后续替换为 `server/api`。
