# `.claude/agents/` 自定义子代理介绍

本目录存放 4 个专门化子代理（subagent）定义，分别负责端到端模块搭建、单组件构建、阅读器构建与响应式审查，协同覆盖本项目从"整模块"到"单组件"再到"质量审查"的完整开发链路。

---

## 一、目录概述

### 1.1 子代理机制的作用

Claude Code 支持将专门化任务委派给**子代理（subagent）**执行。每个子代理拥有：

- 一段独立的**系统提示**——限定其职责范围与工作约定；
- 一个特定的**工具集**——只开放完成任务所需的最少工具，避免越权；
- 一个 `model` 设定——本目录全部为 `inherit`，即继承父会话当前所用模型。

当主会话遇到属于某子代理职责的任务时，可自动（或由用户显式指定 `subagent_type`）派发该任务；子代理在后台执行完毕后，将结论回传给主会话。这样做的好处是：主会话上下文保持干净（不被大量文件读取占满），且每个任务由"专精且守约"的代理处理，输出更可控。

### 1.2 frontmatter 字段含义

每个 `.md` 文件以 YAML frontmatter 开头，字段含义如下：

| 字段 | 含义 |
| --- | --- |
| `name` | 子代理唯一标识，即 `subagent_type` 取值，用于触发委派。 |
| `description` | 一句话职责描述，主会话据此判断是否将任务委派给该代理。 |
| `model` | 使用的模型；本目录均为 `inherit`（继承父会话模型）。 |
| `tools` | 该代理可用的工具白名单。不在列表中的工具不可调用——这是权限与职责边界的硬约束。 |

frontmatter 之后的正文是子代理的**系统提示**，包含定位说明、核心约定、结构规范与工作流程。

### 1.3 本目录文件清单

| 文件 | name | 工具集 | 是否可写 |
| --- | --- | --- | --- |
| `feature-builder.md` | `feature-builder` | Read, Write, Edit, Glob, Grep, Bash | 可写 |
| `vue-component-builder.md` | `vue-component-builder` | Read, Write, Edit, Glob, Grep, Bash | 可写 |
| `content-reader-builder.md` | `content-reader-builder` | Read, Write, Edit, Glob, Grep, Bash | 可写 |
| `responsive-reviewer.md` | `responsive-reviewer` | Read, Glob, Grep, Bash | **只读** |

一个关键差异：前三个代理持有 `Write`/`Edit`，能创建和修改代码文件；`responsive-reviewer` 只持有 `Read`/`Glob`/`Grep`/`Bash`，**无法改动任何文件**，这与其"只读审查、不改代码"的定位完全一致。

---

## 二、各文件详解

### 2.1 `feature-builder.md` — 模块搭建专家

- **name**：`feature-builder`
- **定位**：端到端落地一个完整功能模块，覆盖页面、组件、composable、store、类型、服务端接口的协同开发。
- **可用工具**：Read, Write, Edit, Glob, Grep, Bash
- **依据规范**：遵循 `/new-module` 脚手架流程与 `.claude/rules/module-structure.md`。

#### 模块七件套（结构规范）

1. `app/pages/<module>/` — 页面与子路由（`index.vue`、`[id].vue`、`[...all].vue`），用 `definePageMeta({ layout })` 指定布局。
2. `app/components/<module>/` — 模块组件（自动导入，子目录为命名空间前缀）。
3. `app/composables/use<Module>*.ts` — 模块逻辑（自动导入）。
4. `app/stores/<module>.ts` — 跨页持久状态（Pinia setup 风格 `defineStore('x', () => {...})`）。
5. `server/api/<module>/` — Nitro 接口（自动 `/api/<module>/*`，前后端共享类型）。
6. `app/types/<module>.ts` — 共享类型。
7. 阅读类模块复用 `prose` + 字号/主题 composable（引用 `.claude/skills/reader-page`）。

#### 核心约定

- 数据获取用 `useFetch`/`useAsyncData`（SSR 友好），不在 setup 顶层直接 `fetch`。
- 客户端内容用 `<ClientOnly><Suspense #fallback>...</Suspense></ClientOnly>`。
- 跨组件状态用 `useState('key', () => init)`；跨页/持久用 Pinia。
- 移动优先响应式 + 暗色覆盖（引用 `.claude/rules/responsive.md`）。
- 严格 TypeScript，禁用 `any`（引用 `.claude/rules/typescript.md`）。

#### 工作流程

1. 与用户确认模块名、路由、数据来源、是否需要后端。
2. 先建类型与 composable/store，再建组件，最后建页面接线。
3. 跑 `pnpm typecheck` + `pnpm lint`，零报错。
4. 汇报：目录树、路由表、数据流、响应式/暗色自测结论。

#### 典型使用场景

需要新建一个完整业务模块时（例如"做一个图片画廊模块""搭建百科模块"），由该代理统一完成从类型到接口的全套文件落地。

---

### 2.2 `vue-component-builder.md` — Vue 组件构建专家

- **name**：`vue-component-builder`
- **定位**：构建**单个** Vue 3 组件，遵循 UnoCSS 原子类 + attributify + 自动导入约定，不涉及整页或整模块搭建。
- **可用工具**：Read, Write, Edit, Glob, Grep, Bash

#### 硬性约定

- `<script setup lang="ts">`；props 用 `defineProps<T>()`、emits 用 `defineEmits<T>()`，不写运行时字面量对象。
- 样式用 UnoCSS 原子类 + attributify（如 `<div btn text-gray:80 px-4>`），不写 `<style>` 长串。
- 复用快捷类 `btn`、`icon-btn`（定义在 `uno.config.ts`）；新增快捷类加到 `shortcuts`，不在组件里重复长串类名。
- 图标用 `i-carbon-xxx` / `i-twemoji-xxx`（纯 CSS，无需 import）。
- 暗色用 `dark:` 变体（`html.dark` 触发，`classSuffix: ''`）。
- 组件放 `app/components/<module>/`，自动导入；子目录为命名空间前缀（如 `gallery/Thumb.vue` → `<GalleryThumb>`）。
- 触控目标 ≥ 44px（`min-h-11 min-w-11`）；移动优先，`sm:`/`md:`/`lg:` 增强。
- 禁用 `any`，用 `unknown` + 收窄；可空数据在模板用 `v-if` 守卫。

#### 工作流程

1. Read 目标位置与相邻组件，对齐命名/风格。
2. 写组件，props/emits 严格类型。
3. 需共享类型时放 `app/types/<module>.ts`。
4. 跑 `pnpm typecheck` 与 `pnpm lint` 自检。
5. 汇报：文件路径、props/emits 清单、响应式与暗色覆盖说明。

#### 职责边界（显式声明）

不搭整页路由、不建 store/server 接口——那些交给 `feature-builder`。

#### 典型使用场景

需要单独创建一个展示型或交互型组件时（例如"做一个图片缩略图卡片""做一个分页器组件"），由该代理产出符合项目风格的单个 `.vue` 文件。

---

### 2.3 `content-reader-builder.md` — 阅读类模块构建专家

- **name**：`content-reader-builder`
- **定位**：构建古籍/小说/长文等阅读类模块，产出符合阅读体验的页面与 composable。
- **可用工具**：Read, Write, Edit, Glob, Grep, Bash

#### 核心约定

- 长文用 `prose` 容器（presetTypography），`prose-sm`/`prose-lg` 调字号，`dark:prose-invert` 适配暗色。
- **字号控制**：composable 暴露 `size`（sm/base/lg/xl）与 `setSize`，应用到 `prose-${size}` 或自定义 `--reader-size` CSS 变量。
- **主题控制**：`light`/`sepia`/`dark`；sepia 用自定义背景类（如 `bg-amber-50 text-stone-800`）。
- **章节导航**：上一章/下一章、章节目录抽屉；当前章高亮。
- **阅读进度**：`useScroll` 或 `useIntersectionObserver` 计算百分比，存 `useState` 或 Pinia 跨页恢复。
- **字体**：serif=DM Serif Display（标题），正文 sans/serif 可切换。

#### 结构（遵循模块七件套）

- `app/pages/<module>/index.vue` — 书籍列表
- `app/pages/<module>/[id].vue` — 阅读器（章节 + 进度 + 字号控制）
- `app/composables/useReader.ts` — 字号/主题/进度逻辑
- `app/stores/<module>.ts` — 阅读进度持久化
- `app/types/<module>.ts` — Book/Chapter 类型

#### 工作流程

1. 确认数据来源（示例书籍/后端接口）。
2. 建类型 → composable → 组件 → 页面。
3. 移动优先 + 暗色覆盖自测。
4. `pnpm typecheck` + `pnpm lint` 零报错。
5. 汇报：目录树、字号/主题切换说明、进度恢复机制。

#### 典型使用场景

需要搭建小说阅读器、古籍阅读等长文场景时，由该代理产出带字号/主题控制、章节导航与阅读进度恢复的完整阅读器模块。

---

### 2.4 `responsive-reviewer.md` — 响应式审查员

- **name**：`responsive-reviewer`
- **定位**：**只读**审查页面/组件的 PC + 移动端响应式与暗色模式，输出问题清单与修复建议，不修改任何代码。
- **可用工具**：Read, Glob, Grep, Bash（**无 Write/Edit**，从工具层面保证只读）

#### 审查清单

- **断点覆盖**：移动端默认样式是否存在；`sm:`(640)/`md:`(768)/`lg:`(1024) 是否合理增强。
- **横向溢出**：≥360px 视口下是否有整页横向滚动；表格/图片/图表是否 `w-full`/`max-w-full` 或 `overflow-x-auto`。
- **触控目标**：按钮/链接 ≥ 44px（`min-h-11 min-w-11`）；间距足够。
- **表格窄屏**：是否转卡片或加滚动提示。
- **暗色模式**：关键可视元素是否都有 `dark:` 覆盖；对比度是否可读。
- **导航**：移动端是否汉堡菜单；hover 菜单在触屏是否失效。
- **字号**：是否响应式（`text-sm sm:text-base`、`prose sm:prose-lg`）。

#### 工作流程

1. Read 目标页面/组件（含布局、所用组件）。
2. 逐项核对，记录 `文件:行号` 与问题。
3. 输出问题清单（按严重度排序）+ 具体修复建议（给出类名/结构改法）。
4. **不修改任何文件**。

#### 报告格式

每条 = 严重度 / 文件:行 / 问题 / 建议改法。

#### 典型使用场景

模块或组件开发完成后，派该代理做上线前的响应式与暗色模式体检；也可用于审查既有页面的移动端适配缺陷。由于工具层面不持有写权限，可安全地用于"只看不动"的评审环节。

---

## 三、作用与价值

这 4 个子代理在项目中形成清晰的分工协同：

| 维度 | 负责代理 | 产出 |
| --- | --- | --- |
| **整模块搭建** | `feature-builder` | 页面 + 组件 + composable + store + 类型 + 服务端接口（七件套） |
| **单组件构建** | `vue-component-builder` | 符合 UnoCSS/attributify 约定的单个 `.vue` 组件 |
| **阅读器构建** | `content-reader-builder` | 带 prose 排版、章节导航、进度恢复、字号/主题控制的阅读类模块 |
| **质量审查** | `responsive-reviewer` | 响应式与暗色模式的问题清单 + 修复建议（只读） |

价值体现在三点：

1. **职责分层，边界清晰**：`feature-builder` 管"整模块"，`vue-component-builder` 管"单组件"，二者在提示中显式声明边界（后者明确"不搭整页路由、不建 store/server 接口——那些交给 feature-builder"），避免重复劳动与越权。
2. **专精守约**：每个代理的系统提示内嵌了项目硬性约定（UnoCSS 风格、TS 严格类型、移动优先、暗色覆盖、模块七件套等），并要求产出前自跑 `pnpm typecheck` + `pnpm lint`，从源头保证产出符合项目规范。
3. **安全审查闭环**：`responsive-reviewer` 通过工具白名单（无 Write/Edit）实现"只读不改"，可作为模块开发后的独立质检环节，与前面三个"可写"代理形成"构建 → 审查"的闭环。

典型协同路径：`feature-builder` 搭建模块骨架 → `vue-component-builder` 补充细粒度组件 → `content-reader-builder` 专门承接阅读类模块 → `responsive-reviewer` 做上线前响应式与暗色体检。

---

## 四、使用方式

### 4.1 触发方式

子代理可由两种方式触发：

1. **Claude 自动委派**：主会话根据任务描述与各代理的 `description` 自动判断是否委派。例如用户说"帮我新建一个百科模块"，主会话可识别为整模块开发，委派给 `feature-builder`。
2. **用户显式指定**：通过 Agent 工具的 `subagent_type` 参数指定代理类型，例如 `subagent_type: "responsive-reviewer"` 强制使用响应式审查员。

### 4.2 与 skills / commands 的关系

子代理与 `.claude/skills/`、`.claude/commands/` 共同构成项目的自定义资源体系，三者分工不同：

| 资源 | 性质 | 作用 |
| --- | --- | --- |
| **agents**（本目录） | 独立运行的子代理 | 把整块任务委派出去，自带工具集与系统提示，后台执行并回传结论 |
| **skills**（`.claude/skills/`） | 可加载的指令包 | 在当前会话中注入某类任务的操作范式（如 `new-module`、`reader-page`、`responsive-ui`、`chart-component`），不另开代理 |
| **commands**（`.claude/commands/`） | 斜杠命令 | 用户主动触发的快捷指令（如 `/new-module`、`/new-component`、`/responsive-audit`、`/lint-fix`），通常会加载对应 skill |

子代理的提示中多处引用 skills 与 rules：例如 `feature-builder` 引用 `/new-module` 脚手架与 `.claude/rules/module-structure.md`；`content-reader-builder` 引用 `.claude/skills/reader-page`。也就是说，**子代理是"执行者"，skills/rules 是"它遵守的方法论"**——子代理在被委派任务后，会按照 skills 与 rules 中定义的规范来落地代码。

### 4.3 注意事项

- 本目录 4 个代理的 `model` 均为 `inherit`，实际使用的模型随父会话而定。
- 除 `responsive-reviewer` 外，其余三个代理均可创建/修改文件；如需"只看不动"的评审，应优先选用 `responsive-reviewer`。
- 子代理执行完毕后，结论会回传主会话；文件读取等中间过程不占主会话上下文，适合处理需要遍历多文件的复杂任务。
