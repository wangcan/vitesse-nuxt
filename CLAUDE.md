# CLAUDE.md — 项目核心指令

> 本文件是 Claude 在本仓库工作时的核心指令。详细约束见下方通过 `@` 引入的规则文件。

## 项目概览

基于 **vitesse-nuxt (Nuxt 4)** 模板扩展的多内容应用，目标模块包括：

- **图片展示浏览** — 画廊 / 灯箱 / 网格
- **古籍 / 小说阅读** — 长文排版、章节导航、阅读进度、字号控制
- **简易百科** — 结构化词条、目录、搜索
- **各类表格** — 数据表格、排序、分页
- **各类图表** — 数据可视化

网站**同时支持 PC 与移动端**，所有页面必须响应式。

## 技术栈

| 能力 | 选型 |
| --- | --- |
| 框架 | Nuxt 4（`future.compatibilityVersion: 4`），SSR + 文件路由 |
| 视图 | Vue 3 `<script setup lang="ts">` |
| 样式 | UnoCSS：presetWind4 / presetAttributify / presetIcons / presetTypography / presetWebFonts |
| 状态 | Pinia + `useState` |
| 组合式工具 | VueUse（自动导入） |
| 主题 | `@nuxtjs/color-mode` 暗色/亮色 |
| PWA | `@vite-pwa/nuxt` 离线支持 |
| 类型 | TypeScript（`pnpm typecheck`） |
| Lint | `@antfu/eslint-config` + `@nuxt/eslint` |
| 图标 | Iconify：`@iconify-json/carbon`、`@iconify-json/twemoji`，用法 `i-carbon-xxx` |
| 包管理 | pnpm（workspace + catalog） |

## 目录结构（Nuxt 4 `app/` 约定）

```
app/
  app.vue              # 入口：useHead + NuxtLayout > NuxtPage
  components/          # 自动导入（PascalCase，子目录为命名空间前缀）
  composables/         # 自动导入（use* 函数）
  config/              # 模块配置，如 pwa.ts
  constants/           # 常量
  layouts/             # default.vue / home.vue
  pages/               # 文件路由：index.vue / hi/[id].vue / [...all].vue
server/
  api/                 # Nitro 服务端接口，自动 /api/* 路由
public/                # 静态资源
nuxt.config.ts         # 模块与构建配置
uno.config.ts          # UnoCSS shortcuts / presets / transformers
tsconfig.json          # 引用 .nuxt 生成的 tsconfig
```

## 常用命令

```bash
pnpm dev          # 开发（含 HMR）
pnpm dev:pwa      # 开发 + PWA（VITE_PLUGIN_PWA=true）
pnpm build        # 生产构建
pnpm generate     # 静态站点生成
pnpm preview      # 预览构建产物
pnpm lint         # eslint 检查
pnpm typecheck    # vue-tsc 类型检查
```

## 核心约定（必须遵守）

### 组件 / 页面

- 一律 `<script setup lang="ts">`。
- 组件放 `app/components/`，按功能分子目录；自动导入，无需手动 import。
- 页面放 `app/pages/`，用 `definePageMeta({ layout: 'xxx' })` 指定布局。
- 跨组件共享状态优先 `useState('key', () => init)`；复杂/跨页面状态用 Pinia store。
- 异步内容用 `<ClientOnly><Suspense>...</Suspense></ClientOnly>`，并写 `#fallback`。

### 样式（UnoCSS）

- 优先原子类 + attributify 模式（如 `<div btn text-gray:80 px-4>`）。
- 复用快捷类在 `uno.config.ts` 的 `shortcuts` 中定义，不在组件里重复长串类名。已有：`btn`、`icon-btn`。
- 图标用 `i-carbon-xxx` / `i-twemoji-xxx` 纯 CSS 图标。
- 阅读类长文用 `presetTypography` 的 `prose` 容器，`dark:prose-invert` 适配暗色。
- 暗色模式用 `dark:` 变体（`classSuffix: ''`，`html.dark` 触发）。

### 响应式（PC + 移动端）

- 所有可视页面必须覆盖移动端（默认）与桌面端断点。
- 移动优先：先写移动端样式，再用 `sm:`(640) `md:`(768) `lg:`(1024) 增强。
- 图片/图表/表格用响应式宽度，避免整页横向滚动；表格窄屏转卡片或 `overflow-x-auto` + 提示。
- 触控目标 ≥ 44px（`min-h-11 min-w-11`）。
- 暗色模式必须覆盖关键可视元素。

### TypeScript

- 严格类型，禁用 `any`（确需时用 `unknown` + 收窄）。
- props 用 `defineProps<T>()`，emits 用 `defineEmits<T>()`。
- 共享类型放 `app/types/` 或模块内 `types.ts`。
- 提交前跑 `pnpm typecheck`。

### 数据获取

- 用 `useFetch` / `useAsyncData`，SSR 友好；不要在 setup 顶层直接 `fetch`。
- 服务端接口放 `server/api/`，自动 `/api/...` 路由，Nitro 自动类型，前后端共享。

## 模块扩展指引

新增模块统一走"模块脚手架"流程（见 `.claude/skills/new-module` 与 `/new-module` 命令）：

1. `app/pages/<module>/` 下建页面与子路由
2. `app/components/<module>/` 下建组件
3. `app/composables/use<Module>*.ts` 抽逻辑
4. 需要跨页持久状态建 `app/stores/<module>.ts`（Pinia）
5. 需要后端建 `server/api/<module>/`
6. 共享类型建 `app/types/<module>.ts`
7. 阅读类模块复用 `prose` + 字号/主题控制 composable

## 自定义资源

- **子代理** `.claude/agents/`：`feature-builder`、`responsive-reviewer`、`vue-component-builder`、`content-reader-builder`
- **技能** `.claude/skills/`：`new-module`、`responsive-ui`、`reader-page`、`chart-component`
- **命令** `.claude/commands/`：`/new-page`、`/new-component`、`/new-composable`、`/new-module`、`/lint-fix`、`/responsive-audit`
- **Hooks** `.claude/hooks/`：编辑 `.vue`/`.ts` 后自动 `eslint --fix`

## 引入的规则文件

@.claude/rules/nuxt-conventions.md
@.claude/rules/unocss-style.md
@.claude/rules/responsive.md
@.claude/rules/typescript.md
@.claude/rules/module-structure.md
