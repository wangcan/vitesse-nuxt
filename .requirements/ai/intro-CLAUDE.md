# CLAUDE.md 中文介绍文档

> 一句话概述：本文档是对 `CLAUDE.md` 项目核心指令文件的系统性解读，帮助开发者快速理解 Claude 在该仓库中遵循的行为规范、技术栈约定与模块脚手架流程。

---

## 一、文件概述

`CLAUDE.md` 是本项目（基于 vitesse-nuxt / Nuxt 4 模板扩展的多内容应用）的**项目级核心指令文件**。在 Claude Code 工作流中，它具有以下定位：

- **自动加载**：当 Claude Code 在本仓库目录下启动会话时，`CLAUDE.md` 会被自动读取并注入到 Claude 的上下文中，作为该项目的"长期记忆"与行为基线，无需人工逐次粘贴。
- **统一行为规范**：它为 Claude 在本仓库的所有操作（写代码、改样式、建模块、跑命令）划定统一边界，确保不同会话、不同任务之间产出风格一致。
- **指令分层入口**：文件本身是"总纲"，更细粒度的约束通过 `@.claude/rules/*.md` 语法引入（见末尾"引入的规则文件"章节），形成"总指令 + 规则文件 + 自定义资源（agents/skills/commands/hooks）"的三层结构。
- **人类可读契约**：它同样是团队成员理解"项目如何被 AI 协作开发"的入口文档，明确了技术选型、目录约定与必须遵守的红线。

简言之，`CLAUDE.md` 既是 Claude 的"工作手册"，也是项目工程规范的浓缩索引。

---

## 二、内容详解

下面按文件实际章节逐一介绍。

### 1. 项目概览

开宗明义指出本项目基于 **vitesse-nuxt (Nuxt 4)** 模板扩展，是一个"多内容应用"，目标模块覆盖五类场景：

- **图片展示浏览** — 画廊 / 灯箱 / 网格
- **古籍 / 小说阅读** — 长文排版、章节导航、阅读进度、字号控制
- **简易百科** — 结构化词条、目录、搜索
- **各类表格** — 数据表格、排序、分页
- **各类图表** — 数据可视化

并强调网站**同时支持 PC 与移动端**，所有页面必须响应式。这一段确立了项目的功能边界与"移动优先"的产品基调。

### 2. 技术栈

以表格形式罗列了 12 项能力及其选型，关键点：

| 维度 | 要点 |
| --- | --- |
| 框架 | Nuxt 4（`future.compatibilityVersion: 4`），SSR + 文件路由 |
| 视图 | Vue 3 `<script setup lang="ts">` |
| 样式 | UnoCSS，含 presetWind4 / presetAttributify / presetIcons / presetTypography / presetWebFonts 五套预设 |
| 状态 | Pinia + `useState`（分层使用） |
| 组合式工具 | VueUse（自动导入） |
| 主题 | `@nuxtjs/color-mode` 暗色/亮色 |
| PWA | `@vite-pwa/nuxt` 离线支持 |
| 类型/Lint | TypeScript（`pnpm typecheck`）+ `@antfu/eslint-config` / `@nuxt/eslint` |
| 图标 | Iconify，`@iconify-json/carbon`、`@iconify-json/twemoji`，用法 `i-carbon-xxx` |
| 包管理 | pnpm（workspace + catalog） |

这一表格是技术决策的权威清单，Claude 在选库、写代码时以此为准。

### 3. 目录结构（Nuxt 4 `app/` 约定）

采用 Nuxt 4 的 `app/` 目录约定，关键目录：

- `app/app.vue` — 入口：`useHead` + `NuxtLayout > NuxtPage`
- `app/components/` — 自动导入，PascalCase，子目录为命名空间前缀
- `app/composables/` — 自动导入 `use*` 函数
- `app/config/`、`app/constants/` — 模块配置与常量
- `app/layouts/` — `default.vue` / `home.vue`
- `app/pages/` — 文件路由，含动态 `[id]`、catch-all `[...all]`
- `server/api/` — Nitro 服务端接口，自动 `/api/*` 路由
- `public/` — 静态资源
- 根目录 `nuxt.config.ts`、`uno.config.ts`、`tsconfig.json`

明确了"前端在 `app/`、后端在 `server/`、配置在根目录"的三区划分。

### 4. 常用命令

列出 7 条 pnpm 脚本：`dev`、`dev:pwa`、`build`、`generate`、`preview`、`lint`、`typecheck`。其中 `lint`（eslint 检查）与 `typecheck`（vue-tsc 类型检查）是提交前的强制门槛。

### 5. 核心约定（必须遵守）

这是文件中约束力最强的部分，分为五个子节：

- **组件 / 页面**：一律 `<script setup lang="ts">`；组件按功能分子目录、自动导入；页面用 `definePageMeta({ layout })` 指定布局；跨组件状态优先 `useState`，跨页/复杂状态用 Pinia；异步内容用 `<ClientOnly><Suspense #fallback>` 包裹。
- **样式（UnoCSS）**：优先原子类 + attributify；复用快捷类集中在 `uno.config.ts` 的 `shortcuts`（已有 `btn`、`icon-btn`）；图标用纯 CSS 的 `i-carbon-xxx` / `i-twemoji-xxx`；长文用 `prose` + `dark:prose-invert`；暗色用 `dark:` 变体（`classSuffix: ''`，`html.dark` 触发）。
- **响应式（PC + 移动端）**：所有可视页面必须覆盖移动端与桌面端；移动优先，断点 `sm:`(640) / `md:`(768) / `lg:`(1024)；图片/图表/表格响应式宽度，表格窄屏转卡片或 `overflow-x-auto`；触控目标 ≥ 44px（`min-h-11 min-w-11`）；暗色模式覆盖关键可视元素。
- **TypeScript**：严格类型，禁用 `any`（用 `unknown` + 收窄替代）；props 用 `defineProps<T>()`、emits 用 `defineEmits<T>()`；共享类型放 `app/types/` 或模块内 `types.ts`；提交前跑 `pnpm typecheck`。
- **数据获取**：用 `useFetch` / `useAsyncData`（SSR 友好），不在 setup 顶层直接 `fetch`；服务端接口放 `server/api/`，Nitro 自动类型、前后端共享。

### 6. 模块扩展指引

规定新增模块统一走"模块脚手架"流程（对应 `.claude/skills/new-module` 与 `/new-module` 命令），共七步：

1. `app/pages/<module>/` 建页面与子路由
2. `app/components/<module>/` 建组件
3. `app/composables/use<Module>*.ts` 抽逻辑
4. 需要跨页持久状态建 `app/stores/<module>.ts`（Pinia）
5. 需要后端建 `server/api/<module>/`
6. 共享类型建 `app/types/<module>.ts`
7. 阅读类模块复用 `prose` + 字号/主题控制 composable

这七步构成模块的"七件套"，保证新增功能的结构一致性。

### 7. 自定义资源

列出了四类沉淀在 `.claude/` 下的可复用资源：

- **子代理** `.claude/agents/`：`feature-builder`、`responsive-reviewer`、`vue-component-builder`、`content-reader-builder` — 用于分工明确的专项任务。
- **技能** `.claude/skills/`：`new-module`、`responsive-ui`、`reader-page`、`chart-component` — 封装特定场景的操作流程。
- **命令** `.claude/commands/`：`/new-page`、`/new-component`、`/new-composable`、`/new-module`、`/lint-fix`、`/responsive-audit` — 快捷触发脚手架与审查。
- **Hooks** `.claude/hooks/`：编辑 `.vue`/`.ts` 后自动 `eslint --fix` — 保证落盘代码即时合规。

### 8. 引入的规则文件

文件末尾通过 `@` 语法引入 5 个规则文件，作为详细约束的承载：

- `@.claude/rules/nuxt-conventions.md` — Nuxt 4 约定（入口、自动导入、路由、布局、状态、数据获取、客户端组件、服务端接口、配置）
- `@.claude/rules/unocss-style.md` — UnoCSS 样式约定（原子类、shortcuts、图标、暗色、字体、变体组、指令）
- `@.claude/rules/responsive.md` — 响应式约定（移动优先、断点、容器宽度、表格、触控目标、暗色、导航、字号、自测断点）
- `@.claude/rules/typescript.md` — TypeScript 约定（严格类型、props/emits 泛型、共享类型、Nitro 自动类型、状态、空值守卫、typecheck、ts-expect-error）
- `@.claude/rules/module-structure.md` — 模块目录结构约定（七件套流程、kebab-case 命名、跨模块复用、数据获取、客户端内容）

这些规则文件与 `CLAUDE.md` 主体内容互补：主体给"全景与红线"，规则文件给"条目化细则"。

---

## 三、作用与价值

`CLAUDE.md` 在项目中承担多重角色，价值体现在以下几个方面：

1. **统一 Claude 行为规范**：将"怎么写代码、用什么样式、如何建模块"固化为可执行指令，避免不同会话产出风格漂移，使 AI 协作具备可重复性。
2. **固化技术栈与约定**：以权威清单形式锁定技术选型（Nuxt 4 / Vue 3 / UnoCSS / Pinia / pnpm 等）与工程红线（禁用 `any`、提交前 typecheck/lint、移动优先），降低选型分歧与返工成本。
3. **通过 `@` 引入规则文件实现分层治理**：总纲保持精简，细则下沉到 `.claude/rules/*.md`，既保证主文件可读，又允许规则按域独立演进（如响应式规则可单独更新而不动总纲）。
4. **指引模块脚手架流程**：七件套流程让"新增一个功能模块"从自由发挥变为标准工序，配合 `/new-module` 命令与 `new-module` 技能可半自动化落地，结构一致、易于维护。
5. **沉淀自定义资源生态**：将 agents（分工子代理）、skills（场景技能）、commands（快捷命令）、hooks（自动 lint）四类资源集中索引，形成一套围绕 Claude Code 的项目级"工具箱"，使常见任务可复用、可组合。
6. **充当人机协作契约**：对人类团队成员而言，它澄清了"AI 会遵循哪些规则、产出何种风格"，便于评审与信任建立；对 Claude 而言，它是无需重复声明的长期上下文。

---

## 四、注意事项

使用与维护 `CLAUDE.md` 时需留意以下几点：

- **规则文件经 `@` 引入**：文件末尾的 `@.claude/rules/*.md` 会被自动加载进上下文，修改约束时优先改对应规则文件，而非在 `CLAUDE.md` 主体内重复堆叠条目，以保持总纲精简。
- **新增模块走 `/new-module` 流程**：不要随意手建目录，统一使用 `/new-module` 命令或 `new-module` 技能走七件套脚手架，确保目录结构、命名（kebab-case）、自动导入与类型共享符合约定。
- **提交前必跑 typecheck 与 lint**：`pnpm typecheck`（vue-tsc，零报错）与 `pnpm lint`（eslint）是合并门槛；此外 `.claude/hooks/` 会在编辑 `.vue`/`.ts` 后自动 `eslint --fix`，但自动修复不等于通过检查，仍需人工确认。
- **TypeScript 严格红线**：禁用 `any`，确需豁免用 `unknown` + 类型收窄；不写 `// @ts-ignore`，确需时用 `// @ts-expect-error` 并注明原因。
- **响应式与暗色为硬性要求**：所有可视页面必须覆盖移动端（≥360px）/ 平板（768px）/ 桌面（1024px）三档断点，且暗色模式须覆盖关键可视元素；可借助 `responsive-reviewer` 子代理或 `/responsive-audit` 命令做审查。
- **数据获取走 SSR 友好方式**：用 `useFetch` / `useAsyncData`，不要在 setup 顶层直接 `fetch`；客户端异步内容用 `<ClientOnly><Suspense #fallback>` 包裹。
- **资源更新需同步索引**：新增 agents/skills/commands/hooks 后，记得回填 `CLAUDE.md` 的"自定义资源"章节，保持索引与实际文件一致，避免资源"存在但不可见"。
- **文件本身会进上下文**：由于 `CLAUDE.md` 自动加载，其内容会消耗 token，因此撰写时应保持简洁、条目化，避免冗长叙述，细节交给规则文件承载。

---

*本文档基于 `CLAUDE.md` 实际内容整理，用于辅助理解项目核心指令体系。*
