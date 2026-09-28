# Claude Code 项目配置文件介绍（settings.json / settings.local.json）

> 本文解析本仓库 `.claude/` 目录下的两个 Claude Code 配置文件，说明它们各自承载的权限规则、自动化钩子与本地覆盖机制，帮助团队成员理解 Claude Code 在本项目中的行为边界与协作约定。

---

## 一、文件概述

本项目 `.claude/` 目录下存在两个 Claude Code 配置文件，二者职责互补但作用域不同：

| 文件 | 作用域 | 是否提交 Git | 用途 |
| --- | --- | --- | --- |
| `.claude/settings.json` | 项目级、团队共享 | 是（已纳入版本控制，当前在 `dev-ai` 分支已暂存） | 定义全队统一的权限白/黑名单、自动化 hooks，任何克隆仓库的成员都会继承 |
| `.claude/settings.local.json` | 本地、个人覆盖 | 否（已被 `.gitignore` 第 12 行 `.claude/settings.local.json` 忽略） | 个人在本机对项目配置做覆盖，例如临时禁用某些 MCP 服务、追加个人常用命令权限，不影响他人 |

**加载优先级**：Claude Code 在加载配置时，`settings.local.json` 会与 `settings.json` 合并，本地文件的相同键以"覆盖/合并"方式生效于当前会话；不同键则叠加。因此团队共享规则放 `settings.json`，个人临时调整放 `settings.local.json`，二者互不污染。

两个文件均以 `"$schema": "https://json.schemastore.org/claude-code-settings.json"` 开头，引用官方 JSON Schema，便于编辑器补全与校验。

---

## 二、内容详解

### 2.1 `settings.json`（团队共享配置）

#### 2.1.1 `permissions` 权限配置

Claude Code 对 Bash 等工具调用采用"允许 / 询问 / 拒绝"三态权限模型。本项目通过白名单 `allow` 与黑名单 `deny` 显式界定边界，命中 `allow` 的命令直接放行（不弹权限确认窗），命中 `deny` 的命令直接拒绝。

**`allow`（允许列表，共 19 条）**——命中即自动放行，免弹窗：

| 规则 | 含义 |
| --- | --- |
| `Bash(pnpm dev)` | 启动 Nuxt 开发服务器（含 HMR） |
| `Bash(pnpm dev:pwa)` | 以 PWA 模式启动开发（`VITE_PLUGIN_PWA=true`） |
| `Bash(pnpm build)` | 生产构建 |
| `Bash(pnpm generate)` | 静态站点生成（SSG） |
| `Bash(pnpm preview)` | 预览构建产物 |
| `Bash(pnpm lint)` | 运行 eslint 检查 |
| `Bash(pnpm lint:*)` | 任意 `pnpm lint:xxx` 子命令（如 `lint:fix`），`*` 为通配 |
| `Bash(pnpm typecheck)` | 运行 `vue-tsc` 类型检查 |
| `Bash(pnpm eslint:*)` | 任意 `pnpm eslint:xxx` 子命令 |
| `Bash(eslint:*)` | 直接调用 `eslint` 的任意子命令（不经过 pnpm） |
| `Bash(nuxt prepare)` | 生成 Nuxt 类型与 `.nuxt` 目录 |
| `Bash(git status)` | 查看工作区状态 |
| `Bash(git diff:*)` | 任意 `git diff` 调用 |
| `Bash(git log:*)` | 任意 `git log` 调用 |
| `Bash(git add:*)` | 任意 `git add`（暂存改动） |
| `Bash(git commit:*)` | 任意 `git commit`（提交） |
| `Bash(git checkout:*)` | 任意 `git checkout`（切换分支/文件） |
| `Bash(git branch:*)` | 任意 `git branch`（分支管理） |
| `Bash(git restore:*)` | 任意 `git restore`（恢复工作区文件） |

可以看到，白名单覆盖了项目日常开发的全部高频命令：构建/预览/检查/类型检查四类 pnpm 脚本，以及只读与常规写操作的 git 命令。这样 Claude 在执行这些命令时无需逐次弹窗确认，显著降低交互成本。

> 说明：`git push`、`git reset --hard`、`git rebase` 等具有较高破坏性或远程副作用的命令**未**纳入白名单，执行时仍会触发权限询问，由人工确认后再放行——这是合理的安全留白。

**`deny`（拒绝列表，共 2 条）**——命中即直接拒绝，且不可被 `allow` 覆盖：

| 规则 | 含义 |
| --- | --- |
| `Bash(rm -rf /*)` | 禁止递归删除根目录 `/` 下所有文件 |
| `Bash(rm -rf ~/*)` | 禁止递归删除用户家目录 `~` 下所有文件 |

这两条是兜底安全规则，防止误删系统文件或用户数据，即便其他规则误放行也无法绕过 `deny`。

#### 2.1.2 `hooks` 钩子配置

```json
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
```

- **触发时机**：`PostToolUse`，即在 Claude 每次调用工具**之后**触发。
- **匹配器 `matcher`**：`Edit|Write`，表示仅在 Claude 使用 `Edit` 或 `Write` 工具修改/创建文件后触发，其他工具（如 `Read`、`Bash`）不触发。
- **执行命令**：`node .claude/hooks/lint-edited.mjs`，运行仓库内的 Node 脚本。

**对应脚本 `.claude/hooks/lint-edited.mjs` 的行为**（与配置一一对应）：

1. 从标准输入读取 Claude Code 传入的 JSON（包含 `tool_input.file_path`、`cwd` 等字段）。
2. 取出被编辑的文件路径，仅对扩展名为 `.vue`、`.ts`、`.tsx`、`.js`、`.mjs`、`.cjs` 的文件处理。
3. 跳过 `node_modules/`、`.nuxt/`、`.output/`、`dist/`、`.git/` 目录下的文件，避免误伤依赖与生成产物。
4. 以当前工作目录为 cwd，执行 `pnpm eslint --fix <file>`，自动修复风格问题。
5. 将 eslint 的 stdout / stderr 以 `[lint-edited]` 前缀回写给 Claude 作为反馈。
6. **始终 `process.exit(0)`**，即钩子永不阻塞工具调用——即使 eslint 报错，Edit/Write 操作本身仍算成功，lint 输出仅作为提示。

这一钩子实现了"每次保存即自动 lint"的体验，与项目 CLAUDE.md 中"编辑 `.vue`/`.ts` 后自动 `eslint --fix`"的约定完全对应。

### 2.2 `settings.local.json`（本地个人覆盖配置）

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": { "allow": [] },
  "disabledMcpjsonServers": ["playwright", "context7", "fetch", "github"]
}
```

#### 2.2.1 `permissions.allow`（空列表）

本地未追加任何额外允许规则，意味着个人未在团队白名单之外添加自定义命令权限。如个人有高频私有命令（如 `pnpm test`、自定义脚本），可在此追加，例如：

```json
"allow": ["Bash(pnpm test)", "Bash(pnpm test:*)"]
```

追加后仅本机生效，不会污染团队配置。

#### 2.2.2 `disabledMcpjsonServers`（禁用的 MCP 服务）

本项目根目录 `.mcp.json` 定义了 4 个 MCP（Model Context Protocol）服务：

| 服务名 | 来源包 | 作用 |
| --- | --- | --- |
| `playwright` | `@playwright/mcp` | 浏览器自动化、页面截图与端到端交互 |
| `context7` | `@upstash/context7-mcp` | 拉取第三方库的最新文档上下文 |
| `fetch` | `@modelcontextprotocol/server-fetch` | 抓取 URL 内容 |
| `github` | `@modelcontextprotocol/server-github` | GitHub API 操作（需 `GITHUB_PERSONAL_ACCESS_TOKEN`） |

`settings.local.json` 中将这 4 个服务**全部禁用**：

```json
"disabledMcpjsonServers": ["playwright", "context7", "fetch", "github"]
```

含义：尽管 `.mcp.json` 声明了这些服务，但在当前本地会话中它们不会被启动/连接，Claude 无法调用其工具。这是一种"个人按需关闭"的覆盖——可能出于启动速度、网络环境或安全考量。其他成员若需要使用，只需在自己的 `settings.local.json` 中移除对应条目（或整个删除该键）即可恢复。

---

## 三、作用与价值

这套配置在本项目开发中起到三方面作用：

1. **减少权限弹窗，保持开发流畅**。19 条 `allow` 规则覆盖了 pnpm 脚本与常规 git 操作，Claude 在跑 `pnpm dev`、`pnpm typecheck`、`git diff` 等高频命令时无需逐次确认，交互链路被显著缩短。

2. **自动化代码风格治理**。`PostToolUse` 钩子在每次 Edit/Write 之后自动对改动文件运行 `eslint --fix`，相当于把"提交前 lint"前置到"保存即 lint"，既落实了 CLAUDE.md 的约定，也避免风格问题堆积到 review 阶段。钩子非阻塞设计保证了即便 lint 失败也不会打断编辑流程。

3. **统一团队体验与个人灵活并存**。`settings.json` 把团队共识（哪些命令可放行、哪些必须拒绝、保存即 lint）固化进版本控制，新成员克隆仓库即获得一致体验；`settings.local.json` 则给个人留出覆盖口子（如按需启停 MCP），二者解耦，避免"个人临时调试污染全队配置"的常见问题。

4. **安全兜底**。`deny` 列表硬性禁止 `rm -rf /*`、`rm -rf ~/*` 这类灾难性删除，即便白名单误放行也无法绕过，为自动化操作划出不可逾越的红线。

---

## 四、注意事项

1. **修改 `settings.local.json` 不影响团队**。该文件已被 `.gitignore` 忽略（第 12 行），所有本地改动不会被提交、不会出现在 PR 中。个人可放心调整本地权限与 MCP 启停。

2. **修改 `settings.json` 会影响所有成员**。该文件已纳入 Git，改动应作为正式变更提交并经 review。新增 `allow` 规则前请确认命令安全性，避免放行具有破坏性或远程副作用的命令（如 `git push -f`）。

3. **hooks 配置与 `.claude/hooks/` 脚本必须一一对应**。`settings.json` 中 `command: "node .claude/hooks/lint-edited.mjs"` 指向的脚本必须实际存在且可执行；若重命名或移动脚本，需同步更新 hooks 配置，否则钩子会静默失败（脚本不存在时 Node 报错，但因钩子自身不阻塞，错误可能被忽略）。反之，若新增脚本却未在 `hooks` 中注册，脚本永远不会被触发。

4. **`deny` 优先级高于 `allow`**。若某条命令同时命中两个列表，以 `deny` 为准被拒绝。因此添加 `allow` 规则时无需担心与现有 `deny` 冲突，但也要注意不要把需要放行的命令写进过于宽泛的 deny 模式。

5. **通配符 `*` 的范围**。`Bash(pnpm lint:*)` 这类规则中的 `*` 匹配任意子命令参数，等价于"所有 `pnpm lint:` 开头的命令"。追加此类规则时请确认前缀下没有不应自动放行的子命令。

6. **MCP 禁用是本地行为**。`disabledMcpjsonServers` 只在当前本机会话生效；若团队希望全队禁用某 MCP 服务，应改在 `settings.json` 中配置，或直接从 `.mcp.json` 中移除该服务定义。当前 `.mcp.json` 本身尚未纳入 Git（git status 中显示为 `??` 未跟踪），启用/禁用策略以本地为准。

7. **钩子非阻塞，lint 问题需人工关注**。`lint-edited.mjs` 始终 `exit(0)`，eslint 的输出仅作为反馈呈现给 Claude，不会阻止 Edit/Write 完成。因此自动 `--fix` 能修复的会就地修复，但无法自动修复的错误仍需开发者手动处理，不能依赖钩子拦截。
