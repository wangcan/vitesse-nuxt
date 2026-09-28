# Vitesse for Nuxt 4 — 技术栈与功能分析

> 源码仓库：https://github.com/antfu/vitesse-nuxt
> 本地路径：`/data/project/frontend/vitesse-nuxt`
> 分析时间：2026-09-28

---

## 1. 项目定位

`vitesse-nuxt` 是 antfu 维护的 **Nuxt 4 官方风格启动模板（Starter Template）**，属于 Vitesse 系列模板的 Nuxt 版本（同系列还有 `vitesse`、`vitesse-lite`、`vitesse-webext` 等）。它把 antfu 个人偏好的现代前端工程实践（原子化 CSS、自动导入、严格类型、ESLint 风格统一、PWA、暗色模式等）预先集成进一个开箱即用的 Nuxt 4 项目，目标是让开发者克隆下来即可开始业务二次开发，无需再花时间搭脚手架。

项目本身不含业务逻辑，仅提供一组示例页面（首页、`/hi/[id]` 问候页、404 兜底页）用于演示路由、布局、状态管理、API 调用、PWA、暗色模式等能力的协作方式。

---

## 2. 技术栈总览

| 分类 | 技术 | 版本（来自 `pnpm-workspace.yaml` catalog） | 作用 |
| --- | --- | --- | --- |
| 元框架 | **Nuxt 4** | `^4.4.2` | SSR / ESR / 文件路由 / 自动导入 / 模块系统 |
| 视图框架 | **Vue 3** | `^3.5.30` | `<script setup>` 组合式 API |
| 构建工具 | **Vite** | `^8.0.0`（resolutions 统一） | 极速 HMR、生产打包 |
| 语言 | **TypeScript** | `^5.9.3` | 全量类型，`vue-tsc ^3.2.6` 做类型检查 |
| 原子化 CSS | **UnoCSS** | `^66.6.7` | 按需生成原子类、图标、排版、字体 |
| 状态管理 | **Pinia** | `^3.0.4`（`@pinia/nuxt ^0.11.3`） | 类型安全的 Store |
| 组合式工具 | **VueUse** | `@vueuse/nuxt ^14.2.1` / `@vueuse/core ^14.2.1` | 实用 Composition API 集合 |
| 暗色模式 | **@nuxtjs/color-mode** | `^4.0.0` | 暗/亮色自动检测与切换 |
| PWA | **@vite-pwa/nuxt** | `^1.1.1` | 离线支持 + 自动更新的 Service Worker |
| 代码规范 | **@antfu/eslint-config** | `^7.7.3`（eslint `^10.0.3`） | ESLint 单一事实源，禁用 Prettier |
| 开发工具 | **@nuxt/devtools** | `^3.2.4` | 浏览器内可视化调试 |
| 包管理 | **pnpm** | `10.32.1`（`packageManager` 字段锁定） | 使用 **catalog** 统一版本 |
| 图标 | **@iconify-json/carbon**、**@iconify-json/twemoji** | `^1.2.19` / `^1.2.5` | UnoCSS presetIcons 使用的离线图标集 |
| 运行时 | **Node.js** | `20`（Dockerfile / netlify.toml 指定） | 生产 SSR 运行 |

> 版本管理亮点：项目使用 pnpm **catalog** 机制（`pnpm-workspace.yaml` 定义 `build`/`dev`/`frontend`/`icons` 四个目录），`package.json` 里所有依赖都写成 `"catalog:xxx"` 而非具体版本号，配合 `resolutions` 统一 `nuxt`/`vite`/`@nuxt/kit`/`chokidar`/`semver`/`unplugin` 版本，从根上避免多版本冲突。

---

## 3. 目录结构

项目采用 **Nuxt 4 的 `app/` srcDir 约定**（`future.compatibilityVersion: 4`），即前端源码放在 `app/` 下，服务端代码放在 `server/` 下：

```text
vitesse-nuxt/
├── app/                        # 前端源码（Nuxt 4 srcDir）
│   ├── app.vue                 # 根组件：挂载 PWA manifest + Layout + Page
│   ├── components/             # 组件目录（自动导入）
│   │   ├── Counter.vue         # 计数器（演示 useState）
│   │   ├── DarkToggle.vue      # 暗色切换按钮
│   │   ├── Footer.vue          # 页脚（GitHub 链接 + DarkToggle）
│   │   ├── InputEntry.vue      # 名字输入框，跳转 /hi/[name]
│   │   ├── Logos.vue           # Nuxt + Vitesse Logo
│   │   └── PageView.vue        # 调用 /api/pageview 显示浏览量
│   ├── composables/            # 组合式函数（自动导入）
│   │   ├── count.ts            # useCount：基于 useState 的计数
│   │   └── user.ts             # useUserStore：Pinia store + HMR
│   ├── config/pwa.ts           # PWA 配置（manifest + workbox 缓存策略）
│   ├── constants/index.ts      # appName / appDescription
│   ├── layouts/                # 布局（default.vue / home.vue）
│   └── pages/                  # 文件路由
│       ├── index.vue           # 首页
│       ├── hi/[id].vue         # 动态路由 /hi/:id
│       └── [...all].vue        # 404 兜底页
├── server/
│   ├── api/pageview.ts         # 服务端 API：GET /api/pageview
│   └── tsconfig.json           # 继承 .nuxt/tsconfig.server.json
├── public/                     # 静态资源（favicon、pwa 图标、robots.txt 等）
├── nuxt.config.ts              # Nuxt 主配置
├── uno.config.ts               # UnoCSS 配置
├── eslint.config.js            # ESLint 配置（antfu + nuxt）
├── tsconfig.json               # 根 tsconfig（project references 指向 .nuxt 生成物）
├── pnpm-workspace.yaml         # pnpm catalog 版本目录
├── Dockerfile                  # 多阶段构建：build → node SSR
├── netlify.toml                # Netlify 部署配置
└── .github/workflows/ci.yml    # CI：lint + typecheck
```

---

## 4. 核心功能详解

### 4.1 Nuxt 4 全家桶能力

- **SSR / ESR**：默认服务端渲染；`nuxt build` 产出可独立运行的 Node 服务（`.output/server/index.mjs`）。
- **文件路由**：`app/pages/` 下的文件即路由，支持动态段 `[id]` 与 catch-all `[...all]`（404）。
- **组件自动导入**：`app/components/` 下的 `.vue` 文件全局可用，无需 `import`（如 `<Counter />`、`<DarkToggle />`）。
- **Composables 自动导入**：`app/composables/` 下导出的 `useXxx` 全局可用（如 `useCount`、`useUserStore`）。
- **API 自动导入**：Vue / Nuxt / VueUse 的 Composition API（`ref`、`useFetch`、`useHead`、`useRouter`、`useOnline`、`useTimeAgo` 等）无需手动 import。
- **布局系统**：`app/layouts/` 下定义布局，页面通过 `definePageMeta({ layout: 'home' })` 指定，`app.vue` 中 `<NuxtLayout><NuxtPage /></NuxtLayout>` 组装。
- **实验特性**（`nuxt.config.ts > experimental`）：`typedPages: true`（路由带类型）、`renderJsonPayloads: true`、`payloadExtraction: false`（配合 PWA generate 场景关闭，避免离线缺失）。

### 4.2 状态管理（Pinia + useState 双轨）

- **Pinia**：`app/composables/user.ts` 用 `defineStore` + setup 语法定义 `useUserStore`，并接入了 **HMR**（`acceptHMRUpdate`），编辑 store 时状态不丢失。
- **Nuxt useState**：`app/composables/count.ts` 的 `useCount` 用 `useState('count', ...)` 做 SSR 友好的共享状态。

### 4.3 UnoCSS 原子化样式（`uno.config.ts`）

启用以下 preset 与 transformer：

- `presetWind4` — Tailwind/Wind 风格原子类（`text-2xl`、`px-4`、`dark:gray-700`）。
- `presetAttributify` — 属性化写法（`<div text="xl gray4" m-5 flex="~ gap3">`）。
- `presetIcons({ scale: 1.2 })` — 纯 CSS 图标，按 `i-<集合>-<名>` 使用，如 `i-carbon-add`、`i-twemoji:waving-hand`；图标数据来自 `@iconify-json/carbon` / `@iconify-json/twemoji`。
- `presetTypography` — 排版类（`prose`）。
- `presetWebFonts` — 在线字体（DM Sans / DM Serif Display / DM Mono），并用 `createLocalFontProcessor()` 做本地化处理。
- `transformerDirectives` — 支持 `@apply` 等指令。
- `transformerVariantGroup` — 分组写法（`children:mx-auto`、`hover:(...)`）。
- 自定义 `shortcuts`：`btn`、`icon-btn` 两个复合类。

### 4.4 暗色模式（@nuxtjs/color-mode）

- 配置 `colorMode: { classSuffix: '' }`，通过给 `<html>` 加 `dark` class 切换（`html.dark { color-scheme: dark }`）。
- `DarkToggle.vue` 用 `useColorMode()` 读写偏好；`app.vue` 头部 `theme-color` meta 跟随模式变化。
- 支持系统偏好自动检测。

### 4.5 PWA（@vite-pwa/nuxt，配置在 `app/config/pwa.ts`）

- `registerType: 'autoUpdate'` — 新版本自动更新。
- `manifest` — 名称、描述、主题色、三档图标（192 / 512 / maskable）。
- `workbox` — 预缓存 `**/*.{js,css,html,txt,png,ico,svg}`；`navigateFallback: '/'` 但排除 `/api/`；对 Google Fonts 做 `CacheFirst` 运行时缓存（365 天）。
- `registerWebManifestInRouteRules: true` + `writePlugin: true`。
- `devOptions.enabled` 仅在 `VITE_PLUGIN_PWA=true` 时开启（对应 `pnpm dev:pwa`）。
- `app.vue` 中 `<VitePwaManifest />` 注入 manifest 链接。

### 4.6 服务端 API（Nitro）

- `server/api/pageview.ts` 用 `defineEventHandler` 实现 `GET /api/pageview`，返回累计浏览量与服务启动时间；前端 `PageView.vue` 用 `useFetch('/api/pageview')` + `useTimeAgo` 展示。
- `nuxt.config.ts > nitro`：esbuild `target: esnext`；`prerender.crawlLinks: false`，仅预渲染 `/`，并忽略 `/hi`（动态路由不静态化）。

### 4.7 工程规范

- **ESLint 单一事实源**：`eslint.config.js` 用 `@antfu/eslint-config`，开启 `unocss`、`formatters`（格式化 markdown/yaml/html 等）、`pnpm` 规则，并 append Nuxt 生成的 `.nuxt/eslint.config.mjs`。**禁用 Prettier**（`.vscode/settings.json` 中 `prettier.enable: false`），保存时由 ESLint 自动修复。
- **TypeScript**：根 `tsconfig.json` 用 **project references** 指向 `.nuxt/tsconfig.{app,server,shared,node}.json`（由 `nuxt prepare` 生成）；`server/tsconfig.json` 继承 server 配置。`pnpm typecheck` 跑 `nuxt typecheck`（vue-tsc）。
- **CI**（`.github/workflows/ci.yml`）：对 `main` 分支的 push / PR 跑 `lint` 与 `typecheck` 两个 job。

### 4.8 IDE 支持

- 推荐 VS Code + **Volar**；`.vscode/extensions.json` 推荐了 `antfu.iconify`、`antfu.unocss`、`antfu.goto-alias`、`antfu.pnpm-catalog-lens`、`dbaeumer.vscode-eslint`、`vue.volar`、`csstools.postcss`。
- `.vscode/settings.json` 把 CSS 关联到 postcss、关闭样式类规则的告警（但仍自动修复）。

---

## 5. 构建与部署产物

- `pnpm build` → `nuxt build`，产出 `.output/`（SSR：`.output/server/index.mjs` + `.output/public/`）。
- `pnpm generate` → `nuxt generate`，产出纯静态站点到 `.output/public/`（配合 `prerender` 仅生成 `/`，其余路由需按需扩展）。
- `pnpm start` → `node .output/server/index.mjs`，运行 SSR 服务（默认 3000 端口，见 Dockerfile）。
- `pnpm start:generate` → `npx serve .output/public`，本地预览静态产物。
- `pnpm preview` → `nuxt preview`，本地预览 build 产物。

部署通道已内置：
- **Docker**（`Dockerfile`）：`node:20-alpine` 多阶段构建，build 阶段 `pnpm install --frozen-lockfile` + `pnpm build`，运行阶段拷贝 `.output` 并 `node .output/server/index.mjs`，暴露 3000。
- **Netlify**（`netlify.toml`）：`pnpm run build`，发布目录 `dist`（注意：该配置为历史遗留，实际 Nuxt 产物在 `.output`，二次开发时建议按目标平台校正，详见 `dev-deploy.md`）。
- Nitro 自带各平台 preset（Vercel、Cloudflare、Vercel Edge 等），可按需指定。

---

## 6. 一句话总结

`vitesse-nuxt` 是一份**高度规范化的 Nuxt 4 + Vue 3 + Vite + UnoCSS + Pinia + TypeScript 起步模板**，用 pnpm catalog 锁版本、antfu ESLint 统一风格、自动导入消除样板代码，并预置暗色模式、PWA、文件路由、布局系统与示例 API，适合作为中后台 / 内容型 / PWA 类前端项目的二次开发底座。
