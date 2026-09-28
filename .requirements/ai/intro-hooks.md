# Claude Code 钩子（Hooks）介绍

> `.claude/hooks/` 目录通过 settings.json 的 hooks 配置，在 Claude 编辑文件等事件后自动执行脚本，实现"无人值守"的代码质量保障。

---

## 一、目录概述

`.claude/hooks/` 存放 Claude Code 的钩子脚本。钩子是 Claude Code 提供的一种自动化机制：当 Claude 在工作过程中触发特定事件（如调用某个工具之后），Claude Code 会按照 `settings.json` 中 `hooks` 配置自动运行对应的命令，而无需 Claude 主动发起。

在本项目中，钩子机制的核心价值是把"代码质量检查"从"开发者/Claude 手动执行"转变为"事件驱动自动执行"。其工作链路如下：

```
Claude 调用 Edit/Write 工具编辑文件
        │
        ▼
Claude Code 触发 PostToolUse 事件
        │
        ▼
读取 settings.json 的 hooks.PostToolUse 配置
        │
        ▼
按 matcher 匹配工具名（Edit|Write）
        │
        ▼
执行配置中的命令：node .claude/hooks/lint-edited.mjs
        │
        ▼
脚本读取 stdin（Claude 传入的 JSON）→ 解析文件路径 → 调用 eslint --fix
```

钩子脚本与 `settings.json` 的关系是：**`settings.json` 决定"何时触发、执行什么命令"，脚本决定"具体做什么"**。脚本本身只是一个普通的 Node.js 程序，被 Claude Code 在事件发生时以子进程方式拉起。

目录下目前共有 1 个文件：

| 文件 | 类型 | 触发事件 | 作用 |
| --- | --- | --- | --- |
| `lint-edited.mjs` | PostToolUse 钩子 | Edit / Write 之后 | 对被编辑的 .vue/.ts 等文件自动运行 `eslint --fix` |

---

## 二、文件详解：lint-edited.mjs

### 2.1 脚本用途

这是一段 PostToolUse 钩子脚本，用一句话概括：**每当 Claude 通过 Edit 或 Write 工具修改了一个 `.vue` / `.ts` / `.tsx` / `.js` / `.mjs` / `.cjs` 文件，脚本就自动对该文件运行 `eslint --fix`，把格式问题与可自动修复的 lint 规则就地纠正。**

脚本头部注释也明确说明了两点设计原则：

- 始终退出 0，不阻塞工具调用——即使 eslint 报错也不会打断 Claude 的工作流；
- eslint 的输出作为反馈呈现给 Claude，便于其感知并修正剩余问题。

### 2.2 触发机制

触发由 `settings.json` 的 `hooks` 字段配置：

```json
{
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

- **事件类型 `PostToolUse`**：在 Claude 调用任意工具完成之后触发。Claude Code 会把本次工具调用的相关信息以 JSON 形式写入子进程的 stdin。
- **`matcher: "Edit|Write"`**：正则匹配工具名，仅当工具是 `Edit` 或 `Write` 时命中。也就是说，Read、Bash、Grep 等工具不会触发本钩子。
- **`command`**：用 `node` 执行脚本，无需额外参数——被编辑文件的信息通过 stdin 传入，而非命令行参数。

### 2.3 输入与参数解析方式

Claude Code 传给 PostToolUse 钩子的输入并非命令行参数，而是 **stdin 上的一个 JSON 字符串**。脚本通过 Node.js 的 `readFileSync(0, 'utf8')`（`0` 即 stdin 的文件描述符）一次性读取全部输入：

```js
let raw = ''
try {
  raw = readFileSync(0, 'utf8')
} catch {
  process.exit(0)
}
if (!raw) process.exit(0)

let data
try {
  data = JSON.parse(raw)
} catch {
  process.exit(0)
}
```

解析得到的 JSON 对象结构（脚本实际使用到的字段）为：

| 字段 | 含义 |
| --- | --- |
| `data.tool_input.file_path` | 本次 Edit/Write 工具操作的目标文件绝对路径 |
| `data.cwd` | Claude 当前工作目录（用于定位 pnpm/eslint） |

脚本对 `tool_input.file_path` 做了存在性与类型校验：

```js
const file = data?.tool_input?.file_path
if (!file || typeof file !== 'string') process.exit(0)
```

值得注意的是，所有解析失败、输入为空、字段缺失的情况，脚本都直接 `process.exit(0)` 静默退出——既不报错也不阻塞，符合"钩子应当透明、绝不干扰主流程"的设计。

### 2.4 核心逻辑流程

完整的处理流程分为四步：

**第一步：过滤扩展名**

```js
const LINT_EXT = new Set(['.vue', '.ts', '.tsx', '.js', '.mjs', '.cjs'])
if (!LINT_EXT.has(extname(file))) process.exit(0)
```

只对前端/Node 相关源码文件做 lint，JSON、Markdown、CSS 等不处理。

**第二步：跳过不应 lint 的目录**

```js
const SKIP = [/\/node_modules\//, /\/\.nuxt\//, /\/\.output\//, /\/dist\//, /\/\.git\//]
if (SKIP.some((re) => re.test(file))) process.exit(0)
```

`node_modules`（第三方依赖）、`.nuxt`（Nuxt 自动生成的产物）、`.output`（Nitro 构建产物）、`dist`（通用构建输出）、`.git`（版本控制元数据）一律跳过——这些目录下的文件要么不该被改动，要么是自动生成的，对其进行 lint 既无意义又会产生噪音。

**第三步：同步调用 eslint**

```js
const cwd = data?.cwd || process.cwd()
const r = spawnSync('pnpm', ['eslint', '--fix', file], { cwd, encoding: 'utf8' })
```

- 以 `data.cwd`（Claude 的工作目录，即项目根目录）为执行目录，保证 pnpm 能找到项目的 eslint 配置；
- 使用 `spawnSync` **同步**执行——钩子脚本必须等 eslint 跑完再退出，Claude Code 才会拿到完整输出；
- 命令为 `pnpm eslint --fix <file>`，借助项目本地的 `@antfu/eslint-config` + `@nuxt/eslint` 配置完成修复。

**第四步：回写输出**

```js
if (r.stdout && r.stdout.trim()) {
  process.stdout.write(`[lint-edited] ${r.stdout}`)
}
if (r.stderr && r.stderr.trim()) {
  process.stderr.write(`[lint-edited] ${r.stderr}`)
}
process.exit(0)
```

eslint 的标准输出与标准错误分别透传，并加上 `[lint-edited]` 前缀以便区分来源。最后无论 eslint 是否报错，都以 `0` 退出——这是本钩子最关键的设计：**保证不阻塞 Claude 的工具调用流程**，把 lint 结果仅作为"反馈信息"呈现。

### 2.5 依赖

脚本只依赖 Node.js 内置模块，**零第三方依赖**：

| 模块 | 用途 |
| --- | --- |
| `node:fs` (`readFileSync`) | 读取 stdin（fd 0） |
| `node:child_process` (`spawnSync`) | 同步执行 `pnpm eslint --fix` |
| `node:path` (`extname`) | 提取文件扩展名做过滤 |

脚本以 ESM 编写（`.mjs` 后缀 + `import` 语法），运行环境仅需 Node.js（项目随 pnpm/Nuxt 工具链自带），不需要额外安装任何包。

### 2.6 错误处理

脚本的错误处理策略统一且克制——**任何异常都静默退出 0**，绝不让钩子本身成为工作流的故障点：

| 场景 | 处理 |
| --- | --- |
| stdin 读取失败（如无输入） | `process.exit(0)` |
| stdin 为空字符串 | `process.exit(0)` |
| JSON 解析失败 | `process.exit(0)` |
| `tool_input.file_path` 缺失或非字符串 | `process.exit(0)` |
| 扩展名不在白名单 | `process.exit(0)` |
| 文件位于跳过目录 | `process.exit(0)` |
| eslint 执行有输出 | 透传 stdout/stderr 后退出 0 |
| eslint 本身出错（非零退出码） | 脚本仍退出 0（未检查 `r.status`） |

注意：脚本**没有**检查 `spawnSync` 返回的 `r.status`（eslint 退出码），也没有捕获 `spawnSync` 抛出的异常（如 `pnpm` 不存在）。这意味着即便 eslint 因配置错误而失败，钩子也不会报错打断 Claude——这正是"反馈式钩子"而非"阻塞式钩子"的体现。

---

## 三、作用与价值

`lint-edited.mjs` 在项目中承担的是**"提交前最后一道自动格式化"**的角色，其价值体现在三个方面：

1. **自动格式化与 lint 修复**。Claude 每次落盘一个 `.vue` / `.ts` 文件，脚本立刻对该文件跑 `eslint --fix`。`@antfu/eslint-config` 涵盖的缩进、引号、分号、import 顺序、Vue `<script setup>` 结构等可自动修复的规则都会被即时纠正，省去事后统一格式化的环节。

2. **保证代码质量一致性**。项目 CLAUDE.md 与 `typescript.md` 规则都要求"提交前跑 `pnpm typecheck`、零报错才合并"。钩子把 lint 层面的格式问题在前置环节就消解掉，使 typecheck / 代码评审聚焦于真正的逻辑与类型问题，而非风格噪音。

3. **减少手动跑 lint 的认知负担**。开发者无需在每次让 Claude 改完代码后再手动执行 `/lint-fix` 或 `pnpm lint`——钩子已经按"每次编辑即修复"的粒度自动完成，`pnpm lint` 只剩验证意义。

---

## 四、使用方式与注意事项

### 4.1 钩子如何被触发

钩子的触发完全由 `.claude/settings.json` 的 `hooks` 配置驱动，**无需手动调用**。只要该 `settings.json` 被 Claude Code 加载（项目级配置默认加载），Claude 每次 Edit/Write 之后都会自动拉起脚本。要禁用钩子，删除或注释 `hooks` 配置块即可，脚本文件本身可保留。

### 4.2 脚本执行环境

- **运行时**：Node.js（通过 `node` 命令执行，使用 ESM 模块）。
- **执行目录**：以 Claude 的 `cwd`（通常为项目根 `/data/project/frontend/vitesse-nuxt`）为工作目录，确保 `pnpm` 能解析到项目的 eslint 配置与依赖。
- **调用链**：`node lint-edited.mjs` → `spawnSync('pnpm', ['eslint', ...])` → pnpm 拉起项目本地 eslint。因此要求项目依赖已安装（`pnpm install` 过），否则 `pnpm eslint` 会失败（但因脚本不检查退出码，失败仅表现为 stderr 输出，不会阻塞）。
- **同步执行**：`spawnSync` 会阻塞钩子进程直到 eslint 完成，单文件 eslint 通常在数百毫秒内完成，对编辑体验影响可忽略。

### 4.3 注意事项

- 钩子脚本**始终退出 0**，因此它不会阻止 Claude 完成 Edit/Write 操作；即便 eslint 报错，文件仍会被写入。如需"lint 失败则回滚"的强约束，需改用阻塞式钩子（非零退出）或改用 PreToolUse 钩子——但本项目刻意选择了非阻塞的反馈式策略。
- 脚本只处理**单文件**（本次被编辑的文件），不会对全项目跑 lint。如需全项目检查，仍应手动执行 `pnpm lint` 或 `/lint-fix` 命令。
- 扩展名白名单与跳过目录都是硬编码在脚本中的常量（`LINT_EXT`、`SKIP`）。新增需要 lint 的文件类型（如 `.astro`、`.svelte`）需手动编辑这两个常量。

### 4.4 可扩展方向

借助同样的钩子机制，可在 `.claude/hooks/` 下新增脚本并在 `settings.json` 中配置，覆盖更多自动化场景，例如：

| 拟新增脚本 | 触发事件 | 作用 |
| --- | --- | --- |
| `typecheck-edited.mjs` | PostToolUse (Edit\|Write) | 对被编辑的 .ts/.vue 触发 `vue-tsc` 增量类型检查（注意耗时，可加防抖） |
| `precommit-check.mjs` | PreToolUse (Bash git commit) | 提交前拦截，强制跑 `pnpm typecheck` 与 `pnpm lint`，失败则非零退出阻止提交 |
| `format-staged.mjs` | PostToolUse (Bash git add) | 对暂存区文件统一格式化 |

新增时只需：在 `.claude/hooks/` 放脚本 → 在 `settings.json` 的 `hooks` 对应事件数组中追加 `{ "matcher": "...", "hooks": [{ "type": "command", "command": "node .claude/hooks/xxx.mjs" }] }` 即可，无需改动 Claude Code 本身。
