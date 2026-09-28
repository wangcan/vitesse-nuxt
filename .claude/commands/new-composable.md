---
description: 脚手架新建一个 composable
argument-hint: "[名称，如 useBook] [职责]"
---

创建 composable：`app/composables/$1.ts`（自动导入）。

要求：
- 严格 TS，禁用 `any`；入参与返回显式类型。
- SSR 友好：不在模块顶层访问 `window`/`document`；客户端 API 用 `import.meta.client` 守卫或 VueUse（`useLocalStorage`/`useScroll` 等自动 SSR 安全）。
- 跨组件状态用 `useState('key', () => init)`；跨页持久用 Pinia store。
- 复用 VueUse 优先，不重复造轮子。

职责：$2

完成后：跑 `pnpm typecheck` 与 `pnpm lint`，汇报文件路径与导出签名。
