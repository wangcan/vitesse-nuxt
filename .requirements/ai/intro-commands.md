# `.claude/commands/` 自定义斜杠命令介绍

> 一句话概述：本目录存放 6 个可复用的斜杠命令（slash commands），把"新建页面/组件/composable/模块、lint 修复、响应式审查"等重复性开发工作流封装成 prompt 模板，用户在 Claude Code 中以 `/命令名 参数` 触发即可执行对应流程。

## 一、目录概述

### 1.1 这是什么

`.claude/commands/` 是 Claude Code 的自定义斜杠命令目录。目录下每个 `.md` 文件对应一条命令，文件名去掉 `.md` 即为命令名（如 `new-page.md` → `/new-page`）。用户在对话中输入 `/命令名` 即可触发该命令预设的工作流，从而把高频、重复的开发动作标准化、可复用。

### 1.2 斜杠命令机制的作用

斜杠命令本质上是一段被封装好的 prompt 模板。当用户输入 `/命令名 参数` 时：

- Claude Code 读取对应 `.md` 文件内容；
- 将 frontmatter 中的 `argument-hint` 作为参数提示，正文中的 `$1`、`$2` 等占位符替换为用户传入的实际参数；
- 把替换后的正文作为指令交给 Claude 执行。

这样做的价值在于：把"创建一个符合项目规范的页面/组件/模块"这类多步骤、强约束的工作流固化下来，避免每次都手工描述要求、也避免遗漏约定。

### 1.3 frontmatter 与正文的含义

每个命令文件由两部分组成：

- **frontmatter（YAML 头部，`---` 包裹）**：
  - `description`：命令的一句话用途说明，会在命令列表中展示，帮助用户识别命令作用。
  - `argument-hint`（多数命令带有）：参数提示，告诉用户该命令期望接收哪些参数及格式，如 `"[组件名/路径，如 gallery/Thumb] [用途]"`。
- **正文（Markdown 指令）**：命令被触发后实际交给 Claude 执行的 prompt。正文通过 `$1`、`$2` 等占位符引用用户传入的参数，并明确执行步骤、需遵守的约定、完成后需跑的校验命令与汇报内容。

> 说明：`lint-fix.md` 较特殊，它不带 `argument-hint`，因为其目标是"当前 git 工作区改动"这一隐式上下文，无需用户传参。

## 二、各命令详解

### 2.1 `lint-fix.md` — 对当前改动运行 eslint --fix

- **命令名**：`/lint-fix`
- **用途**：对当前 git 工作区中改动的文件运行 `eslint --fix`，自动修复 lint 问题并汇报结果。
- **触发方式**：`/lint-fix`（无需参数，自动针对当前改动）。
- **frontmatter**：`description: 对当前改动运行 eslint --fix 并汇报`（无 `argument-hint`）。
- **执行流程**：
  1. `git status --short` 列出改动的 `.vue`/`.ts`/`.tsx`/`.js`/`.mjs` 文件。
  2. 对这些文件运行 `pnpm eslint --fix <files>`。
  3. 汇报：修复了哪些文件、剩余报错（按 `文件:行:列` 列出）、是否还有需手动处理的问题。
  4. 若仍有报错，给出具体修复建议。
- **产出物**：lint 修复结果汇报（修复文件清单、剩余报错清单、修复建议）。
- **约束**：不提交代码，只修 lint，不改业务逻辑。

### 2.2 `new-component.md` — 脚手架新建一个 Vue 组件

- **命令名**：`/new-component`
- **用途**：按项目约定创建一个新的 Vue 组件。
- **触发方式**：`/new-component [组件名/路径，如 gallery/Thumb] [用途]`。
- **frontmatter**：`description: 脚手架新建一个 Vue 组件`；`argument-hint: "[组件名/路径，如 gallery/Thumb] [用途]"`。
- **执行流程**：委托 `vue-component-builder` 子代理创建 `app/components/$1.vue`（`$1` 为组件名/路径，`$2` 为用途说明）。
- **约束要求**：
  - `<script setup lang="ts">`；`defineProps<T>()` / `defineEmits<T>()`，禁用 `any`。
  - UnoCSS 原子类 + attributify；复用 `btn`/`icon-btn` 快捷类；图标用 `i-carbon-xxx` / `i-twemoji-xxx`。
  - 自动导入：子目录为命名空间前缀（如 `gallery/Thumb.vue` → `<GalleryThumb>`）。
  - 移动优先 + 暗色 `dark:` 覆盖；触控目标 ≥ 44px（`min-h-11 min-w-11`）。
- **产出物**：组件文件 `app/components/$1.vue`；汇报文件路径、props/emits 清单、自动导入标签名。

### 2.3 `new-composable.md` — 脚手架新建一个 composable

- **命令名**：`/new-composable`
- **用途**：按项目约定创建一个新的 composable 函数。
- **触发方式**：`/new-composable [名称，如 useBook] [职责]`。
- **frontmatter**：`description: 脚手架新建一个 composable`；`argument-hint: "[名称，如 useBook] [职责]"`。
- **执行流程**：创建 `app/composables/$1.ts`（自动导入，无需手动 import）。
- **约束要求**：
  - 严格 TS，禁用 `any`；入参与返回显式类型。
  - SSR 友好：不在模块顶层访问 `window`/`document`；客户端 API 用 `import.meta.client` 守卫或 VueUse（`useLocalStorage`/`useScroll` 等自动 SSR 安全）。
  - 跨组件状态用 `useState('key', () => init)`；跨页持久用 Pinia store。
  - 优先复用 VueUse，不重复造轮子。
- **产出物**：composable 文件 `app/composables/$1.ts`；汇报文件路径与导出签名。

### 2.4 `new-module.md` — 脚手架新建一个完整功能模块（七件套）

- **命令名**：`/new-module`
- **用途**：端到端搭建一个完整功能模块，覆盖类型、逻辑、状态、接口、组件、页面等全套结构。
- **触发方式**：`/new-module [模块名，如 novel 或 gallery] [功能简述]`。
- **frontmatter**：`description: 脚手架新建一个完整功能模块（七件套）`；`argument-hint: "[模块名，如 novel 或 gallery] [功能简述]"`。
- **执行流程**：加载 `new-module` 技能，按七件套顺序搭建模块 `$1`：
  1. `app/types/<module>.ts` — 类型定义
  2. `app/composables/use<Module>*.ts` — 模块逻辑
  3. `app/stores/<module>.ts`（需要时） — Pinia 持久状态
  4. `server/api/<module>/`（需要时） — Nitro 服务端接口
  5. `app/components/<module>/` — 模块组件
  6. `app/pages/<module>/` — 页面与路由
  7. 阅读类模块复用 `prose` + `reader-page` 技能
- **约束要求**：数据来源未指定时用示例数据占位；移动优先 + 暗色覆盖 + 严格 TS。
- **产出物**：按"七件套"生成的完整模块目录结构；按技能中的"产出汇报格式"汇报。完成后跑 `pnpm typecheck` + `pnpm lint` 零报错。

### 2.5 `new-page.md` — 脚手架新建一个页面

- **命令名**：`/new-page`
- **用途**：按项目约定创建一个新的页面文件（含路由）。
- **触发方式**：`/new-page [路由路径，如 about 或 docs/guide] [页面用途]`。
- **frontmatter**：`description: 脚手架新建一个页面`；`argument-hint: "[路由路径，如 about 或 docs/guide] [页面用途]"`。
- **执行流程**：为新页面创建文件 `app/pages/$1`（补全为 `.vue`，含必要父目录）。
- **约束要求**：
  - `<script setup lang="ts">`，`definePageMeta({ layout: 'default' })`（按用途选 default/home）。
  - 移动优先响应式 + 暗色覆盖（遵循 `.claude/rules/responsive.md`）。
  - 样式用 UnoCSS 原子类 + attributify；图标 `i-carbon-xxx`。
  - 异步内容用 `<ClientOnly><Suspense #fallback>…</Suspense></ClientOnly>`；数据用 `useFetch`/`useAsyncData`。
  - 禁用 `any`，严格类型。
- **产出物**：页面文件 `app/pages/$1.vue`；汇报文件路径与路由地址。

### 2.6 `responsive-audit.md` — 审查响应式与暗色模式

- **命令名**：`/responsive-audit`
- **用途**：审查目标页面/组件的 PC + 移动端响应式与暗色模式实现，输出问题清单与修复建议。
- **触发方式**：`/responsive-audit [目标文件或目录]`。
- **frontmatter**：`description: 审查目标页面/组件的响应式与暗色模式`；`argument-hint: "[目标文件或目录]"`。
- **执行流程**：委托 `responsive-reviewer` 子代理审查目标 `$1`（页面/组件/目录）。
- **审查清单**（依据 `.claude/skills/responsive-ui` 与 `.claude/rules/responsive.md`）：
  - 断点覆盖（移动优先，sm/md/lg 合理增强）
  - 横向溢出（≥360px 无整页滚动；表格/图片/图表响应式）
  - 触控目标（≥44px，间距）
  - 表格窄屏（卡片或 `overflow-x-auto`）
  - 暗色模式（关键元素 `dark:` 覆盖，对比度可读）
  - 导航（移动端汉堡菜单，hover 不依赖触屏）
  - 字号响应式
- **产出物**：问题清单（含严重度 / `文件:行` / 问题 / 建议改法），**不改代码**。

## 三、作用与价值

这 6 个命令在本项目的开发协同中形成了一条"模块化开发闭环"：

1. **脚手架新建（4 条）**：`/new-page`、`/new-component`、`/new-composable`、`/new-module` 覆盖了从单文件到整模块的新建需求。其中 `/new-module` 是最重的一级，端到端搭建"七件套"模块；其余三条面向单文件新建，分别对应页面、组件、composable 三个粒度。新建命令统一强制项目约定（`<script setup lang="ts">`、UnoCSS 原子类、移动优先、暗色覆盖、严格 TS、禁用 `any`、SSR 友好数据获取），保证产出物风格一致、可直接通过 `pnpm typecheck` 与 `pnpm lint`。
2. **质量修复（1 条）**：`/lint-fix` 针对当前 git 改动运行 `eslint --fix` 并汇报，是开发过程中快速收敛 lint 问题的入口，与项目 `.claude/hooks/lint-edited.mjs`（编辑后自动 eslint --fix）形成"自动 + 手动"双重保障。
3. **响应式审查（1 条）**：`/responsive-audit` 对已有代码做只读审查，输出问题清单与修复建议，是交付前的质量关卡，确保 PC + 移动端 + 暗色模式均达标。

三者合起来覆盖了"新建 → 修复 → 审查"的完整链路：新建时即遵循规范，开发中用 `/lint-fix` 快速修复，交付前用 `/responsive-audit` 做响应式与暗色体检，形成闭环。

## 四、使用方式与关联

### 4.1 如何调用

在 Claude Code 对话中输入 `/命令名` 即可触发。带参数的命令按 `argument-hint` 提示传入参数，例如：

- `/new-page about 关于本站` — 在 `app/pages/about.vue` 新建"关于本站"页面。
- `/new-component gallery/Thumb 画廊缩略图` — 创建 `app/components/gallery/Thumb.vue`（自动导入标签 `<GalleryThumb>`）。
- `/new-composable useBook 书籍数据加载与状态` — 创建 `app/composables/useBook.ts`。
- `/new-module novel 小说阅读模块` — 端到端搭建 novel 模块七件套。
- `/responsive-audit app/pages/novel` — 审查 novel 页面目录的响应式与暗色实现。
- `/lint-fix` — 对当前改动运行 eslint --fix（无需参数）。

### 4.2 与 agents / skills / rules 的关联

命令本身是"调度入口"，实际执行常委托给子代理或加载技能，并引用规则文件作为约束来源：

| 命令 | 关联子代理（agents） | 关联技能（skills） | 关联规则（rules） |
| --- | --- | --- | --- |
| `/new-component` | `vue-component-builder` | — | `unocss-style.md`、`responsive.md`、`typescript.md`、`nuxt-conventions.md` |
| `/new-composable` | — | — | `typescript.md`、`nuxt-conventions.md` |
| `/new-module` | （由技能内部协调，可涉及 `feature-builder`、`content-reader-builder` 等） | `new-module`、`reader-page`（阅读类模块） | `module-structure.md` 及其 `@` 引入的全部规则 |
| `/new-page` | — | — | `responsive.md`、`unocss-style.md`、`typescript.md`、`nuxt-conventions.md` |
| `/responsive-audit` | `responsive-reviewer` | `responsive-ui` | `responsive.md` |
| `/lint-fix` | — | — | `eslint.config.js`（项目 lint 配置） |

补充说明：

- **技能（skills）**：`/new-module` 显式"加载 `new-module` 技能"，技能内部定义了七件套的详细搭建流程与"产出汇报格式"。阅读类模块还会复用 `reader-page` 技能（prose 排版 + 字号/主题控制）。
- **子代理（agents）**：`/new-component` 委托 `vue-component-builder`，`/responsive-audit` 委托 `responsive-reviewer`。子代理是具备专门工具与职责范围的执行体，命令负责把参数与约束传给它。
- **规则（rules）**：命令正文中直接引用规则文件（如 `.claude/rules/responsive.md`、`.claude/rules/module-structure.md`），把项目约定作为硬约束注入执行过程，确保产出物合规。
- **钩子（hooks）**：`.claude/hooks/lint-edited.mjs` 在编辑 `.vue`/`.ts` 后自动 `eslint --fix`，与 `/lint-fix` 互为补充——前者是被动触发，后者是主动批量修复并汇报。

## 五、命令一览表

| 命令名 | 用途 | 触发参数 | 关联资源（子代理 / 技能 / 规则） |
| --- | --- | --- | --- |
| `/lint-fix` | 对当前 git 改动运行 eslint --fix 并汇报 | 无（针对当前工作区改动） | `eslint.config.js`；与 `.claude/hooks/lint-edited.mjs` 互补 |
| `/new-component` | 脚手架新建一个 Vue 组件 | `[组件名/路径] [用途]` | 子代理 `vue-component-builder`；规则 `unocss-style.md` / `responsive.md` / `typescript.md` / `nuxt-conventions.md` |
| `/new-composable` | 脚手架新建一个 composable | `[名称，如 useBook] [职责]` | 规则 `typescript.md` / `nuxt-conventions.md` |
| `/new-module` | 脚手架新建一个完整功能模块（七件套） | `[模块名] [功能简述]` | 技能 `new-module` / `reader-page`；规则 `module-structure.md`（含全部 `@` 引入规则） |
| `/new-page` | 脚手架新建一个页面 | `[路由路径] [页面用途]` | 规则 `responsive.md` / `unocss-style.md` / `typescript.md` / `nuxt-conventions.md` |
| `/responsive-audit` | 审查目标页面/组件的响应式与暗色模式 | `[目标文件或目录]` | 子代理 `responsive-reviewer`；技能 `responsive-ui`；规则 `responsive.md` |
