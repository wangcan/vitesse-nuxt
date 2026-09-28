# `.claude/skills/` 自定义技能介绍

> 一句话概述：`.claude/skills/` 下存放本项目 4 个自定义技能（chart-component、new-module、reader-page、responsive-ui），每个技能是一个含 `SKILL.md` 的目录，Claude 在匹配到对应开发场景时自动加载其指令，为图表集成、模块脚手架、阅读器排版、响应式适配提供工程规范。

---

## 一、目录概述

### 1.1 技能机制的作用

`.claude/skills/` 是 Claude Code 的自定义技能目录。每个技能是一个独立子目录，核心文件为 `SKILL.md`。当 Claude 识别到当前任务与某技能的 `description` 匹配时，会自动把该技能的指令加载到当前会话中，作为本次工作的执行规范——无需用户手动触发。

### 1.2 与 commands 的区别

| 维面 | skills（技能） | commands（命令，`.claude/commands/`） |
| --- | --- | --- |
| 触发方式 | **自动**：基于 `description` 语义匹配场景后加载 | **手动**：用户输入 `/new-module` 等斜杠命令触发 |
| 定位 | 领域工程模式参考（"怎么做"的规范） | 流程入口与参数化模板 |
| 加载粒度 | 按场景按需加载指令正文 | 按命令名加载命令体 |

技能聚焦"在某个场景下应遵循哪些工程约定"，命令聚焦"以什么参数启动一个流程"。二者常配合使用：例如 `/new-module` 命令会走 new-module 技能定义的七件套流程。

### 1.3 SKILL.md 结构含义

- **frontmatter**：`name`（技能标识，与目录名一致）+ `description`（触发场景描述，Claude 据此判断是否加载）。
- **正文**：该场景下的工程要点、步骤、代码骨架、约定 checklist、反模式等，加载后作为 Claude 的执行指令。

### 1.4 与 agents / rules 的区别

- **agents（`.claude/agents/`）**：子代理定义，可被委派独立执行多步任务（如 feature-builder、responsive-reviewer），强调"由谁执行"。技能强调"执行时遵循什么规范"。
- **rules（`.claude/rules/`）**：全局/常驻规则文件，通过 CLAUDE.md `@` 引入始终生效。技能是按场景按需加载的，不常驻。
- **skills**：场景驱动、按需加载的工程模式库，介于 rules（常驻）与 commands（手动入口）之间。

---

## 二、各技能详解

### 2.1 chart-component — 图表组件模式

- **技能名**：`chart-component`
- **触发场景**（来自 description）：构建数据可视化、图表、dashboard 时加载。在 Nuxt/UnoCSS 中集成图表（ECharts/Chart.js/vxe-table 图表等）。配色与调色板设计交由内置 `dataviz` 技能，本技能聚焦工程集成。
- **核心工作流程/步骤**：
  1. 以 `<ClientOnly>` 包裹图表组件，提供 `#fallback` 占位（骨架/加载提示），保证 SSR 安全。
  2. 容器用 `w-full`，高度用响应式 `h-64 sm:h-80 lg:h-96` 或 `aspect-*`，不写死像素。
  3. 用 `useResizeObserver`（VueUse）监听容器尺寸变化，触发 `chart.resize()`。
  4. 监听 `useColorMode()`，切主题时 dispose 后重新 init 并重渲染（`chart.setOption({ theme })`）。
  5. 数据用 `useFetch`/`useAsyncData` 获取，`watch` 数据变化重渲染。
  6. 大库（echarts 全量）用 `await import('echarts')` 动态按需加载，或 `echarts/core` + 按需注册；多图表页用 `defineAsyncComponent` 拆包。
- **产出物**：一个 SSR 安全、响应式尺寸、暗色适配的图表 Vue 组件（含 `<script setup lang="ts">` 骨架代码）。
- **关键约定**：
  - 必须 `<ClientOnly>` + 动态 import，禁止顶层 `import 'echarts'` 后在 `onMounted` 直接用（SSR 报错）。
  - 禁止写死像素高度（避免移动端溢出或留白）。
  - 必须 `onBeforeUnmount` 调 `chart.dispose()` 防内存泄漏。
  - 暗色切换必须重渲染，否则暗色下图表白底刺眼。
  - 配色/调色板/mark 规格/无障碍对比度先读内置 `dataviz` 技能，本技能只负责工程落地。

### 2.2 new-module — 模块脚手架

- **技能名**：`new-module`
- **触发场景**：用户要"新增模块""搭建 XX 模块"或执行 `/new-module` 时加载。
- **核心工作流程（七件套，按顺序建）**：
  1. **类型** `app/types/<module>.ts` — 先定数据形状（Book/Chapter/Item/Row…），驱动后续所有代码。
  2. **composable** `app/composables/use<Module>*.ts` — 抽数据获取、筛选、状态动作，自动导入。
  3. **store**（可选）`app/stores/<module>.ts` — 仅跨页/持久状态才建；Pinia setup 风格 `defineStore('<module>', () => {...})`，末尾加 `acceptHMRUpdate`。
  4. **服务端接口**（可选）`server/api/<module>/*.get.ts` / `.post.ts` — Nitro 自动路由 `/api/<module>/*`，类型前后端共享。
  5. **组件** `app/components/<module>/` — 按功能分子目录，自动导入，子目录为命名空间前缀。
  6. **页面** `app/pages/<module>/index.vue` / `[id].vue` / `[...all].vue` — `definePageMeta({ layout })` 指定布局。
  7. **阅读类**额外复用 `prose` + 字号/主题 composable（见 reader-page 技能）。
- **产出物**：一个端到端完整的功能模块（类型→composable→store→接口→组件→页面），以及按固定格式的汇报（模块名、路由、目录树、数据流、响应式/暗色自测结论）。
- **关键约定（Checklist）**：
  - 数据获取用 `useFetch`/`useAsyncData`，不在 setup 顶层直接 `fetch`。
  - 客户端内容用 `<ClientOnly><Suspense #fallback>`。
  - 跨组件状态 `useState`，跨页/持久用 Pinia。
  - 移动优先 + 触控目标 ≥ 44px（`min-h-11 min-w-11`）。
  - 暗色模式覆盖关键可视元素。
  - 表格/图片/图表响应式宽度，无整页横向滚动。
  - `<script setup lang="ts">`；`defineProps<T>()` / `defineEmits<T>()`；禁用 `any`。
  - 图标用 `i-carbon-xxx` / `i-twemoji-xxx`；复用 `btn`/`icon-btn` 快捷类。
  - `pnpm typecheck` + `pnpm lint` 零报错。
  - 数据来源未指定时先用 `app/constants/` 或模块内示例数据占位。
  - 模块名用 kebab-case，目录与路由前缀一致。

### 2.3 reader-page — 阅读类页面模式

- **技能名**：`reader-page`
- **触发场景**：构建阅读器、小说阅读、长文排版时加载。适用于小说阅读器、古籍阅读、长文阅读。
- **核心工作流程/步骤**：
  1. **页面结构**：`index.vue` 为书籍列表（网格 `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`）；`[id].vue` 为阅读器（顶栏：返回/章节目录/字号/主题 + `prose` 正文 + 底栏：上一章/下一章/进度）。
  2. **composable 模板 `useReader`**：用 `useLocalStorage` 持久化字号（`ReaderSize: sm|base|lg|xl`）与主题（`ReaderTheme: light|sepia|dark`）；`sizeClass` 映射 `prose-sm`/`prose`/`prose-lg`/`prose-xl`；`themeClass` 处理 sepia（`bg-amber-50 text-stone-800`），dark 走全局 `html.dark`；`setTheme` 联动 `useColorMode()`。
  3. **阅读进度**：`useScroll` 取滚动百分比，`useIntersectionObserver` 判定当前章节；进度存 `useState('reader:progress:<bookId>')` 或 Pinia；进度条 `fixed top-0 h-1 bg-teal-600`。
  4. **章节导航**：上一章/下一章用 `<NuxtLink>`，边界章禁用；移动端目录抽屉/Sheet 风格，当前章高亮 `text-teal-600 font-bold`；章节列表走 `useFetch`/`useAsyncData`。
  5. 异步章节内容用 `<ClientOnly><Suspense #fallback>`。
- **产出物**：阅读器页面（列表 + 阅读器）+ `useReader` composable + 进度/导航实现。
- **关键约定**：
  - 容器 `prose dark:prose-invert max-w-none`（阅读器一般占满可用宽）。
  - 字号切换绑 `sizeClass`，主题切换绑 `themeClass` + 全局 color-mode。
  - 移动端正文 `px-4`，桌面 `max-w-3xl mx-auto`。
  - 段落间距由 `prose` 控制，不额外加 `my-*`。
  - 共享类型示例：`Chapter`（id/title/content/order）、`Book`（id/title/author/cover/intro/chapters）。

### 2.4 responsive-ui — 响应式 UI 模式

- **技能名**：`responsive-ui`
- **触发场景**：构建可视页面/组件、做响应式适配、或执行 `/responsive-audit` 时加载。
- **核心工作流程/步骤**：
  1. **断点体系**（presetWind4）：默认 <640（移动基线先写）、`sm:` 640、`md:` 768、`lg:` 1024、`xl:` 1280；写法如 `text-sm sm:text-base md:text-lg`、`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`。
  2. **触控目标**：可点击元素 ≥ 44×44px（`min-h-11 min-w-11`）；按钮间距 `gap-2` 起步防误触。
  3. **避免横向滚动**：容器 `max-w-* mx-auto`；图片/图表 `w-full max-w-full`；表格窄屏转卡片或 `overflow-x-auto` + 滚动提示；不在固定宽容器放 `whitespace-nowrap` 长内容。
  4. **导航**：PC 横向菜单 hover 展开下级（`right-0` 兜底）；移动端汉堡菜单只展示一级，点击展开下级，避免 hover；当前菜单高亮 `bg-teal-600 text-white`。
  5. **暗色模式**：`classSuffix: ''`，`html.dark` 触发；长文 `prose dark:prose-invert`，卡片 `bg-white dark:bg-dark-9` 等成对类；自测对比度可读。
  6. **自测三档视口**：≥360px（小手机）无溢出/错位/触控可达；768px（平板）网格合理重排；1024px（桌面）布局稳定无大块空白。
- **产出物**：覆盖移动 + 桌面的响应式页面/组件，以及三档视口自测结论。
- **关键约定（反模式禁令）**：
  - 禁止只写桌面样式再 `@media` 缩小（必须移动优先）。
  - 禁止移动端依赖 `hover:` 菜单（触屏无 hover）。
  - 禁止写死 `width: 800px`（用 `w-full max-w-[800px]`）。
  - 禁止暗色只改 body 背景、组件仍白底。

---

## 三、作用与价值

这组技能把项目中反复出现的工程模式沉淀为可复用规范，价值体现在：

1. **一致性**：无论谁（人或 AI）开发图表/模块/阅读器/响应式页面，都遵循同一套约定，产出风格统一。
2. **质量底线**：每个技能都内嵌 checklist 与反模式禁令（SSR 安全、内存泄漏、触控目标、暗色覆盖、横向溢出等），把易踩的坑前置规避。
3. **效率**：技能提供代码骨架与步骤模板，减少从零设计；new-module 的七件套顺序让模块搭建一次到位。
4. **场景驱动按需加载**：不常驻上下文，只在匹配场景注入，避免规则膨胀；与常驻 rules、手动 commands 分层互补。
5. **贴合项目栈**：所有示例均基于本项目的 Nuxt 4 + UnoCSS + VueUse + Pinia + color-mode 技术栈，可直接落地。

---

## 四、使用方式与关联

### 4.1 自动加载机制

Claude 在工作时读取各技能 `SKILL.md` 的 `description`，当当前任务语义匹配时自动加载该技能正文指令。用户无需手动调用，正常描述需求即可（如"加一个销售数据图表""新建一个百科模块""做个小说阅读器""检查这个页面移动端适配"）。

### 4.2 与 commands 的关联

部分技能对应同名/相关命令，命令为手动入口、技能为执行规范：

- `/new-module` 命令 → 走 new-module 技能的七件套流程。
- `/responsive-audit` 命令 → 加载 responsive-ui 技能作为审查规范。
- `/new-page`、`/new-component`、`/new-composable` 命令 → 与 new-module 技能的子步骤对应（单文件创建）。

### 4.3 与 agents 的关联

agents 是可委派的子代理，技能是其执行依据：

- `feature-builder` agent 执行模块搭建时遵循 new-module 技能规范。
- `content-reader-builder` agent 构建阅读器时遵循 reader-page 技能规范。
- `responsive-reviewer` agent 审查响应式时依据 responsive-ui 技能的断点/触控/暗色标准。

### 4.4 与 rules 的关联

技能是 rules 的场景化展开：

- responsive-ui 技能细化 `.claude/rules/responsive.md` 的响应式约定。
- new-module 技能落地 `.claude/rules/module-structure.md` 的模块结构约定。
- 各技能引用的 TypeScript/UnoCSS/Nuxt 约定对应 `.claude/rules/` 下相应规则文件。

### 4.5 技能间协作

- new-module 模块脚手架的第 7 步阅读类直接复用 reader-page 技能。
- chart-component 技能的配色部分交由内置 `dataviz` 技能，工程集成部分自洽。
- 任意可视页面/组件的响应式与暗色均以 responsive-ui 技能为基线。

---

## 五、技能一览表

| 技能 | 触发场景 | 核心产出 |
| --- | --- | --- |
| chart-component | 构建数据可视化、图表、dashboard | SSR 安全 + 响应式尺寸 + 暗色适配的图表 Vue 组件（ClientOnly 包裹、动态 import、resize/dispose 处理） |
| new-module | "新增模块""搭建 XX 模块""/new-module" | 端到端完整功能模块（类型→composable→store→接口→组件→页面，七件套）+ 汇报 |
| reader-page | 构建阅读器、小说阅读、长文排版 | 阅读器页面（列表 + 阅读器）+ useReader composable + 进度/章节导航 |
| responsive-ui | 构建可视页面/组件、响应式适配、/responsive-audit | 移动优先的响应式页面/组件 + 三档视口自测结论（覆盖断点/触控/横向滚动/暗色） |
