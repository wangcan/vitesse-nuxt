# init-claude.md — Claude 配置完善处理结果

> 对应需求：`.requirements/ai/ai.txt` 中的 **需求1**。
> 需求文件第 17 行 `忽略以下全部需求` 使需求 2–9 全部豁免，故仅执行需求1。

## 需求1 摘要

在 vitesse-nuxt（Nuxt 4）基础上，结合技术栈与给定目录结构，完善 Claude 相关设置：生成 `agents` / `skills` / `rules` / `commands` / `hooks` 等文件，处理结果存入 `.requirements/ai/init-claude.md`（本文件）。

## 执行结果总览

| 需求1 要求 | 状态 | 说明 |
| --- | --- | --- |
| `CLAUDE.md` | ✅ 已有 | 项目核心指令，此前已写，引用 5 个 rules 文件（现已全部存在） |
| `.claude/settings.json` | ⚠️ 待用户审核 | 见下方"settings.json 说明" |
| `.claude/settings.local.json` | ✅ 已建 | 本地个人覆盖模板（Git 忽略） |
| `.claude/agents/` | ✅ 已建 | 4 个子代理 |
| `.claude/skills/` | ✅ 已建 | 4 个技能 |
| `.claude/rules/` | ✅ 已补齐 | 此前仅 2 个，补 3 个后共 5 个 |
| `.claude/commands/` | ✅ 已建 | 6 个斜杠命令 |
| `.claude/hooks/` | ✅ 已有 | `lint-edited.mjs`（编辑后自动 eslint --fix） |

## 完整目录树（本次最终状态）

```
CLAUDE.md                          # 项目核心指令
.claude/
├── settings.json                  # ⚠️ 待用户审核（见下）
├── settings.local.json            # 本地覆盖（Git 忽略）
├── agents/
│   ├── feature-builder.md         # 端到端模块搭建
│   ├── responsive-reviewer.md     # 响应式只读审查
│   ├── vue-component-builder.md   # 单组件构建
│   └── content-reader-builder.md  # 阅读类模块构建
├── skills/
│   ├── new-module/SKILL.md        # 模块七件套脚手架
│   ├── responsive-ui/SKILL.md     # 响应式 UI 模式
│   ├── reader-page/SKILL.md       # 阅读页模式 + useReader 模板
│   └── chart-component/SKILL.md   # 图表组件集成模式
├── rules/
│   ├── nuxt-conventions.md        # Nuxt 4 约定（已有）
│   ├── unocss-style.md            # UnoCSS 样式约定（已有）
│   ├── responsive.md              # 响应式约定（新增）
│   ├── typescript.md              # TS 约定（新增）
│   └── module-structure.md        # 模块目录结构约定（新增）
├── commands/
│   ├── new-page.md                # /new-page
│   ├── new-component.md           # /new-component
│   ├── new-composable.md          # /new-composable
│   ├── new-module.md              # /new-module
│   ├── lint-fix.md                # /lint-fix
│   └── responsive-audit.md        # /responsive-audit
└── hooks/
    └── lint-edited.mjs            # PostToolUse: 编辑 .vue/.ts 后 eslint --fix
```

## 各部分说明

### rules（5 个）
- `nuxt-conventions.md` — Nuxt 4 `app/` 目录、自动导入、文件路由、布局、`useState`/Pinia、`useFetch`/`useAsyncData`、`<ClientOnly>`、Nitro 接口。
- `unocss-style.md` — 原子类 + attributify、`shortcuts`（`btn`/`icon-btn`）、`i-carbon-*`/`i-twemoji-*`、`dark:` 变体、`prose` 长文、字体、变体组、`--at-apply`。
- `responsive.md`（新增）— 移动优先、断点表、触控目标 ≥44px、避免横向滚动、移动汉堡菜单、暗色覆盖、自测三档视口。
- `typescript.md`（新增）— 严格类型禁 `any`、`defineProps<T>()`/`defineEmits<T>()`、共享类型位置、Nitro 自动类型、setup 风格 Pinia、`pnpm typecheck`。
- `module-structure.md`（新增）— 模块七件套目录约定，与 `new-module` 技能/命令对齐。

> 此前 `CLAUDE.md` 用 `@` 引入 5 个 rules，但 `responsive`/`typescript`/`module-structure` 三个文件缺失，导致它们无法加载（`/context` 仅显示 2 个）。现已补齐，5 个 rules 全部可加载。

### agents（4 个）
| 子代理 | 职责 | 工具 |
| --- | --- | --- |
| `vue-component-builder` | 构建单个 Vue 3 组件，严格遵循 UnoCSS+attributify+自动导入 | Read/Write/Edit/Glob/Grep/Bash |
| `feature-builder` | 端到端搭建模块（七件套），跨文件协同 | Read/Write/Edit/Glob/Grep/Bash |
| `responsive-reviewer` | 只读审查响应式与暗色模式，输出问题清单 | Read/Glob/Grep/Bash（无 Write/Edit） |
| `content-reader-builder` | 阅读类模块（古籍/小说）：prose、章节导航、进度、字号/主题 | Read/Write/Edit/Glob/Grep/Bash |

### skills（4 个）
| 技能 | 触发 | 内容 |
| --- | --- | --- |
| `new-module` | "新增模块""/new-module" | 七件套顺序、约定 checklist、汇报格式 |
| `responsive-ui` | 构建可视页/响应式适配/`/responsive-audit` | 断点表、触控目标、表格窄屏、导航、暗色、自测、反模式 |
| `reader-page` | 阅读器/小说/长文 | `useReader` composable 模板（字号/主题/进度）、章节导航、排版、类型示例 |
| `chart-component` | 图表/数据可视化/dashboard | SSR 安全（ClientOnly+动态 import）、响应式尺寸、暗色重渲染、组件骨架；配色交由内置 `dataviz` 技能 |

### commands（6 个）
`/new-page`、`/new-component`、`/new-composable`、`/new-module`、`/lint-fix`、`/responsive-audit`。
其中 `/new-component`、`/responsive-audit` 分别委托 `vue-component-builder`、`responsive-reviewer` 子代理；`/new-module` 加载 `new-module` 技能。

### hooks（1 个）
`lint-edited.mjs` — `PostToolUse` 钩子，Edit/Write 之后对改动的 `.vue`/`.ts`/`.tsx`/`.js`/`.mjs`/`.cjs` 运行 `pnpm eslint --fix`，始终退出 0 不阻塞，eslint 输出作为反馈。**此钩子需在 `settings.json` 中挂载才生效**（见下）。

## settings.json 说明（待用户审核）

写入 `settings.json` 时被 Claude Code 的 auto-mode 分类器两次拦截：
1. 含 `git add/commit/checkout` 等 allow 规则 → 判定为"代理自行扩大自身权限"。
2. 改为仅 hooks 配置 → 判定为"移除 deny 守卫削弱安全"。

按规则不绕过，留待用户亲自审核写入。**推荐内容**（可直接粘贴到 `.claude/settings.json`）：

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(pnpm dev)",
      "Bash(pnpm dev:pwa)",
      "Bash(pnpm build)",
      "Bash(pnpm generate)",
      "Bash(pnpm preview)",
      "Bash(pnpm lint)",
      "Bash(pnpm lint:*)",
      "Bash(pnpm typecheck)",
      "Bash(pnpm eslint:*)",
      "Bash(eslint:*)",
      "Bash(nuxt prepare)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git checkout:*)",
      "Bash(git branch:*)",
      "Bash(git restore:*)"
    ],
    "deny": [
      "Bash(rm -rf /*)",
      "Bash(rm -rf ~/*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/lint-edited.mjs" }
        ]
      }
    ]
  }
}
```

> 在 auto-mode 外（或用户显式批准）写入即可。写入后 `lint-edited.mjs` 钩子随即生效，每次编辑 `.vue`/`.ts` 自动 `eslint --fix`。

## 验证

- `CLAUDE.md` 引用的 5 个 rules、4 个 agents、4 个 skills、6 个 commands 路径**全部存在**（已逐一核对）。
- 建议执行 `pnpm typecheck` 与 `pnpm lint` 确认无回归（本次仅新增 `.claude/` 配置与文档，未改 `app/` 业务代码）。

## 使用指引

- 新建模块：`/new-module novel 小说阅读器` → 加载 `new-module` 技能，按七件套落地。
- 新建组件：`/new-component gallery/Thumb 图片缩略图` → 委托 `vue-component-builder`。
- 响应式自检：`/responsive-audit app/pages/novel` → 委托 `responsive-reviewer` 出清单。
- 阅读器排版：构建时加载 `reader-page` 技能取 `useReader` 模板。
- 图表：先 `dataviz`（配色）→ 再 `chart-component`（工程集成）。
