# 模块目录结构约定

新增模块统一走"模块脚手架"流程（见 `.claude/skills/new-module` 与 `/new-module`）：

1. `app/pages/<module>/` — 页面与子路由（`index.vue`、`[id].vue`、`[...all].vue`）
2. `app/components/<module>/` — 模块组件（自动导入，子目录为命名空间前缀）
3. `app/composables/use<Module>*.ts` — 模块逻辑（自动导入）
4. `app/stores/<module>.ts` — 跨页持久状态（Pinia，setup 风格）
5. `server/api/<module>/` — 后端接口（Nitro，自动 `/api/<module>/*`）
6. `app/types/<module>.ts` — 共享类型
7. 阅读类模块复用 `prose` + 字号/主题控制 composable（见 `.claude/skills/reader-page`）

- 模块命名用 kebab-case，目录与路由前缀一致。
- 跨模块复用组件提到 `app/components/` 根目录或公共子目录。
- 数据获取走 `useFetch`/`useAsyncData`（SSR 友好），不在 setup 顶层直接 `fetch`。
- 客户端内容用 `<ClientOnly><Suspense #fallback>...</Suspense></ClientOnly>`。
