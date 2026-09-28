# Nuxt 4 约定

- 入口 `app/app.vue`：`useHead` + `NuxtLayout > NuxtPage`。
- 组件 `app/components/` 自动导入，文件名 PascalCase；子目录成为命名空间前缀（如 `app/components/gallery/Thumb.vue` → `<GalleryThumb>`）。
- composables `app/composables/use*.ts` 自动导入。
- 页面 `app/pages/` 文件路由；动态 `[id]`、catch-all `[...all]`。
- 布局 `app/layouts/*.vue`，页面用 `definePageMeta({ layout })` 指定。
- 状态：跨组件共享用 `useState('key', () => init)`；跨页/持久用 Pinia store。
- 数据获取用 `useFetch` / `useAsyncData`（SSR 友好）；不要在 setup 顶层直接 `fetch`。
- 客户端内容用 `<ClientOnly>`（必要时内嵌 `<Suspense>` + `#fallback`）。
- 服务端接口 `server/api/**`，自动 `/api/**` 路由，Nitro 自动类型，前后端共享。
- 配置在 `nuxt.config.ts`；`future.compatibilityVersion: 4`。
