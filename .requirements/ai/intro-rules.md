# `.claude/rules/` 项目规则文件介绍

> 一句话概述：`.claude/rules/` 目录存放本项目（基于 vitesse-nuxt / Nuxt 4 的多内容应用）的若干 Markdown 规则文件，它们通过 CLAUDE.md 顶部的 `@.claude/rules/xxx.md` 引用语法被注入到 Claude 的上下文中，作为开发时必须遵守的详细技术约定。

---

## 一、目录概述

### 1.1 这是什么

`.claude/rules/` 是本项目的"技术规则集合"目录，集中存放面向 Claude（以及人类协作者）的、按主题分门别类的详细开发约定。当前目录下共有 5 个规则文件：

| 文件 | 规范主题 |
| --- | --- |
| `nuxt-conventions.md` | Nuxt 4 框架与目录约定 |
| `unocss-style.md` | UnoCSS 样式与原子类约定 |
| `responsive.md` | 响应式（PC + 移动端）约定 |
| `typescript.md` | TypeScript 类型约定 |
| `module-structure.md` | 新增模块的目录结构流程约定 |

### 1.2 规则文件机制的作用

这些规则文件的作用，是把"项目里那些容易被忽视、但又必须严格遵守的细粒度约定"固化下来，让 Claude 在每次进入仓库工作时都能自动知晓并照办，而不必每次都靠提示词临时交代。它们覆盖了从框架用法、样式风格、响应式质量、类型安全到模块脚手架流程等多方面的硬性要求。

### 1.3 如何被引入

规则文件通过 CLAUDE.md 主文件末尾的 `@` 引用语法被引入。在 CLAUDE.md 的"引入的规则文件"一节，可以看到如下写法：

```markdown
@.claude/rules/nuxt-conventions.md
@.claude/rules/unocss-style.md
@.claude/rules/responsive.md
@.claude/rules/typescript.md
@.claude/rules/module-structure.md
```

`@路径` 是 Claude Code 的文件引用语法：被引用文件的**完整内容**会被内联展开、注入到 Claude 的上下文中，等价于把规则文本直接写在 CLAUDE.md 里。这样 Claude 在工作时即可读到这些规则，并把它们当作"必须遵守的约束"来执行。

### 1.4 与 CLAUDE.md 主文件的关系

CLAUDE.md 主文件与 `.claude/rules/` 规则文件是一种"概览 + 细则"的分层关系：

- **CLAUDE.md 主文件**给出项目整体概览：项目背景、技术栈、目录结构、常用命令、跨切面的"核心约定"摘要，以及对各规则文件的引用入口。它负责让读者快速建立全局认知。
- **`.claude/rules/` 规则文件**给出每个主题的详细、逐条约束，是 CLAUDE.md 概览的展开与细化。例如 CLAUDE.md 里"严格类型"一句话，对应 `typescript.md` 里十余条具体条目；CLAUDE.md 里"响应式"段落，对应 `responsive.md` 里的完整断点与自测要求。

换言之，主文件管"是什么、怎么做概要"，规则文件管"每条具体怎么落"。两者结合，既保证上下文加载的简洁，又保证细节的可查性与可执行性。

---

## 二、各规则文件详解

### 2.1 `nuxt-conventions.md` —— Nuxt 4 约定

**主题**：规范基于 Nuxt 4（`future.compatibilityVersion: 4`）的框架用法、目录约定与数据获取方式。

**核心条目清单**：

- 入口 `app/app.vue`：`useHead` + `NuxtLayout > NuxtPage`。
- 组件放在 `app/components/`，自动导入，文件名 PascalCase；子目录成为命名空间前缀（例如 `app/components/gallery/Thumb.vue` → `<GalleryThumb>`）。
- composables 放 `app/composables/use*.ts`，自动导入。
- 页面放 `app/pages/`，走文件路由；支持动态 `[id]` 与 catch-all `[...all]`。
- 布局放 `app/layouts/*.vue`，页面用 `definePageMeta({ layout })` 指定使用的布局。
- 状态管理：跨组件共享用 `useState('key', () => init)`；跨页 / 持久状态用 Pinia store。
- 数据获取用 `useFetch` / `useAsyncData`（SSR 友好）；不要在 setup 顶层直接 `fetch`。
- 客户端内容用 `<ClientOnly>`（必要时内嵌 `<Suspense>` + `#fallback`）。
- 服务端接口放 `server/api/**`，自动映射 `/api/**` 路由，Nitro 自动类型，前后端共享。
- 配置集中在 `nuxt.config.ts`；启用 `future.compatibilityVersion: 4`。

### 2.2 `unocss-style.md` —— UnoCSS 样式约定

**主题**：规范 UnoCSS 原子类、attributify、图标、暗色模式、长文排版与字体等样式写法。

**核心条目清单**：

- 优先使用原子类 + attributify 模式（如 `<div btn text-gray:80 px-4>`）。
- 复用快捷类在 `uno.config.ts` 的 `shortcuts` 中定义，不在组件里重复长串类名；已有 `btn`、`icon-btn`。
- 图标使用 `i-carbon-xxx`、`i-twemoji-xxx`（纯 CSS 图标，无需 import）。
- 暗色模式用 `dark:` 变体（配置 `classSuffix: ''`，由 `html.dark` 触发）。
- 长文阅读使用 `prose` 容器（presetTypography），用 `prose-sm` / `prose-lg` 调字号，`dark:prose-invert` 适配暗色。
- 字体：sans = DM Sans、serif = DM Serif Display、mono = DM Mono（presetWebFonts）。
- 变体组语法可用：`hover:(bg-teal-600 text-white)`（transformerVariantGroup）。
- 指令 `--at-apply` 可用（transformerDirectives），但优先使用原子类。

### 2.3 `responsive.md` —— 响应式约定（PC + 移动端）

**主题**：保证所有可视页面同时覆盖移动端与桌面端，规范断点、布局、触控目标、暗色覆盖与自测要求。

**核心条目清单**：

- 移动优先：先写移动端样式，再用断点增强：`sm:`(640)、`md:`(768)、`lg:`(1024)、`xl:`(1280)。
- 所有可视页面必须覆盖移动端与桌面端，不要只写桌面样式。
- 容器宽度响应式：`max-w-*` + `mx-auto`，避免整页横向滚动。
- 图片 / 图表 / 表格用响应式宽度（`w-full`、`max-w-full`），不写死像素宽。
- 表格在窄屏转卡片布局，或用 `overflow-x-auto` + 可见滚动提示；不强行让整页横向滚动。
- 触控目标 ≥ 44px：`min-h-11 min-w-11`；按钮间距留足。
- 暗色模式必须覆盖关键可视元素：用 `dark:` 变体（`classSuffix: ''`，`html.dark` 触发）。
- 导航在移动端用汉堡菜单，只展示一级；点击展开下级，避免 hover 菜单在触屏失效。
- 字号响应式：`text-sm sm:text-base`、`prose sm:prose-lg`。
- 自测断点：≥360px（小手机）、768px（平板）、1024px（桌面）三档无溢出、无错位。

### 2.4 `typescript.md` —— TypeScript 约定

**主题**：规范 TypeScript 严格类型、组件 API 类型声明、类型共享与类型检查流程。

**核心条目清单**：

- 严格类型，禁用 `any`；确需时用 `unknown` + 类型收窄。
- 一律使用 `<script setup lang="ts">`。
- props 用 `defineProps<T>()`，emits 用 `defineEmits<T>()`；不写运行时字面量对象。
- 共享类型放 `app/types/<module>.ts` 或模块内 `types.ts`；页面私有类型随页面写。
- 服务端接口用 Nitro 自动类型，前后端共享；`useFetch` / `useAsyncData` 返回类型自动推断。
- 状态：`useState<T>('key', () => init)`；Pinia store 用 setup 风格 `defineStore('x', () => {...})`。
- 可空 / 异步数据先判空再用；模板里用 `v-if` 守卫，避免访问 `undefined` 字段。
- 提交前跑 `pnpm typecheck`（vue-tsc），零报错才合并。
- 不写 `// @ts-ignore`；确需豁免用 `// @ts-expect-error` 并注明原因。

### 2.5 `module-structure.md` —— 模块目录结构约定

**主题**：规范新增功能模块时的"七件套"目录脚手架流程，保证模块结构统一、可复用。

**核心条目清单**（七件套流程）：

1. `app/pages/<module>/` —— 页面与子路由（`index.vue`、`[id].vue`、`[...all].vue`）。
2. `app/components/<module>/` —— 模块组件（自动导入，子目录为命名空间前缀）。
3. `app/composables/use<Module>*.ts` —— 模块逻辑（自动导入）。
4. `app/stores/<module>.ts` —— 跨页持久状态（Pinia，setup 风格）。
5. `server/api/<module>/` —— 后端接口（Nitro，自动 `/api/<module>/*`）。
6. `app/types/<module>.ts` —— 共享类型。
7. 阅读类模块复用 `prose` + 字号 / 主题控制 composable（见 `.claude/skills/reader-page`）。

**附加约定**：

- 模块命名用 kebab-case，目录与路由前缀一致。
- 跨模块复用组件提到 `app/components/` 根目录或公共子目录。
- 数据获取走 `useFetch` / `useAsyncData`（SSR 友好），不在 setup 顶层直接 `fetch`。
- 客户端内容用 `<ClientOnly><Suspense #fallback>...</Suspense></ClientOnly>`。

该流程与 `.claude/skills/new-module` 技能及 `/new-module` 命令配套，新增模块时可直接走脚手架。

---

## 三、作用与价值

1. **统一代码风格**：从原子类写法、组件命名、状态管理到类型声明，规则文件把"怎么写才符合本项目习惯"固化成可执行的条目，避免不同贡献者写出风格迥异的代码。
2. **固化项目约定**：Nuxt 4 的自动导入、目录前缀、SSR 友好数据获取、Nitro 接口等约定，一旦写进规则文件即成为常驻上下文，无需每次重复交代，降低遗漏与偏差风险。
3. **保证 PC + 移动端质量**：`responsive.md` 用移动优先、明确断点、触控目标尺寸、表格窄屏处理、暗色覆盖以及三档自测要求，把"双端适配"从口号落到可验证的检查项，对图片浏览、长文阅读、表格、图表等模块尤为关键。
4. **保证类型安全**：`typescript.md` 以禁用 `any`、泛型式 props/emits、可空数据守卫、提交前 `pnpm typecheck` 零报错等硬性要求，守住类型边界，减少运行时错误。
5. **统一模块结构**：`module-structure.md` 的七件套流程让图片、小说、百科、表格、图表等各模块拥有一致的目录与职责划分，便于维护与跨模块复用，也让脚手架命令（`/new-module`）有据可依。
6. **分层降低上下文成本**：CLAUDE.md 给概览、规则文件给细则的分层结构，让 Claude 既能快速建立全局认知，又能在需要时按主题读到逐条细节，兼顾简洁与完备。

---

## 四、使用方式与扩展

### 4.1 如何被加载

- 规则文件本身是普通 Markdown，存放在 `.claude/rules/` 下。
- 它们通过 CLAUDE.md 末尾的 `@.claude/rules/<文件名>.md` 引用被加载。`@路径` 语法会使被引用文件的完整内容内联注入到 Claude 的上下文中，等价于直接写在 CLAUDE.md 内。
- 因此，每次 Claude 进入仓库读取 CLAUDE.md 时，这 5 个规则文件的内容会一并进入上下文，作为"必须遵守"的约束生效。

### 4.2 如何新增规则文件

当项目出现需要长期固化的新主题约定时，可按以下步骤扩展：

1. 在 `.claude/rules/` 下新建一个 Markdown 文件，命名用 kebab-case、主题清晰，例如 `.claude/rules/api-design.md`。
2. 文件内以"一级标题点明主题 + 无序列表逐条列出约束"的格式撰写（与现有 5 个文件保持一致风格）。
3. 在 CLAUDE.md 的"引入的规则文件"一节追加一行 `@.claude/rules/<新文件名>.md`，使其被自动注入上下文。
4. 如该主题在 CLAUDE.md 概览中有对应段落，可在概览里补一句指引，保持"概览 + 细则"的分层一致。
5. 规则文件应聚焦"必须遵守的硬性约定"，避免堆砌可选建议；条目要具体、可执行、可验证（例如给出具体的类名、命令、断点值），而非泛泛而谈。

### 4.3 与其他自定义资源的配合

规则文件并非孤立存在，它与项目内其他 Claude 资源协同：

- **技能 `.claude/skills/`**（如 `new-module`、`reader-page`、`responsive-ui`、`chart-component`）把规则文件里的约定落地为可执行的工作流。
- **命令 `.claude/commands/`**（如 `/new-module`、`/responsive-audit`、`/lint-fix`）触发对应技能或检查。
- **子代理 `.claude/agents/`**（如 `feature-builder`、`responsive-reviewer`）在执行时遵循相应规则文件。
- **Hooks `.claude/hooks/`**（如编辑 `.vue`/`.ts` 后自动 `eslint --fix`）以自动化手段兜底执行部分约定。

规则文件是这一体系的"约定源点"，其他资源是对约定的"执行与兜底"。

---

## 五、规则一览表

下表汇总 5 个规则文件的规范主题与关键约定，便于快速查阅。

| 文件 | 规范主题 | 关键约定 |
| --- | --- | --- |
| `nuxt-conventions.md` | Nuxt 4 框架与目录约定 | `app/app.vue` 入口；`app/components/` 自动导入 + 命名空间前缀；`app/composables/use*.ts` 自动导入；`app/pages/` 文件路由（`[id]`、`[...all]`）；`app/layouts/` + `definePageMeta({ layout })`；`useState` / Pinia 分工；`useFetch`/`useAsyncData` SSR 友好，禁 setup 顶层 `fetch`；`<ClientOnly>` + `<Suspense #fallback>`；`server/api/**` 自动路由 + Nitro 类型；`nuxt.config.ts` + `compatibilityVersion: 4` |
| `unocss-style.md` | UnoCSS 样式与原子类约定 | 原子类 + attributify；`shortcuts` 定义复用类（`btn`、`icon-btn`）；`i-carbon-xxx` / `i-twemoji-xxx` 纯 CSS 图标；`dark:` 变体 + `classSuffix: ''` + `html.dark`；`prose` / `prose-sm` / `prose-lg` / `dark:prose-invert` 长文排版；DM Sans / DM Serif Display / DM Mono 字体；变体组 `hover:(...)`；`--at-apply` 可用但优先原子类 |
| `responsive.md` | 响应式（PC + 移动端）约定 | 移动优先 + 断点 `sm`(640)/`md`(768)/`lg`(1024)/`xl`(1280)；所有可视页必覆盖双端；`max-w-*` + `mx-auto` 防整页横滚；图片/图表/表格响应式宽度；表格窄屏转卡片或 `overflow-x-auto`；触控目标 ≥ 44px（`min-h-11 min-w-11`）；暗色覆盖关键元素；移动端汉堡菜单只展示一级；字号响应式；自测 ≥360 / 768 / 1024 三档 |
| `typescript.md` | TypeScript 类型约定 | 严格类型禁 `any`（用 `unknown` + 收窄）；`<script setup lang="ts">`；`defineProps<T>()` / `defineEmits<T>()`；共享类型放 `app/types/<module>.ts` 或模块内 `types.ts`；Nitro 自动类型 + `useFetch`/`useAsyncData` 自动推断；`useState<T>` + setup 风格 Pinia；可空/异步数据 `v-if` 守卫；提交前 `pnpm typecheck` 零报错；禁 `@ts-ignore`，用 `@ts-expect-error` 注明原因 |
| `module-structure.md` | 新增模块目录结构流程约定 | 七件套：`app/pages/<module>/`、`app/components/<module>/`、`app/composables/use<Module>*.ts`、`app/stores/<module>.ts`、`server/api/<module>/`、`app/types/<module>.ts`、阅读类复用 `prose` + 字号/主题 composable；模块命名 kebab-case；跨模块复用提到 `app/components/` 根目录；数据获取 SSR 友好；客户端内容 `<ClientOnly><Suspense #fallback>` |
